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
import { onMounted } from 'vue'
import { useMobileScrollFix } from '@/utils/mobileScrollFix'

// Fix for mobile scrolling issues - only apply on mobile devices
const { applyFixes, enableScrolling, isMobile } = useMobileScrollFix()

onMounted(() => {
  // Only apply fixes on mobile devices to avoid affecting desktop layout
  if (isMobile) {
    applyFixes()
    
    // Additional fix with delay to ensure DOM is ready
    setTimeout(() => {
      enableScrolling()
    }, 100)
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  position: relative;
}

/* Mobile-specific app fixes - ONLY apply on mobile screens */
@media screen and (max-width: 768px) {
  #app {
    height: auto !important;
    min-height: 100vh !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    position: relative !important;
    /* Ensure mobile layout overrides desktop constraints */
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    grid-template-columns: none !important;
  }
}
</style>
