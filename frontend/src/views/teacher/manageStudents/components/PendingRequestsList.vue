<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading pending requests...</p>
    </div>

    <div v-else-if="requests.length === 0" class="text-center py-5">
      <i class="bi bi-check-circle display-4 text-success mb-3"></i>
      <h5 class="text-muted">No Pending Requests</h5>
      <p class="text-muted mb-0">All enrollment requests have been processed.</p>
    </div>

    <div v-else>
      <!-- Pending Requests List -->
      <div class="row g-3">
        <div 
          v-for="request in requests" 
          :key="request.id"
          class="col-12"
        >
          <div class="card border-warning border-opacity-25 hover-card">
            <div class="card-body">
              <div class="row align-items-center">
                <!-- Student Info -->
                <div class="col-md-4">
                  <div class="d-flex align-items-center">
                    <div class="avatar-circle bg-warning bg-opacity-25 text-warning me-3">
                      <i class="bi bi-person-fill"></i>
                    </div>
                    <div>
                      <h6 class="mb-1 fw-bold">{{ request.student.user.name }}</h6>
                      <small class="text-muted">{{ request.student.user.email_id }}</small>
                      <div class="mt-1">
                        <span class="badge bg-warning text-dark">
                          <i class="bi bi-clock me-1"></i>
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Subject & Request Info -->
                <div class="col-md-5">
                  <div class="mb-2">
                    <strong class="text-primary">{{ request.teacher_subject.subject.name }}</strong>
                    <small class="text-muted d-block">{{ request.academic_year }}</small>
                  </div>
                  
                  <div v-if="request.request_message" class="mb-2">
                    <small class="text-muted d-block">Student Message:</small>
                    <p class="mb-0 text-sm bg-light p-2 rounded border-start border-primary border-3">
                      {{ request.request_message }}
                    </p>
                  </div>
                  
                  <small class="text-muted">
                    <i class="bi bi-calendar me-1"></i>
                    Requested: {{ formatDate(request.requested_at) }}
                  </small>
                </div>

                <!-- Actions -->
                <div class="col-md-3 text-end">
                  <div class="d-flex flex-column gap-2">
                    <button 
                      class="btn btn-success btn-sm"
                      @click="handleApproval(request, 'approved')"
                      :disabled="processingRequestId === request.id"
                    >
                      <i class="bi bi-check-lg me-1"></i>
                      Approve
                    </button>
                    <button 
                      class="btn btn-danger btn-sm"
                      @click="openRejectModal(request)"
                      :disabled="processingRequestId === request.id"
                    >
                      <i class="bi bi-x-lg me-1"></i>
                      Reject
                    </button>
                    <button 
                      class="btn btn-outline-primary btn-sm"
                      @click="openResponseModal(request)"
                      :disabled="processingRequestId === request.id"
                    >
                      <i class="bi bi-chat-dots me-1"></i>
                      Respond
                    </button>
                  </div>
                </div>
              </div>

              <!-- Processing indicator -->
              <div v-if="processingRequestId === request.id" class="mt-3">
                <div class="d-flex align-items-center text-muted">
                  <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                  Processing request...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Response Modal -->
  <div 
    class="modal fade" 
    id="responseModal" 
    tabindex="-1" 
    aria-labelledby="responseModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="responseModalLabel">
            <i class="bi bi-chat-dots me-2"></i>
            Respond to Enrollment Request
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRequest" class="mb-4">
            <div class="card bg-light">
              <div class="card-body">
                <h6 class="card-title">Student: {{ selectedRequest.student.user.name }}</h6>
                <p class="card-text">
                  <strong>Subject:</strong> {{ selectedRequest.teacher_subject.subject.name }}<br>
                  <strong>Academic Year:</strong> {{ selectedRequest.academic_year }}
                </p>
                <div v-if="selectedRequest.request_message">
                  <strong>Student Message:</strong>
                  <p class="mt-1 p-2 bg-white rounded border-start border-primary border-3">
                    {{ selectedRequest.request_message }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Action</label>
            <div class="btn-group w-100" role="group">
              <input 
                type="radio" 
                class="btn-check" 
                name="responseAction" 
                id="approve" 
                value="approved"
                v-model="responseForm.status"
              >
              <label class="btn btn-outline-success" for="approve">
                <i class="bi bi-check-lg me-1"></i>
                Approve
              </label>

              <input 
                type="radio" 
                class="btn-check" 
                name="responseAction" 
                id="reject" 
                value="rejected"
                v-model="responseForm.status"
              >
              <label class="btn btn-outline-danger" for="reject">
                <i class="bi bi-x-lg me-1"></i>
                Reject
              </label>
            </div>
          </div>

          <div class="mb-3">
            <label for="responseMessage" class="form-label fw-bold">
              Response Message 
              <span v-if="responseForm.status === 'rejected'" class="text-danger">*</span>
            </label>
            <textarea 
              class="form-control" 
              id="responseMessage" 
              rows="4"
              v-model="responseForm.teacher_response"
              :placeholder="responseForm.status === 'approved' ? 
                'Optional message for the student...' : 
                'Please provide a reason for rejection...'"
              :required="responseForm.status === 'rejected'"
            ></textarea>
            <div v-if="responseForm.status === 'rejected'" class="form-text text-danger">
              A response message is required when rejecting a request.
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button 
            type="button" 
            class="btn"
            :class="responseForm.status === 'approved' ? 'btn-success' : 'btn-danger'"
            @click="submitResponse"
            :disabled="!canSubmitResponse"
          >
            <i class="bi" :class="responseForm.status === 'approved' ? 'bi-check-lg' : 'bi-x-lg'"></i>
            {{ responseForm.status === 'approved' ? 'Approve' : 'Reject' }} Request
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Reject Modal -->
  <div 
    class="modal fade" 
    id="rejectModal" 
    tabindex="-1" 
    aria-labelledby="rejectModalLabel" 
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="rejectModalLabel">
            <i class="bi bi-x-circle me-2"></i>
            Reject Enrollment Request
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRequest">
            <p><strong>Student:</strong> {{ selectedRequest.student.user.name }}</p>
            <p><strong>Subject:</strong> {{ selectedRequest.teacher_subject.subject.name }}</p>
            
            <div class="mb-3">
              <label for="rejectReason" class="form-label fw-bold text-danger">
                Reason for Rejection *
              </label>
              <textarea 
                class="form-control" 
                id="rejectReason" 
                rows="3"
                v-model="rejectReason"
                placeholder="Please provide a clear reason for rejecting this request..."
                required
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
            class="btn btn-danger"
            @click="submitQuickReject"
            :disabled="!rejectReason.trim()"
          >
            <i class="bi bi-x-lg me-1"></i>
            Reject Request
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import axiosInstance from '@/config/axios'

// Props
interface EnrollmentRequest {
  id: number
  status: string
  request_message?: string
  teacher_response?: string
  academic_year: string
  requested_at: string
  student: {
    id: number
    user: {
      id: number
      name: string
      email_id: string
    }
  }
  teacher_subject: {
    id: number
    subject: {
      id: number
      name: string
    }
  }
}

const props = defineProps<{
  requests: EnrollmentRequest[]
  loading: boolean
}>()

// Emits
const emit = defineEmits<{
  'request-updated': []
}>()

// Reactive data
const processingRequestId = ref<number | null>(null)
const selectedRequest = ref<EnrollmentRequest | null>(null)
const rejectReason = ref('')

const responseForm = reactive({
  status: 'approved',
  teacher_response: ''
})

// Computed
const canSubmitResponse = computed(() => {
  if (responseForm.status === 'rejected') {
    return responseForm.teacher_response.trim().length > 0
  }
  return true
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleApproval = async (request: EnrollmentRequest, status: string) => {
  processingRequestId.value = request.id
  
  try {
    await axiosInstance.put(`/student-subject-enrollments/${request.id}/status`, {
      status,
      teacher_response: 'Request approved'
    })
    
    emit('request-updated')
  } catch (error) {
    console.error('Error updating request:', error)
  } finally {
    processingRequestId.value = null
  }
}

const openResponseModal = (request: EnrollmentRequest) => {
  selectedRequest.value = request
  responseForm.status = 'approved'
  responseForm.teacher_response = ''
  
  const modal = new (window as any).bootstrap.Modal(document.getElementById('responseModal'))
  modal.show()
}

const openRejectModal = (request: EnrollmentRequest) => {
  selectedRequest.value = request
  rejectReason.value = ''
  
  const modal = new (window as any).bootstrap.Modal(document.getElementById('rejectModal'))
  modal.show()
}

const submitResponse = async () => {
  if (!selectedRequest.value || !canSubmitResponse.value) return
  
  processingRequestId.value = selectedRequest.value.id
  
  try {
    await axiosInstance.put(`/student-subject-enrollments/${selectedRequest.value.id}/status`, {
      status: responseForm.status,
      teacher_response: responseForm.teacher_response || undefined
    })
    
    // Hide modal
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('responseModal'))
    modal.hide()
    
    emit('request-updated')
  } catch (error) {
    console.error('Error updating request:', error)
  } finally {
    processingRequestId.value = null
  }
}

const submitQuickReject = async () => {
  if (!selectedRequest.value || !rejectReason.value.trim()) return
  
  processingRequestId.value = selectedRequest.value.id
  
  try {
    await axiosInstance.put(`/student-subject-enrollments/${selectedRequest.value.id}/status`, {
      status: 'rejected',
      teacher_response: rejectReason.value
    })
    
    // Hide modal
    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('rejectModal'))
    modal.hide()
    
    emit('request-updated')
  } catch (error) {
    console.error('Error updating request:', error)
  } finally {
    processingRequestId.value = null
  }
}
</script>

<style scoped>
.hover-card {
  transition: all 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.text-sm {
  font-size: 0.875rem;
}

.border-3 {
  border-width: 3px !important;
}

.btn-sm {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

.modal-header.bg-danger {
  border-bottom: 1px solid rgba(255,255,255,0.2);
}
</style> 