'use client'

import { useState } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { TaskList } from '@/components/tasks/TaskList'
import { ProjectTree } from '@/components/tasks/ProjectTree'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useTasks } from '@/hooks/useTasks'
import { useNodes } from '@/hooks/useNodes'
import { useScripts } from '@/hooks/useScripts'

export default function TasksPage() {
  const { 
    tasks, 
    loading, 
    error, 
    createTask, 
    updateTask, 
    deleteTask,
    performTaskAction 
  } = useTasks()
  
  const { nodes } = useNodes()
  const { scripts } = useScripts()

  const handleTaskAdd = async (newTask: any) => {
    const result = await createTask({
      name: newTask.name,
      scriptId: newTask.scriptId,
      nodeId: newTask.nodeId,
      parameters: newTask.parameters || '{}',
      priority: newTask.priority || 'MEDIUM',
      maxRunTime: newTask.maxRunTime,
      isConcurrent: newTask.isConcurrent || false,
      isCompress: newTask.isCompress || false,
      notifyOnComplete: newTask.notifyOnComplete || false,
      emailAuthCode: newTask.emailAuthCode
    })
    
    if (!result) {
      alert('创建任务失败')
    }
  }

  const handleTaskUpdate = async (id: string, updatedTask: any) => {
    const result = await updateTask(id, {
      name: updatedTask.name,
      nodeId: updatedTask.nodeId,
      parameters: updatedTask.parameters,
      priority: updatedTask.priority,
      maxRunTime: updatedTask.maxRunTime,
      isConcurrent: updatedTask.isConcurrent,
      isCompress: updatedTask.isCompress,
      notifyOnComplete: updatedTask.notifyOnComplete,
      emailAuthCode: updatedTask.emailAuthCode
    })
    
    if (!result) {
      alert('更新任务失败')
    }
  }

  const handleTaskDelete = async (id: string) => {
    const result = await deleteTask(id)
    if (!result) {
      alert('删除任务失败')
    }
  }

  const handleTaskStart = async (id: string) => {
    const result = await performTaskAction(id, 'start')
    if (!result) {
      alert('启动任务失败')
    }
  }

  const handleTaskStop = async (id: string) => {
    const result = await performTaskAction(id, 'stop')
    if (!result) {
      alert('停止任务失败')
    }
  }

  const handleTaskPause = async (id: string) => {
    const result = await performTaskAction(id, 'pause')
    if (!result) {
      alert('暂停任务失败')
    }
  }

  const handleTaskResume = async (id: string) => {
    const result = await performTaskAction(id, 'resume')
    if (!result) {
      alert('恢复任务失败')
    }
  }

  const handleTaskRetry = async (id: string) => {
    const result = await performTaskAction(id, 'retry')
    if (!result) {
      alert('重试任务失败')
    }
  }

  // 转换数据格式以适配组件
  const formattedTasks = tasks.map(task => ({
    id: task.id,
    name: task.name,
    type: 'spider' as const, // 默认为爬虫任务，后续可以根据需要扩展
    spiderId: task.scriptId, // 使用scriptId作为spiderId
    nodeId: task.nodeId,
    description: '', // 临时使用空描述
    config: {
      schedule: '0 0 * * *', // 临时使用默认调度
      priority: task.priority.toLowerCase() as 'high' | 'medium' | 'low',
      maxRetries: 3,
      timeout: task.maxRunTime * 1000
    },
    parameters: {
      account: '',
      password: '',
      shop: '',
      dateRange: {
        startDate: '',
        endDate: ''
      },
      isConcurrent: task.isConcurrent || false,
      emailAuthCode: task.emailAuthCode || '',
      filePath: '',
      isCompress: task.isCompress || false,
      notifyOnComplete: task.notifyOnComplete || false
    },
    status: task.status.toLowerCase() as 'running' | 'completed' | 'pending' | 'failed' | 'paused' | 'stopped',
    progress: task.status === 'RUNNING' ? 50 : task.status === 'SUCCESS' ? 100 : 0,
    startTime: task.executions?.[0]?.startTime,
    endTime: task.executions?.[0]?.endTime,
    result: task.executions?.[0] ? {
      totalItems: 100, // 临时使用默认值
      successItems: task.status === 'SUCCESS' ? 100 : 50,
      failedItems: task.status === 'SUCCESS' ? 0 : 50,
      dataSize: '10MB',
      error: task.executions?.[0]?.error
    } : null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }))

  const formattedScripts = scripts.map(script => ({
    id: script.id,
    name: script.name,
    platform: script.platform
  }))

  const formattedNodes = nodes.map(node => ({
    id: node.id,
    name: node.name,
    status: node.status.toLowerCase()
  }))

  // 模拟引擎数据
  const mockEngines = [
    {
      id: '1',
      name: 'Python自动化引擎',
      version: '0.001'
    },
    {
      id: '2',
      name: 'Node.js自动化引擎',
      version: '0.002'
    },
    {
      id: '3',
      name: 'Go自动化引擎',
      version: '0.001'
    }
  ]

  // 扩展脚本数据，添加不同类型的脚本
  const extendedScripts = [
    ...scripts.map(script => ({
      id: script.id,
      name: script.name,
      platform: script.platform
    })),
    // 添加电商相关脚本
    {
      id: 'ecommerce-1',
      name: '电商数据采集脚本',
      platform: 'windows'
    },
    {
      id: 'ecommerce-2', 
      name: '店铺商品监控脚本',
      platform: 'linux'
    },
    // 添加数据处理脚本
    {
      id: 'data-1',
      name: '数据处理自动化脚本',
      platform: 'windows'
    },
    {
      id: 'data-2',
      name: '数据清洗脚本',
      platform: 'linux'
    },
    // 添加报告生成脚本
    {
      id: 'report-1',
      name: '报告生成自动化脚本',
      platform: 'windows'
    },
    {
      id: 'report-2',
      name: '月度报表生成脚本',
      platform: 'linux'
    },
    // 添加系统监控脚本
    {
      id: 'monitor-1',
      name: '系统监控自动化脚本',
      platform: 'linux'
    },
    {
      id: 'monitor-2',
      name: '性能监控脚本',
      platform: 'windows'
    }
  ]
  
  // 模拟项目树数据
  const projectTreeData = [
    {
      id: 'root',
      name: '爬虫项目',
      type: 'folder' as const,
      path: '/',
      children: [
        {
          id: 'spiders',
          name: '爬虫任务',
          type: 'folder' as const,
          path: '/spiders',
          children: [
            {
              id: 'spider-1',
              name: '电商数据采集',
              type: 'spider' as const,
              path: '/spiders/ecommerce',
              status: 'running' as const,
              description: '采集电商平台商品数据'
            },
            {
              id: 'spider-2',
              name: '社交媒体监控',
              type: 'spider' as const,
              path: '/spiders/social',
              status: 'stopped' as const,
              description: '监控社交媒体话题趋势'
            },
            {
              id: 'spider-3',
              name: '新闻聚合',
              type: 'spider' as const,
              path: '/spiders/news',
              status: 'completed' as const,
              description: '聚合各大新闻平台头条'
            }
          ]
        },
        {
          id: 'automation',
          name: '自动化任务',
          type: 'folder' as const,
          path: '/automation',
          children: [
            {
              id: 'automation-1',
              name: '数据处理自动化',
              type: 'automation' as const,
              path: '/automation/data-processing',
              status: 'running' as const,
              description: '自动处理和分析采集数据'
            },
            {
              id: 'automation-2',
              name: '报告生成自动化',
              type: 'automation' as const,
              path: '/automation/report-generation',
              status: 'paused' as const,
              description: '自动生成数据报告'
            },
            {
              id: 'automation-3',
              name: '系统监控自动化',
              type: 'automation' as const,
              path: '/automation/system-monitoring',
              status: 'stopped' as const,
              description: '监控系统运行状态'
            }
          ]
        },
        {
          id: 'scripts',
          name: '脚本文件',
          type: 'folder' as const,
          path: '/scripts',
          children: [
            {
              id: 'script-1',
              name: 'main.py',
              type: 'file' as const,
              path: '/scripts/main.py',
              description: '主程序入口'
            },
            {
              id: 'script-2',
              name: 'config.py',
              type: 'file' as const,
              path: '/scripts/config.py',
              description: '配置文件'
            },
            {
              id: 'script-3',
              name: 'utils.py',
              type: 'file' as const,
              path: '/scripts/utils.py',
              description: '工具函数'
            }
          ]
        }
      ]
    }
  ]

  const handleNodeSelect = (node: any) => {
    console.log('选中节点:', node)
  }

  const handleNodeAction = (nodeId: string, action: string) => {
    console.log('节点操作:', nodeId, action)
  }

  if (loading && tasks.length === 0) {
    return (
      <AuthGuard requiredPermissions={['task:read']}>
        <PageWrapper currentPage="tasks">
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
      <AuthGuard requiredPermissions={['task:read']}>
        <PageWrapper currentPage="tasks">
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
    <AuthGuard requiredPermissions={['task:read']}>
      <PageWrapper currentPage="tasks">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">任务管理</h1>
              <p className="text-muted-foreground">管理和监控爬虫任务与自动化任务的执行状态</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 项目树 */}
            <div className="lg:col-span-1">
              <ProjectTree
                nodes={projectTreeData}
                onNodeSelect={handleNodeSelect}
                onNodeAction={handleNodeAction}
              />
            </div>

            {/* 任务列表 */}
            <div className="lg:col-span-3">
              <TaskList
                tasks={formattedTasks}
                spiders={formattedScripts}
                engines={mockEngines}
                scripts={extendedScripts}
                nodes={formattedNodes}
                onTaskAdd={handleTaskAdd}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onTaskStart={handleTaskStart}
                onTaskStop={handleTaskStop}
                onTaskPause={handleTaskPause}
                onTaskResume={handleTaskResume}
                onTaskRetry={handleTaskRetry}
              />
            </div>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  )
}