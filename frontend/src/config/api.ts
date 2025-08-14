const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`
}
