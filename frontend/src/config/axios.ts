import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the latest token from localStorage
    const token = localStorage.getItem('access_token')
    console.log('Request URL:', config.url)
    console.log('Request Method:', config.method)
    console.log('Current Token:', token ? 'Present' : 'Missing')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Authorization Header Set:', `Bearer ${token.substring(0, 10)}...`)
    } else {
      console.warn('No token found in localStorage')
    }

    console.log('Final Request Headers:', config.headers)
    return config
  },
  (error) => {
    console.error('Request Interceptor Error:', error)
    return Promise.reject(error)
  },
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response Status:', response.status)
    console.log('Response URL:', response.config.url)
    return response
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      response: error.response?.data,
    })

    if (error.response?.status === 401) {
      console.warn('401 Unauthorized Error Detected')
      console.log('Current Path:', window.location.pathname)
      console.log('Request Headers:', error.config?.headers)

      // Clear local storage
      localStorage.clear()
      console.log('LocalStorage cleared')

      // Dispatch a custom event that components can listen for
      window.dispatchEvent(new CustomEvent('auth:expired'))
      console.log('Auth expired event dispatched')
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
