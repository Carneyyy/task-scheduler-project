'use client'

import { SimpleNavigation } from './SimpleNavigation'

interface SimpleLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function SimpleLayout({ children, currentPage, onPageChange }: SimpleLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SimpleNavigation currentPage={currentPage} onPageChange={onPageChange} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}