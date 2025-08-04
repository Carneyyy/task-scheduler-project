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
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Square,
  RotateCcw,
  Clock,
  Calendar,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'

interface Task {
  id: string
  name: string
  type: 'spider' | 'automation'
  spiderId?: string
  nodeId?: string
  engineId?: string
  scriptId?: string
  description?: string
  config: {
    schedule: string
    priority: 'high' | 'medium' | 'low'
    maxRetries: number
    timeout: number
  }
  // 自动化任务专用参数
  parameters?: {
    account?: string
    password?: string
    shop?: string
    dateRange?: {
      startDate: string
      endDate: string
    }
    isConcurrent?: boolean
    emailAuthCode?: string
    filePath?: string
    isCompress?: boolean
    notifyOnComplete?: boolean
  }
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped' | 'paused'
  progress: number
  startTime?: string | null
  endTime?: string | null
  result?: {
    totalItems: number
    successItems: number
    failedItems: number
    dataSize: string
    error?: string
  } | null
  createdAt: string
  updatedAt: string
}

interface Spider {
  id: string
  name: string
}

interface Engine {
  id: string
  name: string
  version: string
}

interface Script {
  id: string
  name: string
  platform: string
}

interface Node {
  id: string
  name: string
  status: string
}

interface TaskListProps {
  tasks: Task[]
  spiders: Spider[]
  engines: Engine[]
  scripts: Script[]
  nodes: Node[]
  onTaskAdd: (task: Omit<Task, 'id' | 'status' | 'progress' | 'startTime' | 'endTime' | 'result' | 'createdAt' | 'updatedAt'>) => void
  onTaskUpdate: (id: string, task: Partial<Task>) => void
  onTaskDelete: (id: string) => void
  onTaskStart: (id: string) => void
  onTaskStop: (id: string) => void
  onTaskPause: (id: string) => void
  onTaskResume: (id: string) => void
  onTaskRetry: (id: string) => void
}

export function TaskList({ 
  tasks, 
  spiders, 
  engines,
  scripts,
  nodes, 
  onTaskAdd, 
  onTaskUpdate, 
  onTaskDelete,
  onTaskStart,
  onTaskStop,
  onTaskPause,
  onTaskResume,
  onTaskRetry
}: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  const [newTask, setNewTask] = useState({
    name: '',
    type: 'spider' as 'spider' | 'automation',
    spiderId: '',
    engineId: '',
    scriptId: '',
    nodeId: '',
    description: '',
    config: {
      schedule: '0 0 * * *',
      priority: 'medium' as const,
      maxRetries: 3,
      timeout: 300000
    },
    parameters: {
      account: '',
      password: '',
      shop: '',
      dateRange: {
        startDate: '',
        endDate: ''
      },
      isConcurrent: false,
      emailAuthCode: '',
      filePath: '',
      isCompress: false,
      notifyOnComplete: false
    }
  })

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddTask = () => {
    if (newTask.name) {
      if (newTask.type === 'spider' && newTask.spiderId && newTask.nodeId) {
        onTaskAdd(newTask)
        setNewTask({
          name: '',
          type: 'spider' as 'spider' | 'automation',
          spiderId: '',
          engineId: '',
          scriptId: '',
          nodeId: '',
          description: '',
          config: {
            schedule: '0 0 * * *',
            priority: 'medium',
            maxRetries: 3,
            timeout: 300000
          },
          parameters: {
            account: '',
            password: '',
            shop: '',
            dateRange: {
              startDate: '',
              endDate: ''
            },
            isConcurrent: false,
            emailAuthCode: '',
            filePath: '',
            isCompress: false,
            notifyOnComplete: false
          }
        })
        setIsAddDialogOpen(false)
      } else if (newTask.type === 'automation' && newTask.engineId && newTask.scriptId && newTask.nodeId) {
        onTaskAdd(newTask)
        setNewTask({
          name: '',
          type: 'spider' as 'spider' | 'automation',
          spiderId: '',
          engineId: '',
          scriptId: '',
          nodeId: '',
          description: '',
          config: {
            schedule: '0 0 * * *',
            priority: 'medium',
            maxRetries: 3,
            timeout: 300000
          },
          parameters: {
            account: '',
            password: '',
            shop: '',
            dateRange: {
              startDate: '',
              endDate: ''
            },
            isConcurrent: false,
            emailAuthCode: '',
            filePath: '',
            isCompress: false,
            notifyOnComplete: false
          }
        })
        setIsAddDialogOpen(false)
      } else {
        alert('请填写必要的字段')
      }
    } else {
      alert('请输入任务名称')
    }
  }

  const handleUpdateTask = () => {
    if (selectedTask) {
      onTaskUpdate(selectedTask.id, selectedTask)
      setIsEditDialogOpen(false)
      setSelectedTask(null)
    }
  }

  const handleDeleteTask = (id: string) => {
    if (confirm('确定要删除此任务吗？')) {
      onTaskDelete(id)
    }
  }

  const openEditDialog = (task: Task) => {
    setSelectedTask(task)
    setIsEditDialogOpen(true)
  }

  const getScriptParameters = (scriptName: string) => {
    const name = scriptName.toLowerCase()
    
    // 根据脚本名称返回需要的参数配置
    if (name.includes('电商') || name.includes('shop') || name.includes('store')) {
      return {
        account: true,
        password: true,
        shop: true,
        dateRange: true,
        isConcurrent: true,
        emailAuthCode: false,
        filePath: true,
        isCompress: true,
        notifyOnComplete: true
      }
    }
    
    if (name.includes('数据') || name.includes('data') || name.includes('处理')) {
      return {
        account: false,
        password: false,
        shop: false,
        dateRange: true,
        isConcurrent: true,
        emailAuthCode: false,
        filePath: true,
        isCompress: true,
        notifyOnComplete: true
      }
    }
    
    if (name.includes('报告') || name.includes('report') || name.includes('生成')) {
      return {
        account: false,
        password: false,
        shop: false,
        dateRange: true,
        isConcurrent: false,
        emailAuthCode: true,
        filePath: true,
        isCompress: true,
        notifyOnComplete: true
      }
    }
    
    if (name.includes('监控') || name.includes('monitor') || name.includes('系统')) {
      return {
        account: true,
        password: true,
        shop: false,
        dateRange: false,
        isConcurrent: false,
        emailAuthCode: true,
        filePath: false,
        isCompress: false,
        notifyOnComplete: true
      }
    }
    
    // 默认配置
    return {
      account: false,
      password: false,
      shop: false,
      dateRange: false,
      isConcurrent: false,
      emailAuthCode: false,
      filePath: false,
      isCompress: false,
      notifyOnComplete: false
    }
  }

  const getTaskTypeBadge = (type: string) => {
    switch (type) {
      case 'spider':
        return <Badge variant="default" className="bg-purple-500">爬虫任务</Badge>
      case 'automation':
        return <Badge variant="default" className="bg-orange-500">自动化任务</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-blue-500">运行中</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500">已完成</Badge>
      case 'failed':
        return <Badge variant="destructive">失败</Badge>
      case 'stopped':
        return <Badge variant="secondary">已停止</Badge>
      case 'paused':
        return <Badge variant="outline">已暂停</Badge>
      case 'pending':
        return <Badge variant="outline">等待中</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">高</Badge>
      case 'medium':
        return <Badge variant="default">中</Badge>
      case 'low':
        return <Badge variant="secondary">低</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '未开始'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const formatDuration = (startTime?: string | null, endTime?: string | null) => {
    if (!startTime) return '未开始'
    if (!endTime) return '进行中'
    
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diff = end.getTime() - start.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`
    }
    return `${minutes}分钟`
  }

  const getTaskStats = () => {
    const total = tasks.length
    const running = tasks.filter(t => t.status === 'running').length
    const completed = tasks.filter(t => t.status === 'completed').length
    const failed = tasks.filter(t => t.status === 'failed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    
    return { total, running, completed, failed, pending }
  }

  const stats = getTaskStats()

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">总任务数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-500">{stats.running}</div>
            <p className="text-xs text-muted-foreground mt-1">运行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">已完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            <p className="text-xs text-muted-foreground mt-1">失败</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">等待中</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索任务..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">等待中</SelectItem>
              <SelectItem value="running">运行中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="failed">失败</SelectItem>
              <SelectItem value="stopped">已停止</SelectItem>
              <SelectItem value="paused">已暂停</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增任务
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新增任务</DialogTitle>
              <DialogDescription>
                创建一个新的任务
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task-name">任务名称</Label>
                <Input
                  id="task-name"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  placeholder="请输入任务名称"
                />
              </div>
              <div>
                <Label htmlFor="task-type">任务类型</Label>
                <Select value={newTask.type} onValueChange={(value: 'spider' | 'automation') => setNewTask({ ...newTask, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spider">爬虫任务</SelectItem>
                    <SelectItem value="automation">自动化任务</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newTask.type === 'spider' && (
                <div>
                  <Label htmlFor="task-spider">选择爬虫</Label>
                  <Select value={newTask.spiderId} onValueChange={(value) => setNewTask({ ...newTask, spiderId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择爬虫" />
                    </SelectTrigger>
                    <SelectContent>
                      {spiders.map((spider) => (
                        <SelectItem key={spider.id} value={spider.id}>
                          {spider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {newTask.type === 'automation' && (
                <>
                  <div>
                    <Label htmlFor="task-engine">选择引擎</Label>
                    <Select value={newTask.engineId} onValueChange={(value) => setNewTask({ ...newTask, engineId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择引擎" />
                      </SelectTrigger>
                      <SelectContent>
                        {engines.map((engine) => (
                          <SelectItem key={engine.id} value={engine.id}>
                            {engine.name} v{engine.version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="task-script">选择脚本</Label>
                    <Select value={newTask.scriptId} onValueChange={(value) => setNewTask({ ...newTask, scriptId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择脚本" />
                      </SelectTrigger>
                      <SelectContent>
                        {scripts.map((script) => (
                          <SelectItem key={script.id} value={script.id}>
                            {script.name} ({script.platform})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="task-node">选择节点</Label>
                <Select value={newTask.nodeId} onValueChange={(value) => setNewTask({ ...newTask, nodeId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择节点" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.filter(node => node.status === 'online').map((node) => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newTask.type === 'automation' && newTask.scriptId && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">运行参数配置</h4>
                    
                    {(() => {
                      const selectedScript = scripts.find(s => s.id === newTask.scriptId)
                      const params = selectedScript ? getScriptParameters(selectedScript.name) : getScriptParameters('')
                      
                      return (
                        <div className="grid grid-cols-3 gap-4">
                          {params.account && (
                            <div>
                              <Label htmlFor="task-account">账号</Label>
                              <Input
                                id="task-account"
                                value={newTask.parameters.account}
                                onChange={(e) => setNewTask({
                                  ...newTask,
                                  parameters: { ...newTask.parameters, account: e.target.value }
                                })}
                                placeholder="请输入账号"
                              />
                            </div>
                          )}
                          
                          {params.password && (
                            <div>
                              <Label htmlFor="task-password">密码</Label>
                              <Input
                                id="task-password"
                                type="password"
                                value={newTask.parameters.password}
                                onChange={(e) => setNewTask({
                                  ...newTask,
                                  parameters: { ...newTask.parameters, password: e.target.value }
                                })}
                                placeholder="请输入密码"
                              />
                            </div>
                          )}
                          
                          {params.shop && (
                            <div>
                              <Label htmlFor="task-shop">执行店铺</Label>
                              <Input
                                id="task-shop"
                                value={newTask.parameters.shop}
                                onChange={(e) => setNewTask({
                                  ...newTask,
                                  parameters: { ...newTask.parameters, shop: e.target.value }
                                })}
                                placeholder="请输入店铺名称"
                              />
                            </div>
                          )}
                          
                          {params.dateRange && (
                            <>
                              <div>
                                <Label htmlFor="task-start-date">开始日期</Label>
                                <Input
                                  id="task-start-date"
                                  type="date"
                                  value={newTask.parameters.dateRange.startDate}
                                  onChange={(e) => setNewTask({
                                    ...newTask,
                                    parameters: { 
                                      ...newTask.parameters, 
                                      dateRange: { ...newTask.parameters.dateRange, startDate: e.target.value }
                                    }
                                  })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="task-end-date">结束日期</Label>
                                <Input
                                  id="task-end-date"
                                  type="date"
                                  value={newTask.parameters.dateRange.endDate}
                                  onChange={(e) => setNewTask({
                                    ...newTask,
                                    parameters: { 
                                      ...newTask.parameters, 
                                      dateRange: { ...newTask.parameters.dateRange, endDate: e.target.value }
                                    }
                                  })}
                                />
                              </div>
                            </>
                          )}
                          
                          {params.emailAuthCode && (
                            <div>
                              <Label htmlFor="task-email-code">邮箱授权码</Label>
                              <Input
                                id="task-email-code"
                                value={newTask.parameters.emailAuthCode}
                                onChange={(e) => setNewTask({
                                  ...newTask,
                                  parameters: { ...newTask.parameters, emailAuthCode: e.target.value }
                                })}
                                placeholder="请输入邮箱授权码"
                              />
                            </div>
                          )}
                          
                          {params.filePath && (
                            <div>
                              <Label htmlFor="task-file-path">文件路径</Label>
                              <Input
                                id="task-file-path"
                                value={newTask.parameters.filePath}
                                onChange={(e) => setNewTask({
                                  ...newTask,
                                  parameters: { ...newTask.parameters, filePath: e.target.value }
                                })}
                                placeholder="请输入文件保存路径"
                              />
                            </div>
                          )}
                          
                          {params.isConcurrent && (
                            <div className="flex items-center space-x-2 col-span-3">
                              <input
                                id="task-concurrent"
                                type="checkbox"
                                checked={newTask.parameters.isConcurrent}
                                onChange={(e) => setNewTask({
                                  ...newTask,
                                  parameters: { ...newTask.parameters, isConcurrent: e.target.checked }
                                })}
                                className="rounded"
                              />
                              <Label htmlFor="task-concurrent">是否并发执行</Label>
                            </div>
                          )}
                          
                          {params.isCompress && (
                            <div className="flex items-center space-x-2 col-span-3">
                              <input
                                id="task-compress"
                                type="checkbox"
                                checked={newTask.parameters.isCompress}
                                onChange={(e) => setNewTask({
                                  ...newTask,
                                  parameters: { ...newTask.parameters, isCompress: e.target.checked }
                                })}
                                className="rounded"
                              />
                              <Label htmlFor="task-compress">是否启用压缩</Label>
                            </div>
                          )}
                          
                          {params.notifyOnComplete && (
                            <div className="flex items-center space-x-2 col-span-3">
                              <input
                                id="task-notify"
                                type="checkbox"
                                checked={newTask.parameters.notifyOnComplete}
                                onChange={(e) => setNewTask({
                                  ...newTask,
                                  parameters: { ...newTask.parameters, notifyOnComplete: e.target.checked }
                                })}
                                className="rounded"
                              />
                              <Label htmlFor="task-notify">完成时发送通知</Label>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="task-description">描述</Label>
                <Textarea
                  id="task-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="请输入任务描述"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="task-schedule">执行计划 (Cron)</Label>
                <Input
                  id="task-schedule"
                  value={newTask.config.schedule}
                  onChange={(e) => setNewTask({
                    ...newTask,
                    config: { ...newTask.config, schedule: e.target.value }
                  })}
                  placeholder="0 0 * * *"
                />
              </div>
              <div>
                <Label htmlFor="task-priority">优先级</Label>
                <Select value={newTask.config.priority} onValueChange={(value: any) => setNewTask({
                  ...newTask,
                  config: { ...newTask.config, priority: value }
                })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-retries">最大重试次数</Label>
                  <Input
                    id="max-retries"
                    type="number"
                    value={newTask.config.maxRetries}
                    onChange={(e) => setNewTask({
                      ...newTask,
                      config: { ...newTask.config, maxRetries: parseInt(e.target.value) || 3 }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">超时时间(毫秒)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={newTask.config.timeout}
                    onChange={(e) => setNewTask({
                      ...newTask,
                      config: { ...newTask.config, timeout: parseInt(e.target.value) || 300000 }
                    })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddTask}>创建任务</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>任务列表</span>
            <Badge variant="secondary">{filteredTasks.length} 个任务</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务信息</TableHead>
                <TableHead>关联资源</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>执行时间</TableHead>
                <TableHead>结果</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{task.name}</div>
                        {getTaskTypeBadge(task.type)}
                      </div>
                      {task.description && (
                        <div className="text-sm text-muted-foreground">{task.description}</div>
                      )}
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(task.config.priority)}
                        <span className="text-xs text-muted-foreground">
                          {task.config.schedule}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {task.type === 'spider' && task.spiderId && (
                        <div>
                          <span className="font-medium">爬虫:</span> {
                            spiders.find(s => s.id === task.spiderId)?.name || '未知'
                          }
                        </div>
                      )}
                      {task.type === 'automation' && task.engineId && (
                        <div>
                          <span className="font-medium">引擎:</span> {
                            engines.find(e => e.id === task.engineId)?.name || '未知'
                          }
                        </div>
                      )}
                      {task.type === 'automation' && task.scriptId && (
                        <div>
                          <span className="font-medium">脚本:</span> {
                            scripts.find(s => s.id === task.scriptId)?.name || '未知'
                          }
                        </div>
                      )}
                      {task.nodeId && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">节点:</span> {
                            nodes.find(n => n.id === task.nodeId)?.name || '未知'
                          }
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>进度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(task.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(task.startTime, task.endTime)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(task.startTime)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.result && (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-2">
                          {task.status === 'completed' ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span>{task.result.successItems}/{task.result.totalItems}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.result.dataSize}
                        </div>
                        {task.result.error && (
                          <div className="text-xs text-red-500">
                            {task.result.error}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {task.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskStart(task.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'running' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskStop(task.id)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'paused' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskResume(task.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskRetry(task.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'stopped' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTaskStart(task.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}