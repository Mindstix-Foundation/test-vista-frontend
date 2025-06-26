<template>
  <div class="container-fluid my-4">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-11">
        <!-- Page Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="fw-bold text-dark mb-1">
              <i class="bi bi-book-half me-2 text-primary"></i>
              Subject Enrollment
            </h2>
            <p class="text-muted mb-0">Manage your subject enrollments and requests</p>
          </div>
          <div class="d-flex gap-2">
            <button 
              class="btn btn-outline-primary"
              @click="refreshData"
              :disabled="loadingAvailable || loadingEnrollments"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>
        </div>

        <!-- Toggle Section -->
        <div class="row justify-content-center mb-4">
          <div class="col-12 col-sm-10 col-md-8">
            <div class="card shadow-sm">
              <div class="card-body p-3 p-md-4">
                <div class="row g-2 justify-content-center align-items-center mb-3">
                  <div class="col-12">
                    <h5 class="text-left fw-bolder text-uppercase m-0">
                      <i class="bi bi-list-ul me-2"></i>
                      Subject Management
                    </h5>
                  </div>
                </div>
                <hr class="mb-4" />
                
                <div class="row g-2">
                  <div class="col-6">
                    <div 
                      class="toggle-option"
                      :class="{ 'selected': currentView === 'available' }"
                      @click="currentView = 'available'"
                    >
                      <div class="fw-bold mb-1">Available to Enroll</div>
                      <div class="text-muted small">
                        {{ availableSubjects.length }} subject{{ availableSubjects.length !== 1 ? 's' : '' }}
                      </div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div 
                      class="toggle-option"
                      :class="{ 'selected': currentView === 'enrolled' }"
                      @click="currentView = 'enrolled'"
                    >
                      <div class="fw-bold mb-1">Already Enrolled</div>
                      <div class="text-muted small">
                        {{ myEnrollments.length }} request{{ myEnrollments.length !== 1 ? 's' : '' }}
                        <span v-if="pendingCount > 0" class="badge bg-warning text-dark ms-1">{{ pendingCount }} Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
                            </div>
            </div>
          </div>
        </div>

        <!-- Available Subjects View -->
        <div v-if="currentView === 'available'" class="available-subjects-container">
          <div v-if="loadingAvailable" class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted mb-0">Loading available subjects...</p>
              </div>
            </div>
          </div>

          <div v-else-if="availableSubjects.length === 0" class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="text-center py-4">
                <div class="alert alert-info" role="alert">
                  All subjects for your standard are either enrolled or requested.
                </div>
              </div>
            </div>
          </div>

          <div v-else class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="row g-3">
                <div 
                  v-for="subject in availableSubjects" 
                  :key="subject.id"
                  class="col-12"
                >
                  <div class="subject-option">
                    <div class="row mb-2">
                      <label class="col-12 col-lg-8 col-form-label fw-bold">{{ subject.name }}</label>
                    </div>
                    
                    <div class="teachers-list mt-3">
                      <div 
                        v-for="teacher in subject.teacher_subjects" 
                        :key="teacher.id"
                        class="teacher-option"
                      >
                        <div class="d-flex justify-content-between align-items-center">
                          <div class="fw-medium">{{ teacher.user.name }}</div>
                          <button 
                            class="btn btn-dark btn-sm"
                            @click="openEnrollmentModal(subject, teacher)"
                            :disabled="isRequesting"
                            data-bs-toggle="modal"
                            data-bs-target="#enrollmentModal"
                          >
                            <i class="bi bi-plus-circle me-1"></i>
                            Request
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Already Enrolled View -->
        <div v-if="currentView === 'enrolled'" class="enrolled-subjects-container">
          <div v-if="loadingEnrollments" class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted mb-0">Loading your enrollments...</p>
              </div>
            </div>
          </div>

          <div v-else-if="myEnrollments.length === 0" class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="text-center py-4">
                <div class="alert alert-info" role="alert">
                  You haven't made any enrollment requests yet.
                </div>
              </div>
            </div>
          </div>

          <div v-else class="row justify-content-center">
            <div class="col-12 col-sm-10 col-md-8">
              <div class="row g-3">
                <div 
                  v-for="enrollment in myEnrollments" 
                  :key="enrollment.id"
                  class="col-12 col-md-6"
                >
                  <div class="enrollment-card">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div class="fw-bold">{{ enrollment.teacher_subject.subject.name }}</div>
                      <span 
                        class="badge"
                        :class="getStatusBadgeClass(enrollment.status)"
                      >
                        {{ getStatusText(enrollment.status) }}
                      </span>
                    </div>
                    <div class="text-muted small mb-1">
                      <i class="bi bi-person me-1"></i>
                      {{ enrollment.teacher_subject.user.name }}
                    </div>
                    <div class="text-muted small mb-2">
                      <i class="bi bi-calendar me-1"></i>
                      {{ formatDate(enrollment.requested_at) }}
                    </div>
                    <div v-if="enrollment.teacher_response" class="mt-2">
                      <small class="text-muted">
                        <i class="bi bi-chat-dots me-1"></i>
                        {{ enrollment.teacher_response }}
                      </small>
                    </div>
                    <div v-if="enrollment.status === 'pending'" class="mt-3">
                      <button 
                        class="btn btn-outline-danger btn-sm"
                        @click="openCancelModal(enrollment)"
                      >
                        <i class="bi bi-x-circle me-1"></i>
                        Cancel Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Enrollment Request Modal -->
  <div class="modal fade" id="enrollmentModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-plus-circle me-2"></i>
            Request Subject Enrollment
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedSubject && selectedTeacher">
            <div class="row mb-3">
              <label class="col-4 col-form-label fw-bold">Subject:</label>
              <div class="col-8">
                <input
                  type="text"
                  class="form-control-plaintext"
                  :value="selectedSubject.name"
                  readonly
                />
              </div>
            </div>
            
            <div class="row mb-3">
              <label class="col-4 col-form-label fw-bold">Teacher:</label>
              <div class="col-8">
                <input
                  type="text"
                  class="form-control-plaintext"
                  :value="selectedTeacher.user.name"
                  readonly
                />
              </div>
            </div>

            <div class="row mb-3">
              <label class="col-4 col-form-label fw-bold">Academic Year:</label>
              <div class="col-8">
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="enrollmentForm.academic_year"
                  placeholder="e.g., 2024-2025"
                  required
                >
              </div>
            </div>

            <div class="mb-3">
              <label for="requestMessage" class="form-label fw-bold">Message (Optional):</label>
              <textarea 
                id="requestMessage"
                class="form-control" 
                rows="3"
                v-model="enrollmentForm.request_message"
                placeholder="Add a message for the teacher..."
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn btn-dark"
            @click="submitEnrollmentRequest"
            :disabled="isRequesting || !enrollmentForm.academic_year"
          >
            <span v-if="isRequesting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-send me-1"></i>
            {{ isRequesting ? 'Requesting...' : 'Send Request' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Cancel Enrollment Modal -->
  <div class="modal fade" id="cancelModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-exclamation-triangle me-2 text-warning"></i>
            Cancel Enrollment Request
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="enrollmentToCancel">
            <p>Are you sure you want to cancel your enrollment request for:</p>
            <div class="alert alert-light">
              <strong>{{ enrollmentToCancel.teacher_subject.subject.name }}</strong><br>
              <small class="text-muted">Teacher: {{ enrollmentToCancel.teacher_subject.user.name }}</small>
            </div>
            <p class="text-muted small mb-0">This action cannot be undone.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Keep Request
          </button>
          <button 
            type="button" 
            class="btn btn-danger"
            @click="confirmCancelEnrollment"
            :disabled="isCanceling"
          >
            <span v-if="isCanceling" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-x-circle me-1"></i>
            {{ isCanceling ? 'Canceling...' : 'Yes, Cancel Request' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification Component -->
  <ToastNotification />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'
import { Modal } from 'bootstrap'
import { useToastStore } from '@/stores/toast'
import ToastNotification from '@/components/common/ToastNotification.vue'

// Types
interface Teacher {
  id: number
  user: {
    id: number
    name: string
    email_id: string
  }
}

interface Subject {
  id: number
  name: string
  teacher_subjects: Teacher[]
}

interface Enrollment {
  id: number
  status: string
  request_message?: string
  teacher_response?: string
  academic_year: string
  requested_at: string
  responded_at?: string
  enrollment_date?: string
  teacher_subject: {
    id: number
    user: {
      id: number
      name: string
      email_id: string
    }
    subject: {
      id: number
      name: string
    }
  }
}

// Reactive data
const currentView = ref('available')
const availableSubjects = ref<Subject[]>([])
const myEnrollments = ref<Enrollment[]>([])
const loadingAvailable = ref(false)
const loadingEnrollments = ref(false)
const isRequesting = ref(false)
const isCanceling = ref(false)

const selectedSubject = ref<Subject | null>(null)
const selectedTeacher = ref<Teacher | null>(null)
const enrollmentToCancel = ref<any>(null)

const enrollmentForm = reactive({
  teacher_subject_id: 0,
  request_message: '',
  academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
})

// Toast store
const toastStore = useToastStore()

// Computed properties
const pendingCount = computed(() => {
  return myEnrollments.value.filter(e => e.status === 'pending').length
})

// Methods
const fetchAvailableSubjects = async () => {
  loadingAvailable.value = true
  try {
    const response = await axiosInstance.get('/student-subject-enrollments/student/available-subjects')
    availableSubjects.value = response.data
  } catch (error) {
    console.error('Error fetching available subjects:', error)
    showToast('Error', 'Failed to load available subjects', 'bi-exclamation-triangle text-danger')
    throw error // Re-throw to be caught by the calling function
  } finally {
    loadingAvailable.value = false
  }
}

const fetchMyEnrollments = async () => {
  loadingEnrollments.value = true
  try {
    const response = await axiosInstance.get('/student-subject-enrollments/student/my-enrollments')
    myEnrollments.value = response.data
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    showToast('Error', 'Failed to load enrollment requests', 'bi-exclamation-triangle text-danger')
    throw error // Re-throw to be caught by the calling function
  } finally {
    loadingEnrollments.value = false
  }
}

const openEnrollmentModal = (subject: Subject, teacher: Teacher) => {
  selectedSubject.value = subject
  selectedTeacher.value = teacher
  enrollmentForm.teacher_subject_id = teacher.id
  enrollmentForm.request_message = ''
  
  // Show modal using Bootstrap 5 approach
  const modalElement = document.getElementById('enrollmentModal')
  if (modalElement) {
    try {
      const modal = new (window as any).bootstrap.Modal(modalElement)
      modal.show()
    } catch (error) {
      console.error('Error opening modal:', error)
    }
  } else {
    console.error('Modal element not found')
  }
}

const submitEnrollmentRequest = async () => {
  enrollmentForm.teacher_subject_id = selectedTeacher.value?.id || 0
  
  if (!enrollmentForm.teacher_subject_id) {
    showToast('Validation Error', 'Please select a teacher', 'bi-exclamation-triangle text-warning')
    return
  }
  
  if (!enrollmentForm.academic_year) {
    showToast('Validation Error', 'Academic year is required', 'bi-exclamation-triangle text-warning')
    return
  }

  isRequesting.value = true
  
  // Always close modal regardless of success/failure
  const closeModal = () => {
    try {
      const modalElement = document.getElementById('enrollmentModal')
      
      if (modalElement) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement)
        
        if (modal) {
          modal.hide()
        } else {
          // Fallback: try to create new modal instance and hide
          const newModal = new (window as any).bootstrap.Modal(modalElement)
          newModal.hide()
        }
        
        // Additional cleanup to ensure backdrop is removed
        setTimeout(() => {
          const backdrops = document.querySelectorAll('.modal-backdrop')
          backdrops.forEach(backdrop => backdrop.remove())
          document.body.classList.remove('modal-open')
          document.body.style.removeProperty('overflow')
          document.body.style.removeProperty('padding-right')
        }, 150)
      }
    } catch (error) {
      console.error('Error closing modal:', error)
      // Fallback: manually remove modal backdrop and hide modal
      try {
        const modalElement = document.getElementById('enrollmentModal')
        if (modalElement) {
          modalElement.style.display = 'none'
          modalElement.classList.remove('show')
          modalElement.setAttribute('aria-hidden', 'true')
          modalElement.removeAttribute('aria-modal')
          modalElement.removeAttribute('role')
          
          document.body.classList.remove('modal-open')
          document.body.style.removeProperty('overflow')
          document.body.style.removeProperty('padding-right')
          
          // Remove all backdrops
          const backdrops = document.querySelectorAll('.modal-backdrop')
          backdrops.forEach(backdrop => backdrop.remove())
        }
      } catch (fallbackError) {
        console.error('Fallback modal close also failed:', fallbackError)
      }
    }
  }


  
  try {
    console.log('Submitting enrollment request:', enrollmentForm)
    const response = await axiosInstance.post('/student-subject-enrollments', enrollmentForm)
    console.log('Enrollment request response:', response.data)
    console.log('Response status:', response.status)
    
    // Check if response is actually successful
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`Unexpected response status: ${response.status}`)
    }
    
    // Show success toast immediately
    showToast('Success', 'Enrollment request submitted successfully!', 'bi-check-circle text-success')
    
    // Close modal on success (use setTimeout to ensure it happens)
    setTimeout(() => {
      closeModal()
    }, 100)
    
    // Switch to enrolled view
    currentView.value = 'enrolled'
    
    // Refresh data to get updated lists (do this after showing success)
    console.log('Refreshing data after successful enrollment...')
    setTimeout(async () => {
      try {
        await Promise.all([fetchAvailableSubjects(), fetchMyEnrollments()])
        console.log('Data refreshed successfully')
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError)
        // Show a warning toast but don't fail the main operation
        showToast('Warning', 'Please refresh the page to see updated data.', 'bi-exclamation-triangle text-warning')
      }
    }, 500) // Longer delay to ensure modal closes first
  } catch (error) {
    console.error('Error submitting enrollment request:', error)
    
    const axiosError = error as AxiosError
    console.error('Error details:', {
      message: axiosError.message,
      response: axiosError.response,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    })
    
    // Close modal on error too
    closeModal()
    
    const errorMessage = (axiosError.response?.data as any)?.message || 'Failed to submit enrollment request'
    showToast('Error', errorMessage, 'bi-exclamation-triangle text-danger')
  } finally {
    isRequesting.value = false
  }
}

const openCancelModal = (enrollment: any) => {
  enrollmentToCancel.value = enrollment
  
  const modalElement = document.getElementById('cancelModal')
  if (modalElement) {
    try {
      // Check if Bootstrap is available
      if ((window as any).bootstrap && (window as any).bootstrap.Modal) {
        let modal = (window as any).bootstrap.Modal.getInstance(modalElement)
        if (!modal) {
          modal = new (window as any).bootstrap.Modal(modalElement)
        }
        modal.show()
      } else {
        // Fallback: manually show modal
        console.log('Bootstrap not available, using manual modal')
        modalElement.classList.add('show')
        modalElement.style.display = 'block'
        modalElement.setAttribute('aria-modal', 'true')
        modalElement.removeAttribute('aria-hidden')
        document.body.classList.add('modal-open')
        
        // Add backdrop
        const backdrop = document.createElement('div')
        backdrop.className = 'modal-backdrop fade show'
        backdrop.id = 'manual-cancel-backdrop'
        document.body.appendChild(backdrop)
      }
    } catch (error) {
      console.error('Error opening cancel modal:', error)
      // Ultimate fallback: use browser confirm
      if (confirm(`Are you sure you want to cancel enrollment for ${enrollment.teacher_subject.subject.name}?`)) {
        confirmCancelEnrollment()
      }
    }
  }
}

const confirmCancelEnrollment = async () => {
  if (!enrollmentToCancel.value) return
  
  isCanceling.value = true
  try {
    const response = await axiosInstance.delete(`/student-subject-enrollments/${enrollmentToCancel.value.id}`)
    
    // Close modal with proper cleanup
    const modalElement = document.getElementById('cancelModal')
    if (modalElement) {
      if ((window as any).bootstrap && (window as any).bootstrap.Modal) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        }
      } else {
        // Manual close
        modalElement.classList.remove('show')
        modalElement.style.display = 'none'
        modalElement.setAttribute('aria-hidden', 'true')
        modalElement.removeAttribute('aria-modal')
        
        // Remove manual backdrop
        const manualBackdrop = document.getElementById('manual-cancel-backdrop')
        if (manualBackdrop) {
          manualBackdrop.remove()
        }
      }
      
      // Always do cleanup after a delay
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop')
        backdrops.forEach(backdrop => backdrop.remove())
        document.body.classList.remove('modal-open')
        document.body.style.removeProperty('overflow')
        document.body.style.removeProperty('padding-right')
      }, 300)
    }
    
    // Show success toast
    const successMessage = response.data?.message || 'Enrollment request cancelled successfully!'
    showToast('Success', successMessage, 'bi-check-circle text-success')
    
    // Refresh data
    await Promise.all([fetchAvailableSubjects(), fetchMyEnrollments()])
    
  } catch (error) {
    console.error('Error cancelling enrollment request:', error)
    
    // Close modal even on error
    const modalElement = document.getElementById('cancelModal')
    if (modalElement) {
      if ((window as any).bootstrap && (window as any).bootstrap.Modal) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement)
        if (modal) {
          modal.hide()
        }
      } else {
        // Manual close
        modalElement.classList.remove('show')
        modalElement.style.display = 'none'
        modalElement.setAttribute('aria-hidden', 'true')
        modalElement.removeAttribute('aria-modal')
        
        // Remove manual backdrop
        const manualBackdrop = document.getElementById('manual-cancel-backdrop')
        if (manualBackdrop) {
          manualBackdrop.remove()
        }
      }
      
      // Always do cleanup after a delay
      setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop')
        backdrops.forEach(backdrop => backdrop.remove())
        document.body.classList.remove('modal-open')
        document.body.style.removeProperty('overflow')
        document.body.style.removeProperty('padding-right')
      }, 300)
    }
    
    const axiosError = error as AxiosError
    const errorMessage = (axiosError.response?.data as any)?.message || 'Failed to cancel enrollment request'
    showToast('Error', errorMessage, 'bi-exclamation-triangle text-danger')
  } finally {
    isCanceling.value = false
    enrollmentToCancel.value = null
  }
}



const cancelEnrollmentRequest = async (enrollmentId: number) => {
  if (!confirm('Are you sure you want to cancel this enrollment request?')) {
    return
  }
  
  try {
    await axiosInstance.delete(`/student-subject-enrollments/${enrollmentId}`)
    
    // Refresh data
    await Promise.all([fetchAvailableSubjects(), fetchMyEnrollments()])
    
    showToast('Success', 'Enrollment request cancelled successfully!', 'bi-check-circle text-success')
  } catch (error) {
    console.error('Error cancelling enrollment request:', error)
    const axiosError = error as AxiosError
    const errorMessage = (axiosError.response?.data as any)?.message || 'Failed to cancel enrollment request'
    showToast('Error', errorMessage, 'bi-exclamation-triangle text-danger')
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-warning text-dark'
    case 'approved': return 'bg-success'
    case 'rejected': return 'bg-danger'
    case 'active': return 'bg-primary'
    case 'inactive': return 'bg-secondary'
    case 'completed': return 'bg-info'
    default: return 'bg-secondary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending'
    case 'approved': return 'Approved'
    case 'rejected': return 'Rejected'
    case 'active': return 'Active'
    case 'inactive': return 'Inactive'
    case 'completed': return 'Completed'
    default: return status
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const showToast = (title: string, message: string, icon: string) => {
  try {
    const type = icon.includes('success') ? 'success' : 
                 icon.includes('danger') ? 'error' : 
                 icon.includes('warning') ? 'warning' : 'info'
    
    toastStore.showToast({ title, message, type })
  } catch (error) {
    console.error('Error showing toast:', error)
    // Fallback to browser alert
    alert(`${title}: ${message}`)
  }
}

const refreshData = async () => {
  await Promise.all([fetchAvailableSubjects(), fetchMyEnrollments()])
}

// Lifecycle
onMounted(() => {
  fetchAvailableSubjects()
  fetchMyEnrollments()
})
</script>

<style scoped>
.subject-option {
  position: relative;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subject-option:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.subject-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.teachers-list {
  padding-left: 1rem;
  border-left: 3px solid #e9ecef;
}

.teacher-option {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  transition: none;
}

.teacher-option:hover {
  border-color: #e9ecef;
  box-shadow: none;
}

.teacher-option:last-child {
  margin-bottom: 0;
}

.toggle-option {
  position: relative;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.toggle-option:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.toggle-option.selected {
  background-color: #f8f9fa;
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.toggle-option.selected .text-muted {
  color: #6c757d !important;
}

.enrollment-card {
  position: relative;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  background-color: #ffffff;
  transition: all 0.2s ease;
}

.enrollment-card:hover {
  background-color: #ffffff;
  border-color: #000000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}



.badge.bg-warning {
  background-color: #ffc107 !important;
}

.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}

.badge.bg-secondary {
  background-color: #6c757d !important;
}

.btn-dark {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:hover {
  background-color: #23272b;
  border-color: #1d2124;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-outline-primary {
  color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary:hover {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.text-primary {
  color: #007bff !important;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .subject-stat {
    margin-bottom: 1rem;
  }
  
  .d-flex.justify-content-lg-end {
    justify-content: flex-start !important;
  }
  
  .teacher-option .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 0.5rem;
  }
  
  .teacher-option .btn {
    align-self: flex-start;
  }
}

/* Toast styling */
.toast-container {
  z-index: 1060;
}
</style> 