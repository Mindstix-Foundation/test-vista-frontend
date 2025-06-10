<template>
  <!-- Navbar -->
  <LoginNavBar />

  <!-- Page Content -->
  <div class="container">
    <div class="card p-4" style="max-width: 400px; width: 100%">
      <h3 class="card-title text-center">Change Password</h3>
      <p class="text-center">
        Choose a strong password that includes a mix of letters, numbers, and special characters.
      </p>

      <div class="mb-3">
        <label for="current-password" class="form-label">Current Password</label>
        <input
          type="password"
          class="form-control"
          id="current-password"
          v-model="currentPassword"
          placeholder="Enter current password"
          :disabled="isLoading"
          required
          ref="currentPasswordInput"
          @input="clearPasswordError"
        />
      </div>

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
            'is-invalid': (!doPasswordsMatch && confirmPassword),
            'is-valid': doPasswordsMatch && confirmPassword,
          }"
          :disabled="isLoading"
          required
        />
        <div v-if="!doPasswordsMatch && confirmPassword" class="invalid-feedback">Passwords do not match</div>
      </div>

      <!-- Error message alert -->
      <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
        {{ errorMessage }}
      </div>

      <button class="btn btn-primary w-100 mb-3" @click="changePassword" :disabled="isLoading">
        <output
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-2"
        ></output>
        Change Password
      </button>

      <!-- Back to profile button -->
      <button
        class="btn btn-light w-100"
        @click="goToProfile"
        :disabled="isLoading"
        style="border: 1px solid #ccc;"
      >
        Back to Profile
      </button>
    </div>
  </div>

  <!-- Toast Notification for success -->
  <ToastNotification
    :show="showToast"
    :title="toastTitle"
    :message="toastMessage"
    :type="toastType"
    @close="closeToast"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LoginNavBar from '@/components/LoginNavBar.vue'
import ToastNotification from '@/components/common/ToastNotification.vue'
import axiosInstance from '@/config/axios'
import { useAuthStore } from '@/stores/auth'
import { VALIDATION_MESSAGES } from '@/utils/validationConstants'

const router = useRouter()
const authStore = useAuthStore()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const currentPasswordInput = ref<HTMLInputElement | null>(null)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('success')

// Password regex for validation
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Computed properties for validation
const isPasswordValid = computed(() => passwordRegex.test(newPassword.value))
const doPasswordsMatch = computed(() => newPassword.value === confirmPassword.value)

// Close toast notification
const closeToast = () => {
  showToast.value = false;
  toastTitle.value = '';
  toastMessage.value = '';
}

// Clear password error when user starts typing
const clearPasswordError = () => {
  if (errorMessage.value) {
    errorMessage.value = '';
  }
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string
    }
    status?: number
  }
}

const changePassword = async () => {
  // Reset error states
  errorMessage.value = ''
  closeToast()

  // Validate current password
  if (!currentPassword.value) {
    errorMessage.value = VALIDATION_MESSAGES.PASSWORD.CURRENT_REQUIRED
    currentPasswordInput.value?.focus()
    return
  }

  // Validate password
  if (!isPasswordValid.value) {
    errorMessage.value = VALIDATION_MESSAGES.PASSWORD.COMPLEXITY
    return
  }

  // Check if passwords match
  if (!doPasswordsMatch.value) {
    errorMessage.value = VALIDATION_MESSAGES.PASSWORD.MISMATCH
    return
  }

  try {
    isLoading.value = true

    // Call to the API to change password
    const response = await axiosInstance.post('/auth/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    })

    // Show success toast notification
    toastTitle.value = 'Success';
    toastMessage.value = response.data.message || 'Password successfully changed!';
    toastType.value = 'success';
    showToast.value = true;

    // Clear form
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    // Wait for 2 seconds before redirecting to appropriate profile based on user role
    setTimeout(() => {
      // Check user role and redirect accordingly
      const userRole = authStore.userRole
      if (userRole === 'TEACHER') {
        router.push({ name: 'teacherProfile' })
      } else {
        router.push({ name: 'adminProfile' })
      }
    }, 2000)
  } catch (error: unknown) {
    console.error('Password change error:', error)

    const apiError = error as ApiErrorResponse

    if (apiError.response?.status === 401 ||
        (apiError.response?.status === 400 &&
         apiError.response?.data?.message?.includes('incorrect'))) {
      // This is a current password error
      errorMessage.value = VALIDATION_MESSAGES.PASSWORD.INCORRECT
      // Clear the password field
      currentPassword.value = ''
      // Focus on the current password field
      setTimeout(() => {
        currentPasswordInput.value?.focus()
      }, 100)
    } else if (apiError.response?.data?.message) {
      errorMessage.value = apiError.response.data.message
    } else {
      errorMessage.value = 'Failed to change password. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}

const goToProfile = () => {
  // Redirect to appropriate profile based on user role
  const userRole = authStore.userRole
  if (userRole === 'TEACHER') {
    router.push({ name: 'teacherProfile' })
  } else {
    router.push({ name: 'adminProfile' })
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

/* Override Bootstrap's invalid styling when the input is focused */
.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}
</style>
