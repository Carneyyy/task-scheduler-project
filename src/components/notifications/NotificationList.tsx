'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DingdingConfigDialog } from './DingdingConfigDialog'
import { 
  Search, 
  Edit, 
  Trash2, 
  Bell,
  BellOff,
  Check,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Mail,
  MessageSquare,
  Settings,
  Play,
  MoreHorizontal,
  Plus,
  Bot
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  level: 'error' | 'warning' | 'success' | 'info'
  source: string
  sourceName: string
  data: any
  isRead: boolean
  createdAt: string
  sentAt: string
}

interface NotificationConfig {
  id: string
  name: string
  type: string
  enabled: boolean
  channels: string[]
  conditions: any
  template: string
  webhookUrl?: string
  keyword?: string
  successTemplateId?: string
  failureTemplateId?: string
}

interface NotificationListProps {
  notifications: Notification[]
  configs: NotificationConfig[]
  onNotificationMarkAsRead: (id: string) => void
  onNotificationMarkAllAsRead: () => void
  onNotificationDelete: (id: string) => void
  onConfigToggle: (id: string, enabled: boolean) => void
  onTestNotification: (configId: string) => void
  onCreateNotification: (notificationData: {
    type: string
    title: string
    message: string
    level?: string
    source?: string
    sourceName?: string
    data?: any
  }) => void
  onCreateDingdingConfig: (config: {
    name: string
    webhookUrl: string
    keyword: string
    successTemplateId: string
    failureTemplateId: string
    enabled: boolean
  }) => void
  onUpdateDingdingConfig: (id: string, config: {
    name: string
    webhookUrl: string
    keyword: string
    successTemplateId: string
    failureTemplateId: string
    enabled: boolean
  }) => void
  onTestDingdingConfig: (config: {
    webhookUrl: string
    keyword: string
    successTemplateId: string
    failureTemplateId: string
  }) => void
}

export function NotificationList({ 
  notifications, 
  configs,
  onNotificationMarkAsRead, 
  onNotificationMarkAllAsRead,
  onNotificationDelete,
  onConfigToggle,
  onTestNotification,
  onCreateNotification,
  onCreateDingdingConfig,
  onUpdateDingdingConfig,
  onTestDingdingConfig
}: NotificationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDingdingConfigDialogOpen, setIsDingdingConfigDialogOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<NotificationConfig | null>(null)
  const [testMessage, setTestMessage] = useState('')
  const [dingdingConfigMode, setDingdingConfigMode] = useState<'create' | 'edit'>('create')
  const [newNotification, setNewNotification] = useState({
    type: 'info',
    title: '',
    message: '',
    level: 'info',
    source: 'system',
    sourceName: '系统',
    data: ''
  })

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || notification.level === levelFilter
    return matchesSearch && matchesLevel
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAsRead = (id: string) => {
    onNotificationMarkAsRead(id)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此通知吗？')) {
      onNotificationDelete(id)
    }
  }

  const openTestDialog = (config: NotificationConfig) => {
    setSelectedConfig(config)
    setTestMessage(`这是${config.name}的测试通知消息`)
    setIsTestDialogOpen(true)
  }

  const handleSendTest = () => {
    if (selectedConfig) {
      onTestNotification(selectedConfig.id)
      setIsTestDialogOpen(false)
      setSelectedConfig(null)
      setTestMessage('')
    }
  }

  const handleCreateNotification = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      alert('标题和消息不能为空')
      return
    }

    const notificationData = {
      type: newNotification.type,
      title: newNotification.title,
      message: newNotification.message,
      level: newNotification.level,
      source: newNotification.source,
      sourceName: newNotification.sourceName,
      data: newNotification.data ? JSON.parse(newNotification.data) : undefined
    }

    onCreateNotification(notificationData)
    setIsCreateDialogOpen(false)
    setNewNotification({
      type: 'info',
      title: '',
      message: '',
      level: 'info',
      source: 'system',
      sourceName: '系统',
      data: ''
    })
  }

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true)
  }

  const openDingdingConfigDialog = (mode: 'create' | 'edit', config?: NotificationConfig) => {
    setDingdingConfigMode(mode)
    if (mode === 'edit' && config) {
      setSelectedConfig(config)
    } else {
      setSelectedConfig(null)
    }
    setIsDingdingConfigDialogOpen(true)
  }

  const handleSaveDingdingConfig = (configData: {
    name: string
    webhookUrl: string
    keyword: string
    successTemplateId: string
    failureTemplateId: string
    enabled: boolean
  }) => {
    if (dingdingConfigMode === 'create') {
      onCreateDingdingConfig(configData)
    } else if (dingdingConfigMode === 'edit' && selectedConfig) {
      onUpdateDingdingConfig(selectedConfig.id, configData)
    }
    setIsDingdingConfigDialogOpen(false)
    setSelectedConfig(null)
  }

  const handleTestDingdingConfig = (configData: {
    webhookUrl: string
    keyword: string
    successTemplateId: string
    failureTemplateId: string
  }) => {
    onTestDingdingConfig(configData)
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <X className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">错误</Badge>
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">警告</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">成功</Badge>
      case 'info':
        return <Badge variant="secondary">信息</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getTypeName = (type: string) => {
    switch (type) {
      case 'task_failed':
        return '任务失败'
      case 'task_completed':
        return '任务完成'
      case 'node_offline':
        return '节点离线'
      case 'high_cpu_usage':
        return 'CPU使用过高'
      case 'dingding_test':
        return '钉钉测试'
      default:
        return '未知类型'
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'dingding':
        return <MessageSquare className="h-4 w-4" />
      case 'email':
        return <Mail className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getChannelName = (channel: string) => {
    switch (channel) {
      case 'dingding':
        return '钉钉'
      case 'email':
        return '邮件'
      default:
        return '未知'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`
    
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{notifications.length}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">总通知数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BellOff className="h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold text-blue-500">{unreadCount}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">未读通知</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold text-red-500">
                {notifications.filter(n => n.level === 'error').length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">错误通知</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold text-green-500">
                {configs.filter(c => c.enabled).length}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">启用配置</p>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">通知列表</TabsTrigger>
          <TabsTrigger value="configs">通知配置</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-4">
          {/* 搜索和操作栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索通知..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="级别筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部级别</SelectItem>
                  <SelectItem value="error">错误</SelectItem>
                  <SelectItem value="warning">警告</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="info">信息</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={openCreateDialog}>
                添加通知
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={onNotificationMarkAllAsRead}
                >
                  全部标记为已读
                </Button>
              )}
            </div>
          </div>

          {/* 通知列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>通知列表</span>
                <Badge variant="secondary">{filteredNotifications.length} 条通知</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg space-y-2 ${
                      !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getLevelIcon(notification.level)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{notification.title}</h3>
                            {getLevelBadge(notification.level)}
                            {!notification.isRead && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                未读
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>来源: {notification.sourceName}</span>
                            <span>类型: {getTypeName(notification.type)}</span>
                            <span>{getTimeAgo(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configs" className="space-y-4">
          {/* 配置操作栏 */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">通知配置管理</h3>
              <p className="text-sm text-muted-foreground">配置各种通知渠道和触发条件</p>
            </div>
            <Button onClick={() => openDingdingConfigDialog('create')}>
              <Plus className="h-4 w-4 mr-2" />
              添加钉钉配置
            </Button>
          </div>

          {/* 配置列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>通知配置</span>
                <Badge variant="secondary">{configs.length} 个配置</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>配置名称</TableHead>
                    <TableHead>触发类型</TableHead>
                    <TableHead>通知渠道</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>条件</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="font-medium">{config.name}</div>
                        {config.webhookUrl && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Bot className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-500">钉钉机器人</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeName(config.type)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {config.channels.map((channel, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              {getChannelIcon(channel)}
                              <span className="text-sm">{getChannelName(channel)}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(checked) => onConfigToggle(config.id, checked)}
                          />
                          <span className="text-sm">{config.enabled ? '启用' : '禁用'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {config.type === 'task_failed' && `重试${config.conditions.retryCount}次`}
                          {config.type === 'node_offline' && `离线${config.conditions.offlineDuration / 60}分钟`}
                          {config.type === 'resource_usage' && `CPU>${config.conditions.cpuThreshold}%`}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTestDialog(config)}
                            disabled={!config.enabled}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          {config.webhookUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDingdingConfigDialog('edit', config)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 测试通知对话框 */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>测试通知</DialogTitle>
            <DialogDescription>
              发送测试通知到 {selectedConfig?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-message">测试消息</Label>
              <Textarea
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="请输入测试消息内容"
                rows={3}
              />
            </div>
            <div>
              <Label>通知渠道</Label>
              <div className="flex items-center space-x-2 mt-2">
                {selectedConfig?.channels.map((channel, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    {getChannelIcon(channel)}
                    <span className="text-sm">{getChannelName(channel)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSendTest}>发送测试</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建通知对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加通知</DialogTitle>
            <DialogDescription>
              创建一个新的通知消息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notification-type">通知类型</Label>
              <Select 
                value={newNotification.type} 
                onValueChange={(value) => setNewNotification({...newNotification, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task_failed">任务失败</SelectItem>
                  <SelectItem value="task_completed">任务完成</SelectItem>
                  <SelectItem value="node_offline">节点离线</SelectItem>
                  <SelectItem value="high_cpu_usage">CPU使用过高</SelectItem>
                  <SelectItem value="system">系统</SelectItem>
                  <SelectItem value="info">信息</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notification-level">通知级别</Label>
              <Select 
                value={newNotification.level} 
                onValueChange={(value) => setNewNotification({...newNotification, level: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">错误</SelectItem>
                  <SelectItem value="warning">警告</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="info">信息</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notification-title">通知标题</Label>
              <Input
                id="notification-title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                placeholder="请输入通知标题"
              />
            </div>
            <div>
              <Label htmlFor="notification-message">通知消息</Label>
              <Textarea
                id="notification-message"
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                placeholder="请输入通知消息"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="notification-data">额外数据 (JSON)</Label>
              <Textarea
                id="notification-data"
                value={newNotification.data}
                onChange={(e) => setNewNotification({...newNotification, data: e.target.value})}
                placeholder="请输入JSON格式的额外数据"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateNotification}>创建通知</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 钉钉配置对话框 */}
      <DingdingConfigDialog
        open={isDingdingConfigDialogOpen}
        onOpenChange={setIsDingdingConfigDialogOpen}
        config={selectedConfig ? {
          name: selectedConfig.name,
          webhookUrl: selectedConfig.webhookUrl || '',
          keyword: selectedConfig.keyword || '',
          successTemplateId: selectedConfig.successTemplateId || '',
          failureTemplateId: selectedConfig.failureTemplateId || '',
          enabled: selectedConfig.enabled
        } : undefined}
        onSave={handleSaveDingdingConfig}
        onTest={handleTestDingdingConfig}
        mode={dingdingConfigMode}
      />
    </div>
  )
}