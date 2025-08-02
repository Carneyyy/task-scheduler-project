'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Settings,
  User,
  Mail,
  Calendar,
  Shield
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  isActive: boolean
  roles: string[]
  createdAt: string
  lastLogin?: string
}

interface Role {
  id: string
  name: string
  description?: string
}

interface Permission {
  id: string
  name: string
  code: string
  description?: string
}

interface UserListProps {
  users: User[]
  roles: Role[]
  permissions: Permission[]
  onUserAdd: (user: Omit<User, 'id' | 'createdAt'>) => void
  onUserUpdate: (id: string, user: Partial<User>) => void
  onUserDelete: (id: string) => void
}

export function UserList({ users, roles, permissions, onUserAdd, onUserUpdate, onUserDelete }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    isActive: true,
    roles: [] as string[]
  })

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.password) {
      onUserAdd(newUser)
      setNewUser({
        name: '',
        email: '',
        password: '',
        isActive: true,
        roles: []
      })
      setIsAddDialogOpen(false)
    }
  }

  const handleUpdateUser = () => {
    if (selectedUser) {
      onUserUpdate(selectedUser.id, selectedUser)
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleDeleteUser = (id: string) => {
    if (confirm('确定要删除此用户吗？')) {
      onUserDelete(id)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const openRoleDialog = (user: User) => {
    setSelectedUser(user)
    setIsRoleDialogOpen(true)
  }

  const toggleRole = (roleId: string) => {
    if (selectedUser) {
      const newRoles = selectedUser.roles.includes(roleId)
        ? selectedUser.roles.filter(r => r !== roleId)
        : [...selectedUser.roles, roleId]
      setSelectedUser({ ...selectedUser, roles: newRoles })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>用户管理</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增用户
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>新增用户</DialogTitle>
                <DialogDescription>
                  创建一个新的系统用户
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="请输入姓名"
                  />
                </div>
                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="请输入邮箱"
                  />
                </div>
                <div>
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="请输入密码"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={newUser.isActive}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive">激活用户</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddUser}>创建用户</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户信息</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? '激活' : '禁用'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.slice(0, 2).map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                    {user.roles.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.roles.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {user.createdAt}
                  </div>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? (
                    <div className="text-sm text-muted-foreground">
                      {user.lastLogin}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      从未登录
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRoleDialog(user)}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* 编辑用户对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>
              修改用户信息
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">姓名</Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">邮箱</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-isActive"
                  checked={selectedUser.isActive}
                  onCheckedChange={(checked) => setSelectedUser({ ...selectedUser, isActive: !!checked })}
                />
                <Label htmlFor="edit-isActive">激活用户</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateUser}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 角色权限对话框 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>角色权限管理</DialogTitle>
            <DialogDescription>
              为用户分配角色和权限
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">用户：{selectedUser.name}</Label>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">选择角色</Label>
                <ScrollArea className="h-48 border rounded-md p-3">
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={selectedUser.roles.includes(role.name)}
                          onCheckedChange={() => toggleRole(role.name)}
                        />
                        <Label htmlFor={`role-${role.id}`} className="text-sm">
                          {role.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setIsRoleDialogOpen(false)}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}