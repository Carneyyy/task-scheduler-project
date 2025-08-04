'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  File, 
  FileText,
  Bug,
  Cog,
  Play,
  Pause,
  Square,
  MoreHorizontal
} from 'lucide-react'

interface ProjectNode {
  id: string
  name: string
  type: 'folder' | 'file' | 'spider' | 'automation'
  path: string
  children?: ProjectNode[]
  status?: 'running' | 'stopped' | 'paused' | 'completed' | 'failed'
  icon?: React.ReactNode
  description?: string
  lastModified?: string
}

interface ProjectTreeProps {
  nodes: ProjectNode[]
  onNodeSelect?: (node: ProjectNode) => void
  onNodeAction?: (nodeId: string, action: string) => void
}

export function ProjectTree({ nodes, onNodeSelect, onNodeAction }: ProjectTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const handleNodeClick = (node: ProjectNode) => {
    setSelectedNode(node.id)
    onNodeSelect?.(node)
  }

  const handleNodeAction = (nodeId: string, action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onNodeAction?.(nodeId, action)
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-blue-500">运行中</Badge>
      case 'stopped':
        return <Badge variant="secondary">已停止</Badge>
      case 'paused':
        return <Badge variant="outline">已暂停</Badge>
      case 'completed':
        return <Badge variant="default" className="bg-green-500">已完成</Badge>
      case 'failed':
        return <Badge variant="destructive">失败</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  const getNodeIcon = (node: ProjectNode) => {
    if (node.icon) return node.icon
    
    switch (node.type) {
      case 'folder':
        return expandedNodes.has(node.id) ? 
          <FolderOpen className="h-4 w-4 text-blue-500" /> : 
          <Folder className="h-4 w-4 text-blue-500" />
      case 'spider':
        return <Bug className="h-4 w-4 text-purple-500" />
      case 'automation':
        return <Cog className="h-4 w-4 text-orange-500" />
      case 'file':
        return node.name.endsWith('.py') ? 
          <FileText className="h-4 w-4 text-green-500" /> : 
          <File className="h-4 w-4 text-gray-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const renderNode = (node: ProjectNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const isSelected = selectedNode === node.id
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={node.id}>
        <div
          className={`flex items-center space-x-2 p-2 hover:bg-muted cursor-pointer rounded-md transition-colors ${
            isSelected ? 'bg-muted' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => handleNodeClick(node)}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
            >
              {isExpanded ? 
                <ChevronDown className="h-3 w-3" /> : 
                <ChevronRight className="h-3 w-3" />
              }
            </Button>
          ) : (
            <div className="w-4" />
          )}
          
          <div className="flex items-center space-x-2 flex-1">
            {getNodeIcon(node)}
            <span className="text-sm font-medium">{node.name}</span>
            {node.description && (
              <span className="text-xs text-muted-foreground">
                {node.description}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(node.status)}
            
            {node.type === 'spider' || node.type === 'automation' ? (
              <div className="flex items-center space-x-1">
                {node.status === 'stopped' || node.status === 'failed' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => handleNodeAction(node.id, 'start', e)}
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                ) : null}
                
                {node.status === 'running' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => handleNodeAction(node.id, 'stop', e)}
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                ) : null}
                
                {node.status === 'running' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => handleNodeAction(node.id, 'pause', e)}
                  >
                    <Pause className="h-3 w-3" />
                  </Button>
                ) : null}
              </div>
            ) : null}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => handleNodeAction(node.id, 'more', e)}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>项目树</span>
          <Badge variant="secondary">{nodes.length} 个项目</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {nodes.map(node => renderNode(node))}
        </div>
      </CardContent>
    </Card>
  )
}