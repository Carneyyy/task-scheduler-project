import { useState, useEffect } from 'react'

interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  type: 'SUCCESS' | 'COMPLETION' | 'TIMEOUT' | 'MANUAL'
  condition: 'ALL_SUCCESS' | 'ANY_SUCCESS' | 'ALL_COMPLETE' | 'ANY_COMPLETE'
  timeoutMinutes?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  task?: {
    id: string
    name: string
    script?: {
      id: string
      name: string
      platform: string
    }
    node?: {
      id: string
      name: string
      status: string
    }
  }
  dependsOnTask?: {
    id: string
    name: string
    script?: {
      id: string
      name: string
      platform: string
    }
    node?: {
      id: string
      name: string
      status: string
    }
  }
}

interface DependencyCheckResult {
  satisfied: boolean
  dependencies: Array<{
    dependencyId: string
    taskId: string
    taskName: string
    satisfied: boolean
    type: string
    condition: string
    lastExecutionStatus?: string
    lastExecutionTime?: string
    error?: string
    message?: string
    timeoutMinutes?: number
    elapsedMinutes?: number
  }>
  condition: string
}

export function useTaskDependencies() {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取任务依赖
  const getTaskDependencies = async (taskId: string): Promise<TaskDependency[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch task dependencies')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // 获取依赖此任务的任务
  const getTaskDependents = async (taskId: string): Promise<TaskDependency[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/tasks/${taskId}/dependents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch task dependents')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // 创建任务依赖
  const createDependency = async (dependencyData: {
    taskId: string
    dependsOnTaskId: string
    type?: 'SUCCESS' | 'COMPLETION' | 'TIMEOUT' | 'MANUAL'
    condition?: 'ALL_SUCCESS' | 'ANY_SUCCESS' | 'ALL_COMPLETE' | 'ANY_COMPLETE'
    timeoutMinutes?: number
  }): Promise<TaskDependency | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/task-dependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dependencyData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create dependency')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 更新任务依赖
  const updateDependency = async (
    dependencyId: string,
    updateData: {
      type?: 'SUCCESS' | 'COMPLETION' | 'TIMEOUT' | 'MANUAL'
      condition?: 'ALL_SUCCESS' | 'ANY_SUCCESS' | 'ALL_COMPLETE' | 'ANY_COMPLETE'
      timeoutMinutes?: number
      isActive?: boolean
    }
  ): Promise<TaskDependency | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/task-dependencies/${dependencyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update dependency')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 删除任务依赖
  const deleteDependency = async (dependencyId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/task-dependencies/${dependencyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete dependency')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // 检查任务依赖状态
  const checkTaskDependencies = async (taskId: string): Promise<DependencyCheckResult | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/tasks/${taskId}/check-dependencies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check dependencies')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 获取所有依赖关系
  const getAllDependencies = async (filters?: {
    taskId?: string
    dependsOnTaskId?: string
  }): Promise<TaskDependency[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('authToken')
      const params = new URLSearchParams()
      
      if (filters?.taskId) {
        params.append('taskId', filters.taskId)
      }
      if (filters?.dependsOnTaskId) {
        params.append('dependsOnTaskId', filters.dependsOnTaskId)
      }

      const response = await fetch(`/api/task-dependencies?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dependencies')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    dependencies,
    loading,
    error,
    getTaskDependencies,
    getTaskDependents,
    createDependency,
    updateDependency,
    deleteDependency,
    checkTaskDependencies,
    getAllDependencies
  }
}