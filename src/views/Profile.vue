<template>
  <div class="profile">
    <h1>个人资料</h1>
    <div class="profile-container">
      <div class="profile-section">
        <h2>基本信息</h2>
        <div class="profile-item">
          <label for="username">用户名</label>
          <input id="username" v-model="profile.username" type="text" disabled />
        </div>
        <div class="profile-item">
          <label for="email">邮箱</label>
          <input id="email" v-model="profile.email" type="email" />
        </div>
        <div class="profile-item">
          <label for="full-name">姓名</label>
          <input id="full-name" v-model="profile.full_name" type="text" />
        </div>
        <div class="profile-item">
          <label for="phone">电话</label>
          <input id="phone" v-model="profile.phone" type="tel" />
        </div>
      </div>

      <div class="profile-section">
        <h2>修改密码</h2>
        <div class="profile-item">
          <label for="current-password">当前密码</label>
          <input id="current-password" v-model="passwordForm.current_password" type="password" />
        </div>
        <div class="profile-item">
          <label for="new-password">新密码</label>
          <input id="new-password" v-model="passwordForm.new_password" type="password" />
        </div>
        <div class="profile-item">
          <label for="confirm-password">确认密码</label>
          <input id="confirm-password" v-model="passwordForm.confirm_password" type="password" />
        </div>
        <div class="password-actions">
          <button @click="changePassword" class="change-password-btn" :disabled="changingPassword">
            {{ changingPassword ? "修改中..." : "修改密码" }}
          </button>
        </div>
      </div>

      <div class="profile-section">
        <h2>通知偏好</h2>
        <div class="profile-item">
          <label>
            <input type="checkbox" v-model="profile.email_notifications" />
            邮件通知
          </label>
        </div>
        <div class="profile-item">
          <label>
            <input type="checkbox" v-model="profile.system_notifications" />
            系统通知
          </label>
        </div>
        <div class="profile-item">
          <label>
            <input type="checkbox" v-model="profile.task_notifications" />
            任务通知
          </label>
        </div>
      </div>

      <div class="profile-section">
        <h2>账户信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">角色:</span>
            <span class="value">{{ profile.role }}</span>
          </div>
          <div class="info-item">
            <span class="label">状态:</span>
            <span class="value" :class="profile.is_active ? 'active' : 'inactive'">
              {{ profile.is_active ? "活跃" : "禁用" }}
            </span>
          </div>
          <div class="info-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatDate(profile.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">最后登录:</span>
            <span class="value">{{ formatDate(profile.last_login) || "从未登录" }}</span>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="saveProfile" class="save-btn" :disabled="saving">
          {{ saving ? "保存中..." : "保存资料" }}
        </button>
        <button @click="resetProfile" class="reset-btn">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"


const profile = ref({
  username: "",
  email: "",
  full_name: "",
  phone: "",
  role: "",
  is_active: false,
  email_notifications: false,
  system_notifications: false,
  task_notifications: false,
  created_at: "",
  last_login: ""
})

const passwordForm = ref({
  current_password: "",
  new_password: "",
  confirm_password: ""
})

const saving = ref(false)
const changingPassword = ref(false)

const fetchProfile = async () => {
  try {
    const response = await api.get("/users/profile")
    profile.value = { ...profile.value, ...response.data }
  } catch (error) {
    console.error("Failed to fetch profile:", error)
  }
}

const saveProfile = async () => {
  saving.value = true
  try {
    await api.put("/users/profile", {
      email: profile.value.email,
      full_name: profile.value.full_name,
      phone: profile.value.phone,
      email_notifications: profile.value.email_notifications,
      system_notifications: profile.value.system_notifications,
      task_notifications: profile.value.task_notifications
    })
    alert("个人资料保存成功")
  } catch (error) {
    console.error("Failed to save profile:", error)
    alert("个人资料保存失败")
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    alert("新密码和确认密码不匹配")
    return
  }
  
  if (passwordForm.value.new_password.length < 6) {
    alert("新密码长度至少为6位")
    return
  }

  changingPassword.value = true
  try {
    await api.put("/users/change-password", {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password
    })
    alert("密码修改成功")
    passwordForm.value = {
      current_password: "",
      new_password: "",
      confirm_password: ""
    }
  } catch (error) {
    console.error("Failed to change password:", error)
    alert("密码修改失败")
  } finally {
    changingPassword.value = false
  }
}

const resetProfile = () => {
  fetchProfile()
}

const formatDate = (dateString: string) => {
  return dateString ? new Date(dateString).toLocaleString() : ""
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile {
  padding: 20px;
}

.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.profile-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.profile-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.profile-item {
  margin-bottom: 15px;
}

.profile-item:last-child {
  margin-bottom: 0;
}

.profile-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.profile-item input[type="text"],
.profile-item input[type="email"],
.profile-item input[type="tel"],
.profile-item input[type="password"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.profile-item input[type="checkbox"] {
  margin-right: 8px;
}

.password-actions {
  margin-top: 15px;
}

.change-password-btn {
  background: #ffc107;
  color: #212529;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.change-password-btn:hover:not(:disabled) {
  background: #e0a800;
}

.change-password-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  font-weight: 500;
  color: #666;
}

.info-item .value {
  color: #333;
}

.info-item .value.active {
  color: #28a745;
  font-weight: 500;
}

.info-item .value.inactive {
  color: #dc3545;
  font-weight: 500;
}

.profile-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 30px;
}

.save-btn, .reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.save-btn {
  background: #007bff;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #0056b3;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover {
  background: #5a6268;
}
</style>
