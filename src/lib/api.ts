import axios from "axios"
import { useAuthStore } from "@/stores/auth"

export const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
