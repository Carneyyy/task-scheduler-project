'use client'

import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentTasks } from '@/components/dashboard/RecentTasks'
import { NodeStatus } from '@/components/dashboard/NodeStatus'
import { SystemHealth } from '@/components/dashboard/SystemHealth'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { 
  Server, 
  FileText, 
  Play, 
  Heart,
  Activity,
  Users,
  Settings
} from 'lucide-react'

export default function Home() {
  // 模拟数据
  const mockStats = [
    {
      title: '总节点数',
      value: 12,
      description: '3个离线',
      icon: Server,
      trend: { value: 8, isPositive: true }
    },
    {
      title: '脚本数',
      value: 24,
      description: '2个本周新增',
      icon: FileText,
      trend: { value: 12, isPositive: true }
    },
    {
      title: '运行中的任务',
      value: 8,
      description: '5个等待中',
      icon: Play,
      trend: { value: -5, isPositive: false }
    },
    {
      title: '系统健康度',
      value: '85%',
      description: '良好状态',
      icon: Heart,
      trend: { value: 3, isPositive: true }
    }
  ]

  const mockRecentTasks = [
    {
      id: '1',
      name: '数据采集任务 - 电商平台',
      status: 'running' as const,
      startTime: '2024-01-15 14:30:00',
      duration: '2h 15m',
      node: 'Node-001'
    },
    {
      id: '2',
      name: '价格监控任务',
      status: 'success' as const,
      startTime: '2024-01-15 12:00:00',
      duration: '45m',
      node: 'Node-002'
    },
    {
      id: '3',
      name: '库存同步任务',
      status: 'failed' as const,
      startTime: '2024-01-15 10:30:00',
      duration: '1h 20m',
      node: 'Node-003'
    },
    {
      id: '4',
      name: '订单处理任务',
      status: 'pending' as const,
      startTime: '2024-01-15 09:00:00',
      node: 'Node-004'
    },
    {
      id: '5',
      name: '数据清洗任务',
      status: 'success' as const,
      startTime: '2024-01-15 08:00:00',
      duration: '30m',
      node: 'Node-005'
    }
  ]

  const mockNodes = [
    {
      id: '1',
      name: 'Node-001',
      status: 'online' as const,
      cpuUsage: 45,
      memoryUsage: 60,
      diskUsage: 35,
      host: '192.168.1.100',
      port: 8080
    },
    {
      id: '2',
      name: 'Node-002',
      status: 'busy' as const,
      cpuUsage: 85,
      memoryUsage: 75,
      diskUsage: 45,
      host: '192.168.1.101',
      port: 8080
    },
    {
      id: '3',
      name: 'Node-003',
      status: 'offline' as const,
      host: '192.168.1.102',
      port: 8080
    },
    {
      id: '4',
      name: 'Node-004',
      status: 'online' as const,
      cpuUsage: 25,
      memoryUsage: 40,
      diskUsage: 20,
      host: '192.168.1.103',
      port: 8080
    },
    {
      id: '5',
      name: 'Node-005',
      status: 'error' as const,
      host: '192.168.1.104',
      port: 8080
    }
  ]

  return (
    <AuthGuard>
      <PageWrapper currentPage="dashboard">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">爬虫任务管理系统</h1>
              <p className="text-muted-foreground">实时监控和管理您的爬虫任务</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>系统运行正常</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>管理员</span>
              </div>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mockStats.map((stat, index) => (
              <DashboardStats
                key={index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))}
          </div>

          {/* 系统健康状态 */}
          <SystemHealth
            healthScore={85}
            cpuUsage={45}
            memoryUsage={60}
            diskUsage={35}
            activeNodes={9}
            totalNodes={12}
            runningTasks={8}
          />

          {/* 最近任务和节点状态 */}
          <div className="grid gap-6 md:grid-cols-5">
            <RecentTasks tasks={mockRecentTasks} />
            <NodeStatus nodes={mockNodes} />
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  )
}