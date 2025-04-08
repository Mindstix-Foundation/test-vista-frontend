import { defineStore } from 'pinia'

interface ToastState {
  show: boolean
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    show: false,
    title: '',
    message: '',
    type: 'info'
  }),

  actions: {
    showToast({ title, message, type }: Omit<ToastState, 'show'>) {
      this.title = title
      this.message = message
      this.type = type
      this.show = true

      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideToast()
      }, 5000)
    },

    hideToast() {
      this.show = false
      this.title = ''
      this.message = ''
      this.type = 'info'
    }
  }
}) 