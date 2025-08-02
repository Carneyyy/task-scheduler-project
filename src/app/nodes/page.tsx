'use client'

import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { NodeList } from '@/components/nodes/NodeList'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useNodes } from '@/hooks/useNodes'

export default function NodesPage() {
  const { 
    nodes, 
    loading, 
    error, 
    createNode, 
    updateNode, 
    deleteNode,
    performNodeAction 
  } = useNodes()

  const handleNodeAdd = async (newNode: any) => {
    const result = await createNode({
      name: newNode.name,
      host: newNode.host,
      port: newNode.port,
      description: newNode.description || undefined
    })
    
    if (!result) {
      alert('创建节点失败')
    }
  }

  const handleNodeUpdate = async (id: string, updatedNode: any) => {
    const result = await updateNode(id, {
      name: updatedNode.name,
      host: updatedNode.host,
      port: updatedNode.port,
      description: updatedNode.description,
      isActive: updatedNode.isActive
    })
    
    if (!result) {
      alert('更新节点失败')
    }
  }

  const handleNodeDelete = async (id: string) => {
    const result = await deleteNode(id)
    if (!result) {
      alert('删除节点失败')
    }
  }

  const handleNodeRestart = async (id: string) => {
    const result = await performNodeAction(id, 'restart')
    if (!result) {
      alert('重启节点失败')
    }
  }

  const handleNodeStop = async (id: string) => {
    const result = await performNodeAction(id, 'stop')
    if (!result) {
      alert('停止节点失败')
    }
  }

  // 转换数据格式以适配组件
  const formattedNodes = nodes.map(node => ({
    id: node.id,
    name: node.name,
    type: 'worker', // 临时使用默认类型
    host: node.host,
    port: node.port,
    status: node.status.toLowerCase() as 'online' | 'offline' | 'restarting',
    capacity: {
      cpu: 4,
      memory: 16,
      storage: 500,
      network: 1000
    },
    usage: {
      cpu: node.cpuUsage || 0,
      memory: node.memoryUsage || 0,
      storage: node.diskUsage || 0,
      network: 0
    },
    lastHeartbeat: node.updatedAt,
    location: '默认位置', // 临时使用默认位置
    description: node.description,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt
  }))

  if (loading && nodes.length === 0) {
    return (
      <AuthGuard requiredPermissions={['node:read']}>
        <PageWrapper currentPage="nodes">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>加载中...</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard requiredPermissions={['node:read']}>
        <PageWrapper currentPage="nodes">
          <div className="container mx-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-medium">错误</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </PageWrapper>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredPermissions={['node:read']}>
      <PageWrapper currentPage="nodes">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">节点管理</h1>
              <p className="text-muted-foreground">管理和监控分布式爬虫节点</p>
            </div>
          </div>

          <NodeList
            nodes={formattedNodes}
            onNodeAdd={handleNodeAdd}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            onNodeRestart={handleNodeRestart}
            onNodeStop={handleNodeStop}
          />
        </div>
      </PageWrapper>
    </AuthGuard>
  )
}