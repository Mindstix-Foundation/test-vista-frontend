const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const getApiUrl = (path: string): string => {
  const formattedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${formattedPath}`
}
