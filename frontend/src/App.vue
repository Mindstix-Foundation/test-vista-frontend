<template>
  <ToastNotification
    :show="toastStore.show"
    :title="toastStore.title"
    :message="toastStore.message"
    :type="toastStore.type"
    @close="toastStore.hideToast"
  />
  <RouterView />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'
import ToastNotification from '@/components/common/ToastNotification.vue'
import { useToastStore } from '@/store/toast'

const toastStore = useToastStore()

const logAppDimensions = () => {
  console.log('App - Window dimensions:', {
    width: window.innerWidth,
    height: window.innerHeight,
    viewportHeight: window.visualViewport?.height,
    devicePixelRatio: window.devicePixelRatio,
  })
}

onMounted(() => {
  logAppDimensions()
  window.addEventListener('resize', logAppDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', logAppDimensions)
})
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
}
</style>
