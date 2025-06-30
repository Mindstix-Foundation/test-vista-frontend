<template>
  <nav class="navbar">
    <div class="container-fluid px-4">
      <!-- Project Heading -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img src="@/assets/Test.jpg" alt="Test Vista Logo" class="brand-logo" />
      </router-link>

      <!-- Teacher/Admin Login Button -->
      <div class="navbar-nav">
        <router-link 
          to="/teacher-admin-login" 
          class="btn btn-outline-light"
          v-if="!isTeacherAdminLoginPage"
        >
          Teacher/Admin Login
        </router-link>
        <router-link 
          to="/login" 
          class="btn btn-outline-light"
          v-if="isTeacherAdminLoginPage"
        >
          Student Login
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isTeacherAdminLoginPage = computed(() => {
  return route.path === '/teacher-admin-login'
})
</script>

<style scoped>
/* General Styling */
.navbar {
  background-color: black !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100px;
  padding-bottom: 10px;
}

.container-fluid {
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.brand-logo {
  height: 40px;
  width: auto;
  object-fit: contain;
  margin-bottom: 0;
  margin-top: 50px;
}

.navbar-brand {
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  align-items: flex-start;
}
</style>
