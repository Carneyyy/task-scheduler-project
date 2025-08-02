'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  AlertCircleIcon,
  RefreshCwIcon,
  EyeIcon,
  PlayIcon
} from 'lucide-react'

interface Task {
  id: string
  name: string
  status: string
  script?: {
    name: string
    platform: string
  }
  node?: {
    name: string
    status: string
  }
}

interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  type: 'SUCCESS' | 'COMPLETION' | 'TIMEOUT' | 'MANUAL'
  condition: 'ALL_SUCCESS' | 'ANY_SUCCESS' | 'ALL_COMPLETE' | 'ANY_COMPLETE'
  timeoutMinutes?: number
  isActive: boolean
  task?: Task
  dependsOnTask?: Task
}

interface DependencyGraphProps {
  taskId?: string
  onTaskSelect?: (taskId: string) => void
  className?: string
}

export function DependencyGraph({ taskId, onTaskSelect, className }: DependencyGraphProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [dependencies, setDependencies] = useState<TaskDependency[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [dependencyCheck, setDependencyCheck] = useState<any>(null)

  useEffect(() => {
    if (taskId) {
      loadTaskDependencies(taskId)
    } else {
      loadAllDependencies()
    }
  }, [taskId])

  const loadTaskDependencies = async (id: string) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      
      // 获取任务详情
      const taskResponse = await fetch(`/api/tasks/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (taskResponse.ok) {
        const taskData = await taskResponse.json()
        setSelectedTask(taskData)
      }

      // 获取依赖关系
      const [depsResponse, dependentsResponse] = await Promise.all([
        fetch(`/api/tasks/${id}/dependencies`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/tasks/${id}/dependents`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (depsResponse.ok && dependentsResponse.ok) {
        const [deps, dependents] = await Promise.all([
          depsResponse.json(),
          dependentsResponse.json()
        ])
        
        const allDependencies = [...deps, ...dependents]
        setDependencies(allDependencies)
        
        // 提取所有相关任务
        const allTasks = allDependencies.reduce((acc: Task[], dep) => {
          if (dep.task && !acc.find(t => t.id === dep.task.id)) {
            acc.push(dep.task)
          }
          if (dep.dependsOnTask && !acc.find(t => t.id === dep.dependsOnTask.id)) {
            acc.push(dep.dependsOnTask)
          }
          return acc
        }, [])
        
        if (selectedTask && !allTasks.find(t => t.id === selectedTask.id)) {
          allTasks.push(selectedTask)
        }
        
        setTasks(allTasks)
      }
    } catch (error) {
      console.error('Error loading task dependencies:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllDependencies = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/task-dependencies', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDependencies(data)
        
        // 提取所有任务
        const allTasks = data.reduce((acc: Task[], dep: TaskDependency) => {
          if (dep.task && !acc.find(t => t.id === dep.task.id)) {
            acc.push(dep.task)
          }
          if (dep.dependsOnTask && !acc.find(t => t.id === dep.dependsOnTask.id)) {
            acc.push(dep.dependsOnTask)
          }
          return acc
        }, [])
        
        setTasks(allTasks)
      }
    } catch (error) {
      console.error('Error loading dependencies:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDependencies = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/tasks/${id}/check-dependencies`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDependencyCheck(data)
      }
    } catch (error) {
      console.error('Error checking dependencies:', error)
    }
  }

  const executeWithDependencies = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/tasks/${id}/execute-with-dependencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ force: false })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        // 刷新数据
        if (taskId) {
          loadTaskDependencies(taskId)
        } else {
          loadAllDependencies()
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Execution failed')
      }
    } catch (error) {
      console.error('Error executing task:', error)
      alert('Execution failed')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'border-green-500 bg-green-50'
      case 'COMPLETION':
        return 'border-blue-500 bg-blue-50'
      case 'TIMEOUT':
        return 'border-orange-500 bg-orange-50'
      case 'MANUAL':
        return 'border-purple-500 bg-purple-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  const renderDependencyNode = (task: Task) => {
    const isCenter = selectedTask?.id === task.id
    const incomingDeps = dependencies.filter(d => d.taskId === task.id)
    const outgoingDeps = dependencies.filter(d => d.dependsOnTaskId === task.id)

    return (
      <div
        key={task.id}
        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isCenter 
            ? 'border-primary bg-primary/5 shadow-lg' 
            : 'border-border hover:border-primary/50'
        }`}
        onClick={() => {
          setSelectedTask(task)
          onTaskSelect?.(task.id)
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">{task.name}</h3>
          <Badge className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          {task.script && (
            <div>脚本: {task.script.name}</div>
          )}
          {task.node && (
            <div>节点: {task.node.name}</div>
          )}
          <div className="flex items-center gap-2 mt-2">
            {incomingDeps.length > 0 && (
              <Badge variant="outline" className="text-xs">
                依赖: {incomingDeps.length}
              </Badge>
            )}
            {outgoingDeps.length > 0 && (
              <Badge variant="outline" className="text-xs">
                被依赖: {outgoingDeps.length}
              </Badge>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              checkDependencies(task.id)
            }}
          >
            <EyeIcon className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              executeWithDependencies(task.id)
            }}
          >
            <PlayIcon className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  const renderDependencyConnection = (dep: TaskDependency) => {
    if (!dep.task || !dep.dependsOnTask) return null

    return (
      <div
        key={dep.id}
        className={`absolute border-l-2 border-dashed ${getDependencyTypeColor(dep.type)} p-2 text-xs`}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}
      >
        <div className="font-medium">{dep.type}</div>
        <div className="text-muted-foreground">{dep.condition}</div>
        {dep.timeoutMinutes && (
          <div className="text-orange-600">{dep.timeoutMinutes}min</div>
        )}
        <div className="flex items-center gap-1 mt-1">
          {dep.isActive ? (
            <CheckCircleIcon className="w-3 h-3 text-green-500" />
          ) : (
            <XCircleIcon className="w-3 h-3 text-red-500" />
          )}
          <span>{dep.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCwIcon className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>加载依赖关系...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* 依赖检查结果弹窗 */}
      <Dialog open={!!dependencyCheck} onOpenChange={() => setDependencyCheck(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>依赖检查结果</DialogTitle>
            <DialogDescription>
              任务依赖关系检查结果
            </DialogDescription>
          </DialogHeader>
          {dependencyCheck && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {dependencyCheck.satisfied ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {dependencyCheck.satisfied ? '依赖已满足' : '依赖未满足'}
                </span>
              </div>
              
              <div className="space-y-2">
                {dependencyCheck.dependencies?.map((dep: any) => (
                  <div key={dep.dependencyId} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{dep.taskName}</span>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getDependencyTypeColor(dep.type)}>
                          {dep.type}
                        </Badge>
                        <Badge variant="outline">
                          {dep.condition}
                        </Badge>
                      </div>
                      {dep.error && (
                        <div className="text-sm text-red-600 mt-1">{dep.error}</div>
                      )}
                      {dep.message && (
                        <div className="text-sm text-blue-600 mt-1">{dep.message}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {dep.satisfied ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 依赖关系图 */}
      <Card>
        <CardHeader>
          <CardTitle>任务依赖关系图</CardTitle>
          <CardDescription>
            可视化展示任务之间的依赖关系
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">暂无任务依赖关系</p>
            </div>
          ) : (
            <div className="relative">
              {/* 简化的网格布局展示依赖关系 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(renderDependencyNode)}
              </div>

              {/* 依赖关系统计 */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">依赖关系统计</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">总任务数</div>
                    <div className="font-medium">{tasks.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">依赖关系数</div>
                    <div className="font-medium">{dependencies.length}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">活跃依赖</div>
                    <div className="font-medium">
                      {dependencies.filter(d => d.isActive).length}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">依赖类型</div>
                    <div className="font-medium">
                      {new Set(dependencies.map(d => d.type)).size}
                    </div>
                  </div>
                </div>
              </div>

              {/* 依赖类型说明 */}
              <div className="mt-4 p-4 border rounded-lg">
                <h4 className="font-medium mb-2">依赖类型说明</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                    <span><strong>SUCCESS</strong> - 依赖任务成功完成</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-500 rounded"></div>
                    <span><strong>COMPLETION</strong> - 依赖任务执行完成（无论成功失败）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border border-orange-500 rounded"></div>
                    <span><strong>TIMEOUT</strong> - 依赖任务超时触发</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 border border-purple-500 rounded"></div>
                    <span><strong>MANUAL</strong> - 手动触发依赖</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}