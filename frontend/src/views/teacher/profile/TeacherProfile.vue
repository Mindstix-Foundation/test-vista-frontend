<template>
  <div>
    <!-- Main Container -->
    <div class="container mt-4 mb-5">
      <div class="row p-2 g-2 mb-1">
        <div
          class="row justify-content-center align-items-center g-2 mb-4"
          style="margin-left: 4px"
        >
          <div class="col-12 col-sm-5">
            <h5 class="text-left m-0 fw-bolder text-uppercase">profile</h5>
          </div>
          <div class="col-12 col-sm-5 text-end"></div>
        </div>
        <hr />
      </div>

      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-md-8">
          <!-- Profile Information -->
          <div class="profile-info">
            <div class="mb-3">
              <label class="form-label">Name:</label>
              <p>{{ profile.name }}</p>
            </div>

            <div class="mb-3">
              <label class="form-label">Email:</label>
              <p>{{ profile.email_id }}</p>
            </div>

            <div class="mb-3">
              <label class="form-label">Contact Number:</label>
              <p>{{ profile.contact_number }}</p>
            </div>

            <div class="mb-3">
              <label class="form-label">Alternate Contact Number:</label>
              <p>{{ profile.alternate_contact_number || 'Not provided' }}</p>
            </div>

            <div class="mb-3">
              <label class="form-label">Highest Qualification:</label>
              <p>{{ profile.highest_qualification || 'Not provided' }}</p>
            </div>

            <div class="mb-3">
              <label class="form-label">School:</label>
              <p>{{ profile.user_schools[0].school.name || 'Not assigned' }}</p>
            </div>

            <div class="d-flex justify-content-between">
              <button class="btn btn-primary" disabled title="Coming soon">Reset Password</button>
              <button class="btn btn-danger" @click="showLogoutModal">Logout</button>
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
.profile-info label {
  font-weight: bold;
}

.profile-info p {
  margin-bottom: 0.5rem;
}
</style>
