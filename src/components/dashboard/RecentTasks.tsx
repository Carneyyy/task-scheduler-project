'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Play, 
  Pause,
  RotateCcw,
  MoreHorizontal
} from 'lucide-react'

interface RecentTask {
  id: string
  name: string
  status: 'running' | 'success' | 'failed' | 'pending'
  startTime: string
  duration?: string
  node?: string
}

interface RecentTasksProps {
  tasks: RecentTask[]
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  const getStatusIcon = (status: RecentTask['status']) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: RecentTask['status']) => {
    switch (status) {
      case 'running':
        return 'default'
      case 'success':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getStatusColor = (status: RecentTask['status']) => {
    switch (status) {
      case 'running':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'pending':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>最近执行的任务</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={getStatusColor(task.status)}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div>
                    <h4 className="font-medium">{task.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{task.startTime}</span>
                      {task.duration && <span>• {task.duration}</span>}
                      {task.node && <span>• {task.node}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant(task.status)}>
                    {task.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}