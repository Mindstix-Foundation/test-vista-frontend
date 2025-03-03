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

    <!-- Profile Card -->
    <div class="row gy-2 g-3 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="card shadow-sm">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
          <form v-else>
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
                      :value="userData.alternate_contact_number"
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
                  :value="userData.highest_qualification"
                />
              </div>
            </div>
          </form>
          <div class="card-footer text-end">
            <button
              type="button"
              class="btn btn-light me-2"
              style="border: 1px solid gray"
              @click="handleResetPassword"
            >
              Reset Password
            </button>
            <button type="button" class="btn btn-danger fw-bold" @click="handleLogout">
              Logout <i class="bi bi-box-arrow-right"></i>
            </button>
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

const router = useRouter()
const authStore = useAuthStore()

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
  alternate_contact_number: string
  highest_qualification: string
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
  alternate_contact_number: '',
  highest_qualification: '',
  status: true,
  created_at: '',
  updated_at: '',
  user_schools: [],
})

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
    error.value = 'Failed to load profile data. Please try again.'
    // If auth error, redirect to login
    if (err instanceof Error && err.message === 'User ID not found') {
      router.push({ name: 'login' })
    }
  } finally {
    loading.value = false
  }
}

const handleResetPassword = () => {
  router.push({ name: 'forgotPassword' })
}

const handleLogout = () => {
  // Clear all authentication data
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.clear() // Clear any remaining data

  // Reset any auth state in your app
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

  // Redirect to login page
  router.push('/login')

  // Force a page reload to clear any cached data
  window.location.reload()
}

onMounted(() => {
  fetchUserData()
})
</script>

<style scoped>
@media (max-width: 768px) {
  #navProfile {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.form-control-plaintext {
  font-weight: normal;
}

.card {
  border: none;
}

.card-footer {
  background-color: transparent;
  border-top: none;
  padding: 1rem;
}

.btn-danger {
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.bi-box-arrow-right {
  margin-left: 0.5rem;
}
</style>
