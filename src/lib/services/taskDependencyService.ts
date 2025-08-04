import { db } from '@/lib/db'

export interface DependencyCheckResult {
  satisfied: boolean
  message: string
  dependencies: Array<{
    dependencyId: string
    taskId: string
    taskName: string
    satisfied: boolean
    type: string
    condition: string
    lastExecutionStatus?: string
    lastExecutionTime?: Date
    error?: string
    message?: string
    timeoutMinutes?: number
    elapsedMinutes?: number
  }>
}

export interface TaskExecutionPlan {
  taskId: string
  canExecute: boolean
  blockedBy: string[]
  reason: string
}

export class TaskDependencyService {
  /**
   * 检查任务依赖是否满足
   */
  static async checkDependencies(taskId: string): Promise<DependencyCheckResult> {
    try {
      // 获取所有活跃的依赖
      const dependencies = await db.taskDependency.findMany({
        where: { 
          taskId: taskId,
          isActive: true 
        },
        include: {
          dependsOnTask: {
            include: {
              executions: {
                orderBy: { startTime: 'desc' },
                take: 1
              }
            }
          }
        }
      })

      if (dependencies.length === 0) {
        return {
          satisfied: true,
          message: 'No dependencies found',
          dependencies: []
        }
      }

      // 检查每个依赖
      const dependencyResults = await Promise.all(
        dependencies.map(async (dep) => {
          const lastExecution = dep.dependsOnTask.executions[0]
          
          switch (dep.type) {
            case 'SUCCESS':
              return {
                dependencyId: dep.id,
                taskId: dep.dependsOnTaskId,
                taskName: dep.dependsOnTask.name,
                satisfied: lastExecution?.status === 'SUCCESS',
                type: dep.type,
                condition: dep.condition,
                lastExecutionStatus: lastExecution?.status,
                lastExecutionTime: lastExecution?.endTime
              }

            case 'COMPLETION':
              return {
                dependencyId: dep.id,
                taskId: dep.dependsOnTaskId,
                taskName: dep.dependsOnTask.name,
                satisfied: lastExecution?.status === 'SUCCESS' || lastExecution?.status === 'FAILED',
                type: dep.type,
                condition: dep.condition,
                lastExecutionStatus: lastExecution?.status,
                lastExecutionTime: lastExecution?.endTime
              }

            case 'TIMEOUT':
              if (!dep.timeoutMinutes) {
                return {
                  dependencyId: dep.id,
                  taskId: dep.dependsOnTaskId,
                  taskName: dep.dependsOnTask.name,
                  satisfied: false,
                  type: dep.type,
                  condition: dep.condition,
                  error: 'Timeout not configured'
                }
              }

              const timeoutMs = dep.timeoutMinutes * 60 * 1000
              const now = new Date()
              const startTime = lastExecution?.startTime
              
              if (!startTime) {
                return {
                  dependencyId: dep.id,
                  taskId: dep.dependsOnTaskId,
                  taskName: dep.dependsOnTask.name,
                  satisfied: false,
                  type: dep.type,
                  condition: dep.condition,
                  error: 'Task not started'
                }
              }

              const elapsed = now.getTime() - startTime.getTime()
              const timedOut = elapsed > timeoutMs

              return {
                dependencyId: dep.id,
                taskId: dep.dependsOnTaskId,
                taskName: dep.dependsOnTask.name,
                satisfied: timedOut,
                type: dep.type,
                condition: dep.condition,
                timeoutMinutes: dep.timeoutMinutes,
                elapsedMinutes: Math.floor(elapsed / 60000),
                lastExecutionStatus: lastExecution?.status,
                lastExecutionTime: lastExecution?.endTime
              }

            case 'MANUAL':
              return {
                dependencyId: dep.id,
                taskId: dep.dependsOnTaskId,
                taskName: dep.dependsOnTask.name,
                satisfied: false, // Manual dependencies need to be manually triggered
                type: dep.type,
                condition: dep.condition,
                message: 'Manual dependency requires manual trigger'
              }

            default:
              return {
                dependencyId: dep.id,
                taskId: dep.dependsOnTaskId,
                taskName: dep.dependsOnTask.name,
                satisfied: false,
                type: dep.type,
                condition: dep.condition,
                error: 'Unknown dependency type'
              }
          }
        })
      )

      // 应用条件判断是否所有依赖都满足
      let allSatisfied = false
      let message = ''

      if (dependencyResults.length > 0) {
        const firstDependency = dependencies[0]
        
        switch (firstDependency.condition) {
          case 'ALL_SUCCESS':
            allSatisfied = dependencyResults.every(r => r.satisfied && r.type === 'SUCCESS')
            message = allSatisfied ? 'All dependencies completed successfully' : 'Waiting for all dependencies to succeed'
            break
          case 'ANY_SUCCESS':
            allSatisfied = dependencyResults.some(r => r.satisfied && r.type === 'SUCCESS')
            message = allSatisfied ? 'At least one dependency completed successfully' : 'Waiting for at least one dependency to succeed'
            break
          case 'ALL_COMPLETE':
            allSatisfied = dependencyResults.every(r => r.satisfied)
            message = allSatisfied ? 'All dependencies completed' : 'Waiting for all dependencies to complete'
            break
          case 'ANY_COMPLETE':
            allSatisfied = dependencyResults.some(r => r.satisfied)
            message = allSatisfied ? 'At least one dependency completed' : 'Waiting for at least one dependency to complete'
            break
        }
      }

      return {
        satisfied: allSatisfied,
        message,
        dependencies: dependencyResults
      }

    } catch (error) {
      console.error('Error checking task dependencies:', error)
      return {
        satisfied: false,
        message: 'Error checking dependencies',
        dependencies: []
      }
    }
  }

  /**
   * 获取任务执行计划
   */
  static async getExecutionPlan(taskIds: string[]): Promise<TaskExecutionPlan[]> {
    const plans: TaskExecutionPlan[] = []

    for (const taskId of taskIds) {
      const dependencyCheck = await this.checkDependencies(taskId)
      
      if (dependencyCheck.satisfied) {
        plans.push({
          taskId,
          canExecute: true,
          blockedBy: [],
          reason: 'Dependencies satisfied'
        })
      } else {
        const blockedBy = dependencyCheck.dependencies
          .filter(dep => !dep.satisfied)
          .map(dep => dep.taskId)

        plans.push({
          taskId,
          canExecute: false,
          blockedBy,
          reason: dependencyCheck.message
        })
      }
    }

    return plans
  }

  /**
   * 获取任务的依赖链
   */
  static async getDependencyChain(taskId: string): Promise<string[]> {
    const chain: string[] = []
    const visited = new Set<string>()

    const traverse = async (currentTaskId: string): Promise<void> => {
      if (visited.has(currentTaskId)) {
        return // 避免循环依赖
      }

      visited.add(currentTaskId)

      const dependencies = await db.taskDependency.findMany({
        where: { taskId: currentTaskId },
        select: { dependsOnTaskId: true }
      })

      for (const dep of dependencies) {
        await traverse(dep.dependsOnTaskId)
        chain.push(dep.dependsOnTaskId)
      }
    }

    await traverse(taskId)
    return chain
  }

  /**
   * 获取依赖此任务的任务列表
   */
  static async getDependentTasks(taskId: string): Promise<string[]> {
    const dependents = await db.taskDependency.findMany({
      where: { dependsOnTaskId: taskId },
      select: { taskId: true }
    })

    return dependents.map(dep => dep.taskId)
  }

  /**
   * 检查是否存在循环依赖
   */
  static async hasCircularDependency(taskId: string, dependsOnTaskId: string): Promise<boolean> {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = async (currentTaskId: string): Promise<boolean> => {
      if (recursionStack.has(currentTaskId)) {
        return true
      }

      if (visited.has(currentTaskId)) {
        return false
      }

      visited.add(currentTaskId)
      recursionStack.add(currentTaskId)

      const dependencies = await db.taskDependency.findMany({
        where: { taskId: currentTaskId },
        select: { dependsOnTaskId: true }
      })

      for (const dep of dependencies) {
        if (await hasCycle(dep.dependsOnTaskId)) {
          return true
        }
      }

      recursionStack.delete(currentTaskId)
      return false
    }

    return await hasCycle(dependsOnTaskId)
  }

  /**
   * 验证依赖配置
   */
  static async validateDependencyConfig(taskId: string, dependsOnTaskId: string): Promise<{
    valid: boolean
    message: string
  }> {
    // 检查任务是否存在
    const [task, dependsOnTask] = await Promise.all([
      db.task.findUnique({ where: { id: taskId } }),
      db.task.findUnique({ where: { id: dependsOnTaskId } })
    ])

    if (!task || !dependsOnTask) {
      return {
        valid: false,
        message: 'One or both tasks not found'
      }
    }

    // 检查是否为同一任务
    if (taskId === dependsOnTaskId) {
      return {
        valid: false,
        message: 'Task cannot depend on itself'
      }
    }

    // 检查循环依赖
    const hasCircular = await this.hasCircularDependency(taskId, dependsOnTaskId)
    if (hasCircular) {
      return {
        valid: false,
        message: 'Circular dependency detected'
      }
    }

    // 检查是否已存在相同的依赖
    const existingDependency = await db.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId,
          dependsOnTaskId
        }
      }
    })

    if (existingDependency) {
      return {
        valid: false,
        message: 'Dependency already exists'
      }
    }

    return {
      valid: true,
      message: 'Dependency configuration is valid'
    }
  }

  /**
   * 执行带依赖检查的任务
   */
  static async executeTaskWithDependencies(taskId: string): Promise<{
    success: boolean
    message: string
    canExecute: boolean
  }> {
    // 检查依赖
    const dependencyCheck = await this.checkDependencies(taskId)

    if (!dependencyCheck.satisfied) {
      return {
        success: false,
        message: dependencyCheck.message,
        canExecute: false
      }
    }

    // 依赖满足，可以执行任务
    // 这里可以调用实际的任务执行逻辑
    try {
      // 更新任务状态为运行中
      await db.task.update({
        where: { id: taskId },
        data: { status: 'RUNNING' }
      })

      // 创建执行记录
      const execution = await db.taskExecution.create({
        data: {
          taskId,
          nodeId: 'default', // 这里应该根据实际情况选择节点
          status: 'RUNNING',
          startTime: new Date()
        }
      })

      // TODO: 这里应该调用实际的任务执行逻辑
      // 例如：调用节点执行任务，等待执行结果等

      return {
        success: true,
        message: 'Task execution started',
        canExecute: true
      }
    } catch (error) {
      console.error('Error executing task:', error)
      return {
        success: false,
        message: 'Failed to execute task',
        canExecute: false
      }
    }
  }

  /**
   * 批量执行任务（按照依赖顺序）
   */
  static async executeTasksInOrder(taskIds: string[]): Promise<{
    success: boolean
    executed: string[]
    failed: string[]
    skipped: string[]
  }> {
    const executed: string[] = []
    const failed: string[] = []
    const skipped: string[] = []

    // 获取执行计划
    const executionPlan = await this.getExecutionPlan(taskIds)

    // 按照依赖顺序执行任务
    for (const plan of executionPlan) {
      if (plan.canExecute) {
        const result = await this.executeTaskWithDependencies(plan.taskId)
        if (result.success) {
          executed.push(plan.taskId)
        } else {
          failed.push(plan.taskId)
        }
      } else {
        skipped.push(plan.taskId)
      }
    }

    return {
      success: failed.length === 0,
      executed,
      failed,
      skipped
    }
  }
}