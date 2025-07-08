<template>
  <!-- Navbar -->
  <LoginNavBar />

  <!-- Page Content -->
  <div class="container">
    <div class="card p-4 login-card">
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
  min-height: calc(100vh - 100px); /* Adjusted for navbar height */
  margin-top: 20px; /* Add some space below navbar */
  padding: 1rem;
}

/* Styling the card */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-card {
  transition: all 0.3s ease;
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

/* Button styling */
.btn {
  transition: all 0.3s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    min-height: calc(100vh - 80px);
    margin-top: 15px;
    padding: 0.5rem;
  }
  
  .card {
    max-width: 100%;
    margin: 0 0.5rem;
  }
  
  .btn-lg {
    padding: 0.75rem 1rem;
    font-size: 1.1rem;
  }
}

@media (max-width: 576px) {
  .container {
    min-height: calc(100vh - 70px);
    margin-top: 10px;
    padding: 0.25rem;
  }
  
  .card {
    margin: 0 0.25rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
  
  .btn-lg {
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
  }
}

/* Extra small screens */
@media (max-width: 400px) {
  .container {
    padding: 0.1rem;
  }
  
  .card {
    margin: 0 0.1rem;
  }
  
  .card-title {
    font-size: 1.3rem;
  }
  
  .btn-lg {
    font-size: 0.95rem;
  }
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
