'use client'

import { Button } from '@/components/ui/button'

interface SimpleNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export function SimpleNavigation({ currentPage, onPageChange }: SimpleNavigationProps) {
  const menuItems = [
    { id: 'dashboard', label: '仪表盘' },
    { id: 'users', label: '用户管理' },
    { id: 'scripts', label: '脚本管理' },
    { id: 'spiders', label: '爬虫管理' },
    { id: 'nodes', label: '节点管理' },
    { id: 'tasks', label: '任务管理' },
    { id: 'webhooks', label: '告警通知' },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold">爬虫管理</h2>
      </div>
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPage === item.id ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onPageChange(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  )
}