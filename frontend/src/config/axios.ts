import axios from 'axios'

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
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('localStorage clear failed:', error)
    }
  }
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : '/api', // Use proxy in development
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add debounce for auth expired events
let authExpiredTimeout: number | null = null

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the latest token from localStorage
    const token = safeLocalStorage.getItem('access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Debounce auth expired events to prevent rapid successive calls
      if (authExpiredTimeout) {
        clearTimeout(authExpiredTimeout)
      }
      
      authExpiredTimeout = setTimeout(() => {
        // Clear local storage
        safeLocalStorage.clear()

        // Dispatch a custom event that components can listen for
        window.dispatchEvent(new CustomEvent('auth:expired'))
        authExpiredTimeout = null
      }, 100) as unknown as number // 100ms debounce
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  },
)

export default axiosInstance
