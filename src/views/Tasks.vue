<template>
  <div class="tasks-page">
    <h1>任务管理</h1>
    <p>任务管理功能正在开发中...</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.tasks-page { padding: 20px; }
</style>
  <div class="tasks">
    <h1>任务管理</h1>
    <div class="task-actions">
      <button @click="createTask">创建任务</button>
    </div>
    <div class="task-list">
      <div v-if="loading">加载中...</div>
      <div v-else-if="tasks.length === 0">暂无任务</div>
      <div v-else class="task-grid">
        <div v-for="task in tasks" :key="task.id" class="task-card">
          <h3>{{ task.name }}</h3>
          <p>{{ task.description }}</p>
          <div class="task-meta">
            <span class="status">{{ task.status }}</span>
            <span class="created">{{ task.created_at }}</span>
          </div>
          <div class="task-actions">
            <button @click="editTask(task)">编辑</button>
            <button @click="deleteTask(task.id)">删除</button>
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

const deleteTask = async (id: number) => {
  if (confirm("确定要删除这个任务吗？")) {
    try {
      await api.delete(`/tasks/${id}`)
      await fetchTasks()
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.tasks {
  padding: 20px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.task-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-card h3 {
  margin: 0 0 10px 0;
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

.task-actions {
  display: flex;
  gap: 10px;
}

.task-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.task-actions button:first-child {
  background: #007bff;
  color: white;
}

.task-actions button:last-child {
  background: #dc3545;
  color: white;
}
</style>
