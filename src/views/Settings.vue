<template>
  <div class="settings">
    <h1>系统设置</h1>
    <div class="settings-container">
      <div class="settings-section">
        <h2>基本设置</h2>
        <div class="setting-item">
          <label for="site-name">系统名称</label>
          <input id="site-name" v-model="settings.site_name" type="text" />
        </div>
        <div class="setting-item">
          <label for="site-description">系统描述</label>
          <textarea id="site-description" v-model="settings.site_description"></textarea>
        </div>
        <div class="setting-item">
          <label for="admin-email">管理员邮箱</label>
          <input id="admin-email" v-model="settings.admin_email" type="email" />
        </div>
      </div>

      <div class="settings-section">
        <h2>任务设置</h2>
        <div class="setting-item">
          <label for="max-concurrent-tasks">最大并发任务数</label>
          <input id="max-concurrent-tasks" v-model.number="settings.max_concurrent_tasks" type="number" min="1" />
        </div>
        <div class="setting-item">
          <label for="task-timeout">任务超时时间（秒）</label>
          <input id="task-timeout" v-model.number="settings.task_timeout" type="number" min="1" />
        </div>
        <div class="setting-item">
          <label for="retry-count">重试次数</label>
          <input id="retry-count" v-model.number="settings.retry_count" type="number" min="0" />
        </div>
      </div>

      <div class="settings-section">
        <h2>通知设置</h2>
        <div class="setting-item">
          <label for="email-enabled">启用邮件通知</label>
          <input id="email-enabled" v-model="settings.email_enabled" type="checkbox" />
        </div>
        <div class="setting-item" v-if="settings.email_enabled">
          <label for="smtp-server">SMTP服务器</label>
          <input id="smtp-server" v-model="settings.smtp_server" type="text" />
        </div>
        <div class="setting-item" v-if="settings.email_enabled">
          <label for="smtp-port">SMTP端口</label>
          <input id="smtp-port" v-model.number="settings.smtp_port" type="number" />
        </div>
        <div class="setting-item" v-if="settings.email_enabled">
          <label for="smtp-username">SMTP用户名</label>
          <input id="smtp-username" v-model="settings.smtp_username" type="text" />
        </div>
        <div class="setting-item" v-if="settings.email_enabled">
          <label for="smtp-password">SMTP密码</label>
          <input id="smtp-password" v-model="settings.smtp_password" type="password" />
        </div>
      </div>

      <div class="settings-section">
        <h2>安全设置</h2>
        <div class="setting-item">
          <label for="session-timeout">会话超时时间（分钟）</label>
          <input id="session-timeout" v-model.number="settings.session_timeout" type="number" min="1" />
        </div>
        <div class="setting-item">
          <label for="max-login-attempts">最大登录尝试次数</label>
          <input id="max-login-attempts" v-model.number="settings.max_login_attempts" type="number" min="1" />
        </div>
        <div class="setting-item">
          <label for="password-policy">密码策略</label>
          <select id="password-policy" v-model="settings.password_policy">
            <option value="weak">弱</option>
            <option value="medium">中等</option>
            <option value="strong">强</option>
          </select>
        </div>
      </div>

      <div class="settings-actions">
        <button @click="saveSettings" class="save-btn" :disabled="saving">
          {{ saving ? "保存中..." : "保存设置" }}
        </button>
        <button @click="resetSettings" class="reset-btn">重置默认</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"

const settings = ref({
  site_name: "",
  site_description: "",
  admin_email: "",
  max_concurrent_tasks: 5,
  task_timeout: 3600,
  retry_count: 3,
  email_enabled: false,
  smtp_server: "",
  smtp_port: 587,
  smtp_username: "",
  smtp_password: "",
  session_timeout: 30,
  max_login_attempts: 5,
  password_policy: "medium"
})

const saving = ref(false)

const fetchSettings = async () => {
  try {
    const response = await api.get("/settings")
    settings.value = { ...settings.value, ...response.data }
  } catch (error) {
    console.error("Failed to fetch settings:", error)
  }
}

const saveSettings = async () => {
  saving.value = true
  try {
    await api.put("/settings", settings.value)
    alert("设置保存成功")
  } catch (error) {
    console.error("Failed to save settings:", error)
    alert("设置保存失败")
  } finally {
    saving.value = false
  }
}

const resetSettings = async () => {
  if (confirm("确定要重置为默认设置吗？")) {
    try {
      await api.post("/settings/reset")
      await fetchSettings()
      alert("设置已重置为默认值")
    } catch (error) {
      console.error("Failed to reset settings:", error)
      alert("重置设置失败")
    }
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
.settings {
  padding: 20px;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.settings-section h2 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

.setting-item input[type="text"],
.setting-item input[type="email"],
.setting-item input[type="number"],
.setting-item input[type="password"],
.setting-item textarea,
.setting-item select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.setting-item textarea {
  resize: vertical;
  min-height: 80px;
}

.setting-item input[type="checkbox"] {
  margin-right: 8px;
}

.settings-actions {
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
