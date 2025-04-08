<template>
  <div v-if="toastStore.show" class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      class="toast show"
      :class="toastClass"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="toast-header">
        <strong class="me-auto">{{ toastStore.title }}</strong>
        <button type="button" class="btn-close" @click="closeToast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        {{ toastStore.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const toastClass = computed(() => {
  switch (toastStore.type) {
    case 'success':
      return 'bg-success text-white'
    case 'error':
      return 'bg-danger text-white'
    case 'warning':
      return 'bg-warning'
    case 'info':
    default:
      return 'bg-info'
  }
})

const closeToast = () => {
  toastStore.hideToast()
}
</script>

<style scoped>
.toast-container {
  z-index: 1050;
}
</style>
