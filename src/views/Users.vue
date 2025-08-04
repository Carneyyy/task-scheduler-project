<template>
  <div class="users">
    <h1>用户管理</h1>
    <div class="users-actions">
      <button @click="createUser" class="create-btn">创建用户</button>
    </div>
    <div class="users-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="users.length === 0" class="empty">暂无用户</div>
      <div v-else class="users-table">
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>最后登录</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role" :class="user.role">{{ user.role }}</span>
              </td>
              <td>
                <span class="status" :class="user.is_active ? "active" : "inactive"">
                  {{ user.is_active ? "活跃" : "禁用" }}
                </span>
              </td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>{{ formatDate(user.last_login) || "从未登录" }}</td>
              <td>
                <div class="user-actions">
                  <button @click="editUser(user)" class="edit-btn">编辑</button>
                  <button @click="toggleUserStatus(user)" class="toggle-btn">
                    {{ user.is_active ? "禁用" : "启用" }}
                  </button>
                  <button @click="deleteUser(user.id)" class="delete-btn">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"

const users = ref([])
const loading = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get("/users")
    users.value = response.data
  } catch (error) {
    console.error("Failed to fetch users:", error)
  } finally {
    loading.value = false
  }
}

const createUser = () => {
  console.log("Create user")
}

const editUser = (user: any) => {
  console.log("Edit user:", user)
}

const toggleUserStatus = async (user: any) => {
  try {
    await api.put(`/users/${user.id}/toggle-status`)
    await fetchUsers()
  } catch (error) {
    console.error("Failed to toggle user status:", error)
  }
}

const deleteUser = async (id: string) => {
  if (confirm("确定要删除这个用户吗？")) {
    try {
      await api.delete(`/users/${id}`)
      await fetchUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }
}

const formatDate = (dateString: string) => {
  return dateString ? new Date(dateString).toLocaleString() : ""
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users {
  padding: 20px;
}

.users-actions {
  margin-bottom: 20px;
}

.create-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.create-btn:hover {
  background: #0056b3;
}

.users-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

tr:hover {
  background: #f8f9fa;
}

.role {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.role.admin {
  background: #f8d7da;
  color: #721c24;
}

.role.user {
  background: #d1ecf1;
  color: #0c5460;
}

.role.manager {
  background: #d4edda;
  color: #155724;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.user-actions {
  display: flex;
  gap: 5px;
}

.user-actions button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.edit-btn {
  background: #28a745;
  color: white;
}

.edit-btn:hover {
  background: #218838;
}

.toggle-btn {
  background: #ffc107;
  color: #212529;
}

.toggle-btn:hover {
  background: #e0a800;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
