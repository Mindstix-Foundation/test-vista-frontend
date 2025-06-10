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
          Failed to load profile data. Please try again later.
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
                    :value="profile.schools && profile.schools.length > 0 ? profile.schools[0].name : 'Not assigned'"
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

            <!-- Teaching Subjects - Full Width -->
            <div class="row mt-3" v-if="profile.teaching_subjects && profile.teaching_subjects.length > 0">
              <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold mb-0">Teaching Subjects</h6>
                  <a 
                    href="#" 
                    class="toggle-link d-flex align-items-center"
                    @click.prevent="toggleSubjects"
                    :class="{ 'expanded': isSubjectsExpanded }"
                    aria-controls="teachingSubjectsCollapse">
                    <span class="toggle-text">{{ isSubjectsExpanded ? 'Hide' : 'Show' }}</span>
                    <span class="toggle-icon-container">
                      <i class="bi bi-chevron-down toggle-icon"></i>
                    </span>
                  </a>
                </div>
                <div 
                  class="collapse border-top pt-3 " 
                  id="teachingSubjectsCollapse"
                  ref="subjectsCollapseRef">
                  <div id="classSubjectList">
                    <ul class="list-group">
                      <li
                        v-for="(standardGroup, standardName) in groupedSubjects"
                        :key="standardName"
                        class="mb-2"
                      >
                        <div class="list-group-item">
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-bold">Standard {{ standardName }}</span>
                          </div>
                          <div class="ps-3 d-flex flex-wrap gap-2">
                            <span
                              v-for="subject in standardGroup"
                              :key="subject.id"
                              class="subject-badge"
                            >
                              <i class="bi bi-book me-1"></i>
                              {{ subject.subject.name }}
                            </span>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-dark"
                    style="border: 1px solid #dee2e6;"
                    @click="goToChangePassword"
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { Modal, Collapse } from 'bootstrap'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'

const authStore = useAuthStore()
const router = useRouter()

// Define profile interface based on API response
interface TeachingSubject {
  id: number
  standard: {
    id: number
    name: string
    sequence_number: number
  }
  subject: {
    id: number
    name: string
  }
  medium: {
    id: number
    name: string
  }
}

interface School {
  id: number
  name: string
}

interface Role {
  id: number
  name: string
}

interface Profile {
  id: number
  name: string
  email_id: string
  contact_number: string
  alternate_contact_number?: string
  highest_qualification?: string
  status: boolean
  created_at: string
  updated_at: string
  roles: Role[]
  schools: School[]
  teaching_subjects: TeachingSubject[]
}

// State variables
const profile = ref<Profile>({} as Profile)
const loading = ref(true)
const error = ref(false)
const logoutModal = ref<Modal | null>(null)
const subjectsCollapseRef = ref<HTMLElement | null>(null)
const subjectsCollapse = ref<Collapse | null>(null)
const isSubjectsExpanded = ref(false)

// Computed property to group subjects by standard
const groupedSubjects = computed(() => {
  const grouped: Record<string, TeachingSubject[]> = {};
  
  if (profile.value?.teaching_subjects) {
    profile.value.teaching_subjects.forEach(subject => {
      const standardName = subject.standard.name;
      if (!grouped[standardName]) {
        grouped[standardName] = [];
      }
      grouped[standardName].push(subject);
    });
  }
  
  return grouped;
});

// Fetch profile data from API
const fetchProfileData = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response = await axiosInstance.get('/auth/profile')
    if (response.data && response.data.statusCode === 200) {
      profile.value = response.data.data
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Error fetching profile data:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

/**
 * Toggle the visibility of teaching subjects section
 */
const toggleSubjects = () => {
  if (subjectsCollapse.value) {
    // Toggle the collapse state
    if (isSubjectsExpanded.value) {
      subjectsCollapse.value.hide()
    } else {
      subjectsCollapse.value.show()
    }
    
    // Update the expanded state (with slight delay to ensure Bootstrap's animation completes)
    setTimeout(() => {
      isSubjectsExpanded.value = !isSubjectsExpanded.value
    }, 50)
  }
}

/**
 * Show the logout confirmation modal
 */
const showLogoutModal = () => {
  logoutModal.value?.show()
}

/**
 * Navigate to the change password page
 */
const goToChangePassword = () => {
  router.push({ name: 'changePassword' })
}

/**
 * Handle user logout
 */
const logout = async () => {
  try {
    logoutModal.value?.hide()
    await authStore.logout()
  } catch (error) {
    console.error('Error during logout:', error)
    // Even if logout fails, redirect to login
    await router.push('/login')
  }
}

// Initialize modal and fetch profile data on mount
onMounted(async () => {
  // Initialize the logout modal
  const modalElement = document.getElementById('logoutModal')
  if (modalElement) {
    logoutModal.value = new Modal(modalElement)
  }
  
  // Fetch profile data from API
  await fetchProfileData()
  
  // Initialize the subjects collapse after the DOM is updated
  await nextTick(() => {
    if (subjectsCollapseRef.value) {
      subjectsCollapse.value = new Collapse(subjectsCollapseRef.value, {
        toggle: false
      })
      
      // Set up event listeners for the collapse component
      subjectsCollapseRef.value.addEventListener('shown.bs.collapse', () => {
        isSubjectsExpanded.value = true
      })
      
      subjectsCollapseRef.value.addEventListener('hidden.bs.collapse', () => {
        isSubjectsExpanded.value = false
      })
    }
  })
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

.subject-separator {
  display: inline-block;
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

/* Custom styling for teaching subjects */
.subject-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  color: #495057;
  transition: all 0.2s ease-in-out;
  cursor: default;
}

.subject-badge:hover {
  background-color: #e9ecef;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.subject-badge i {
  color: #6c757d;
}

/* Custom styling for teaching subjects list */
#classSubjectList .list-group {
  --bs-list-group-color: var(--bs-body-color);
  --bs-list-group-bg: var(--bs-body-bg);
  --bs-list-group-border-color: var(--bs-border-color);
  --bs-list-group-border-width: var(--bs-border-width);
  --bs-list-group-border-radius: var(--bs-border-radius);
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
}

#classSubjectList ul {
  list-style: none;
  padding-left: 0;
}

#classSubjectList li {
  list-style: none;
}

#classSubjectList .list-group-item {
  position: relative;
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  background-color: var(--bs-list-group-bg);
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

#classSubjectList .list-group-item:hover {
  background-color: #f8f9fa;
}

/* Make sure teaching subjects section is responsive */
@media (max-width: 576px) {
  .subject-badge {
    padding: 0.25rem 0.5rem;
    margin-bottom: 0.25rem;
  }
  
  #classSubjectList .list-group-item {
    padding: 0.5rem 0.75rem;
  }
  
  #classSubjectList .ps-3 {
    padding-left: 0.5rem !important;
  }
}

@media (min-width: 576px) and (max-width: 991.98px) {
  #classSubjectList .ps-3 {
    padding-left: 1rem !important;
  }
}

/* Toggle link styling */
.toggle-link {
  color: #6c757d;
  text-decoration: none;
  font-size: 0.8125rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease;
  min-width: 85px;
  display: inline-flex;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

.toggle-link:hover {
  color: #495057;
}

.toggle-link:active, .toggle-link:focus {
  color: #495057;
  background-color: transparent;
  outline: none;
}

.toggle-text {
  margin-right: 6px;
  width: 38px; /* Wider fixed width to prevent wrapping */
  text-align: right;
  white-space: nowrap;
  display: inline-block; /* Ensures the text stays on one line */
}

.toggle-icon-container {
  display: inline-flex;
  width: 16px;
  justify-content: center;
  align-items: center;
}

.toggle-icon {
  transition: transform 0.3s ease;
  font-size: 0.8125rem;
}

.toggle-link.expanded .toggle-icon {
  transform: rotate(180deg);
}

/* Responsive adjustments for the toggle link */
@media (max-width: 576px) {
  .toggle-link {
    font-size: 0.75rem;
    min-width: 80px;
    padding: 0.3rem 0.5rem;
  }
  
  .toggle-text {
    width: 34px;
  }
  
  .toggle-icon {
    font-size: 0.75rem;
  }
}

/* Remove old button styling */
.btn-outline-secondary {
  border-color: #dee2e6;
  color: #6c757d;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa;
  color: #495057;
}

/* Responsive adjustments for the collapse button */
@media (max-width: 576px) {
  .btn-sm {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
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
