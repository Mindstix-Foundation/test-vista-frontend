<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading enrolled students...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="students.length === 0" class="text-center py-5">
      <i class="bi bi-people display-1 text-muted mb-3"></i>
      <h5 class="text-muted">No Enrolled Students</h5>
      <p class="text-muted">No students are currently enrolled in your subjects.</p>
    </div>

    <!-- Students List -->
    <div v-else>
      <!-- Search and Filters -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search by student name or email..."
              v-model="searchQuery"
            >
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="statusFilter">
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="subjectFilter">
            <option value="">All Subjects</option>
            <option v-for="subject in uniqueSubjects" :key="subject" :value="subject">
              {{ subject }}
            </option>
          </select>
        </div>
      </div>

      <!-- Students Grid -->
      <div class="row g-3">
        <div 
          v-for="student in filteredStudents" 
          :key="student.id"
          class="col-12 col-lg-6"
        >
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex align-items-start justify-content-between">
                <div class="flex-grow-1">
                  <!-- Student Info -->
                  <div class="d-flex align-items-center mb-2">
                    <div 
                      class="avatar-circle bg-primary text-white me-3"
                      :title="student.student.user.name"
                    >
                      {{ getInitials(student.student.user.name) }}
                    </div>
                    <div>
                      <h6 class="mb-0 fw-bold">{{ student.student.user.name }}</h6>
                      <small class="text-muted">{{ student.student.user.email_id }}</small>
                    </div>
                  </div>

                  <!-- Enrollment Details -->
                  <div class="mb-2">
                    <span class="badge bg-info me-2">
                      {{ student.teacher_subject.subject.name }}
                    </span>
                    <span 
                      class="badge"
                      :class="getStatusBadgeClass(student.status)"
                    >
                      {{ getStatusText(student.status) }}
                    </span>
                  </div>

                  <div class="small text-muted">
                    <div class="mb-1">
                      <i class="bi bi-calendar-event me-1"></i>
                      Enrolled: {{ formatDate(student.enrollment_date || student.requested_at) }}
                    </div>
                    <div class="mb-1">
                      <i class="bi bi-calendar3 me-1"></i>
                      Academic Year: {{ student.academic_year }}
                    </div>
                    <div v-if="student.teacher_response" class="mb-1">
                      <i class="bi bi-chat-dots me-1"></i>
                      Response: {{ student.teacher_response }}
                    </div>
                  </div>
                </div>

                <!-- Actions Dropdown -->
                <div class="dropdown">
                  <button 
                    class="btn btn-outline-secondary btn-sm dropdown-toggle"
                    type="button"
                    :id="`dropdownMenuButton${student.id}`"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    :disabled="processingStudentId === student.id"
                  >
                    <span v-if="processingStudentId === student.id" class="spinner-border spinner-border-sm me-1"></span>
                    <i v-else class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu" :aria-labelledby="`dropdownMenuButton${student.id}`">
                    <li>
                      <button 
                        class="dropdown-item"
                        @click="activateStudent(student)"
                        v-if="student.status === 'approved'"
                      >
                        <i class="bi bi-check-circle text-success me-2"></i>
                        Activate Enrollment
                      </button>
                    </li>
                    <li>
                      <button 
                        class="dropdown-item"
                        @click="deactivateStudent(student)"
                        v-if="student.status === 'active'"
                      >
                        <i class="bi bi-pause-circle text-warning me-2"></i>
                        Deactivate
                      </button>
                    </li>
                    <li>
                      <button 
                        class="dropdown-item"
                        @click="completeEnrollment(student)"
                        v-if="student.status === 'active'"
                      >
                        <i class="bi bi-check2-all text-info me-2"></i>
                        Mark Completed
                      </button>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <button 
                        class="dropdown-item text-danger"
                        @click="openRemoveModal(student)"
                      >
                        <i class="bi bi-trash text-danger me-2"></i>
                        Remove Student
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <nav v-if="totalPages > 1" aria-label="Students pagination" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
              Previous
            </button>
          </li>
          <li 
            v-for="page in visiblePages" 
            :key="page" 
            class="page-item" 
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="changePage(page)">{{ page }}</button>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Remove Student Confirmation Modal -->
    <div class="modal fade" id="removeStudentModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Remove Student
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedStudent">
              <p class="mb-3">
                Are you sure you want to remove <strong>{{ selectedStudent.student.user.name }}</strong> 
                from <strong>{{ selectedStudent.teacher_subject.subject.name }}</strong>?
              </p>
              
              <div class="alert alert-warning">
                <i class="bi bi-info-circle me-2"></i>
                This action will set their enrollment status to "inactive" and they will no longer have access to this subject.
              </div>

              <div class="mb-3">
                <label for="removalReason" class="form-label fw-bold">
                  Reason for Removal (Optional):
                </label>
                <textarea 
                  class="form-control" 
                  id="removalReason" 
                  rows="3"
                  v-model="removalReason"
                  placeholder="Provide a reason for removing this student..."
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
              @click="confirmRemoveStudent"
              :disabled="processingStudentId !== null"
            >
              <span v-if="processingStudentId" class="spinner-border spinner-border-sm me-2"></span>
              Remove Student
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import axiosInstance from '@/config/axios'

// Props
interface EnrollmentRequest {
  id: number
  status: string
  request_message?: string
  teacher_response?: string
  academic_year: string
  requested_at: string
  responded_at?: string
  enrollment_date?: string
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
  students: EnrollmentRequest[]
  loading: boolean
}>()

// Emits
const emit = defineEmits<{
  'student-updated': []
}>()

// Reactive data
const searchQuery = ref('')
const statusFilter = ref('')
const subjectFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 8
const processingStudentId = ref<number | null>(null)
const selectedStudent = ref<EnrollmentRequest | null>(null)
const removalReason = ref('')

// Computed properties
const uniqueSubjects = computed(() => {
  const subjects = [...new Set(props.students.map(s => s.teacher_subject.subject.name))]
  return subjects.sort()
})

const filteredStudents = computed(() => {
  let filtered = props.students

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student => 
      student.student.user.name.toLowerCase().includes(query) ||
      student.student.user.email_id.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(student => student.status === statusFilter.value)
  }

  // Subject filter
  if (subjectFilter.value) {
    filtered = filtered.filter(student => student.teacher_subject.subject.name === subjectFilter.value)
  }

  // Pagination
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filtered.slice(start, end)
})

const totalPages = computed(() => {
  let filtered = props.students

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(student => 
      student.student.user.name.toLowerCase().includes(query) ||
      student.student.user.email_id.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(student => student.status === statusFilter.value)
  }

  if (subjectFilter.value) {
    filtered = filtered.filter(student => student.teacher_subject.subject.name === subjectFilter.value)
  }

  return Math.ceil(filtered.length / itemsPerPage)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, 5)
    } else {
      start = Math.max(1, total - 4)
    }
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const getInitials = (name: string) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-success'
    case 'active': return 'bg-primary'
    case 'inactive': return 'bg-secondary'
    case 'completed': return 'bg-info'
    default: return 'bg-secondary'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return 'Approved'
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

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const updateStudentStatus = async (student: EnrollmentRequest, status: string, response: string) => {
  processingStudentId.value = student.id
  
  try {
    await axiosInstance.put(`/student-subject-enrollments/${student.id}/status`, {
      status,
      teacher_response: response
    })
    
    emit('student-updated')
  } catch (error) {
    console.error('Error updating student status:', error)
  } finally {
    processingStudentId.value = null
  }
}

const activateStudent = async (student: EnrollmentRequest) => {
  await updateStudentStatus(student, 'active', 'Enrollment activated by teacher')
}

const deactivateStudent = async (student: EnrollmentRequest) => {
  await updateStudentStatus(student, 'inactive', 'Enrollment deactivated by teacher')
}

const completeEnrollment = async (student: EnrollmentRequest) => {
  await updateStudentStatus(student, 'completed', 'Enrollment completed successfully')
}

const openRemoveModal = (student: EnrollmentRequest) => {
  selectedStudent.value = student
  removalReason.value = ''
  const modal = new (window as any).bootstrap.Modal(document.getElementById('removeStudentModal'))
  modal.show()
}

const confirmRemoveStudent = async () => {
  if (!selectedStudent.value) return
  
  const response = removalReason.value || 'Student removed by teacher'
  await updateStudentStatus(selectedStudent.value, 'inactive', response)
  
  const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('removeStudentModal'))
  modal.hide()
}

// Watchers
watch([searchQuery, statusFilter, subjectFilter], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.avatar-circle {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}

.dropdown-toggle::after {
  display: none;
}

.page-link {
  color: #0d6efd;
  border: 1px solid #dee2e6;
}

.page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.page-link:hover {
  color: #0a58ca;
  background-color: #e9ecef;
  border-color: #dee2e6;
}
</style> 