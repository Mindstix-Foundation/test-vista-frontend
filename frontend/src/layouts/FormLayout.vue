<template>
  <div class="form-layout">
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const logFormLayoutDimensions = () => {
  const formLayout = document.querySelector('.form-layout')
  if (!formLayout) return

  const styles = window.getComputedStyle(formLayout)
  const scrollHeight = formLayout.scrollHeight || 0
  const clientHeight = formLayout.clientHeight || 0

  console.log('FormLayout - Dimensions:', {
    width: window.innerWidth,
    height: window.innerHeight,
    layoutHeight: clientHeight,
    layoutScrollHeight: scrollHeight,
    overflowY: styles.overflowY,
    actualScroll: scrollHeight > clientHeight,
  })
}

onMounted(() => {
  logFormLayoutDimensions()
  window.addEventListener('resize', logFormLayoutDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', logFormLayoutDimensions)
})
</script>

<style scoped>
.form-layout {
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 768px) {
  .form-layout {
    height: 100vh;
    overflow-y: scroll !important;
  }
}
</style>
