'use client'

import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SpiderList } from '@/components/spiders/SpiderList'
import { useSpiders } from '@/hooks/useSpiders'
import { useNodes } from '@/hooks/useNodes'
import { useScripts } from '@/hooks/useScripts'

export default function SpidersPage() {
  const { 
    spiders, 
    loading, 
    error, 
    pagination,
    createSpider, 
    updateSpider, 
    deleteSpider,
    performSpiderAction 
  } = useSpiders()
  
  const { nodes } = useNodes()
  const { scripts } = useScripts()

  const handleSpiderAdd = async (newSpider: any) => {
    const result = await createSpider({
      name: newSpider.name,
      nodeId: newSpider.nodeId || undefined,
      packagePath: newSpider.packagePath || undefined,
      description: newSpider.description || undefined
    })
    
    if (!result) {
      alert('创建爬虫失败')
    }
  }

  const handleSpiderUpdate = async (id: string, updatedSpider: any) => {
    const result = await updateSpider(id, {
      name: updatedSpider.name,
      nodeId: updatedSpider.nodeId,
      packagePath: updatedSpider.packagePath,
      description: updatedSpider.description,
      isActive: updatedSpider.isActive
    })
    
    if (!result) {
      alert('更新爬虫失败')
    }
  }

  const handleSpiderDelete = async (id: string) => {
    const result = await deleteSpider(id)
    if (!result) {
      alert('删除爬虫失败')
    }
  }

  const handleSpiderStart = async (id: string) => {
    const result = await performSpiderAction(id, 'start')
    if (!result) {
      alert('启动爬虫失败')
    }
  }

  const handleSpiderStop = async (id: string) => {
    const result = await performSpiderAction(id, 'stop')
    if (!result) {
      alert('停止爬虫失败')
    }
  }

  const handleSpiderPause = async (id: string) => {
    const result = await performSpiderAction(id, 'pause')
    if (!result) {
      alert('暂停爬虫失败')
    }
  }

  // 转换数据格式以适配组件
  const formattedSpiders = spiders.map(spider => ({
    id: spider.id,
    name: spider.name,
    scriptId: '1', // 临时使用默认脚本ID
    engineId: '1', // 临时使用默认引擎ID
    description: spider.description,
    config: {
      targetUrls: spider.packagePath ? [spider.packagePath] : [],
      crawlInterval: 3600,
      maxConcurrency: 3,
      retryCount: 3,
      timeout: 30000
    },
    status: spider.isActive ? 'running' : 'stopped',
    lastRunAt: spider.packagedAt,
    nextRunAt: spider.isActive ? new Date().toISOString() : null,
    createdAt: spider.createdAt,
    updatedAt: spider.updatedAt
  }))

  const formattedScripts = scripts.map(script => ({
    id: script.id,
    name: script.name,
    platform: script.platform
  }))

  const formattedNodes = nodes.map(node => ({
    id: node.id,
    name: node.name,
    version: '0.001' // 临时使用默认版本
  }))

  if (loading && spiders.length === 0) {
    return (
      <PageWrapper currentPage="spiders">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>加载中...</p>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper currentPage="spiders">
        <div className="container mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-medium">错误</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper currentPage="spiders">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">爬虫管理</h1>
            <p className="text-muted-foreground">管理和监控爬虫任务的运行状态</p>
          </div>
        </div>

        <SpiderList
          spiders={formattedSpiders}
          scripts={formattedScripts}
          engines={formattedNodes}
          onSpiderAdd={handleSpiderAdd}
          onSpiderUpdate={handleSpiderUpdate}
          onSpiderDelete={handleSpiderDelete}
          onSpiderStart={handleSpiderStart}
          onSpiderStop={handleSpiderStop}
          onSpiderPause={handleSpiderPause}
        />
      </div>
    </PageWrapper>
  )
}