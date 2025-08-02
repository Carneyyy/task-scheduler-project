'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Server, 
  Wifi, 
  WifiOff, 
  Activity,
  MoreHorizontal,
  Cpu,
  HardDrive,
  MemoryStick
} from 'lucide-react'

interface Node {
  id: string
  name: string
  status: 'online' | 'offline' | 'busy' | 'error'
  cpuUsage?: number
  memoryUsage?: number
  diskUsage?: number
  host: string
  port: number
}

interface NodeStatusProps {
  nodes: Node[]
}

export function NodeStatus({ nodes }: NodeStatusProps) {
  const getStatusIcon = (status: Node['status']) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-600" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-600" />
      case 'busy':
        return <Activity className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-600" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusVariant = (status: Node['status']) => {
    switch (status) {
      case 'online':
        return 'default'
      case 'offline':
        return 'destructive'
      case 'busy':
        return 'secondary'
      case 'error':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusColor = (status: Node['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-600'
      case 'offline':
        return 'text-red-600'
      case 'busy':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>节点状态</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {nodes.map((node) => (
              <div key={node.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium">{node.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {node.host}:{node.port}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(node.status)}>
                      {node.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {node.status === 'online' && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4" />
                      <span>CPU: {node.cpuUsage || 0}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="h-4 w-4" />
                      <span>内存: {node.memoryUsage || 0}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4" />
                      <span>磁盘: {node.diskUsage || 0}%</span>
                    </div>
                  </div>
                )}
                
                {node.status === 'online' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>CPU使用率</span>
                      <span>{node.cpuUsage || 0}%</span>
                    </div>
                    <Progress value={node.cpuUsage || 0} className="h-2" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span>内存使用率</span>
                      <span>{node.memoryUsage || 0}%</span>
                    </div>
                    <Progress value={node.memoryUsage || 0} className="h-2" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span>磁盘使用率</span>
                      <span>{node.diskUsage || 0}%</span>
                    </div>
                    <Progress value={node.diskUsage || 0} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}