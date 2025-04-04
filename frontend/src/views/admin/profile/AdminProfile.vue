<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">My Profile</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="row justify-content-center my-5">
      <div class="col-12 text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="row justify-content-center my-4">
      <div class="col-12 col-sm-10">
        <div class="alert alert-danger" role="alert">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- Profile Card -->
    <div v-else class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="card shadow-sm">
          <div class="card-body p-3 p-md-4">
            <form>
              <!-- Name -->
              <div class="row mb-2">
                <label for="name" class="col-12 col-sm-3 col-form-label fw-bolder">Name:</label>
                <div class="col-12 col-sm-9">
                  <input
                    type="text"
                    class="form-control-plaintext"
                    id="name"
                    :value="userData.name"
                    readonly
                  />
                </div>
              </div>

              <!-- School Name -->
              <div class="row mb-2">
                <label for="schoolName" class="col-12 col-lg-3 col-form-label fw-bold"
                  >School Name:</label
                >
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="schoolName"
                    :value="userData.user_schools?.[0]?.school?.name || 'Not assigned'"
                  />
                </div>
              </div>

              <!-- Contact Numbers -->
              <div class="row mb-2">
                <div class="col-12 col-lg-6">
                  <div class="row">
                    <label for="contactNumber" class="col-12 col-lg-6 col-form-label fw-bold"
                      >Contact Number:</label
                    >
                    <div class="col-12 col-lg-6">
                      <input
                        type="text"
                        readonly
                        class="form-control-plaintext"
                        id="contactNumber"
                        :value="userData.contact_number"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="row">
                    <label for="alternateContactNumber" class="col-12 col-lg-6 col-form-label fw-bold"
                      >Alternate Number:</label
                    >
                    <div class="col-12 col-lg-6">
                      <input
                        type="text"
                        readonly
                        class="form-control-plaintext"
                        id="alternateContactNumber"
                        :value="userData.alternate_contact_number || 'Not provided'"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="row mb-2">
                <label for="emailId" class="col-12 col-lg-3 col-form-label fw-bold">Email Id:</label>
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="emailId"
                    :value="userData.email_id"
                  />
                </div>
              </div>

              <!-- Qualification -->
              <div class="row mb-2">
                <label for="qualification" class="col-12 col-lg-3 col-form-label fw-bold"
                  >Highest Qualification:</label
                >
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="qualification"
                    :value="userData.highest_qualification || 'Not provided'"
                  />
                </div>
              </div>
            </form>

            <!-- Action Buttons -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-dark"
                    style="border: 1px solid #dee2e6;"
                    @click="handleResetPassword"
                    title="Change your password"
                  >
                    Change Password
                  </button>
                  <button type="button" class="btn btn-custom" @click="showLogoutModal">
                    Logout <i class="bi bi-box-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div
      class="modal fade"
      id="logoutModal"
      tabindex="-1"
      aria-labelledby="logoutModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="logoutModalLabel">Confirm Logout</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">Are you sure you want to log out?</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-dark" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="logout">Logout</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import { useAuthStore } from '@/stores/auth'
import { Modal } from 'bootstrap'

const router = useRouter()
const authStore = useAuthStore()
const logoutModal = ref<Modal | null>(null)

interface UserSchool {
  id: number
  user_id: number
  school_id: number
  start_date: string
  end_date: string | null
  created_at: string
  school: {
    id: number
    board_id: number
    name: string
    address_id: number
    principal_name: string
    email: string
    contact_number: string
    alternate_contact_number: string
    created_at: string
    updated_at: string
  }
}

interface UserData {
  id: number
  name: string
  email_id: string
  contact_number: string
  alternate_contact_number: string | null
  highest_qualification: string | null
  status: boolean
  created_at: string
  updated_at: string
  user_schools: UserSchool[]
}

const loading = ref(true)
const error = ref<string | null>(null)
const userData = ref<UserData>({
  id: 0,
  name: '',
  email_id: '',
  contact_number: '',
  alternate_contact_number: null,
  highest_qualification: null,
  status: true,
  created_at: '',
  updated_at: '',
  user_schools: [],
})

/**
 * Fetch user profile data from API
 */
const fetchUserData = async () => {
  try {
    loading.value = true
    error.value = null

    // Wait for auth check to complete
    await authStore.checkAuth()

    const userId = authStore.userId
    if (!userId) {
      throw new Error('User ID not found')
    }
    const { data } = await axiosInstance.get(`/users/${userId}`)
    userData.value = data
  } catch (err) {
    console.error('Error fetching user data:', err)
    error.value = 'Failed to load profile data. Please try again later.'
    // If auth error, redirect to login
    if (err instanceof Error && err.message === 'User ID not found') {
      router.push({ name: 'login' })
    }
  } finally {
    loading.value = false
  }
}

/**
 * Show the logout confirmation modal
 */
const showLogoutModal = () => {
  logoutModal.value?.show()
}

/**
 * Handle user logout
 */
const logout = () => {
  logoutModal.value?.hide()
  
  // Clear all authentication data
  authStore.clearAuth()
  
  // Redirect to login page
  router.push('/login')
}

/**
 * Navigate to the change password page
 */
const handleResetPassword = () => {
  // Redirect to the change password page
  router.push({ name: 'changePassword' })
}

// Initialize modal and fetch user data on mount
onMounted(() => {
  // Initialize the logout modal
  const modalElement = document.getElementById('logoutModal')
  if (modalElement) {
    logoutModal.value = new Modal(modalElement)
  }
  
  // Fetch user data
  fetchUserData()
})
</script>

<style scoped>
.card {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-body {
  padding: 1.5rem;
}

.form-control-plaintext {
  font-weight: normal;
  padding: 0.375rem 0;
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .form-control-plaintext {
    padding-left: 0;
  }
  
  .col-form-label {
    padding-bottom: 0;
    margin-bottom: -0.5rem;
  }
  
  /* Update button styles for mobile */
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  /* Make action buttons stack on mobile */
  .row .d-flex.justify-content-end {
    flex-direction: column;
    gap: 0.5rem !important;
  }
}

@media (min-width: 576px) and (max-width: 767.98px) {
  /* Maintain right-alignment for buttons on tablet */
  .d-flex.justify-content-end {
    justify-content: flex-end;
  }
}

/* Button Styles */
.btn-custom {
  border: 1px solid gray !important;
  background-color: #f8f9fa;
  color: black;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.btn-custom:hover {
  border: 1px solid #dc3545 !important;
  background-color: #dc3545 !important;
  color: white !important;
}

@media (max-width: 576px) {
  .btn-custom {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545 !important;
    color: white !important;
  }
  
  /* Make action buttons stack on mobile */
  .d-flex.justify-content-end {
    flex-direction: column;
    gap: 0.5rem !important;
  }
  
  /* Update button styles for mobile */
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
