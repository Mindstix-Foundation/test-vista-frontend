import { defineStore } from 'pinia'

interface ToastState {
  show: boolean
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    show: false,
    title: '',
    message: '',
    type: 'info',
  }),

  actions: {
    showToast(toast: Partial<ToastState>) {
      this.show = true
      this.title = toast.title ?? ''
      this.message = toast.message ?? ''
      this.type = toast.type ?? 'info'

      // Auto hide after 3 seconds
      setTimeout(() => {
        this.hideToast()
      }, 3000)
    },

    hideToast() {
      this.show = false
    },
  },
})
