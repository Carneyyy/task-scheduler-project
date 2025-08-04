'use client'

import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useTasks } from '@/hooks/useTasks'
import { useNodes } from '@/hooks/useNodes'
import { useScripts } from '@/hooks/useScripts'
import { DependencyGraph } from '@/components/tasks/DependencyGraph'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, ClockIcon, PlusIcon, LinkIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  name: string
  scriptId: string
  nodeId?: string
  parameters: string
  status: string
  priority: string
  maxRunTime?: number
  isConcurrent: boolean
  isCompress: boolean
  notifyOnComplete: boolean
  emailAuthCode?: string
  createdAt: string
  updatedAt: string
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
  dependencies?: TaskDependency[]
  dependents?: TaskDependency[]
}

interface TaskDependency {
  id: string
  taskId: string
  dependsOnTaskId: string
  type: 'SUCCESS' | 'COMPLETION' | 'TIMEOUT' | 'MANUAL'
  condition: 'ALL_SUCCESS' | 'ANY_SUCCESS' | 'ALL_COMPLETE' | 'ANY_COMPLETE'
  timeoutMinutes?: number
  isActive: boolean
  createdAt: string
  dependsOnTask?: Task
}

interface CreateTaskData {
  name: string
  scriptId: string
  nodeId?: string
  parameters: string
  priority: string
  maxRunTime?: number
  isConcurrent: boolean
  isCompress: boolean
  notifyOnComplete: boolean
  emailAuthCode?: string
}

interface CreateDependencyData {
  taskId: string
  dependsOnTaskId: string
  type: 'SUCCESS' | 'COMPLETION' | 'TIMEOUT' | 'MANUAL'
  condition: 'ALL_SUCCESS' | 'ANY_SUCCESS' | 'ALL_COMPLETE' | 'ANY_COMPLETE'
  timeoutMinutes?: number
}

export default function SchedulerPage() {
  const { 
    tasks, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    deleteTask,
    performTaskAction 
  } = useTasks()
  
  const { nodes } = useNodes()
  const { scripts } = useScripts()

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDependencyDialogOpen, setIsDependencyDialogOpen] = useState(false)
  const [dependencyCheckResult, setDependencyCheckResult] = useState<any>(null)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [cronExpression, setCronExpression] = useState('0 0 * * *')

  const handleTaskCreate = async (taskData: CreateTaskData) => {
    try {
      const result = await createTask(taskData)
      if (result) {
        setIsCreateDialogOpen(false)
        // 显示成功消息
        alert('任务创建成功！')
      } else {
        alert('创建任务失败，请检查输入信息')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      alert('创建任务时发生错误，请稍后重试')
    }
  }

  const handleDependencyCreate = async (dependencyData: CreateDependencyData) => {
    try {
      const response = await fetch('/api/task-dependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(dependencyData)
      })

      if (response.ok) {
        setIsDependencyDialogOpen(false)
        // Refresh tasks to update dependencies
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create dependency')
      }
    } catch (error) {
      console.error('Error creating dependency:', error)
      alert('Failed to create dependency')
    }
  }

  const checkTaskDependencies = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/check-dependencies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setDependencyCheckResult(result)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to check dependencies')
      }
    } catch (error) {
      console.error('Error checking dependencies:', error)
      alert('Failed to check dependencies')
    }
  }

  const getTaskDependencies = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const dependencies = await response.json()
        return dependencies
      }
    } catch (error) {
      console.error('Error fetching dependencies:', error)
    }
    return []
  }

  const getTaskDependents = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/dependents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const dependents = await response.json()
        return dependents
      }
    } catch (error) {
      console.error('Error fetching dependents:', error)
    }
    return []
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
        return 'bg-green-100 text-green-800'
      case 'COMPLETION':
        return 'bg-blue-100 text-blue-800'
      case 'TIMEOUT':
        return 'bg-orange-100 text-orange-800'
      case 'MANUAL':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const availableTasks = tasks.filter(task => task.id !== selectedTask?.id)

  return (
    <AuthGuard requiredPermissions={['task:read']}>
      <PageWrapper currentPage="scheduler">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">任务调度器</h1>
              <p className="text-muted-foreground">管理任务依赖关系和调度配置</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  创建任务
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>创建新任务</DialogTitle>
                  <DialogDescription>
                    创建一个新的任务并配置其参数和依赖关系
                  </DialogDescription>
                </DialogHeader>
                <CreateTaskForm
                  onSubmit={handleTaskCreate}
                  scripts={scripts}
                  nodes={nodes}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 任务列表 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>任务列表</CardTitle>
                  <CardDescription>选择任务以查看和配置依赖关系</CardDescription>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTask?.id === task.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {task.script?.name || 'Unknown Script'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 任务详情和依赖配置 */}
            <div className="lg:col-span-2">
              {selectedTask ? (
                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="details">任务详情</TabsTrigger>
                    <TabsTrigger value="dependencies">依赖配置</TabsTrigger>
                    <TabsTrigger value="schedule">调度设置</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedTask.name}</CardTitle>
                        <CardDescription>任务基本信息和配置</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>脚本</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedTask.script?.name || 'Unknown'}
                            </p>
                          </div>
                          <div>
                            <Label>执行节点</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedTask.node?.name || '未分配'}
                            </p>
                          </div>
                          <div>
                            <Label>状态</Label>
                            <Badge className={getStatusColor(selectedTask.status)}>
                              {selectedTask.status}
                            </Badge>
                          </div>
                          <div>
                            <Label>优先级</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedTask.priority}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <Label>参数</Label>
                          <Textarea
                            value={selectedTask.parameters}
                            readOnly
                            className="mt-1"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => performTaskAction(selectedTask.id, 'start')}
                            disabled={selectedTask.status === 'RUNNING'}
                          >
                            启动
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => performTaskAction(selectedTask.id, 'stop')}
                            disabled={selectedTask.status !== 'RUNNING'}
                          >
                            停止
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => checkTaskDependencies(selectedTask.id)}
                          >
                            检查依赖
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="dependencies">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle>依赖关系</CardTitle>
                              <CardDescription>管理任务的依赖关系</CardDescription>
                            </div>
                            <Dialog open={isDependencyDialogOpen} onOpenChange={setIsDependencyDialogOpen}>
                              <DialogTrigger asChild>
                                <Button size="sm">
                                  <LinkIcon className="w-4 h-4 mr-2" />
                                  添加依赖
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>添加任务依赖</DialogTitle>
                                  <DialogDescription>
                                    为当前任务添加依赖关系
                                  </DialogDescription>
                                </DialogHeader>
                                <CreateDependencyForm
                                  taskId={selectedTask.id}
                                  availableTasks={availableTasks}
                                  onSubmit={handleDependencyCreate}
                                  onCancel={() => setIsDependencyDialogOpen(false)}
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <DependencyList
                            taskId={selectedTask.id}
                            onRefresh={() => window.location.reload()}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>依赖关系图</CardTitle>
                          <CardDescription>
                            可视化展示任务之间的依赖关系
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <DependencyGraph
                            taskId={selectedTask.id}
                            onTaskSelect={(taskId) => {
                              const task = tasks.find(t => t.id === taskId)
                              if (task) setSelectedTask(task)
                            }}
                          />
                        </CardContent>
                      </Card>

                      {dependencyCheckResult && (
                        <Card>
                          <CardHeader>
                            <CardTitle>依赖检查结果</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {dependencyCheckResult.satisfied ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircleIcon className="w-5 h-5 text-red-500" />
                                )}
                                <span className="font-medium">
                                  {dependencyCheckResult.satisfied ? '依赖已满足' : '依赖未满足'}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                {dependencyCheckResult.dependencies?.map((dep: any) => (
                                  <div key={dep.dependencyId} className="flex items-center justify-between p-2 border rounded">
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
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule">
                    <Card>
                      <CardHeader>
                        <CardTitle>调度设置</CardTitle>
                        <CardDescription>配置任务的执行计划和时间</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>开始日期</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {startDate ? format(startDate, "PPP") : "选择日期"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={startDate}
                                  onSelect={setStartDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div>
                            <Label>结束日期</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !endDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {endDate ? format(endDate, "PPP") : "选择日期"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={endDate}
                                  onSelect={setEndDate}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div>
                          <Label>Cron 表达式</Label>
                          <Input
                            value={cronExpression}
                            onChange={(e) => setCronExpression(e.target.value)}
                            placeholder="0 0 * * *"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            标准 Cron 表达式格式：分 时 日 月 周
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch id="concurrent" />
                          <Label htmlFor="concurrent">允许并发执行</Label>
                        </div>

                        <div className="flex gap-2">
                          <Button>保存调度配置</Button>
                          <Button variant="outline">测试调度</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <AlertCircleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">请选择一个任务以查看详情</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  )
}

function CreateTaskForm({ 
  onSubmit, 
  scripts, 
  nodes, 
  onCancel 
}: { 
  onSubmit: (data: CreateTaskData) => void
  scripts: any[]
  nodes: any[]
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<CreateTaskData>({
    name: '',
    scriptId: '',
    nodeId: '',
    parameters: '{}',
    priority: 'MEDIUM',
    maxRunTime: 3600,
    isConcurrent: false,
    isCompress: false,
    notifyOnComplete: false,
    emailAuthCode: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">任务名称</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="script">脚本</Label>
        <Select
          value={formData.scriptId}
          onValueChange={(value) => setFormData({ ...formData, scriptId: value })}
        >
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

      <div>
        <Label htmlFor="node">执行节点</Label>
        <Select
          value={formData.nodeId}
          onValueChange={(value) => setFormData({ ...formData, nodeId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择节点" />
          </SelectTrigger>
          <SelectContent>
            {nodes.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">优先级</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">低</SelectItem>
            <SelectItem value="MEDIUM">中</SelectItem>
            <SelectItem value="HIGH">高</SelectItem>
            <SelectItem value="URGENT">紧急</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="parameters">参数 (JSON)</Label>
        <Textarea
          id="parameters"
          value={formData.parameters}
          onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="concurrent"
          checked={formData.isConcurrent}
          onCheckedChange={(checked) => setFormData({ ...formData, isConcurrent: checked })}
        />
        <Label htmlFor="concurrent">允许并发执行</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="compress"
          checked={formData.isCompress}
          onCheckedChange={(checked) => setFormData({ ...formData, isCompress: checked })}
        />
        <Label htmlFor="compress">压缩输出</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="notify"
          checked={formData.notifyOnComplete}
          onCheckedChange={(checked) => setFormData({ ...formData, notifyOnComplete: checked })}
        />
        <Label htmlFor="notify">完成时通知</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit">创建任务</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  )
}

function CreateDependencyForm({ 
  taskId, 
  availableTasks, 
  onSubmit, 
  onCancel 
}: { 
  taskId: string
  availableTasks: Task[]
  onSubmit: (data: CreateDependencyData) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<CreateDependencyData>({
    taskId,
    dependsOnTaskId: '',
    type: 'SUCCESS',
    condition: 'ALL_SUCCESS',
    timeoutMinutes: undefined
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="dependsOnTask">依赖任务</Label>
        <Select
          value={formData.dependsOnTaskId}
          onValueChange={(value) => setFormData({ ...formData, dependsOnTaskId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="选择依赖任务" />
          </SelectTrigger>
          <SelectContent>
            {availableTasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="type">依赖类型</Label>
        <Select
          value={formData.type}
          onValueChange={(value: any) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SUCCESS">成功完成</SelectItem>
            <SelectItem value="COMPLETION">执行完成</SelectItem>
            <SelectItem value="TIMEOUT">超时触发</SelectItem>
            <SelectItem value="MANUAL">手动触发</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="condition">触发条件</Label>
        <Select
          value={formData.condition}
          onValueChange={(value: any) => setFormData({ ...formData, condition: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL_SUCCESS">全部成功</SelectItem>
            <SelectItem value="ANY_SUCCESS">任一成功</SelectItem>
            <SelectItem value="ALL_COMPLETE">全部完成</SelectItem>
            <SelectItem value="ANY_COMPLETE">任一完成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type === 'TIMEOUT' && (
        <div>
          <Label htmlFor="timeout">超时时间（分钟）</Label>
          <Input
            id="timeout"
            type="number"
            value={formData.timeoutMinutes || ''}
            onChange={(e) => setFormData({ ...formData, timeoutMinutes: parseInt(e.target.value) || undefined })}
            placeholder="60"
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit">添加依赖</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  )
}

function DependencyList({ taskId, onRefresh }: { taskId: string, onRefresh: () => void }) {
  const [dependencies, setDependencies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDependencies()
  }, [taskId])

  const loadDependencies = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDependencies(data)
      }
    } catch (error) {
      console.error('Error loading dependencies:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteDependency = async (dependencyId: string) => {
    try {
      const response = await fetch(`/api/task-dependencies/${dependencyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error deleting dependency:', error)
    }
  }

  const getDependencyTypeColor = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800'
      case 'COMPLETION':
        return 'bg-blue-100 text-blue-800'
      case 'TIMEOUT':
        return 'bg-orange-100 text-orange-800'
      case 'MANUAL':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-4">加载中...</div>
  }

  if (dependencies.length === 0) {
    return <div className="text-center py-4 text-muted-foreground">暂无依赖关系</div>
  }

  return (
    <div className="space-y-2">
      {dependencies.map((dep) => (
        <div key={dep.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{dep.dependsOnTask?.name}</h4>
              <Badge className={getDependencyTypeColor(dep.type)}>
                {dep.type}
              </Badge>
              <Badge variant="outline">
                {dep.condition}
              </Badge>
              {dep.timeoutMinutes && (
                <Badge variant="secondary">
                  {dep.timeoutMinutes}分钟
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {dep.dependsOnTask?.script?.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteDependency(dep.id)}
            className="text-red-500 hover:text-red-700"
          >
            删除
          </Button>
        </div>
      ))}
    </div>
  )
}