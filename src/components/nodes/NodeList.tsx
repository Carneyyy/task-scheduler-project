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
  Server,
  Wifi,
  WifiOff,
  RotateCcw,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  MapPin,
  Clock
} from 'lucide-react'

interface Node {
  id: string
  name: string
  type: 'master' | 'worker' | 'proxy' | 'storage'
  host: string
  port: number
  status: 'online' | 'offline' | 'restarting'
  capacity: {
    cpu: number
    memory: number
    storage: number
    network: number
  }
  usage: {
    cpu: number
    memory: number
    storage: number
    network: number
  }
  lastHeartbeat?: string | null
  location: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface NodeListProps {
  nodes: Node[]
  onNodeAdd: (node: Omit<Node, 'id' | 'status' | 'usage' | 'lastHeartbeat' | 'createdAt' | 'updatedAt'>) => void
  onNodeUpdate: (id: string, node: Partial<Node>) => void
  onNodeDelete: (id: string) => void
  onNodeRestart: (id: string) => void
  onNodeStop: (id: string) => void
}

export function NodeList({ 
  nodes, 
  onNodeAdd, 
  onNodeUpdate, 
  onNodeDelete,
  onNodeRestart,
  onNodeStop 
}: NodeListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  
  const [newNode, setNewNode] = useState({
    name: '',
    type: 'worker' as const,
    host: '',
    port: 8080,
    capacity: {
      cpu: 4,
      memory: 16,
      storage: 500,
      network: 1000
    },
    location: '',
    description: ''
  })

  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddNode = () => {
    if (newNode.name && newNode.host && newNode.location) {
      onNodeAdd(newNode)
      setNewNode({
        name: '',
        type: 'worker',
        host: '',
        port: 8080,
        capacity: {
          cpu: 4,
          memory: 16,
          storage: 500,
          network: 1000
        },
        location: '',
        description: ''
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateNode = () => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, selectedNode)
      setIsEditDialogOpen(false)
      setSelectedNode(null)
    }
  }

  const handleDeleteNode = (id: string) => {
    if (confirm('确定要删除此节点吗？')) {
      onNodeDelete(id)
    }
  }

  const openEditDialog = (node: Node) => {
    setSelectedNode(node)
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-500">在线</Badge>
      case 'restarting':
        return <Badge variant="secondary">重启中</Badge>
      case 'offline':
        return <Badge variant="destructive">离线</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'master':
        return <Badge variant="default">主节点</Badge>
      case 'worker':
        return <Badge variant="secondary">工作节点</Badge>
      case 'proxy':
        return <Badge variant="outline">代理节点</Badge>
      case 'storage':
        return <Badge variant="outline">存储节点</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return '从未'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getTimeSinceLastHeartbeat = (lastHeartbeat?: string | null) => {
    if (!lastHeartbeat) return '从未'
    const now = new Date()
    const last = new Date(lastHeartbeat)
    const diff = now.getTime() - last.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`
    
    const days = Math.floor(hours / 24)
    return `${days}天前`
  }

  const getNodeStats = () => {
    const total = nodes.length
    const online = nodes.filter(n => n.status === 'online').length
    const offline = nodes.filter(n => n.status === 'offline').length
    const restarting = nodes.filter(n => n.status === 'restarting').length
    
    return { total, online, offline, restarting }
  }

  const stats = getNodeStats()

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">总节点数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold text-green-500">{stats.online}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">在线节点</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold text-red-500">{stats.offline}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">离线节点</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold text-blue-500">{stats.restarting}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">重启中</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和添加按钮 */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索节点..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增节点
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>新增节点</DialogTitle>
              <DialogDescription>
                添加一个新的分布式节点
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="node-name">节点名称</Label>
                <Input
                  id="node-name"
                  value={newNode.name}
                  onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                  placeholder="请输入节点名称"
                />
              </div>
              <div>
                <Label htmlFor="node-type">节点类型</Label>
                <Select value={newNode.type} onValueChange={(value: any) => setNewNode({ ...newNode, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="master">主节点</SelectItem>
                    <SelectItem value="worker">工作节点</SelectItem>
                    <SelectItem value="proxy">代理节点</SelectItem>
                    <SelectItem value="storage">存储节点</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="node-host">主机地址</Label>
                  <Input
                    id="node-host"
                    value={newNode.host}
                    onChange={(e) => setNewNode({ ...newNode, host: e.target.value })}
                    placeholder="192.168.1.100"
                  />
                </div>
                <div>
                  <Label htmlFor="node-port">端口</Label>
                  <Input
                    id="node-port"
                    type="number"
                    value={newNode.port}
                    onChange={(e) => setNewNode({ ...newNode, port: parseInt(e.target.value) || 8080 })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="node-location">位置</Label>
                <Input
                  id="node-location"
                  value={newNode.location}
                  onChange={(e) => setNewNode({ ...newNode, location: e.target.value })}
                  placeholder="北京机房"
                />
              </div>
              <div>
                <Label className="text-base font-medium">硬件配置</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="cpu-cores">CPU核心数</Label>
                    <Input
                      id="cpu-cores"
                      type="number"
                      value={newNode.capacity.cpu}
                      onChange={(e) => setNewNode({
                        ...newNode,
                        capacity: { ...newNode.capacity, cpu: parseInt(e.target.value) || 4 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory-gb">内存(GB)</Label>
                    <Input
                      id="memory-gb"
                      type="number"
                      value={newNode.capacity.memory}
                      onChange={(e) => setNewNode({
                        ...newNode,
                        capacity: { ...newNode.capacity, memory: parseInt(e.target.value) || 16 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="storage-gb">存储(GB)</Label>
                    <Input
                      id="storage-gb"
                      type="number"
                      value={newNode.capacity.storage}
                      onChange={(e) => setNewNode({
                        ...newNode,
                        capacity: { ...newNode.capacity, storage: parseInt(e.target.value) || 500 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="network-mbps">网络(Mbps)</Label>
                    <Input
                      id="network-mbps"
                      type="number"
                      value={newNode.capacity.network}
                      onChange={(e) => setNewNode({
                        ...newNode,
                        capacity: { ...newNode.capacity, network: parseInt(e.target.value) || 1000 }
                      })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="node-description">描述</Label>
                <Textarea
                  id="node-description"
                  value={newNode.description}
                  onChange={(e) => setNewNode({ ...newNode, description: e.target.value })}
                  placeholder="请输入节点描述"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddNode}>添加节点</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 节点列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>节点列表</span>
            <Badge variant="secondary">{filteredNodes.length} 个节点</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>节点信息</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>资源使用</TableHead>
                <TableHead>位置</TableHead>
                <TableHead>最后心跳</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium">{node.name}</div>
                        {getTypeBadge(node.type)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {node.host}:{node.port}
                      </div>
                      {node.description && (
                        <div className="text-xs text-muted-foreground">{node.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(node.status)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-3 w-3" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs">
                            <span>CPU</span>
                            <span>{node.usage.cpu.toFixed(1)}%</span>
                          </div>
                          <Progress value={node.usage.cpu} className="h-1" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MemoryStick className="h-3 w-3" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs">
                            <span>内存</span>
                            <span>{node.usage.memory.toFixed(1)}%</span>
                          </div>
                          <Progress value={node.usage.memory} className="h-1" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-3 w-3" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs">
                            <span>存储</span>
                            <span>{node.usage.storage.toFixed(1)}%</span>
                          </div>
                          <Progress value={node.usage.storage} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-3 w-3" />
                      <span>{node.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{getTimeSinceLastHeartbeat(node.lastHeartbeat)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(node.lastHeartbeat)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {node.status === 'online' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNodeRestart(node.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {node.status === 'offline' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNodeRestart(node.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {node.status === 'online' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNodeStop(node.id)}
                        >
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(node)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNode(node.id)}
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