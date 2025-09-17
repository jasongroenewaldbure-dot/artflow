import axios from 'axios'
import { env } from '@/config/env'

export const http = axios.create({
  baseURL: env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || ({} as any)
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

