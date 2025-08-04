<template>
  <div class="spiders">
    <h1>爬虫管理</h1>
    <div class="spiders-actions">
      <button @click="createSpider" class="create-btn">创建爬虫</button>
    </div>
    <div class="spiders-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="spiders.length === 0" class="empty">暂无爬虫</div>
      <div v-else class="spiders-grid">
        <div v-for="spider in spiders" :key="spider.id" class="spider-card">
          <h3>{{ spider.name }}</h3>
          <p>{{ spider.description }}</p>
          <div class="spider-meta">
            <span class="status" :class="spider.status">{{ spider.status }}</span>
            <span class="type">{{ spider.type }}</span>
            <span class="created">{{ formatDate(spider.created_at) }}</span>
          </div>
          <div class="spider-actions">
            <button @click="editSpider(spider)" class="edit-btn">编辑</button>
            <button @click="deleteSpider(spider.id)" class="delete-btn">删除</button>
            <button @click="runSpider(spider)" class="run-btn">运行</button>
            <button @click="stopSpider(spider)" class="stop-btn" :disabled="spider.status !== 'RUNNING'">停止</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"

const spiders = ref([])
const loading = ref(false)

const fetchSpiders = async () => {
  loading.value = true
  try {
    const response = await api.get("/spiders")
    spiders.value = response.data
  } catch (error) {
    console.error("Failed to fetch spiders:", error)
  } finally {
    loading.value = false
  }
}

const createSpider = () => {
  console.log("Create spider")
}

const editSpider = (spider: any) => {
  console.log("Edit spider:", spider)
}

const deleteSpider = async (id: string) => {
  if (confirm("确定要删除这个爬虫吗？")) {
    try {
      await api.delete(`/spiders/${id}`)
      await fetchSpiders()
    } catch (error) {
      console.error("Failed to delete spider:", error)
    }
  }
}

const runSpider = (spider: any) => {
  console.log("Run spider:", spider)
}

const stopSpider = (spider: any) => {
  console.log("Stop spider:", spider)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchSpiders()
})
</script>

<style scoped>
.spiders {
  padding: 20px;
}

.spiders-actions {
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

.spiders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.spider-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.spider-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.spider-card p {
  margin: 0 0 15px 0;
  color: #666;
}

.spider-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.IDLE {
  background: #e9ecef;
  color: #495057;
}

.status.RUNNING {
  background: #d1ecf1;
  color: #0c5460;
}

.status.COMPLETED {
  background: #d4edda;
  color: #155724;
}

.status.FAILED {
  background: #f8d7da;
  color: #721c24;
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

.spider-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.spider-actions button {
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

.run-btn {
  background: #17a2b8;
  color: white;
}

.run-btn:hover {
  background: #138496;
}

.stop-btn {
  background: #6c757d;
  color: white;
}

.stop-btn:hover:not(:disabled) {
  background: #5a6268;
}

.stop-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
