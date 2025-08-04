'use client'

import { useState, useEffect } from 'react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  level: string
  source?: string
  sourceName?: string
  data?: string
  isRead: boolean
  createdAt: string
  sentAt: string
}

interface NotificationConfig {
  id: string
  name: string
  type: string
  enabled: boolean
  channels: string
  conditions: string
  template: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface NotificationResponse {
  success: boolean
  data: {
    notifications: Notification[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
    unreadCount: number
  }
  message?: string
}

interface NotificationConfigResponse {
  success: boolean
  data: {
    configs: NotificationConfig[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  message?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [configs, setConfigs] = useState<NotificationConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchNotifications = async (page = 1, limit = 10, filters?: {
    level?: string
    type?: string
    isRead?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (filters?.level) {
        params.append('level', filters.level)
      }
      if (filters?.type) {
        params.append('type', filters.type)
      }
      if (filters?.isRead !== undefined) {
        params.append('isRead', filters.isRead.toString())
      }
      
      const response = await fetch(`/api/notifications?${params}`)
      const data: NotificationResponse = await response.json()
      
      if (data.success) {
        setNotifications(data.data.notifications)
        setPagination(data.data.pagination)
        setUnreadCount(data.data.unreadCount)
      } else {
        setError(data.message || '获取通知列表失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('获取通知列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchConfigs = async (page = 1, limit = 10, filters?: {
    type?: string
    enabled?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (filters?.type) {
        params.append('type', filters.type)
      }
      if (filters?.enabled !== undefined) {
        params.append('enabled', filters.enabled.toString())
      }
      
      const response = await fetch(`/api/notification-configs?${params}`)
      const data: NotificationConfigResponse = await response.json()
      
      if (data.success) {
        setConfigs(data.data.configs)
      } else {
        setError(data.message || '获取通知配置失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('获取通知配置失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const createNotification = async (notificationData: {
    type: string
    title: string
    message: string
    level?: string
    source?: string
    sourceName?: string
    data?: any
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取列表
        await fetchNotifications(pagination.page, pagination.limit)
        return data
      } else {
        setError(data.message || '创建通知失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('创建通知失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateNotification = async (id: string, updateData: {
    isRead?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取列表
        await fetchNotifications(pagination.page, pagination.limit)
        return data
      } else {
        setError(data.message || '更新通知失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('更新通知失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取列表
        await fetchNotifications(pagination.page, pagination.limit)
        return data
      } else {
        setError(data.message || '删除通知失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('删除通知失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const batchUpdateNotifications = async (action: 'markAsRead' | 'delete', notificationIds: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/notifications/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, notificationIds })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取列表
        await fetchNotifications(pagination.page, pagination.limit)
        return data
      } else {
        setError(data.message || '批量操作失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('批量操作失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createConfig = async (configData: {
    name: string
    type: string
    channels: string[]
    conditions?: any
    template: string
    enabled?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/notification-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取配置列表
        await fetchConfigs()
        return data
      } else {
        setError(data.message || '创建通知配置失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('创建通知配置失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async (id: string, configData: {
    name?: string
    type?: string
    channels?: string[]
    conditions?: any
    template?: string
    enabled?: boolean
    isActive?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/notification-configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取配置列表
        await fetchConfigs()
        return data
      } else {
        setError(data.message || '更新通知配置失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('更新通知配置失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteConfig = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/notification-configs/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取配置列表
        await fetchConfigs()
        return data
      } else {
        setError(data.message || '删除通知配置失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('删除通知配置失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const testConfig = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/notification-configs/${id}/test`, {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data
      } else {
        setError(data.message || '测试通知配置失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('测试通知配置失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchConfigs()
  }, [])

  return {
    notifications,
    configs,
    loading,
    error,
    unreadCount,
    pagination,
    fetchNotifications,
    fetchConfigs,
    createNotification,
    updateNotification,
    deleteNotification,
    batchUpdateNotifications,
    createConfig,
    updateConfig,
    deleteConfig,
    testConfig
  }
}