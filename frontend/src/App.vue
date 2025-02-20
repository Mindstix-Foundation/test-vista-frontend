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
import { RouterView } from 'vue-router'
import ToastNotification from '@/components/common/ToastNotification.vue'
import { useToastStore } from '@/store/toast'

const toastStore = useToastStore()
</script>
