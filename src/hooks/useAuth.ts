'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name?: string
  isActive: boolean
  roles: string[]
  permissions: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  })

  useEffect(() => {
    // 检查localStorage中的认证信息
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          loading: false
        })
      } catch (error) {
        // 解析失败，清除存储
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        })
      }
    } else {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      })
    }
  }, [])

  const login = (token: string, user: User) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      loading: false
    })
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    })
  }

  const hasPermission = (permission: string): boolean => {
    return authState.user?.permissions?.includes(permission) || false
  }

  const hasRole = (role: string): boolean => {
    return authState.user?.roles?.includes(role) || false
  }

  return {
    ...authState,
    login,
    logout,
    hasPermission,
    hasRole
  }
}