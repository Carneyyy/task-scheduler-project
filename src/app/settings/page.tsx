'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Bell, 
  Monitor, 
  Moon, 
  Sun,
  Save,
  RefreshCw,
  Palette,
  Database,
  Shield
} from 'lucide-react'

interface UserSettings {
  theme?: 'light' | 'dark' | 'system'
  notifications?: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  display?: {
    density: 'comfortable' | 'normal' | 'compact'
    sidebarCollapsed: boolean
    showStats: boolean
  }
  data?: {
    autoSave: boolean
    exportFormat: 'json' | 'csv' | 'excel'
    retentionDays: number
  }
  security?: {
    twoFactorAuth: boolean
    loginNotifications: boolean
    sessionTimeout: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('获取设置失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value }
      setHasChanges(true)
      return newSettings
    })
  }

  const handleNestedSettingChange = (parentKey: string, childKey: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      if (!newSettings[parentKey as keyof UserSettings]) {
        newSettings[parentKey as keyof UserSettings] = {} as any
      }
      (newSettings[parentKey as keyof UserSettings] as any)[childKey] = value
      setHasChanges(true)
      return newSettings
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      })

      if (response.ok) {
        setHasChanges(false)
      }
    } catch (error) {
      console.error('保存设置失败:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      setSettings({})
      setHasChanges(true)
    }
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
          <h1 className="text-3xl font-bold">设置</h1>
          <p className="text-muted-foreground">自定义您的使用体验和偏好设置</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">您有未保存的更改</p>
              <p className="text-sm text-blue-600">点击"保存设置"按钮来保存您的更改</p>
            </div>
            <Badge variant="secondary">未保存</Badge>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 外观设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              外观设置
            </CardTitle>
            <CardDescription>
              自定义界面外观和主题
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>主题模式</Label>
              <Select 
                value={settings.theme || 'system'} 
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2" />
                      浅色模式
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 mr-2" />
                      深色模式
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      跟随系统
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <Label>界面密度</Label>
              <Select 
                value={settings.display?.density || 'normal'} 
                onValueChange={(value) => handleNestedSettingChange('display', 'density', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">舒适</SelectItem>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="compact">紧凑</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>折叠侧边栏</Label>
                <p className="text-sm text-muted-foreground">默认折叠侧边栏以获得更多空间</p>
              </div>
              <Switch
                checked={settings.display?.sidebarCollapsed || false}
                onCheckedChange={(checked) => handleNestedSettingChange('display', 'sidebarCollapsed', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>显示统计信息</Label>
                <p className="text-sm text-muted-foreground">在仪表盘显示详细统计信息</p>
              </div>
              <Switch
                checked={settings.display?.showStats !== false}
                onCheckedChange={(checked) => handleNestedSettingChange('display', 'showStats', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              通知设置
            </CardTitle>
            <CardDescription>
              管理通知和提醒偏好
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>邮件通知</Label>
                <p className="text-sm text-muted-foreground">接收邮件通知</p>
              </div>
              <Switch
                checked={settings.notifications?.email !== false}
                onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>推送通知</Label>
                <p className="text-sm text-muted-foreground">接收浏览器推送通知</p>
              </div>
              <Switch
                checked={settings.notifications?.push !== false}
                onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'push', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>桌面通知</Label>
                <p className="text-sm text-muted-foreground">显示桌面通知</p>
              </div>
              <Switch
                checked={settings.notifications?.desktop !== false}
                onCheckedChange={(checked) => handleNestedSettingChange('notifications', 'desktop', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 数据设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              数据设置
            </CardTitle>
            <CardDescription>
              管理数据存储和导出选项
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>自动保存</Label>
                <p className="text-sm text-muted-foreground">自动保存表单和数据</p>
              </div>
              <Switch
                checked={settings.data?.autoSave !== false}
                onCheckedChange={(checked) => handleNestedSettingChange('data', 'autoSave', checked)}
              />
            </div>

            <div>
              <Label>导出格式</Label>
              <Select 
                value={settings.data?.exportFormat || 'json'} 
                onValueChange={(value) => handleNestedSettingChange('data', 'exportFormat', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>数据保留天数</Label>
              <Input
                type="number"
                value={settings.data?.retentionDays || 30}
                onChange={(e) => handleNestedSettingChange('data', 'retentionDays', parseInt(e.target.value) || 30)}
                min="1"
                max="365"
              />
              <p className="text-xs text-muted-foreground mt-1">
                超过此天数的数据将被自动清理
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 安全设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              安全设置
            </CardTitle>
            <CardDescription>
              管理账户安全和隐私设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>双因素认证</Label>
                <p className="text-sm text-muted-foreground">启用双因素认证增强安全性</p>
              </div>
              <Switch
                checked={settings.security?.twoFactorAuth || false}
                onCheckedChange={(checked) => handleNestedSettingChange('security', 'twoFactorAuth', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>登录通知</Label>
                <p className="text-sm text-muted-foreground">新设备登录时发送通知</p>
              </div>
              <Switch
                checked={settings.security?.loginNotifications !== false}
                onCheckedChange={(checked) => handleNestedSettingChange('security', 'loginNotifications', checked)}
              />
            </div>

            <div>
              <Label>会话超时（分钟）</Label>
              <Input
                type="number"
                value={settings.security?.sessionTimeout || 30}
                onChange={(e) => handleNestedSettingChange('security', 'sessionTimeout', parseInt(e.target.value) || 30)}
                min="5"
                max="480"
              />
              <p className="text-xs text-muted-foreground mt-1">
                无操作后自动登出的时间
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}