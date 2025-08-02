'use client'

import { SimplePageWrapper } from '@/components/layout/SimplePageWrapper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SimpleHome() {
  return (
    <SimplePageWrapper currentPage="dashboard">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">爬虫任务管理系统</h1>
            <p className="text-muted-foreground">实时监控和管理您的爬虫任务</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">总节点数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3个离线</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">脚本数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">2个本周新增</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">运行中的任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">5个等待中</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">系统健康度</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">良好状态</p>
            </CardContent>
          </Card>
        </div>

        {/* 系统状态 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>最近执行的任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">数据采集任务 - 电商平台</div>
                    <div className="text-sm text-muted-foreground">2024-01-15 14:30:00</div>
                  </div>
                  <div className="text-blue-600">运行中</div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">价格监控任务</div>
                    <div className="text-sm text-muted-foreground">2024-01-15 12:00:00</div>
                  </div>
                  <div className="text-green-600">成功</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>节点状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Node-001</div>
                    <div className="text-sm text-muted-foreground">192.168.1.100:8080</div>
                  </div>
                  <div className="text-green-600">在线</div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Node-002</div>
                    <div className="text-sm text-muted-foreground">192.168.1.101:8080</div>
                  </div>
                  <div className="text-yellow-600">繁忙</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SimplePageWrapper>
  )
}