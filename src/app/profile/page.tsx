'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Clock, 
  Globe,
  Save,
  Edit
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  name?: string
  profile?: {
    id: string
    userId: string
    avatar?: string
    nickname?: string
    phone?: string
    department?: string
    position?: string
    bio?: string
    timezone: string
    language: string
    lastLoginAt?: string
    lastLoginIp?: string
    createdAt: string
    updatedAt: string
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    department: '',
    position: '',
    bio: '',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN'
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        if (data.profile) {
          setFormData({
            nickname: data.profile.nickname || data.name || '',
            phone: data.profile.phone || '',
            department: data.profile.department || '',
            position: data.profile.position || '',
            bio: data.profile.bio || '',
            timezone: data.profile.timezone || 'Asia/Shanghai',
            language: data.profile.language || 'zh-CN'
          })
        }
      }
    } catch (error) {
      console.error('获取个人资料失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('保存个人资料失败:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile?.profile) {
      setFormData({
        nickname: profile.profile.nickname || profile.name || '',
        phone: profile.profile.phone || '',
        department: profile.profile.department || '',
        position: profile.profile.position || '',
        bio: profile.profile.bio || '',
        timezone: profile.profile.timezone || 'Asia/Shanghai',
        language: profile.profile.language || 'zh-CN'
      })
    }
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">个人资料</h1>
          <p className="text-muted-foreground">管理您的个人信息和偏好设置</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            编辑资料
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：基本信息卡片 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profile?.avatar} />
                <AvatarFallback className="text-2xl">
                  {profile?.name?.charAt(0) || profile?.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {profile?.profile?.nickname || profile?.name || '未设置昵称'}
                </h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {profile?.profile?.department || '未设置部门'}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">最后登录</span>
              </div>
              <p className="text-sm">
                {profile?.profile?.lastLoginAt 
                  ? new Date(profile.profile.lastLoginAt).toLocaleString('zh-CN')
                  : '首次登录'
                }
              </p>
              {profile?.profile?.lastLoginIp && (
                <p className="text-xs text-muted-foreground">
                  IP: {profile.profile.lastLoginIp}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 右侧：详细信息表单 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>详细信息</CardTitle>
            <CardDescription>
              {isEditing ? '编辑您的个人信息' : '查看您的个人信息'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  邮箱地址
                </Label>
                <Input
                  id="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="nickname" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  昵称
                </Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  disabled={!isEditing}
                  placeholder="请输入昵称"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  手机号码
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="请输入手机号码"
                />
              </div>

              <div>
                <Label htmlFor="department" className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  部门
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={!isEditing}
                  placeholder="请输入部门"
                />
              </div>

              <div>
                <Label htmlFor="position" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  职位
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  disabled={!isEditing}
                  placeholder="请输入职位"
                />
              </div>

              <div>
                <Label htmlFor="timezone" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  时区
                </Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Shanghai">北京时间 (UTC+8)</SelectItem>
                    <SelectItem value="Asia/Hong_Kong">香港时间 (UTC+8)</SelectItem>
                    <SelectItem value="Asia/Taipei">台北时间 (UTC+8)</SelectItem>
                    <SelectItem value="UTC">UTC 时间</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language" className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  语言
                </Label>
                <Select 
                  value={formData.language} 
                  onValueChange={(value) => setFormData({ ...formData, language: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="zh-TW">繁体中文</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="请输入个人简介"
                rows={4}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  取消
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}