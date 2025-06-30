<template>
  <!-- Navbar -->
  <LoginNavBar />

  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <button class="btn btn-close" @click="goToMainLogin" aria-label="Close"></button>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Student Login</h4>
          <p class="text-muted">Enter all your details to login</p>
        </div>
      </div>
      <hr>
    </div>
    
    <div id="form-container" class="row mt-4 justify-content-center">
      <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
        <div class="row g-3 justify-content-center">
          
          <!-- Full Name -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="form-floating">
              <input
                ref="nameInput"
                type="text"
                class="form-control"
                :class="{
                  'is-invalid': !validationStates.name.valid && validationStates.name.touched,
                  'is-valid': validationStates.name.valid && validationStates.name.touched,
                }"
                id="studentName"
                v-model="formData.name"
                placeholder="Enter Full Name"
                @input="handleNameInput"
                @keydown="handleKeyDown($event, 'rollNo')"
                required
              />
              <label for="studentName" class="form-label">Full Name <span class="text-danger">*</span></label>
              <div
                class="invalid-feedback"
                v-if="!validationStates.name.valid && validationStates.name.touched"
              >
                Please enter a valid full name (at least 2 characters)
              </div>
            </div>
          </div>

          <!-- Roll Number -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="form-floating">
              <input
                ref="rollNoInput"
                type="text"
                class="form-control"
                :class="{
                  'is-invalid': !validationStates.rollNo.valid && validationStates.rollNo.touched,
                  'is-valid': validationStates.rollNo.valid && validationStates.rollNo.touched,
                }"
                id="rollNo"
                v-model="formData.rollNo"
                placeholder="Enter Roll Number"
                @input="handleRollNoInput"
                @keydown="handleKeyDown($event, 'board')"
                required
              />
              <label for="rollNo" class="form-label">Roll Number <span class="text-danger">*</span></label>
              <div
                class="invalid-feedback"
                v-if="!validationStates.rollNo.valid && validationStates.rollNo.touched"
              >
                Please enter your roll number (uppercase letters and numbers only)
              </div>
            </div>
          </div>

          <!-- Board Selection -->
          <div class="col col-12 col-sm-10 col-md-8">
            <SearchableDropdown
              id="board"
              label="Board"
              required
              placeholder="Select Board"
              :items="boards"
              :model-value="selectedBoard"
              :class="{
                'is-invalid': !validationStates.boardId.valid && validationStates.boardId.touched,
                'is-valid': validationStates.boardId.valid && validationStates.boardId.touched,
              }"
              next-field-id="college"
              @update:model-value="handleBoardChange"
              @change="handleBoardChange"
            >
              <template #item="{ item }">
                {{ item.name }}
              </template>
            </SearchableDropdown>
            <div
              class="invalid-feedback"
              v-show="!validationStates.boardId.valid && validationStates.boardId.touched"
            >
              Please select a board
            </div>
          </div>

          <!-- College Selection -->
          <div class="col col-12 col-sm-10 col-md-8">
            <SearchableDropdown
              id="college"
              label="College"
              required
              placeholder="Select College"
              :items="colleges"
              :model-value="selectedCollege"
              :class="{
                'is-invalid': !validationStates.collegeId.valid && validationStates.collegeId.touched,
                'is-valid': validationStates.collegeId.valid && validationStates.collegeId.touched,
              }"
              :disabled="!formData.boardId"
              next-field-id="standard"
              @update:model-value="handleCollegeChange"
              @change="handleCollegeChange"
            >
              <template #item="{ item }">
                {{ item.name }}
              </template>
            </SearchableDropdown>
            <div
              class="invalid-feedback"
              v-show="!validationStates.collegeId.valid && validationStates.collegeId.touched"
            >
              {{
                !formData.boardId
                  ? 'Please select a board first'
                  : formData.boardId && colleges.length === 0
                    ? 'No colleges found for selected board'
                    : 'Please select a college'
              }}
            </div>
          </div>

          <!-- Standard Selection -->
          <div class="col col-12 col-sm-10 col-md-8">
            <SearchableDropdown
              id="standard"
              label="Standard"
              required
              placeholder="Select Standard"
              :items="standards"
              :model-value="selectedStandard"
              :class="{
                'is-invalid': !validationStates.standardId.valid && validationStates.standardId.touched,
                'is-valid': validationStates.standardId.valid && validationStates.standardId.touched,
              }"
              :disabled="!formData.collegeId"
              @update:model-value="handleStandardChange"
              @change="handleStandardChange"
            >
              <template #item="{ item }">
                {{ item.name }}
              </template>
            </SearchableDropdown>
            <div
              class="invalid-feedback"
              v-show="!validationStates.standardId.valid && validationStates.standardId.touched"
            >
              {{ !formData.collegeId ? 'Please select a college first' : 'Please select a standard' }}
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col col-12 col-sm-10 col-md-8 mt-4">
            <div class="text-center">
              <button 
                type="submit" 
                class="btn btn-dark btn-lg"
                :disabled="isSubmitting || isRedirecting"
              >
                {{ isSubmitting ? 'Processing...' : 'Login' }}
              </button>
            </div>
            <div class="text-center mt-3">
              <p class="text-muted">
                Not registered? 
                <a href="#" @click.prevent="goToItiRegistration" class="text-decoration-none">Register here</a>
              </p>
              <p class="text-muted">
                <a href="#" @click.prevent="goToMainLogin" class="text-decoration-none">Back to main login</a>
              </p>
            </div>
          </div>

          <!-- Messages -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div v-if="errorMessage" class="alert alert-danger text-center">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success text-center">{{ successMessage }}</div>
          </div>

          <!-- Debug Mode Toggle -->
          <div class="col col-12 col-sm-10 col-md-8 text-center">
            <button 
              type="button" 
              class="btn btn-sm btn-outline-secondary"
              @click="toggleDebugMode"
            >
              {{ debugMode ? 'Hide' : 'Show' }} Test Students
            </button>
          </div>

          <!-- Available Students for Testing -->
          <div v-if="debugMode" class="col col-12 col-sm-10 col-md-8">
            <div class="alert alert-info">
              <h6>Available Students for Testing:</h6>
              <div v-for="student in availableStudents" :key="student.id" class="mb-2">
                <button 
                  type="button"
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="useStudentData(student)"
                >
                  Use Data
                </button>
                <strong>{{ student.user.name }}</strong> (Roll: {{ student.student_id }})
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>

  <!-- Full Screen Loading Overlay -->
  <div v-if="isSubmitting || isRedirecting" class="loading-overlay">
    <div class="loading-content">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="loading-text mt-3">
        {{ isRedirecting ? 'Redirecting to exam page...' : 'Logging you in...' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import LoginNavBar from '@/components/LoginNavBar.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import type { Item } from '@/components/common/SearchableDropdown.vue'
import { useAuthStore } from '@/stores/auth'
import axiosInstance from '@/config/axios'
import type { AxiosError } from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// Form data
const formData = reactive({
  name: '',
  rollNo: '',
  boardId: null as number | null,
  collegeId: null as number | null,
  standardId: null as number | null,
})

// Validation states
const validationStates = reactive({
  name: { valid: false, touched: false },
  rollNo: { valid: false, touched: false },
  boardId: { valid: false, touched: false },
  collegeId: { valid: false, touched: false },
  standardId: { valid: false, touched: false },
})

// Dropdown data
const boards = ref<Item[]>([])
const colleges = ref<Item[]>([])
const standards = ref<Item[]>([])

// Selected items
const selectedBoard = ref<Item | null>(null)
const selectedCollege = ref<Item | null>(null)
const selectedStandard = ref<Item | null>(null)

// UI states
const isSubmitting = ref<boolean>(false)
const isRedirecting = ref<boolean>(false)
const errorMessage = ref('')
const successMessage = ref('')
const debugMode = ref(false)
const availableStudents = ref<any[]>([])

// Refs for form inputs
const nameInput = ref<HTMLInputElement | null>(null)
const rollNoInput = ref<HTMLInputElement | null>(null)

// Input handlers
const formatName = (name: string): string => {
  return name
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .split(' ')
    .map((word) => {
      // Only capitalize the first letter, leave the rest as is
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

const handleNameInput = () => {
  // Format the name in real-time as user types
  formData.name = formatName(formData.name)
  validationStates.name.touched = true
  validationStates.name.valid = formData.name.trim().length >= 2
}

const formatRollNo = (rollNo: string): string => {
  // Remove all spaces and non-alphanumeric characters, then convert to uppercase
  return rollNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

const handleRollNoInput = () => {
  // Format the roll number in real-time as user types
  formData.rollNo = formatRollNo(formData.rollNo)
  validationStates.rollNo.touched = true
  validationStates.rollNo.valid = formData.rollNo.length >= 1
}

const handleBoardChange = async (board: Item | null) => {
  selectedBoard.value = board
  formData.boardId = board?.id as number | null
  validationStates.boardId.touched = true
  validationStates.boardId.valid = !!board
  
  // Fetch colleges for selected board
  if (board?.id) {
    await fetchCollegesByBoard(board.id as number)
  } else {
    colleges.value = []
    standards.value = []
  }
}

const handleCollegeChange = async (college: Item | null) => {
  selectedCollege.value = college
  formData.collegeId = college?.id as number | null
  validationStates.collegeId.touched = true
  validationStates.collegeId.valid = !!college
  
  // Fetch standards for selected college
  if (college?.id) {
    await fetchStandardsByCollege(college.id as number)
  } else {
    standards.value = []
  }
}

const handleStandardChange = (standard: Item | null) => {
  selectedStandard.value = standard
  formData.standardId = standard?.id as number | null
  validationStates.standardId.touched = true
  validationStates.standardId.valid = !!standard
}

// API calls
const fetchBoards = async () => {
  try {
    const response = await axiosInstance.get('/iti-mocktest/boards')
    boards.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

const fetchCollegesByBoard = async (boardId: number) => {
  try {
    const response = await axiosInstance.get(`/iti-mocktest/schools/${boardId}`)
    colleges.value = response.data.data || []
    
    // Reset college and standard selections when board changes
    selectedCollege.value = null
    selectedStandard.value = null
    formData.collegeId = null
    formData.standardId = null
    validationStates.collegeId.valid = false
    validationStates.standardId.valid = false
    standards.value = []
  } catch (error) {
    console.error('Error fetching colleges:', error)
    colleges.value = []
  }
}

const fetchStandardsByCollege = async (collegeId: number) => {
  try {
    const response = await axiosInstance.get(`/iti-mocktest/standards/${collegeId}`)
    standards.value = response.data.data || []
    
    // Reset standard selection when college changes
    selectedStandard.value = null
    formData.standardId = null
    validationStates.standardId.valid = false
  } catch (error) {
    console.error('Error fetching standards:', error)
    standards.value = []
  }
}

// Form submission
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Simple inline validation to bypass the problematic validateForm
  if (!formData.name.trim() || !formData.rollNo.trim() || !formData.boardId || !formData.collegeId || !formData.standardId) {
    errorMessage.value = 'Please fill all required fields'
    return
  }
  
  // Set a flag to prevent global auth expired handler from triggering
  (window as any).preventAuthExpiredRedirect = true
  isSubmitting.value = true
  
  try {
    const submitData = {
      name: formData.name.trim(),
      roll_no: formData.rollNo.trim(),
      board_id: formData.boardId,
      school_id: formData.collegeId,
      standard_id: formData.standardId
    }
    
    console.log('Submitting login data:', submitData)
    
    const response = await axiosInstance.post('/iti-mocktest/login', submitData)
    
    if (response.data && response.data.access_token) {
      successMessage.value = 'Login successful! Redirecting...'
      
      // Store the token and user data using auth store
      const { access_token, user } = response.data
      authStore.setAuth(access_token, 'STUDENT', user.id)
      
      // Set redirecting state and redirect to student exam after 1 second
      isRedirecting.value = true
      setTimeout(() => {
        router.push({ name: 'studentExam' })
      }, 1000)
    } else {
      throw new Error('Login failed')
    }
    
  } catch (error) {
    console.error('Login error:', error)
    const axiosError = error as AxiosError
    
    // Reset redirecting state on error
    isRedirecting.value = false
    
    if (axiosError.response?.status === 401) {
      // Use the specific error message from API if available
      const apiErrorMessage = (axiosError.response?.data as any)?.message
      errorMessage.value = apiErrorMessage || 'Invalid details. Please check your name, roll number, board, college, and standard.'
    } else if (axiosError.response?.status === 400) {
      errorMessage.value = 'Bad request. Please check your input data.'
    } else if (axiosError.response?.status === 404) {
      errorMessage.value = 'Student not found. Please check your details or register first.'
    } else if (axiosError.response && axiosError.response.status >= 500) {
      errorMessage.value = 'Server error. Please try again later.'
    } else {
      errorMessage.value = 'Login failed. Please try again.'
    }
  } finally {
    // Clear the flag to allow normal auth expired handling
    (window as any).preventAuthExpiredRedirect = false
    
    // Only reset isSubmitting if there's an error (not redirecting)
    if (!isRedirecting.value) {
      isSubmitting.value = false
    }
  }
}

// Navigation
const goToMainLogin = () => {
  router.push({ name: 'login' })
}

const goToItiRegistration = () => {
  router.push({ name: 'iti-student-registration' })
}

// Keyboard navigation
const handleKeyDown = (event: KeyboardEvent, nextFieldId: string) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const nextField = document.getElementById(nextFieldId)
    if (nextField) {
      nextField.focus()
    }
  }
}

// Add debug functionality
const toggleDebugMode = async () => {
  debugMode.value = !debugMode.value
  if (debugMode.value) {
    await fetchAvailableStudents()
  }
}

const fetchAvailableStudents = async () => {
  try {
    const response = await axiosInstance.get('/iti-mocktest/students?schoolId=1&standardId=1')
    availableStudents.value = response.data.data.slice(0, 5) // Show first 5 for testing
  } catch (error) {
    console.error('Error fetching available students:', error)
  }
}

const useStudentData = (student: any) => {
  formData.name = student.user.name
  formData.rollNo = student.student_id
  formData.boardId = 1
  formData.collegeId = 1
  formData.standardId = 1
  
  // Update selected dropdowns
  selectedBoard.value = boards.value.find(b => b.id === 1) || null
  selectedCollege.value = colleges.value.find(c => c.id === 1) || null
  selectedStandard.value = standards.value.find(s => s.id === 1) || null
  
  // Mark fields as valid
  validationStates.name.valid = true
  validationStates.rollNo.valid = true
  validationStates.boardId.valid = true
  validationStates.collegeId.valid = true
  validationStates.standardId.valid = true
}

// Initialize
onMounted(async () => {
  // Reset form to ensure fresh state
  resetForm()
  
  await fetchBoards()
  
  await nextTick()
  nameInput.value?.focus()
})

// Reset form when component is activated (for keep-alive scenarios)
onActivated(() => {
  resetForm()
})

// Add reset form function
const resetForm = () => {
  // Reset form data
  formData.name = ''
  formData.rollNo = ''
  formData.boardId = null
  formData.collegeId = null
  formData.standardId = null
  
  // Reset selected items
  selectedBoard.value = null
  selectedCollege.value = null
  selectedStandard.value = null
  
  // Reset validation states
  Object.keys(validationStates).forEach(key => {
    validationStates[key as keyof typeof validationStates].valid = false
    validationStates[key as keyof typeof validationStates].touched = false
  })
  
  // Reset dropdown data
  colleges.value = []
  standards.value = []
  
  // Reset UI states
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = false
  isRedirecting.value = false
}
</script>

<style scoped>
.form-control {
  background-color: #FBFBFB;
}

.btn-lg {
  padding: 12px 40px;
  font-weight: 600;
}

.alert {
  border-radius: 8px;
  font-weight: 500;
}

/* Full Screen Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: white;
  margin: 0;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.25em;
}
</style> 