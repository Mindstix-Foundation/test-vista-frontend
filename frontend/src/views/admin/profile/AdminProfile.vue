<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">My Profile</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Profile Card -->
    <div class="row gy-2 g-3 justify-content-center p-3">
      <div class="col-12 col-sm-10 col-md-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <form>
              <!-- Name -->
              <div class="row mb-2">
                <label for="name" class="col-12 col-sm-3 col-form-label fw-bolder">Name</label>
                <div class="col-12 col-sm-9">
                  <input
                    type="text"
                    class="form-control-plaintext"
                    id="name"
                    :value="profileData.name"
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
                    :value="profileData.schoolName"
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
                        :value="profileData.contactNumber"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-12 col-lg-6">
                  <div class="row">
                    <label
                      for="alternateContactNumber"
                      class="col-12 col-lg-6 col-form-label fw-bold"
                      >Alternate Number:</label
                    >
                    <div class="col-12 col-lg-6">
                      <input
                        type="text"
                        readonly
                        class="form-control-plaintext"
                        id="alternateContactNumber"
                        :value="profileData.alternateNumber"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="row mb-2">
                <label for="emailId" class="col-12 col-lg-3 col-form-label fw-bold"
                  >Email Id:</label
                >
                <div class="col-12 col-lg-9">
                  <input
                    type="text"
                    readonly
                    class="form-control-plaintext"
                    id="emailId"
                    :value="profileData.email"
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
                    :value="profileData.qualification"
                  />
                </div>
              </div>
            </form>
          </div>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock profile data - replace with actual API call
const profileData = ref({
  name: 'Admin Mindstix Foundation',
  schoolName: 'PQR School',
  contactNumber: '9874563211',
  alternateNumber: '1234567899',
  email: 'admin@gmail.com',
  qualification: 'M.Sc. B.Ed.',
})

const handleResetPassword = () => {
  router.push({ name: 'forgotPassword' })
}

const handleLogout = () => {
  // Here you would typically clear the auth token/session
  router.push({ name: 'login' })
}
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
