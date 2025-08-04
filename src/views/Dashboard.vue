<template>
  <div class="dashboard">
    <h1>仪表板</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>总任务数</h3>
        <p>{{ stats.totalTasks }}</p>
      </div>
      <div class="stat-card">
        <h3>运行中</h3>
        <p>{{ stats.runningTasks }}</p>
      </div>
      <div class="stat-card">
        <h3>已完成</h3>
        <p>{{ stats.completedTasks }}</p>
      </div>
      <div class="stat-card">
        <h3>失败</h3>
        <p>{{ stats.failedTasks }}</p>
      </div>
    </div>
    <div class="recent-tasks">
      <h2>最近任务</h2>
      <div class="task-list">
        <div v-for="task in recentTasks" :key="task.id" class="task-item">
          <div class="task-info">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-status" :class="task.status">{{ task.status }}</span>
          </div>
          <div class="task-time">{{ task.created_at }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"

const stats = ref({
  totalTasks: 0,
  runningTasks: 0,
  completedTasks: 0,
  failedTasks: 0
})

const recentTasks = ref([])

const fetchStats = async () => {
  try {
    const response = await api.get("/tasks/stats")
    stats.value = response.data
  } catch (error) {
    console.error("Failed to fetch stats:", error)
  }
}

const fetchRecentTasks = async () => {
  try {
    const response = await api.get("/tasks?limit=10")
    recentTasks.value = response.data
  } catch (error) {
    console.error("Failed to fetch recent tasks:", error)
  }
}

onMounted(() => {
  fetchStats()
  fetchRecentTasks()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
}

.stat-card p {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}

.recent-tasks {
  margin-top: 40px;
}

.task-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-item {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-item:last-child {
  border-bottom: none;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-name {
  font-weight: 500;
}

.task-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.task-status.running {
  background: #e3f2fd;
  color: #1976d2;
}

.task-status.completed {
  background: #e8f5e8;
  color: #2e7d32;
}

.task-status.failed {
  background: #ffebee;
  color: #c62828;
}

.task-time {
  color: #666;
  font-size: 14px;
}
</style>
