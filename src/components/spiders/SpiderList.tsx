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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Square,
  Settings,
  Clock,
  Calendar,
  Target,
  Zap,
  RotateCcw
} from 'lucide-react'

interface Spider {
  id: string
  name: string
  scriptId: string
  engineId: string
  description?: string
  config: {
    targetUrls: string[]
    crawlInterval: number
    maxConcurrency: number
    retryCount: number
    timeout: number
  }
  status: 'running' | 'stopped' | 'paused'
  lastRunAt?: string | null
  nextRunAt?: string | null
  createdAt: string
  updatedAt: string
}

interface Script {
  id: string
  name: string
  platform: string
}

interface Engine {
  id: string
  name: string
  version: string
}

interface SpiderListProps {
  spiders: Spider[]
  scripts: Script[]
  engines: Engine[]
  onSpiderAdd: (spider: Omit<Spider, 'id' | 'status' | 'lastRunAt' | 'nextRunAt' | 'createdAt' | 'updatedAt'>) => void
  onSpiderUpdate: (id: string, spider: Partial<Spider>) => void
  onSpiderDelete: (id: string) => void
  onSpiderStart: (id: string) => void
  onSpiderStop: (id: string) => void
  onSpiderPause: (id: string) => void
}

export function SpiderList({ 
  spiders, 
  scripts, 
  engines, 
  onSpiderAdd, 
  onSpiderUpdate, 
  onSpiderDelete,
  onSpiderStart,
  onSpiderStop,
  onSpiderPause 
}: SpiderListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSpider, setSelectedSpider] = useState<Spider | null>(null)
  
  const [newSpider, setNewSpider] = useState({
    name: '',
    scriptId: '',
    engineId: '',
    description: '',
    config: {
      targetUrls: [''],
      crawlInterval: 3600,
      maxConcurrency: 3,
      retryCount: 3,
      timeout: 30000
    }
  })

  const filteredSpiders = spiders.filter(spider =>
    spider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spider.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddSpider = () => {
    if (newSpider.name && newSpider.scriptId && newSpider.engineId) {
      onSpiderAdd(newSpider)
      setNewSpider({
        name: '',
        scriptId: '',
        engineId: '',
        description: '',
        config: {
          targetUrls: [''],
          crawlInterval: 3600,
          maxConcurrency: 3,
          retryCount: 3,
          timeout: 30000
        }
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateSpider = () => {
    if (selectedSpider) {
      onSpiderUpdate(selectedSpider.id, selectedSpider)
      setIsEditDialogOpen(false)
      setSelectedSpider(null)
    }
  }

  const handleDeleteSpider = (id: string) => {
    if (confirm('确定要删除此爬虫吗？')) {
      onSpiderDelete(id)
    }
  }

  const openEditDialog = (spider: Spider) => {
    setSelectedSpider(spider)
    setIsEditDialogOpen(true)
  }

  const addTargetUrl = () => {
    setNewSpider({
      ...newSpider,
      config: {
        ...newSpider.config,
        targetUrls: [...newSpider.config.targetUrls, '']
      }
    })
  }

  const removeTargetUrl = (index: number) => {
    setNewSpider({
      ...newSpider,
      config: {
        ...newSpider.config,
        targetUrls: newSpider.config.targetUrls.filter((_, i) => i !== index)
      }
    })
  }

  const updateTargetUrl = (index: number, value: string) => {
    const newTargetUrls = [...newSpider.config.targetUrls]
    newTargetUrls[index] = value
    setNewSpider({
      ...newSpider,
      config: {
        ...newSpider.config,
        targetUrls: newTargetUrls
      }
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-green-500">运行中</Badge>
      case 'paused':
        return <Badge variant="secondary">已暂停</Badge>
      case 'stopped':
        return <Badge variant="outline">已停止</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '从未运行'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const formatInterval = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  return (
    <div className="space-y-6">
      {/* 搜索和添加按钮 */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索爬虫..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增爬虫
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新增爬虫</DialogTitle>
              <DialogDescription>
                创建一个新的爬虫任务
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="spider-name">爬虫名称</Label>
                <Input
                  id="spider-name"
                  value={newSpider.name}
                  onChange={(e) => setNewSpider({ ...newSpider, name: e.target.value })}
                  placeholder="请输入爬虫名称"
                />
              </div>
              <div>
                <Label htmlFor="spider-script">选择脚本</Label>
                <Select value={newSpider.scriptId} onValueChange={(value) => setNewSpider({ ...newSpider, scriptId: value })}>
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
                <Label htmlFor="spider-engine">选择引擎</Label>
                <Select value={newSpider.engineId} onValueChange={(value) => setNewSpider({ ...newSpider, engineId: value })}>
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
                <Label htmlFor="spider-description">描述</Label>
                <Textarea
                  id="spider-description"
                  value={newSpider.description}
                  onChange={(e) => setNewSpider({ ...newSpider, description: e.target.value })}
                  placeholder="请输入爬虫描述"
                  rows={3}
                />
              </div>
              <div className="space-y-4">
                <Label className="text-base font-medium">爬虫配置</Label>
                <div>
                  <Label className="text-sm font-medium">目标URL</Label>
                  <div className="space-y-2">
                    {newSpider.config.targetUrls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={url}
                          onChange={(e) => updateTargetUrl(index, e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1"
                        />
                        {newSpider.config.targetUrls.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTargetUrl(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addTargetUrl}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加URL
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="crawl-interval">抓取间隔（秒）</Label>
                    <Input
                      id="crawl-interval"
                      type="number"
                      value={newSpider.config.crawlInterval}
                      onChange={(e) => setNewSpider({
                        ...newSpider,
                        config: { ...newSpider.config, crawlInterval: parseInt(e.target.value) || 3600 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-concurrency">最大并发数</Label>
                    <Input
                      id="max-concurrency"
                      type="number"
                      value={newSpider.config.maxConcurrency}
                      onChange={(e) => setNewSpider({
                        ...newSpider,
                        config: { ...newSpider.config, maxConcurrency: parseInt(e.target.value) || 3 }
                      })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="retry-count">重试次数</Label>
                    <Input
                      id="retry-count"
                      type="number"
                      value={newSpider.config.retryCount}
                      onChange={(e) => setNewSpider({
                        ...newSpider,
                        config: { ...newSpider.config, retryCount: parseInt(e.target.value) || 3 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeout">超时时间（毫秒）</Label>
                    <Input
                      id="timeout"
                      type="number"
                      value={newSpider.config.timeout}
                      onChange={(e) => setNewSpider({
                        ...newSpider,
                        config: { ...newSpider.config, timeout: parseInt(e.target.value) || 30000 }
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddSpider}>创建爬虫</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 爬虫列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>爬虫列表</span>
            <Badge variant="secondary">{filteredSpiders.length} 个爬虫</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>爬虫信息</TableHead>
                <TableHead>脚本/引擎</TableHead>
                <TableHead>配置</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>运行时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSpiders.map((spider) => (
                <TableRow key={spider.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{spider.name}</div>
                      {spider.description && (
                        <div className="text-sm text-muted-foreground">{spider.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">脚本:</span> {
                          scripts.find(s => s.id === spider.scriptId)?.name || '未知'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">引擎:</span> {
                          engines.find(e => e.id === spider.engineId)?.name || '未知'
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Target className="h-3 w-3" />
                        <span>{spider.config.targetUrls.length} 个目标</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatInterval(spider.config.crawlInterval)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3" />
                        <span>并发 {spider.config.maxConcurrency}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(spider.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">上次: {formatDateTime(spider.lastRunAt)}</span>
                      </div>
                      {spider.nextRunAt && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            下次: {formatDateTime(spider.nextRunAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {spider.status === 'running' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSpiderPause(spider.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSpiderStart(spider.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {spider.status !== 'stopped' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSpiderStop(spider.id)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(spider)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSpider(spider.id)}
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