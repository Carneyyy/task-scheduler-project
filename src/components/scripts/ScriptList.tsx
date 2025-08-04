'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/ui/file-upload'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  FileCode,
  Calendar,
  User,
  Settings,
  Download,
  Play
} from 'lucide-react'

interface Script {
  id: string
  name: string
  platform: string
  description?: string
  maxRunTime: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  versions: ScriptVersion[]
}

interface ScriptVersion {
  id: string
  scriptId: string
  version: string
  filePath: string
  size: number
  isActive: boolean
  createdAt: string
}

interface Engine {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  versions: EngineVersion[]
}

interface EngineVersion {
  id: string
  engineId: string
  version: string
  filePath: string
  size: number
  isActive: boolean
  createdAt: string
}

interface ScriptListProps {
  scripts: Script[]
  engines: Engine[]
  onScriptAdd: (script: Omit<Script, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => void
  onScriptUpdate: (id: string, script: Partial<Script>) => void
  onScriptDelete: (id: string) => void
  onEngineAdd: (engine: Omit<Engine, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => void
  onEngineUpdate: (id: string, engine: Partial<Engine>) => void
  onEngineDelete: (id: string) => void
}

export function ScriptList({ 
  scripts, 
  engines, 
  onScriptAdd, 
  onScriptUpdate, 
  onScriptDelete,
  onEngineAdd,
  onEngineUpdate,
  onEngineDelete 
}: ScriptListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddScriptDialogOpen, setIsAddScriptDialogOpen] = useState(false)
  const [isEditScriptDialogOpen, setIsEditScriptDialogOpen] = useState(false)
  const [isAddEngineDialogOpen, setIsAddEngineDialogOpen] = useState(false)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null)
  const [isEditEngineDialogOpen, setIsEditEngineDialogOpen] = useState(false)
  
  const [newScript, setNewScript] = useState({
    name: '',
    platform: '',
    description: '',
    maxRunTime: 3600,
    isActive: true
  })

  const [newEngine, setNewEngine] = useState({
    name: '',
    description: '',
    isActive: true
  })

  // 文件上传状态
  const [scriptFile, setScriptFile] = useState<File | null>(null)
  const [engineFile, setEngineFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadError, setUploadError] = useState('')
  const [uploadedFileInfo, setUploadedFileInfo] = useState<any>(null)

  const filteredScripts = scripts.filter(script =>
    script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.platform.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredEngines = engines.filter(engine =>
    engine.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 文件上传处理函数
  const handleFileUpload = async (file: File, type: 'script' | 'engine') => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus('uploading')
    setUploadProgress(0)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }

      const fileInfo = await response.json()
      setUploadedFileInfo(fileInfo)
      setUploadStatus('success')
      
      // 延迟关闭对话框，显示成功状态
      setTimeout(() => {
        setUploadStatus('idle')
        setUploadProgress(0)
      }, 2000)

    } catch (error) {
      console.error('文件上传失败:', error)
      setUploadError(error instanceof Error ? error.message : '上传失败')
      setUploadStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleScriptFileSelect = (file: File) => {
    setScriptFile(file)
  }

  const handleScriptFileRemove = () => {
    setScriptFile(null)
    setUploadedFileInfo(null)
    setUploadStatus('idle')
  }

  const handleEngineFileSelect = (file: File) => {
    setEngineFile(file)
  }

  const handleEngineFileRemove = () => {
    setEngineFile(null)
    setUploadedFileInfo(null)
    setUploadStatus('idle')
  }

  const handleAddScript = async () => {
    if (newScript.name && newScript.platform) {
      // 如果有文件，先上传文件
      if (scriptFile) {
        await handleFileUpload(scriptFile, 'script')
      }

      // 创建脚本，包含文件信息
      const scriptData = {
        ...newScript,
        ...(uploadedFileInfo && {
          filePath: uploadedFileInfo.filePath,
          fileSize: uploadedFileInfo.size,
          fileVersion: '0.001' // 默认版本
        })
      }

      onScriptAdd(scriptData)
      
      // 重置状态
      setNewScript({
        name: '',
        platform: '',
        description: '',
        maxRunTime: 3600,
        isActive: true
      })
      setScriptFile(null)
      setUploadedFileInfo(null)
      setUploadStatus('idle')
      setIsAddScriptDialogOpen(false)
    }
  }

  const handleUpdateScript = () => {
    if (selectedScript) {
      onScriptUpdate(selectedScript.id, selectedScript)
      setIsEditScriptDialogOpen(false)
      setSelectedScript(null)
    }
  }

  const handleUpdateEngine = () => {
    if (selectedEngine) {
      onEngineUpdate(selectedEngine.id, selectedEngine)
      setIsEditEngineDialogOpen(false)
      setSelectedEngine(null)
    }
  }

  const handleDeleteScript = (id: string) => {
    if (confirm('确定要删除此脚本吗？')) {
      onScriptDelete(id)
    }
  }

  const handleAddEngine = async () => {
    if (newEngine.name) {
      // 如果有文件，先上传文件
      if (engineFile) {
        await handleFileUpload(engineFile, 'engine')
      }

      // 创建引擎，包含文件信息
      const engineData = {
        ...newEngine,
        ...(uploadedFileInfo && {
          filePath: uploadedFileInfo.filePath,
          fileSize: uploadedFileInfo.size,
          fileVersion: '0.001' // 默认版本
        })
      }

      onEngineAdd(engineData)
      
      // 重置状态
      setNewEngine({
        name: '',
        description: '',
        isActive: true
      })
      setEngineFile(null)
      setUploadedFileInfo(null)
      setUploadStatus('idle')
      setIsAddEngineDialogOpen(false)
    }
  }

  const openEditScriptDialog = (script: Script) => {
    setSelectedScript(script)
    setIsEditScriptDialogOpen(true)
  }

  const openEditEngineDialog = (engine: Engine) => {
    setSelectedEngine(engine)
    setIsEditEngineDialogOpen(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatRunTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* 搜索和添加按钮 */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索脚本或引擎..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddScriptDialogOpen} onOpenChange={setIsAddScriptDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新增脚本
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>新增脚本</DialogTitle>
                <DialogDescription>
                  创建一个新的脚本
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="script-name">脚本名称</Label>
                  <Input
                    id="script-name"
                    value={newScript.name}
                    onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                    placeholder="请输入脚本名称"
                  />
                </div>
                <div>
                  <Label htmlFor="script-platform">平台</Label>
                  <Select value={newScript.platform} onValueChange={(value) => setNewScript({ ...newScript, platform: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择平台" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="macos">macOS</SelectItem>
                      <SelectItem value="android">Android</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="script-description">描述</Label>
                  <Input
                    id="script-description"
                    value={newScript.description}
                    onChange={(e) => setNewScript({ ...newScript, description: e.target.value })}
                    placeholder="请输入脚本描述"
                  />
                </div>
                <div>
                  <Label htmlFor="script-maxRuntime">最大运行时间（秒）</Label>
                  <Input
                    id="script-maxRuntime"
                    type="number"
                    value={newScript.maxRunTime}
                    onChange={(e) => setNewScript({ ...newScript, maxRunTime: parseInt(e.target.value) || 3600 })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="script-isActive"
                    checked={newScript.isActive}
                    onChange={(e) => setNewScript({ ...newScript, isActive: e.target.checked })}
                  />
                  <Label htmlFor="script-isActive">激活脚本</Label>
                </div>
                <div>
                  <Label htmlFor="script-file">脚本文件</Label>
                  <FileUpload
                    onFileSelect={handleScriptFileSelect}
                    onFileRemove={handleScriptFileRemove}
                    acceptedTypes={['.zip']}
                    maxSize={100}
                    selectedFile={scriptFile}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    uploadStatus={uploadStatus}
                    errorMessage={uploadError}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    请上传ZIP格式的脚本文件，最大100MB
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddScriptDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddScript}>创建脚本</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddEngineDialogOpen} onOpenChange={setIsAddEngineDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                新增引擎
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>新增引擎</DialogTitle>
                <DialogDescription>
                  创建一个新的引擎
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="engine-name">引擎名称</Label>
                  <Input
                    id="engine-name"
                    value={newEngine.name}
                    onChange={(e) => setNewEngine({ ...newEngine, name: e.target.value })}
                    placeholder="请输入引擎名称"
                  />
                </div>
                <div>
                  <Label htmlFor="engine-description">描述</Label>
                  <Input
                    id="engine-description"
                    value={newEngine.description}
                    onChange={(e) => setNewEngine({ ...newEngine, description: e.target.value })}
                    placeholder="请输入引擎描述"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="engine-isActive"
                    checked={newEngine.isActive}
                    onChange={(e) => setNewEngine({ ...newEngine, isActive: e.target.checked })}
                  />
                  <Label htmlFor="engine-isActive">激活引擎</Label>
                </div>
                <div>
                  <Label htmlFor="engine-file">引擎文件</Label>
                  <FileUpload
                    onFileSelect={handleEngineFileSelect}
                    onFileRemove={handleEngineFileRemove}
                    acceptedTypes={['.exe', '.zip']}
                    maxSize={100}
                    selectedFile={engineFile}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    uploadStatus={uploadStatus}
                    errorMessage={uploadError}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    请上传EXE或ZIP格式的引擎文件，最大100MB
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEngineDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleAddEngine}>创建引擎</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 标签页 */}
      <Tabs defaultValue="scripts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scripts">脚本仓库</TabsTrigger>
          <TabsTrigger value="engines">引擎版本</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scripts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>脚本列表</span>
                <Badge variant="secondary">{filteredScripts.length} 个脚本</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>脚本信息</TableHead>
                    <TableHead>平台</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>最大运行时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScripts.map((script) => (
                    <TableRow key={script.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileCode className="h-4 w-4" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{script.name}</div>
                            {script.description && (
                              <div className="text-sm text-muted-foreground">{script.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{script.platform}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {script.versions.slice(0, 2).map((version) => (
                            <div key={version.id} className="flex items-center space-x-2 text-sm">
                              <Badge variant="secondary" className="text-xs">
                                v{version.version}
                              </Badge>
                              <span className="text-muted-foreground">
                                {formatFileSize(version.size)}
                              </span>
                            </div>
                          ))}
                          {script.versions.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{script.versions.length - 2} 个版本
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm">
                          <Play className="h-3 w-3" />
                          <span>{formatRunTime(script.maxRunTime)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={script.isActive ? 'default' : 'secondary'}>
                          {script.isActive ? '激活' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {script.updatedAt}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditScriptDialog(script)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteScript(script.id)}
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
          </Card>
        </TabsContent>

        <TabsContent value="engines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>引擎列表</span>
                <Badge variant="secondary">{filteredEngines.length} 个引擎</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>引擎信息</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEngines.map((engine) => (
                    <TableRow key={engine.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Settings className="h-4 w-4" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{engine.name}</div>
                            {engine.description && (
                              <div className="text-sm text-muted-foreground">{engine.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {engine.versions.slice(0, 2).map((version) => (
                            <div key={version.id} className="flex items-center space-x-2 text-sm">
                              <Badge variant="secondary" className="text-xs">
                                v{version.version}
                              </Badge>
                              <span className="text-muted-foreground">
                                {formatFileSize(version.size)}
                              </span>
                            </div>
                          ))}
                          {engine.versions.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{engine.versions.length - 2} 个版本
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={engine.isActive ? 'default' : 'secondary'}>
                          {engine.isActive ? '激活' : '禁用'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {engine.updatedAt}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditEngineDialog(engine)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEngineDelete(engine.id)}
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
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑脚本对话框 */}
      <Dialog open={isEditScriptDialogOpen} onOpenChange={setIsEditScriptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑脚本</DialogTitle>
            <DialogDescription>
              修改脚本信息
            </DialogDescription>
          </DialogHeader>
          {selectedScript && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-script-name">脚本名称</Label>
                <Input
                  id="edit-script-name"
                  value={selectedScript.name}
                  onChange={(e) => setSelectedScript({ ...selectedScript, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-script-platform">平台</Label>
                <Select value={selectedScript.platform} onValueChange={(value) => setSelectedScript({ ...selectedScript, platform: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="windows">Windows</SelectItem>
                    <SelectItem value="linux">Linux</SelectItem>
                    <SelectItem value="macos">macOS</SelectItem>
                    <SelectItem value="android">Android</SelectItem>
                    <SelectItem value="ios">iOS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-script-description">描述</Label>
                <Input
                  id="edit-script-description"
                  value={selectedScript.description || ''}
                  onChange={(e) => setSelectedScript({ ...selectedScript, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-script-maxRuntime">最大运行时间（秒）</Label>
                <Input
                  id="edit-script-maxRuntime"
                  type="number"
                  value={selectedScript.maxRunTime}
                  onChange={(e) => setSelectedScript({ ...selectedScript, maxRunTime: parseInt(e.target.value) || 3600 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-script-isActive"
                  checked={selectedScript.isActive}
                  onChange={(e) => setSelectedScript({ ...selectedScript, isActive: e.target.checked })}
                />
                <Label htmlFor="edit-script-isActive">激活脚本</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditScriptDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateScript}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}