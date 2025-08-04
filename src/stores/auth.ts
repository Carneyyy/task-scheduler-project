import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { api } from "@/lib/api"

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null)
  const token = ref(localStorage.getItem("token") || "")
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials: { username: string; password: string }) => {
    isLoading.value = true
    try {
      const response = await api.post("/auth/login", credentials)
      token.value = response.data.access_token
      localStorage.setItem("token", token.value)
      await fetchUser()
      return response.data
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = ""
    localStorage.removeItem("token")
  }

  const fetchUser = async () => {
    if (!token.value) return
    
    try {
      const response = await api.get("/auth/me")
      user.value = response.data
    } catch (error) {
      console.error("Failed to fetch user:", error)
      logout()
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    fetchUser
  }
})
