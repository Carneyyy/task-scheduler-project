'use client'

import { useState } from 'react'
import { AppLayout } from './AppLayout'

interface PageWrapperProps {
  children: React.ReactNode
  currentPage: string
}

export function PageWrapper({ children, currentPage }: PageWrapperProps) {
  const [currentPageState, setCurrentPageState] = useState(currentPage)

  const handlePageChange = (page: string) => {
    setCurrentPageState(page)
    // 这里可以添加路由跳转逻辑
    if (page === 'dashboard') {
      window.location.href = '/'
    } else if (page === 'users') {
      window.location.href = '/users'
    } else if (page === 'scripts') {
      window.location.href = '/scripts'
    } else if (page === 'spiders') {
      window.location.href = '/spiders'
    } else if (page === 'nodes') {
      window.location.href = '/nodes'
    } else if (page === 'tasks') {
      window.location.href = '/tasks'
    } else if (page === 'scheduler') {
      window.location.href = '/scheduler'
    } else if (page === 'notifications') {
      window.location.href = '/notifications'
    } else if (page === 'profile') {
      window.location.href = '/profile'
    } else if (page === 'settings') {
      window.location.href = '/settings'
    }
  }

  return (
    <AppLayout currentPage={currentPageState} onPageChange={handlePageChange}>
      {children}
    </AppLayout>
  )
}