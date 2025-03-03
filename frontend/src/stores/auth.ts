import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const userRole = ref<string | null>(localStorage.getItem('user_role'))
  const userId = ref<number | null>(Number(localStorage.getItem('user_id')) || null)
  const router = useRouter()

  console.log('Auth Store Initialized:', {
    hasToken: !!token.value,
    role: userRole.value,
    userId: userId.value,
  })

  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (accessToken: string, role: string, id: number) => {
    console.log('Setting Auth:', { role, id })
    token.value = accessToken
    userRole.value = role
    userId.value = id
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('user_role', role)
    localStorage.setItem('user_id', id.toString())
    // Update axios default headers
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    console.log('Auth Set Successfully:', {
      tokenSet: !!token.value,
      roleSet: !!userRole.value,
      userIdSet: !!userId.value,
      axiosHeader: !!axiosInstance.defaults.headers.common['Authorization'],
    })
  }

  const clearAuth = () => {
    console.log('Clearing Auth State')
    token.value = null
    userRole.value = null
    userId.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    // Remove authorization header
    delete axiosInstance.defaults.headers.common['Authorization']
    console.log('Auth State Cleared:', {
      tokenCleared: !token.value,
      roleCleared: !userRole.value,
      userIdCleared: !userId.value,
      axiosHeaderCleared: !axiosInstance.defaults.headers.common['Authorization'],
    })
  }

  const handleAuthExpired = () => {
    console.log('Auth Expired Event Received')
    clearAuth()
    const currentPath = window.location.pathname
    console.log('Current Path:', currentPath)
    if (currentPath !== '/login') {
      console.log('Redirecting to login with redirect path:', currentPath)
      router.push({
        name: 'login',
        query: { redirect: currentPath },
      })
    }
  }

  const checkAuth = async () => {
    console.log('Checking Auth Status')
    try {
      if (!token.value) {
        console.warn('No token found during auth check')
        clearAuth()
        return false
      }

      console.log('Setting axios headers for auth check')
      // Set the token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      // Verify token by calling the profile endpoint
      console.log('Calling profile endpoint for verification')
      const response = await axiosInstance.get('/auth/profile')
      console.log('Profile endpoint response:', response.status)

      // Set user ID from profile response if not already set
      if (response.data && response.data.id && !userId.value) {
        console.log('Setting user ID from profile:', response.data.id)
        userId.value = response.data.id
        localStorage.setItem('user_id', response.data.id.toString())
      }

      return response.status === 200
    } catch (error: unknown) {
      console.error('Auth check failed:', (error as AxiosError).message)
      clearAuth()
      return false
    }
  }

  // Initialize auth state and listeners
  if (token.value) {
    console.log('Setting initial axios headers')
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // Listen for auth expiration events
  window.addEventListener('auth:expired', handleAuthExpired)
  console.log('Auth expiration listener attached')

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
