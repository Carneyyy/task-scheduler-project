'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Settings, 
  Save, 
  X, 
  Send,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react'

interface DingdingConfig {
  id?: string
  name: string
  webhookUrl: string
  keyword: string
  successTemplateId: string
  failureTemplateId: string
  enabled: boolean
}

interface DingdingConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config?: DingdingConfig
  onSave: (config: DingdingConfig) => void
  onTest: (config: DingdingConfig) => void
  mode: 'create' | 'edit'
}

export function DingdingConfigDialog({ 
  open, 
  onOpenChange, 
  config, 
  onSave, 
  onTest, 
  mode 
}: DingdingConfigDialogProps) {
  const [formData, setFormData] = useState<DingdingConfig>({
    name: config?.name || '',
    webhookUrl: config?.webhookUrl || '',
    keyword: config?.keyword || '',
    successTemplateId: config?.successTemplateId || '',
    failureTemplateId: config?.failureTemplateId || '',
    enabled: config?.enabled ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isTesting, setIsTesting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '配置名称不能为空'
    }
    
    if (!formData.webhookUrl.trim()) {
      newErrors.webhookUrl = 'Webhook URL不能为空'
    } else if (!isValidUrl(formData.webhookUrl)) {
      newErrors.webhookUrl = '请输入有效的Webhook URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }
    onSave(formData)
    onOpenChange(false)
  }

  const handleTest = async () => {
    if (!validateForm()) {
      return
    }
    
    setIsTesting(true)
    try {
      await onTest(formData)
    } finally {
      setIsTesting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: config?.name || '',
      webhookUrl: config?.webhookUrl || '',
      keyword: config?.keyword || '',
      successTemplateId: config?.successTemplateId || '',
      failureTemplateId: config?.failureTemplateId || '',
      enabled: config?.enabled ?? true
    })
    setErrors({})
    onOpenChange(false)
  }

  const templateOptions = [
    { id: 'template_001', name: '标准成功模板' },
    { id: 'template_002', name: '详细成功模板' },
    { id: 'template_003', name: '简洁成功模板' },
    { id: 'template_101', name: '标准失败模板' },
    { id: 'template_102', name: '详细失败模板' },
    { id: 'template_103', name: '紧急失败模板' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
            {mode === 'create' ? '创建钉钉通知配置' : '编辑钉钉通知配置'}
          </DialogTitle>
          <DialogDescription>
            配置钉钉自定义机器人webhook通知设置
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="config-name">配置名称</Label>
                  <Input
                    id="config-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="例如：任务失败通知"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="config-enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({...formData, enabled: checked})}
                  />
                  <Label htmlFor="config-enabled">启用配置</Label>
                  <Badge variant={formData.enabled ? "default" : "secondary"}>
                    {formData.enabled ? '启用' : '禁用'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 钉钉配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                钉钉机器人配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                  placeholder="https://oapi.dingtalk.com/robot/send?access_token=xxx"
                  className={errors.webhookUrl ? 'border-red-500' : ''}
                />
                {errors.webhookUrl && (
                  <p className="text-sm text-red-500 mt-1">{errors.webhookUrl}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  请输入钉钉自定义机器人的webhook地址
                </p>
              </div>

              <div>
                <Label htmlFor="keyword">关键词</Label>
                <Input
                  id="keyword"
                  value={formData.keyword}
                  onChange={(e) => setFormData({...formData, keyword: e.target.value})}
                  placeholder="例如：任务通知"
                />
                <p className="text-sm text-gray-500 mt-1">
                  如果机器人设置了关键词安全设置，请输入对应的关键词
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 模板配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                模板配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="success-template">成功模板</Label>
                  <Select 
                    value={formData.successTemplateId} 
                    onValueChange={(value) => setFormData({...formData, successTemplateId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择成功模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions
                        .filter(t => t.id.startsWith('template_00'))
                        .map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    任务成功时使用的消息模板
                  </p>
                </div>

                <div>
                  <Label htmlFor="failure-template">失败模板</Label>
                  <Select 
                    value={formData.failureTemplateId} 
                    onValueChange={(value) => setFormData({...formData, failureTemplateId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择失败模板" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions
                        .filter(t => t.id.startsWith('template_10'))
                        .map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    任务失败时使用的消息模板
                  </p>
                </div>
              </div>

              {/* 模板预览 */}
              <div className="space-y-3">
                <h4 className="font-medium">模板预览</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-700">成功模板</span>
                    </div>
                    <Textarea 
                      value={`【任务成功】\n任务名称：{taskName}\n完成时间：{completedAt}\n执行节点：{nodeName}\n详情：{details}`}
                      readOnly
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                  <div className="p-3 border rounded-lg bg-red-50">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-700">失败模板</span>
                    </div>
                    <Textarea 
                      value={`【任务失败】\n任务名称：{taskName}\n失败时间：{failedAt}\n执行节点：{nodeName}\n错误信息：{errorMessage}\n请及时处理！`}
                      readOnly
                      rows={4}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 配置说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Info className="h-4 w-4 mr-2 text-blue-500" />
                配置说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Webhook URL：在钉钉群设置中添加自定义机器人时获取</p>
                <p>• 关键词：如果机器人启用了关键词安全设置，消息中必须包含此关键词</p>
                <p>• 模板ID：选择适合的消息模板，系统会根据任务状态自动选择对应模板</p>
                <p>• 测试通知：保存配置后可以发送测试消息验证配置是否正确</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTest}
            disabled={isTesting}
          >
            <Send className="h-4 w-4 mr-2" />
            {isTesting ? '测试中...' : '测试通知'}
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}