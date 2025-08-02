'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Shield, User, Check, X } from 'lucide-react'

export default function TestPermissionsPage() {
  const { user, isAuthenticated, hasPermission, hasRole, loading } = useAuth()

  const permissions = [
    { code: 'task:read', name: '查看任务' },
    { code: 'task:create', name: '创建任务' },
    { code: 'task:update', name: '编辑任务' },
    { code: 'task:delete', name: '删除任务' },
    { code: 'node:read', name: '查看节点' },
    { code: 'node:create', name: '创建节点' },
    { code: 'node:update', name: '编辑节点' },
    { code: 'node:delete', name: '删除节点' },
    { code: 'notification:read', name: '查看通知' },
    { code: 'notification:create', name: '创建通知' },
    { code: 'user:manage', name: '用户管理' },
    { code: 'system:settings', name: '系统设置' }
  ]

  const roles = [
    { code: 'admin', name: '管理员' },
    { code: 'user', name: '普通用户' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <PageWrapper currentPage="dashboard">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">权限测试页面</h1>
              <p className="text-muted-foreground">测试用户权限和角色功能</p>
            </div>
          </div>

          {/* 用户信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                当前用户信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">用户ID</p>
                  <p className="text-lg">{user?.id || '未登录'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">邮箱</p>
                  <p className="text-lg">{user?.email || '未登录'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">姓名</p>
                  <p className="text-lg">{user?.name || '未设置'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">认证状态</p>
                  <Badge variant={isAuthenticated ? "default" : "destructive"}>
                    {isAuthenticated ? "已认证" : "未认证"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 角色信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                用户角色
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div key={role.code} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <p className="text-sm text-gray-500">{role.code}</p>
                    </div>
                    {hasRole(role.code) ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 权限信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                用户权限
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => (
                  <div key={permission.code} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{permission.name}</p>
                      <p className="text-sm text-gray-500">{permission.code}</p>
                    </div>
                    {hasPermission(permission.code) ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 菜单可见性测试 */}
          <Card>
            <CardHeader>
              <CardTitle>菜单可见性测试</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">仪表盘</p>
                    <p className="text-sm text-gray-500">所有人可见</p>
                  </div>
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">用户管理</p>
                    <p className="text-sm text-gray-500">需要 user:manage 权限</p>
                  </div>
                  {hasPermission('user:manage') ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">节点管理</p>
                    <p className="text-sm text-gray-500">需要 node:read 权限</p>
                  </div>
                  {hasPermission('node:read') ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">任务管理</p>
                    <p className="text-sm text-gray-500">需要 task:read 权限</p>
                  </div>
                  {hasPermission('task:read') ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">告警通知</p>
                    <p className="text-sm text-gray-500">需要 notification:read 权限</p>
                  </div>
                  {hasPermission('notification:read') ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </AuthGuard>
  )
}