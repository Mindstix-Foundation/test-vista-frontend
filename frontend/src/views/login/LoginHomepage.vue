<template>
  <!-- Navbar -->
  <LoginNavBar />

  <!-- Page Content -->
  <div class="container">
    <div class="card p-4" style="max-width: 400px; width: 100%">
      <h3 class="card-title text-center">Student Registration</h3>
      <p class="text-center">Student Portal</p>

      <!-- Student Options -->
      <div class="student-section">
        <!-- Primary Registration Button -->
        <button class="btn btn-success w-100 mb-3 btn-lg" @click="itiStudentRegistration">
          Student Registration
        </button>
      </div>

      <!-- Error message below login -->
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginNavBar from '@/components/LoginNavBar.vue'

const router = useRouter()
const errorMessage = ref('')

const itiStudentRegistration = () => {
  router.push({ name: 'iti-student-registration' })
}
</script>

<style scoped>
body {
  background-color: #ffffff;
}

/* Centering the container */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px); /* Adjusted for navbar height */
  margin-top: 20px; /* Add some space below navbar */
}

/* Styling the card */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Styling form inputs */
.form-control {
  background-color: #fbfbfb;
}

.btn-link {
  text-decoration: none;
}

.error-message {
  color: red;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 10px;
}

/* Password field styling */
.password-field {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #495057;
}
</style>
