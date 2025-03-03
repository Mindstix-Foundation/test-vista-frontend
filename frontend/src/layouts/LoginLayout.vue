<template>
  <div>
    <LoginNavBar />
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import LoginNavBar from '@/components/LoginNavBar.vue'
</script>

<style scoped>
/* Add any layout-specific styles here if needed */
</style>
