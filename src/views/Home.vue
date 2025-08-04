<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-4">爬虫任务管理系统</h1>
        <p class="text-xl text-gray-600 mb-8">实时监控和管理您的爬虫任务</p>
        <div class="space-x-4">
          <router-link to="/login" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            登录系统
          </router-link>
          <router-link to="/dashboard" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
            进入仪表板
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
