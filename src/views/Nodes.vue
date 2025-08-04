<template>
  <div class="nodes">
    <h1>节点管理</h1>
    <div class="nodes-actions">
      <button @click="createNode" class="create-btn">添加节点</button>
    </div>
    <div class="nodes-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="nodes.length === 0" class="empty">暂无节点</div>
      <div v-else class="nodes-grid">
        <div v-for="node in nodes" :key="node.id" class="node-card">
          <h3>{{ node.name }}</h3>
          <p>{{ node.description }}</p>
          <div class="node-meta">
            <span class="status" :class="node.status">{{ node.status }}</span>
            <span class="type">{{ node.type }}</span>
            <span class="created">{{ formatDate(node.created_at) }}</span>
          </div>
          <div class="node-info">
            <div class="info-item">
              <span class="label">IP地址:</span>
              <span class="value">{{ node.ip_address }}</span>
            </div>
            <div class="info-item">
              <span class="label">端口:</span>
              <span class="value">{{ node.port }}</span>
            </div>
            <div class="info-item">
              <span class="label">CPU使用率:</span>
              <span class="value">{{ node.cpu_usage || "N/A" }}</span>
            </div>
            <div class="info-item">
              <span class="label">内存使用率:</span>
              <span class="value">{{ node.memory_usage || "N/A" }}</span>
            </div>
          </div>
          <div class="node-actions">
            <button @click="editNode(node)" class="edit-btn">编辑</button>
            <button @click="deleteNode(node.id)" class="delete-btn">删除</button>
            <button @click="testConnection(node)" class="test-btn">测试连接</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { api } from "@/lib/api"

const nodes = ref([])
const loading = ref(false)

const fetchNodes = async () => {
  loading.value = true
  try {
    const response = await api.get("/nodes")
    nodes.value = response.data
  } catch (error) {
    console.error("Failed to fetch nodes:", error)
  } finally {
    loading.value = false
  }
}

const createNode = () => {
  console.log("Create node")
}

const editNode = (node: any) => {
  console.log("Edit node:", node)
}

const deleteNode = async (id: string) => {
  if (confirm("确定要删除这个节点吗？")) {
    try {
      await api.delete(`/nodes/${id}`)
      await fetchNodes()
    } catch (error) {
      console.error("Failed to delete node:", error)
    }
  }
}

const testConnection = (node: any) => {
  console.log("Test connection:", node)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchNodes()
})
</script>

<style scoped>
.nodes {
  padding: 20px;
}

.nodes-actions {
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

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.node-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.node-card h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.node-card p {
  margin: 0 0 15px 0;
  color: #666;
}

.node-meta {
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

.status.ONLINE {
  background: #d4edda;
  color: #155724;
}

.status.OFFLINE {
  background: #f8d7da;
  color: #721c24;
}

.status.MAINTENANCE {
  background: #fff3cd;
  color: #856404;
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

.node-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.info-item .label {
  color: #666;
  font-weight: 500;
}

.info-item .value {
  color: #333;
}

.node-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.node-actions button {
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

.test-btn {
  background: #17a2b8;
  color: white;
}

.test-btn:hover {
  background: #138496;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
