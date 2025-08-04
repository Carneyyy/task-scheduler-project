<template>
  <div class="tasks">
    <h1>任务管理</h1>
    <div class="task-actions">
      <button @click="createTask" class="create-btn">创建任务</button>
    </div>
    <div class="task-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="tasks.length === 0" class="empty">暂无任务</div>
      <div v-else class="task-grid">
        <div v-for="task in tasks" :key="task.id" class="task-card">
          <h3>{{ task.name }}</h3>
          <p>{{ task.description }}</p>
          <div class="task-meta">
            <span class="status" :class="task.status">{{ task.status }}</span>
            <span class="created">{{ formatDate(task.created_at) }}</span>
          </div>
          <div class="task-actions">
            <button @click="editTask(task)" class="edit-btn">编辑</button>
            <button @click="deleteTask(task.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"

const tasks = ref([])
const loading = ref(false)

const fetchTasks = async () => {
  loading.value = true
  try {
    const response = await api.get("/tasks")
    tasks.value = response.data
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
  } finally {
    loading.value = false
  }
}

const createTask = () => {
  console.log("Create task")
}

const editTask = (task: any) => {
  console.log("Edit task:", task)
}

const deleteTask = async (id: string) => {
  if (confirm("确定要删除这个任务吗？")) {
    try {
      await api.delete(`/tasks/${id}`)
      await fetchTasks()
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.tasks {
  padding: 20px;
}

.task-actions {
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

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.task-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.task-card p {
  margin: 0 0 15px 0;
  color: #666;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.PENDING {
  background: #fff3cd;
  color: #856404;
}

.status.RUNNING {
  background: #d1ecf1;
  color: #0c5460;
}

.status.SUCCESS {
  background: #d4edda;
  color: #155724;
}

.status.FAILED {
  background: #f8d7da;
  color: #721c24;
}

.created {
  color: #666;
  font-size: 14px;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.task-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.edit-btn {
  background: #28a745;
  color: white;
}

.edit-btn:hover {
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
