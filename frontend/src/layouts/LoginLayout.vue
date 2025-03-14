<template>
  <div>
    <TeacherNavbar v-if="isTeacherRoute" />
    <LoginNavBar v-else />
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import LoginNavBar from '@/components/LoginNavBar.vue'
import TeacherNavbar from '@/components/TeacherNavbar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Check if the current route is a teacher route
const isTeacherRoute = computed(() => {
  return route.path.startsWith('/teacher')
})
</script>

<style scoped>
/* Add any layout-specific styles here if needed */
</style>
