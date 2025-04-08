<template>
  <ToastNotification />
  <RouterView v-slot="{ Component, route }">
    <keep-alive :include="['EditPattern', 'EditSection']">
      <component
        :is="Component"
        :key="route.name === 'editPattern' && route.query.from === 'editSection'
          ? `${route.name}-${route.params.id}`
          : route.fullPath"
      />
    </keep-alive>
  </RouterView>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastNotification from '@/components/common/ToastNotification.vue'
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
}
</style>
