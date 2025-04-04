<template>
  <div v-if="show" :class="['loading-container', { 'with-overlay': showOverlay }]">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  showOverlay?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-container.with-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 