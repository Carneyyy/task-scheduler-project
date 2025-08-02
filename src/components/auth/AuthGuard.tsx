'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  requiredRoles?: string[]
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  fallback 
}: AuthGuardProps) {
  const { isAuthenticated, loading, hasPermission, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || null
  }

  // 检查权限
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission))
    if (!hasAllPermissions) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">权限不足</h1>
            <p className="text-gray-600">您没有访问此页面的权限</p>
          </div>
        </div>
      )
    }
  }

  // 检查角色
  if (requiredRoles.length > 0) {
    const hasAnyRole = requiredRoles.some(role => hasRole(role))
    if (!hasAnyRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">角色权限不足</h1>
            <p className="text-gray-600">您没有访问此页面的角色权限</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}