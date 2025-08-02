'use client'

import { useState } from 'react'
import { SimpleLayout } from './SimpleLayout'

interface SimplePageWrapperProps {
  children: React.ReactNode
  currentPage: string
}

export function SimplePageWrapper({ children, currentPage }: SimplePageWrapperProps) {
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
    }
  }

  return (
    <SimpleLayout currentPage={currentPageState} onPageChange={handlePageChange}>
      {children}
    </SimpleLayout>
  )
}