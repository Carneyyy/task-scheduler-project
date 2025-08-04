<template>
  <div class="notifications">
    <h1>通知管理</h1>
    <div class="notifications-actions">
      <button @click="createNotification" class="create-btn">创建通知</button>
      <button @click="markAllAsRead" class="mark-read-btn">全部标记为已读</button>
    </div>
    <div class="notifications-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="notifications.length === 0" class="empty">暂无通知</div>
      <div v-else class="notifications-container">
        <div v-for="notification in notifications" :key="notification.id" 
             class="notification-item" 
             :class="{ unread: !notification.is_read }">
          <div class="notification-header">
            <h3>{{ notification.title }}</h3>
            <span class="notification-time">{{ formatDate(notification.created_at) }}</span>
          </div>
          <div class="notification-content">
            <p>{{ notification.message }}</p>
          </div>
          <div class="notification-meta">
            <span class="type" :class="notification.type">{{ notification.type }}</span>
            <span class="priority" :class="notification.priority">{{ notification.priority }}</span>
          </div>
          <div class="notification-actions">
            <button @click="markAsRead(notification)" class="read-btn" 
                    v-if="!notification.is_read">标记为已读</button>
            <button @click="deleteNotification(notification.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"

const notifications = ref([])
const loading = ref(false)

const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await api.get("/notifications")
    notifications.value = response.data
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
  } finally {
    loading.value = false
  }
}

const createNotification = () => {
  console.log("Create notification")
}

const markAsRead = async (notification: any) => {
  try {
    await api.put(`/notifications/${notification.id}/read`)
    await fetchNotifications()
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
  }
}

const markAllAsRead = async () => {
  try {
    await api.put("/notifications/read-all")
    await fetchNotifications()
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
  }
}

const deleteNotification = async (id: string) => {
  if (confirm("确定要删除这个通知吗？")) {
    try {
      await api.delete(`/notifications/${id}`)
      await fetchNotifications()
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notifications {
  padding: 20px;
}

.notifications-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.create-btn, .mark-read-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.create-btn:hover, .mark-read-btn:hover {
  background: #0056b3;
}

.notifications-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #dee2e6;
}

.notification-item.unread {
  border-left-color: #007bff;
  background: #f8f9fa;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.notification-header h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.notification-time {
  color: #666;
  font-size: 14px;
}

.notification-content {
  margin-bottom: 15px;
}

.notification-content p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.type, .priority {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.type.INFO {
  background: #d1ecf1;
  color: #0c5460;
}

.type.WARNING {
  background: #fff3cd;
  color: #856404;
}

.type.ERROR {
  background: #f8d7da;
  color: #721c24;
}

.type.SUCCESS {
  background: #d4edda;
  color: #155724;
}

.priority.LOW {
  background: #e9ecef;
  color: #495057;
}

.priority.MEDIUM {
  background: #fff3cd;
  color: #856404;
}

.priority.HIGH {
  background: #f8d7da;
  color: #721c24;
}

.priority.URGENT {
  background: #dc3545;
  color: white;
}

.notification-actions {
  display: flex;
  gap: 10px;
}

.notification-actions button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.read-btn {
  background: #28a745;
  color: white;
}

.read-btn:hover {
  background: #218838;
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
