<template>
  <div v-if="show" class="toast-container position-fixed bottom-0 end-0 p-3">
    <div
      class="toast show"
      :class="toastClass"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="toast-header">
        <strong class="me-auto">{{ title }}</strong>
        <button type="button" class="btn-close" @click="closeToast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  show: boolean
  title: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const toastClass = computed(() => {
  switch (props.type) {
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
  emit('close')
}
</script>

<style scoped>
.toast-container {
  z-index: 1050;
}
</style>
