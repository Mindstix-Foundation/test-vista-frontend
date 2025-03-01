<template>
  <nav class="navbar">
    <div class="container-fluid px-4">
      <!-- Project Heading -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <img src="@/assets/Test.jpg" alt="Test Vista Logo" class="brand-logo" />
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
// No additional logic needed
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
