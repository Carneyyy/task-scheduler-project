'use client'

import { useState, useEffect } from 'react'

interface Spider {
  id: string
  name: string
  nodeId?: string
  packagePath?: string
  description?: string
  isPackaged: boolean
  packagedAt?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  node?: {
    id: string
    name: string
    host: string
    port: number
    status: string
  }
}

interface SpiderResponse {
  success: boolean
  data: {
    spiders: Spider[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
  message?: string
}

export function useSpiders() {
  const [spiders, setSpiders] = useState<Spider[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })

  const fetchSpiders = async (page = 1, limit = 10, status?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (status) {
        params.append('status', status)
      }
      
      const response = await fetch(`/api/spiders?${params}`)
      const data: SpiderResponse = await response.json()
      
      if (data.success) {
        setSpiders(data.data.spiders)
        setPagination(data.data.pagination)
      } else {
        setError(data.message || '获取爬虫列表失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('获取爬虫列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const createSpider = async (spiderData: {
    name: string
    nodeId?: string
    packagePath?: string
    description?: string
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/spiders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(spiderData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取列表
        await fetchSpiders(pagination.page, pagination.limit)
        return data
      } else {
        setError(data.message || '创建爬虫失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('创建爬虫失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateSpider = async (id: string, spiderData: {
    name?: string
    nodeId?: string
    packagePath?: string
    description?: string
    isActive?: boolean
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/spiders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(spiderData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取列表
        await fetchSpiders(pagination.page, pagination.limit)
        return data
      } else {
        setError(data.message || '更新爬虫失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('更新爬虫失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteSpider = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/spiders/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取列表
        await fetchSpiders(pagination.page, pagination.limit)
        return data
      } else {
        setError(data.message || '删除爬虫失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('删除爬虫失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const performSpiderAction = async (id: string, action: 'start' | 'stop' | 'pause' | 'restart') => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/spiders/${id}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 重新获取列表
        await fetchSpiders(pagination.page, pagination.limit)
        return data
      } else {
        setError(data.message || '执行操作失败')
        return null
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('执行爬虫操作失败:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpiders()
  }, [])

  return {
    spiders,
    loading,
    error,
    pagination,
    fetchSpiders,
    createSpider,
    updateSpider,
    deleteSpider,
    performSpiderAction
  }
}