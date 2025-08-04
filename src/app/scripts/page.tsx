'use client'

import { useState } from 'react'
import { ScriptList } from '@/components/scripts/ScriptList'
import { PageWrapper } from '@/components/layout/PageWrapper'

// 模拟数据
const mockScripts = [
  {
    id: '1',
    name: '电商数据采集脚本',
    platform: 'windows',
    description: '用于采集电商平台的商品数据、价格信息和用户评价',
    maxRunTime: 7200,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    versions: [
      {
        id: '1',
        scriptId: '1',
        version: '0.001',
        filePath: '/scripts/ecommerce_v0.001.zip',
        size: 2048000,
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        scriptId: '1',
        version: '0.002',
        filePath: '/scripts/ecommerce_v0.002.zip',
        size: 2150000,
        isActive: true,
        createdAt: '2024-01-10'
      }
    ]
  },
  {
    id: '2',
    name: '社交媒体监控脚本',
    platform: 'linux',
    description: '监控社交媒体平台的关键词和话题趋势',
    maxRunTime: 3600,
    isActive: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-12',
    versions: [
      {
        id: '3',
        scriptId: '2',
        version: '0.001',
        filePath: '/scripts/social_v0.001.zip',
        size: 1024000,
        isActive: true,
        createdAt: '2024-01-02'
      }
    ]
  },
  {
    id: '3',
    name: '价格比较脚本',
    platform: 'windows',
    description: '比较不同电商平台的价格差异并发送通知',
    maxRunTime: 1800,
    isActive: false,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-08',
    versions: [
      {
        id: '4',
        scriptId: '3',
        version: '0.001',
        filePath: '/scripts/price_v0.001.zip',
        size: 512000,
        isActive: true,
        createdAt: '2024-01-03'
      },
      {
        id: '5',
        scriptId: '3',
        version: '0.002',
        filePath: '/scripts/price_v0.002.zip',
        size: 524000,
        isActive: true,
        createdAt: '2024-01-08'
      }
    ]
  },
  {
    id: '4',
    name: '新闻聚合脚本',
    platform: 'linux',
    description: '聚合各大新闻平台的头条新闻',
    maxRunTime: 2400,
    isActive: true,
    createdAt: '2024-01-04',
    updatedAt: '2024-01-14',
    versions: [
      {
        id: '6',
        scriptId: '4',
        version: '0.001',
        filePath: '/scripts/news_v0.001.zip',
        size: 768000,
        isActive: true,
        createdAt: '2024-01-04'
      }
    ]
  },
  {
    id: '5',
    name: '库存管理脚本',
    platform: 'macos',
    description: '监控和管理商品库存信息',
    maxRunTime: 4800,
    isActive: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-13',
    versions: [
      {
        id: '7',
        scriptId: '5',
        version: '0.001',
        filePath: '/scripts/inventory_v0.001.zip',
        size: 1536000,
        isActive: true,
        createdAt: '2024-01-05'
      },
      {
        id: '8',
        scriptId: '5',
        version: '0.002',
        filePath: '/scripts/inventory_v0.002.zip',
        size: 1600000,
        isActive: true,
        createdAt: '2024-01-13'
      }
    ]
  }
]

const mockEngines = [
  {
    id: '1',
    name: 'Python爬虫引擎',
    description: '基于Python的通用爬虫引擎，支持动态页面渲染',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    versions: [
      {
        id: '1',
        engineId: '1',
        version: '0.001',
        filePath: '/engines/python_v0.001.zip',
        size: 10240000,
        isActive: true,
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        engineId: '1',
        version: '0.002',
        filePath: '/engines/python_v0.002.zip',
        size: 10485760,
        isActive: true,
        createdAt: '2024-01-10'
      }
    ]
  },
  {
    id: '2',
    name: 'Node.js爬虫引擎',
    description: '基于Node.js的高性能爬虫引擎，适合大规模数据采集',
    isActive: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-12',
    versions: [
      {
        id: '3',
        engineId: '2',
        version: '0.001',
        filePath: '/engines/nodejs_v0.001.zip',
        size: 8192000,
        isActive: true,
        createdAt: '2024-01-02'
      }
    ]
  },
  {
    id: '3',
    name: 'Go爬虫引擎',
    description: '基于Go语言的轻量级爬虫引擎，内存占用低',
    isActive: false,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-08',
    versions: [
      {
        id: '4',
        engineId: '3',
        version: '0.001',
        filePath: '/engines/go_v0.001.zip',
        size: 5120000,
        isActive: true,
        createdAt: '2024-01-03'
      }
    ]
  }
]

export default function ScriptsPage() {
  const [scripts, setScripts] = useState(mockScripts)
  const [engines, setEngines] = useState(mockEngines)

  const handleScriptAdd = (newScript: any) => {
    const script = {
      ...newScript,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      versions: newScript.filePath ? [{
        id: Date.now().toString(),
        scriptId: Date.now().toString(),
        version: newScript.fileVersion || '0.001',
        filePath: newScript.filePath,
        size: newScript.fileSize || 0,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      }] : []
    }
    setScripts([...scripts, script])
  }

  const handleScriptUpdate = (id: string, updatedScript: any) => {
    setScripts(scripts.map(script => 
      script.id === id ? { ...script, ...updatedScript, updatedAt: new Date().toISOString().split('T')[0] } : script
    ))
  }

  const handleScriptDelete = (id: string) => {
    setScripts(scripts.filter(script => script.id !== id))
  }

  const handleEngineAdd = (newEngine: any) => {
    const engine = {
      ...newEngine,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      versions: newEngine.filePath ? [{
        id: Date.now().toString(),
        engineId: Date.now().toString(),
        version: newEngine.fileVersion || '0.001',
        filePath: newEngine.filePath,
        size: newEngine.fileSize || 0,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      }] : []
    }
    setEngines([...engines, engine])
  }

  const handleEngineUpdate = (id: string, updatedEngine: any) => {
    setEngines(engines.map(engine => 
      engine.id === id ? { ...engine, ...updatedEngine, updatedAt: new Date().toISOString().split('T')[0] } : engine
    ))
  }

  const handleEngineDelete = (id: string) => {
    setEngines(engines.filter(engine => engine.id !== id))
  }

  return (
    <PageWrapper currentPage="scripts">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">脚本管理</h1>
            <p className="text-muted-foreground">管理脚本仓库和引擎版本</p>
          </div>
        </div>

        <ScriptList
          scripts={scripts}
          engines={engines}
          onScriptAdd={handleScriptAdd}
          onScriptUpdate={handleScriptUpdate}
          onScriptDelete={handleScriptDelete}
          onEngineAdd={handleEngineAdd}
          onEngineUpdate={handleEngineUpdate}
          onEngineDelete={handleEngineDelete}
        />
      </div>
    </PageWrapper>
  )
}