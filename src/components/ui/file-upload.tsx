'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove: () => void
  acceptedTypes: string[]
  maxSize: number // in MB
  selectedFile?: File | null
  isUploading?: boolean
  uploadProgress?: number
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error'
  errorMessage?: string
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  acceptedTypes,
  maxSize,
  selectedFile = null,
  isUploading = false,
  uploadProgress = 0,
  uploadStatus = 'idle',
  errorMessage = ''
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // 验证文件类型
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const isAcceptedType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.substring(1)
      }
      return file.type === type
    })

    if (!isAcceptedType) {
      alert(`不支持的文件类型。请上传以下类型的文件：${acceptedTypes.join(', ')}`)
      return
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      alert(`文件大小超过限制。最大允许 ${maxSize}MB`)
      return
    }

    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <File className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Badge variant="secondary">上传中...</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">上传成功</Badge>
      case 'error':
        return <Badge variant="destructive">上传失败</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        accept={acceptedTypes.join(',')}
        className="hidden"
        disabled={isUploading}
      />

      {!selectedFile ? (
        <Card 
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            dragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <p className="text-lg font-medium">拖拽文件到此处或点击上传</p>
              <p className="text-sm text-muted-foreground">
                支持的文件类型：{acceptedTypes.join(', ')}
              </p>
              <p className="text-sm text-muted-foreground">
                最大文件大小：{maxSize}MB
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div className="flex-1">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}
              </div>
              {getStatusBadge()}
            </div>
            <div className="flex items-center space-x-2">
              {!isUploading && uploadStatus !== 'success' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFileRemove}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {isUploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                上传进度：{uploadProgress}%
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}