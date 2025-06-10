import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/config/axios'
import { useRouter } from 'vue-router'

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('localStorage access failed:', error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('localStorage write failed:', error)
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('localStorage remove failed:', error)
    }
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(safeLocalStorage.getItem('access_token'))
  const userRole = ref<string | null>(safeLocalStorage.getItem('user_role'))
  const userId = ref<number | null>(Number(safeLocalStorage.getItem('user_id')) || null)
  const router = useRouter()
  
  // Add flag to prevent multiple simultaneous auth checks
  const checkingAuth = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (accessToken: string, role: string, id: number) => {
    token.value = accessToken
    userRole.value = role
    userId.value = id
    safeLocalStorage.setItem('access_token', accessToken)
    safeLocalStorage.setItem('user_role', role)
    safeLocalStorage.setItem('user_id', id.toString())
    // Update axios default headers
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  }

  const clearAuth = () => {
    token.value = null
    userRole.value = null
    userId.value = null
    checkingAuth.value = false
    safeLocalStorage.removeItem('access_token')
    safeLocalStorage.removeItem('user_role')
    safeLocalStorage.removeItem('user_id')
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
    // Prevent multiple simultaneous auth checks
    if (checkingAuth.value) {
      return !!token.value
    }
    
    try {
      checkingAuth.value = true
      
      if (!token.value) {
        clearAuth()
        return false
      }

      // Set the token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      // Verify token by calling the profile endpoint
      const response = await axiosInstance.get('/auth/profile')

      // Set user ID from profile response if not already set
      if (response?.data?.data?.id && !userId.value) {
        userId.value = response.data.data.id
        safeLocalStorage.setItem('user_id', response.data.data.id.toString())
      }

      return response.status === 200
    } catch (error) {
      console.error('Auth check failed:', error)
      clearAuth()
      return false
    } finally {
      checkingAuth.value = false
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
    checkingAuth,
    setAuth,
    clearAuth,
    checkAuth,
  }
})
