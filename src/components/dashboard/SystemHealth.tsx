'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'

interface SystemHealthProps {
  healthScore: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  activeNodes: number
  totalNodes: number
  runningTasks: number
}

export function SystemHealth({ 
  healthScore, 
  cpuUsage, 
  memoryUsage, 
  diskUsage, 
  activeNodes, 
  totalNodes, 
  runningTasks 
}: SystemHealthProps) {
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { status: 'healthy', color: 'text-green-600', icon: CheckCircle }
    if (score >= 60) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle }
    return { status: 'critical', color: 'text-red-600', icon: AlertTriangle }
  }

  const healthStatus = getHealthStatus(healthScore)
  const HealthIcon = healthStatus.icon

  const getTrendIcon = (value: number, threshold: number) => {
    if (value > threshold) return <TrendingUp className="h-4 w-4 text-red-600" />
    return <TrendingDown className="h-4 w-4 text-green-600" />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">系统健康程度</CardTitle>
        <Heart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <HealthIcon className={`h-5 w-5 ${healthStatus.color}`} />
            <div className="text-2xl font-bold">{healthScore}%</div>
          </div>
          <Badge variant={healthStatus.status === 'healthy' ? 'default' : 'destructive'}>
            {healthStatus.status === 'healthy' ? '健康' : healthStatus.status === 'warning' ? '警告' : '严重'}
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>CPU使用率</span>
              </span>
              <div className="flex items-center space-x-2">
                <span>{cpuUsage}%</span>
                {getTrendIcon(cpuUsage, 80)}
              </div>
            </div>
            <Progress value={cpuUsage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>内存使用率</span>
              </span>
              <div className="flex items-center space-x-2">
                <span>{memoryUsage}%</span>
                {getTrendIcon(memoryUsage, 80)}
              </div>
            </div>
            <Progress value={memoryUsage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>磁盘使用率</span>
              </span>
              <div className="flex items-center space-x-2">
                <span>{diskUsage}%</span>
                {getTrendIcon(diskUsage, 80)}
              </div>
            </div>
            <Progress value={diskUsage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{activeNodes}/{totalNodes}</div>
              <div className="text-xs text-muted-foreground">活跃节点</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{runningTasks}</div>
              <div className="text-xs text-muted-foreground">运行中任务</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}