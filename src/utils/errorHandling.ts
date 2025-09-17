export const handleError = (error: any, context?: string) => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  return {
    message: error?.message || 'An unexpected error occurred',
    code: error?.code || 'UNKNOWN_ERROR'
  }
}

import { logger } from '../services/logger'
import toast from 'react-hot-toast'

export const showErrorToast = (message: string, context?: Record<string, unknown>) => {
  logger.error('Error toast displayed', undefined, { message, ...context })
  toast.error(message)
}

export const showSuccessToast = (message: string, context?: Record<string, unknown>) => {
  logger.info('Success toast displayed', { message, ...context })
  toast.success(message)
}