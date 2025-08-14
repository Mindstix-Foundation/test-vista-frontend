<template>
  <!-- Navbar -->
  <LoginNavBar />

  <!-- Page Content -->
  <div class="container">
    <div class="card p-4" style="max-width: 400px; width: 100%">
      <h3 class="card-title text-center">Reset Password</h3>
      <p class="text-center">
        Choose a strong password that includes a mix of letters, numbers, and special characters.
      </p>

      <div class="mb-3">
        <label for="new-password" class="form-label">New Password</label>
        <input
          type="password"
          class="form-control"
          id="new-password"
          v-model="newPassword"
          placeholder="Enter new password"
          :class="{
            'is-invalid': !isPasswordValid && newPassword,
            'is-valid': isPasswordValid && newPassword,
          }"
          :disabled="isLoading"
          required
        />
        <div v-if="!isPasswordValid && newPassword" class="invalid-feedback">
          Password must be at least 8 characters long and include uppercase, lowercase, number, and
          special character.
        </div>
      </div>

      <div class="mb-4">
        <label for="confirm-password" class="form-label">Confirm Password</label>
        <input
          type="password"
          class="form-control"
          id="confirm-password"
          v-model="confirmPassword"
          placeholder="Confirm new password"
          :class="{
            'is-invalid': showError || (!doPasswordsMatch && confirmPassword),
            'is-valid': doPasswordsMatch && confirmPassword,
          }"
          :disabled="isLoading"
          required
        />
        <div class="invalid-feedback">{{ errorMessage || 'Passwords do not match' }}</div>
      </div>

      <button class="btn btn-primary w-100 mb-3" @click="resetPassword" :disabled="isLoading">
        <output
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-2"
        ></output>
        Reset Password
      </button>

      <!-- Success message -->
      <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LoginNavBar from '@/components/LoginNavBar.vue'
import axiosInstance from '@/config/axios'

const router = useRouter()
const route = useRoute()
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const showError = ref(false)
const successMessage = ref('')
const isLoading = ref(false)

// Get token from URL
const token = computed(() => route.query.token as string)

// Validate token on mount
onMounted(() => {
  if (!token.value) {
    router.push({ name: 'login' })
  }
})

// Password regex for validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Computed properties for validation
const isPasswordValid = computed(() => passwordRegex.test(newPassword.value))
const doPasswordsMatch = computed(() => newPassword.value === confirmPassword.value)

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string
    }
    status?: number
  }
}

const resetPassword = async () => {
  // Reset error states
  showError.value = false
  errorMessage.value = ''
  successMessage.value = ''

  // Validate password
  if (!isPasswordValid.value) {
    showError.value = true
    errorMessage.value = 'Password does not meet complexity requirements.'
    return
  }

  // Check if passwords match
  if (!doPasswordsMatch.value) {
    showError.value = true
    errorMessage.value = 'Passwords do not match.'
    return
  }

  try {
    isLoading.value = true
    const response = await axiosInstance.post('/auth/reset-password', {
      token: token.value,
      newPassword: newPassword.value,
    })

    // Show success message
    successMessage.value = response.data.message || 'Password successfully reset!'

    // Clear form
    newPassword.value = ''
    confirmPassword.value = ''

    // Wait for 2 seconds before redirecting to login
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
  } catch (error: unknown) {
    console.error('Password reset error:', error)
    const apiError = error as ApiErrorResponse
    showError.value = true
    if (apiError.response?.data?.message) {
      errorMessage.value = apiError.response.data.message
    } else if (apiError.response?.status === 401) {
      errorMessage.value = 'Invalid or expired reset token. Please request a new reset link.'
    } else {
      errorMessage.value = 'Failed to reset password. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
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

/* Custom border color for password validation */
.invalid {
  border-color: red !important;
}

.valid {
  border-color: green !important;
}

.alert {
  margin-top: 1rem;
  margin-bottom: 0;
  font-size: 0.875rem;
}

.text-danger {
  font-size: 0.875rem;
}
</style>
