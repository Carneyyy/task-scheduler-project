import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/Login.vue"),
      meta: { requiresAuth: false }
    },
    {
      path: "/tasks",
      name: "Tasks",
      component: () => import("@/views/Tasks.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/scripts",
      name: "Scripts",
      component: () => import("@/views/Scripts.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/spiders",
      name: "Spiders",
      component: () => import("@/views/Spiders.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/nodes",
      name: "Nodes",
      component: () => import("@/views/Nodes.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/notifications",
      name: "Notifications",
      component: () => import("@/views/Notifications.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/users",
      name: "Users",
      component: () => import("@/views/Users.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/settings",
      name: "Settings",
      component: () => import("@/views/Settings.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/profile",
      name: "Profile",
      component: () => import("@/views/Profile.vue"),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login")
  } else if (to.path === "/login" && authStore.isAuthenticated) {
    next("/")
  } else {
    next()
  }
})

export default router
