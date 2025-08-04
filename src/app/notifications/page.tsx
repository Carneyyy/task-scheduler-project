'use client'

import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { NotificationList } from '@/components/notifications/NotificationList'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationsPage() {
  const { 
    notifications, 
    configs, 
    loading, 
    error, 
    unreadCount,
    updateNotification, 
    batchUpdateNotifications, 
    deleteNotification,
    updateConfig,
    testConfig,
    createNotification
  } = useNotifications()

  const handleNotificationMarkAsRead = async (id: string) => {
    const result = await updateNotification(id, { isRead: true })
    if (!result) {
      alert('标记已读失败')
    }
  }

  const handleNotificationMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
    if (unreadIds.length > 0) {
      const result = await batchUpdateNotifications('markAsRead', unreadIds)
      if (!result) {
        alert('批量标记已读失败')
      }
    }
  }

  const handleNotificationDelete = async (id: string) => {
    const result = await deleteNotification(id)
    if (!result) {
      alert('删除通知失败')
    }
  }

  const handleConfigToggle = async (id: string, enabled: boolean) => {
    const result = await updateConfig(id, { enabled })
    if (!result) {
      alert('更新配置失败')
    }
  }

  const handleTestNotification = async (configId: string) => {
    const result = await testConfig(configId)
    if (!result) {
      alert('测试通知失败')
    } else {
      alert('测试通知发送成功')
    }
  }

  const handleCreateNotification = async (notificationData: {
    type: string
    title: string
    message: string
    level?: string
    source?: string
    sourceName?: string
    data?: any
  }) => {
    const result = await createNotification(notificationData)
    if (!result) {
      alert('创建通知失败')
    } else {
      alert('通知创建成功')
    }
  }

  const handleCreateDingdingConfig = async (configData: {
    name: string
    webhookUrl: string
    keyword: string
    successTemplateId: string
    failureTemplateId: string
    enabled: boolean
  }) => {
    try {
      const response = await fetch('/api/notification-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configData.name,
          type: 'dingding_test',
          channels: ['dingding'],
          conditions: {},
          template: 'dingding',
          webhookUrl: configData.webhookUrl,
          keyword: configData.keyword,
          successTemplateId: configData.successTemplateId,
          failureTemplateId: configData.failureTemplateId,
          enabled: configData.enabled
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('钉钉配置创建成功')
      } else {
        alert(data.message || '创建钉钉配置失败')
      }
    } catch (error) {
      console.error('创建钉钉配置失败:', error)
      alert('网络错误，请稍后重试')
    }
  }

  const handleUpdateDingdingConfig = async (id: string, configData: {
    name: string
    webhookUrl: string
    keyword: string
    successTemplateId: string
    failureTemplateId: string
    enabled: boolean
  }) => {
    try {
      const response = await fetch(`/api/notification-configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: configData.name,
          webhookUrl: configData.webhookUrl,
          keyword: configData.keyword,
          successTemplateId: configData.successTemplateId,
          failureTemplateId: configData.failureTemplateId,
          enabled: configData.enabled
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('钉钉配置更新成功')
      } else {
        alert(data.message || '更新钉钉配置失败')
      }
    } catch (error) {
      console.error('更新钉钉配置失败:', error)
      alert('网络错误，请稍后重试')
    }
  }

  const handleTestDingdingConfig = async (configData: {
    webhookUrl: string
    keyword: string
    successTemplateId: string
    failureTemplateId: string
  }) => {
    try {
      const response = await fetch('/api/notification-configs/test-dingding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl: configData.webhookUrl,
          keyword: configData.keyword,
          successTemplateId: configData.successTemplateId,
          failureTemplateId: configData.failureTemplateId
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('钉钉测试通知发送成功')
      } else {
        alert(data.message || '钉钉测试通知发送失败')
      }
    } catch (error) {
      console.error('钉钉测试通知失败:', error)
      alert('网络错误，请稍后重试')
    }
  }

  // 转换数据格式以适配组件
  const formattedNotifications = notifications.map(notification => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    level: notification.level,
    source: notification.source,
    sourceName: notification.sourceName,
    data: notification.data ? JSON.parse(notification.data) : undefined,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    sentAt: notification.sentAt
  }))

  const formattedConfigs = configs.map(config => ({
    id: config.id,
    name: config.name,
    type: config.type,
    enabled: config.enabled,
    channels: JSON.parse(config.channels),
    conditions: JSON.parse(config.conditions),
    template: config.template,
    webhookUrl: config.webhookUrl,
    keyword: config.keyword,
    successTemplateId: config.successTemplateId,
    failureTemplateId: config.failureTemplateId
  }))

  if (loading && notifications.length === 0) {
    return (
      <AuthGuard requiredPermissions={['notification:read']}>
        <PageWrapper currentPage="notifications">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>加载中...</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard requiredPermissions={['notification:read']}>
        <PageWrapper currentPage="notifications">
          <div className="container mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium">错误</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredPermissions={['notification:read']}>
      <PageWrapper currentPage="notifications">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">告警通知</h1>
              <p className="text-muted-foreground">管理系统告警和通知配置</p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {unreadCount} 条未读通知
              </div>
            )}
          </div>

          <NotificationList
            notifications={formattedNotifications}
            configs={formattedConfigs}
            onNotificationMarkAsRead={handleNotificationMarkAsRead}
            onNotificationMarkAllAsRead={handleNotificationMarkAllAsRead}
            onNotificationDelete={handleNotificationDelete}
            onConfigToggle={handleConfigToggle}
            onTestNotification={handleTestNotification}
            onCreateNotification={handleCreateNotification}
            onCreateDingdingConfig={handleCreateDingdingConfig}
            onUpdateDingdingConfig={handleUpdateDingdingConfig}
            onTestDingdingConfig={handleTestDingdingConfig}
          />
        </div>
      </PageWrapper>
    </AuthGuard>
  )
}