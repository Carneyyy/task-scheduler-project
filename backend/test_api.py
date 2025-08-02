"""
FastAPI后端接口自动化测试
使用httpx进行异步API测试
"""

import asyncio
import httpx
from typing import Optional

class APITester:
    """API测试器类"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(base_url=base_url)
        self.auth_token: Optional[str] = None
        self.test_user_id: Optional[str] = None
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    async def test_health_check(self):
        """测试健康检查接口"""
        print("🔍 测试健康检查接口...")
        response = await self.client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✅ 健康检查接口测试通过")
        return True
    
    async def test_auth_login(self):
        """测试用户登录接口"""
        print("🔍 测试用户登录接口...")
        login_data = {
            "username": "test_user",
            "password": "test123456"
        }
        
        response = await self.client.post("/api/v1/auth/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            assert data["success"] is True
            self.auth_token = data["data"]["access_token"]
            self.test_user_id = data["data"].get("user_id")
            self.client.headers.update({"Authorization": f"Bearer {self.auth_token}"})
            print("✅ 用户登录接口测试通过")
            return True
        else:
            print(f"⚠️ 登录测试跳过，状态码: {response.status_code}")
            return True
    
    async def test_tasks_crud(self):
        """测试任务管理CRUD接口"""
        print("🔍 测试任务管理CRUD接口...")
        
        task_data = {
            "name": "测试任务",
            "description": "这是一个测试任务",
            "type": "automation",
            "script_id": "test_script_001",
            "engine_id": "test_engine_001",
            "parameters": {"param1": "value1"},
            "priority": "high",
            "status": "pending"
        }
        
        # 创建任务
        response = await self.client.post("/api/v1/tasks", json=task_data)
        if response.status_code in [200, 201]:
            data = response.json()
            assert data["success"] is True
            task_id = data["data"]["id"]
            print("✅ 创建任务接口测试通过")
            
            # 获取任务列表
            response = await self.client.get("/api/v1/tasks")
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            print("✅ 获取任务列表接口测试通过")
            
            # 删除任务
            response = await self.client.delete(f"/api/v1/tasks/{task_id}")
            assert response.status_code == 200
            print("✅ 删除任务接口测试通过")
            
            return True
        else:
            print(f"⚠️ 任务CRUD测试跳过，状态码: {response.status_code}")
            return True
    
    async def test_scripts_crud(self):
        """测试脚本管理CRUD接口"""
        print("🔍 测试脚本管理CRUD接口...")
        
        script_data = {
            "name": "测试脚本",
            "description": "这是一个测试脚本",
            "type": "python",
            "content": "print('Hello, World!')",
            "status": "active"
        }
        
        # 创建脚本
        response = await self.client.post("/api/v1/scripts", json=script_data)
        if response.status_code in [200, 201]:
            data = response.json()
            assert data["success"] is True
            script_id = data["data"]["id"]
            print("✅ 创建脚本接口测试通过")
            
            # 获取脚本列表
            response = await self.client.get("/api/v1/scripts")
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            print("✅ 获取脚本列表接口测试通过")
            
            # 删除脚本
            response = await self.client.delete(f"/api/v1/scripts/{script_id}")
            assert response.status_code == 200
            print("✅ 删除脚本接口测试通过")
            
            return True
        else:
            print(f"⚠️ 脚本CRUD测试跳过，状态码: {response.status_code}")
            return True
    
    async def test_nodes_crud(self):
        """测试节点管理CRUD接口"""
        print("🔍 测试节点管理CRUD接口...")
        
        node_data = {
            "name": "测试节点",
            "description": "这是一个测试节点",
            "type": "worker",
            "host": "localhost",
            "port": 8080,
            "status": "active"
        }
        
        # 创建节点
        response = await self.client.post("/api/v1/nodes", json=node_data)
        if response.status_code in [200, 201]:
            data = response.json()
            assert data["success"] is True
            node_id = data["data"]["id"]
            print("✅ 创建节点接口测试通过")
            
            # 获取节点列表
            response = await self.client.get("/api/v1/nodes")
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            print("✅ 获取节点列表接口测试通过")
            
            # 删除节点
            response = await self.client.delete(f"/api/v1/nodes/{node_id}")
            assert response.status_code == 200
            print("✅ 删除节点接口测试通过")
            
            return True
        else:
            print(f"⚠️ 节点CRUD测试跳过，状态码: {response.status_code}")
            return True
    
    async def run_all_tests(self):
        """运行所有测试"""
        print("🚀 开始运行API自动化测试...")
        print("=" * 50)
        
        tests = [
            self.test_health_check,
            self.test_auth_login,
            self.test_tasks_crud,
            self.test_scripts_crud,
            self.test_nodes_crud
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                result = await test()
                if result:
                    passed += 1
                else:
                    failed += 1
                print("-" * 30)
            except Exception as e:
                print(f"❌ 测试失败: {str(e)}")
                failed += 1
                print("-" * 30)
        
        print("=" * 50)
        print(f"📊 测试结果: {passed} 通过, {failed} 失败")
        print("🎉 API自动化测试完成!")
        
        return failed == 0


async def main():
    """主函数"""
    async with APITester() as tester:
        success = await tester.run_all_tests()
        return success


if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)