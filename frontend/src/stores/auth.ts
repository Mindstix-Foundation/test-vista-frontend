import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/config/axios'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const userRole = ref<string | null>(localStorage.getItem('user_role'))
  const userId = ref<number | null>(Number(localStorage.getItem('user_id')) || null)
  const router = useRouter()

  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (accessToken: string, role: string, id: number) => {
    token.value = accessToken
    userRole.value = role
    userId.value = id
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('user_role', role)
    localStorage.setItem('user_id', id.toString())
    // Update axios default headers
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  const clearAuth = () => {
    token.value = null
    userRole.value = null
    userId.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    // Remove authorization header
    delete axiosInstance.defaults.headers.common['Authorization']
  }

  const handleAuthExpired = () => {
    clearAuth()
    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      router.push({
        name: 'login',
        query: { redirect: currentPath },
      })
    }
  }

  const checkAuth = async () => {
    try {
      if (!token.value) {
        clearAuth()
        return false
      }

      // Set the token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      // Verify token by calling the profile endpoint
      const response = await axiosInstance.get('/auth/profile')

      // Set user ID from profile response if not already set
      if (response?.data?.id && !userId.value) {
        userId.value = response.data.id
        localStorage.setItem('user_id', response.data.id.toString())
      }

      return response.status === 200
    } catch {
      clearAuth()
      return false
    }
  }

  // Initialize auth state and listeners
  if (token.value) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // Listen for auth expiration events
  window.addEventListener('auth:expired', handleAuthExpired)

  return {
    token,
    userRole,
    userId,
    isAuthenticated,
    setAuth,
    clearAuth,
    checkAuth,
  }
})
