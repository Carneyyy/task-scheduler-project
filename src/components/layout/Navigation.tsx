'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Bug, 
  Server, 
  Play, 
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  User,
  Clock
} from 'lucide-react'

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const menuItems = [
  {
    id: 'dashboard',
    label: '仪表盘',
    icon: LayoutDashboard,
    href: '/',
    permission: null // 所有人都可以访问
  },
  {
    id: 'users',
    label: '用户管理',
    icon: Users,
    href: '/users',
    permission: 'user:manage' // 需要用户管理权限
  },
  {
    id: 'scripts',
    label: '脚本管理',
    icon: FileText,
    href: '/scripts',
    permission: null // 所有人都可以访问
  },
  {
    id: 'spiders',
    label: '爬虫管理',
    icon: Bug,
    href: '/spiders',
    permission: null // 所有人都可以访问
  },
  {
    id: 'nodes',
    label: '节点管理',
    icon: Server,
    href: '/nodes',
    permission: 'node:read' // 需要查看节点权限
  },
  {
    id: 'tasks',
    label: '任务管理',
    icon: Play,
    href: '/tasks',
    permission: 'task:read' // 需要查看任务权限
  },
  {
    id: 'scheduler',
    label: '任务调度',
    icon: Clock,
    href: '/scheduler',
    permission: 'task:read' // 需要查看任务权限
  },
  {
    id: 'notifications',
    label: '告警通知',
    icon: Bell,
    href: '/notifications',
    permission: 'notification:read' // 需要查看通知权限
  }
]

const userMenuItems = [
  {
    id: 'profile',
    label: '个人资料',
    icon: User,
    href: '/profile',
    permission: null // 所有人都可以访问
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: Settings,
    href: '/settings',
    permission: null // 所有人都可以访问
  }
]

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { hasPermission } = useAuth()

  // 根据用户权限过滤菜单项
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true // 没有权限要求的菜单项所有人都可见
    return hasPermission(item.permission)
  })

  return (
    <div className={cn(
      'bg-background border-r border-border transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">爬虫管理</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isCollapsed && 'justify-center px-2'
                )}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className={cn(
                  'h-4 w-4',
                  !isCollapsed && 'mr-2'
                )} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-border space-y-2">
          {userMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isCollapsed && 'justify-center px-2'
                )}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className={cn(
                  'h-4 w-4',
                  !isCollapsed && 'mr-2'
                )} />
                {!isCollapsed && item.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}