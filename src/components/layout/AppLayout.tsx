'use client'

import { useState } from 'react'
import { Navigation } from './Navigation'
import { Navbar } from './Navbar'

interface AppLayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function AppLayout({ children, currentPage, onPageChange }: AppLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar currentPage={currentPage} />
      <div className="flex flex-1 overflow-hidden">
        <Navigation currentPage={currentPage} onPageChange={onPageChange} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}