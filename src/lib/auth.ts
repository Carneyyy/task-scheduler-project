import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

// 模拟 NextAuth 的 getServerSession 函数
export async function getServerSession() {
  // 在服务器端，我们无法直接访问 localStorage
  // 这里我们需要从请求头中获取 token
  return null
}

// 模拟 authOptions
export const authOptions = {
  providers: [],
  callbacks: {}
}

// 辅助函数：从请求中获取用户信息
export async function getUserFromRequest(request: NextRequest) {
  try {
    // 从 Authorization 头获取 token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    
    // 解析 token（格式：userId:timestamp 的 base64 编码）
    try {
      const tokenData = Buffer.from(token, 'base64').toString('utf-8')
      const [userId, timestamp] = tokenData.split(':')
      
      if (!userId || !timestamp) {
        return null
      }
      
      // 检查 token 是否过期（24小时）
      const tokenTime = parseInt(timestamp)
      const now = Date.now()
      const tokenAge = now - tokenTime // 已经是毫秒
      const maxAge = 24 * 60 * 60 * 1000 // 24小时（毫秒）
      
      if (tokenAge > maxAge) {
        return null
      }
      
      // 从数据库获取用户信息
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      })
      
      if (!user || !user.isActive) {
        return null
      }
      
      // 构建用户权限列表
      const permissions = user.roles.flatMap(userRole => 
        userRole.role.permissions.map(rolePermission => rolePermission.permission.code)
      )
      
      // 构建角色列表
      const roles = user.roles.map(userRole => userRole.role.name)
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        roles,
        permissions
      }
    } catch (error) {
      console.error('Token 解析失败:', error)
      return null
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 辅助函数：验证 token
export async function verifyToken(token: string) {
  try {
    // 这里应该验证 token 的有效性
    // 为了简化，我们只是检查 token 是否存在且格式正确
    return token && token.length > 0 && token.includes('@')
  } catch {
    return false
  }
}

// 辅助函数：创建简单的 token（用于演示）
export function createSimpleToken(email: string): string {
  // 在实际应用中，应该使用 JWT 或其他安全的 token 生成方式
  // 这里使用 base64 编码作为简单演示
  return btoa(email)
}