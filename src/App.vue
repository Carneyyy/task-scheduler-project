<template>
  <div id="app">
    <nav class="navbar" v-if="isAuthenticated">
      <div class="nav-brand">
        <h1>任务调度系统</h1>
      </div>
      <div class="nav-menu">
        <router-link to="/" class="nav-item">仪表板</router-link>
        <router-link to="/tasks" class="nav-item">任务管理</router-link>
        <router-link to="/scripts" class="nav-item">脚本管理</router-link>
        <router-link to="/spiders" class="nav-item">爬虫管理</router-link>
        <router-link to="/nodes" class="nav-item">节点管理</router-link>
        <router-link to="/notifications" class="nav-item">通知</router-link>
        <router-link to="/users" class="nav-item" v-if="isAdmin">用户管理</router-link>
        <router-link to="/settings" class="nav-item">设置</router-link>
      </div>
      <div class="nav-user">
        <span class="username">{{ user?.username }}</span>
        <button @click="logout" class="logout-btn">退出</button>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isAdmin = computed(() => user.value?.role === "admin")

const logout = () => {
  authStore.logout()
  router.push("/login")
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

#app {
  min-height: 100vh;
}

.navbar {
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: #34495e;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-weight: 500;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background: #c0392b;
}

.main-content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
