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
          <form>
            <!-- Name -->
            <div class="row mb-2">
              <label for="name" class="col-12 col-sm-3 col-form-label fw-bolder">Name:</label>
              <div class="col-12 col-sm-9">
                <input
                  type="text"
                  class="form-control-plaintext"
                  id="name"
                  :value="profile.name"
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
                  :value="profile.user_schools[0].school.name || 'Not assigned'"
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
                      :value="profile.contact_number"
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
                      :value="profile.alternate_contact_number || 'Not provided'"
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
                  :value="profile.email_id"
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
                  :value="profile.highest_qualification || 'Not provided'"
                />
              </div>
            </div>
          </form>
          <div class="card-footer text-end">
            <button
              type="button"
              class="btn btn-light me-2"
              style="border: 1px solid gray"
              disabled
              title="Coming soon"
            >
              Reset Password
            </button>
            <button type="button" class="btn btn-danger fw-bold" @click="showLogoutModal">
              Logout <i class="bi bi-box-arrow-right"></i>
            </button>
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
import { Modal } from 'bootstrap'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Hardcoded dummy data
const profile = ref({
  id: 1,
  name: 'John Smith',
  email_id: 'john.smith@school.com',
  contact_number: '+91 9876543210',
  alternate_contact_number: '+91 9876543211',
  highest_qualification: 'M.Ed in Mathematics',
  user_schools: [
    {
      school: {
        name: 'Delhi Public School',
      },
    },
  ],
})

const logoutModal = ref<Modal | null>(null)

const showLogoutModal = () => {
  logoutModal.value?.show()
}

const logout = async () => {
  try {
    logoutModal.value?.hide()
    authStore.clearAuth()
    await router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
}

// Initialize modal on mount
onMounted(() => {
  const modalElement = document.getElementById('logoutModal')
  if (modalElement) {
    logoutModal.value = new Modal(modalElement)
  }
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
