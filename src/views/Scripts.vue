<template>
  <div class="scripts">
    <h1>脚本管理</h1>
    <div class="scripts-actions">
      <button @click="createScript" class="create-btn">创建脚本</button>
    </div>
    <div class="scripts-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="scripts.length === 0" class="empty">暂无脚本</div>
      <div v-else class="scripts-grid">
        <div v-for="script in scripts" :key="script.id" class="script-card">
          <h3>{{ script.name }}</h3>
          <p>{{ script.description }}</p>
          <div class="script-meta">
            <span class="type">{{ script.type }}</span>
            <span class="created">{{ formatDate(script.created_at) }}</span>
          </div>
          <div class="script-actions">
            <button @click="editScript(script)" class="edit-btn">编辑</button>
            <button @click="deleteScript(script.id)" class="delete-btn">删除</button>
            <button @click="executeScript(script)" class="execute-btn">执行</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"

const scripts = ref([])
const loading = ref(false)

const fetchScripts = async () => {
  loading.value = true
  try {
    const response = await api.get("/scripts")
    scripts.value = response.data
  } catch (error) {
    console.error("Failed to fetch scripts:", error)
  } finally {
    loading.value = false
  }
}

const createScript = () => {
  console.log("Create script")
}

const editScript = (script: any) => {
  console.log("Edit script:", script)
}

const deleteScript = async (id: string) => {
  if (confirm("确定要删除这个脚本吗？")) {
    try {
      await api.delete(`/scripts/${id}`)
      await fetchScripts()
    } catch (error) {
      console.error("Failed to delete script:", error)
    }
  }
}

const executeScript = (script: any) => {
  console.log("Execute script:", script)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchScripts()
})
</script>

<style scoped>
.scripts {
  padding: 20px;
}

.scripts-actions {
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

.scripts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.script-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.script-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.script-card p {
  margin: 0 0 15px 0;
  color: #666;
}

.script-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.type {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.created {
  color: #666;
  font-size: 14px;
}

.script-actions {
  display: flex;
  gap: 10px;
}

.script-actions button {
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

.execute-btn {
  background: #ffc107;
  color: #212529;
}

.execute-btn:hover {
  background: #e0a800;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
