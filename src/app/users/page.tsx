'use client'

import { useState } from 'react'
import { UserList } from '@/components/users/UserList'
import { PageWrapper } from '@/components/layout/PageWrapper'

// 模拟数据
const mockUsers = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    isActive: true,
    roles: ['管理员', '开发者'],
    createdAt: '2024-01-01',
    lastLogin: '2024-01-15 14:30:00'
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    isActive: true,
    roles: ['开发者'],
    createdAt: '2024-01-02',
    lastLogin: '2024-01-15 10:00:00'
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    isActive: false,
    roles: ['查看者'],
    createdAt: '2024-01-03',
    lastLogin: '2024-01-10 16:20:00'
  },
  {
    id: '4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    isActive: true,
    roles: ['开发者', '运维'],
    createdAt: '2024-01-04',
    lastLogin: '2024-01-15 09:15:00'
  },
  {
    id: '5',
    name: '钱七',
    email: 'qianqi@example.com',
    isActive: true,
    roles: ['查看者'],
    createdAt: '2024-01-05',
    lastLogin: null
  }
]

const mockRoles = [
  {
    id: '1',
    name: '管理员',
    description: '系统管理员，拥有所有权限'
  },
  {
    id: '2',
    name: '开发者',
    description: '开发者，可以管理脚本和任务'
  },
  {
    id: '3',
    name: '运维',
    description: '运维人员，可以管理节点和监控'
  },
  {
    id: '4',
    name: '查看者',
    description: '只读权限，只能查看系统状态'
  }
]

const mockPermissions = [
  {
    id: '1',
    name: '用户管理',
    code: 'user:manage',
    description: '管理用户和权限'
  },
  {
    id: '2',
    name: '脚本管理',
    code: 'script:manage',
    description: '管理脚本和引擎'
  },
  {
    id: '3',
    name: '任务管理',
    code: 'task:manage',
    description: '管理任务和调度'
  },
  {
    id: '4',
    name: '节点管理',
    code: 'node:manage',
    description: '管理节点和部署'
  },
  {
    id: '5',
    name: '系统监控',
    code: 'system:monitor',
    description: '查看系统状态和日志'
  }
]

export default function UsersPage() {
  const [users, setUsers] = useState(mockUsers)

  const handleUserAdd = (newUser: any) => {
    const user = {
      ...newUser,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null
    }
    setUsers([...users, user])
  }

  const handleUserUpdate = (id: string, updatedUser: any) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...updatedUser } : user
    ))
  }

  const handleUserDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id))
  }

  return (
    <PageWrapper currentPage="users">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">用户管理</h1>
            <p className="text-muted-foreground">管理系统用户、角色和权限</p>
          </div>
        </div>

        <UserList
          users={users}
          roles={mockRoles}
          permissions={mockPermissions}
          onUserAdd={handleUserAdd}
          onUserUpdate={handleUserUpdate}
          onUserDelete={handleUserDelete}
        />
      </div>
    </PageWrapper>
  )
}