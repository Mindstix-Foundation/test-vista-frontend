<template>
  <!-- Navbar -->
  <LoginNavBar />

  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <button class="btn btn-close" @click="goToLogin" aria-label="Close"></button>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Student Registration</h4>
          <p class="text-muted">Simple registration for college testing</p>
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
                {{ rollNoErrorMessage || 'Please enter a valid roll number (uppercase letters and numbers only)' }}
              </div>
            </div>
          </div>

          <!-- Contact Number -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="form-floating">
              <input
                ref="contactNumberInput"
                type="text"
                class="form-control"
                :class="{
                  'is-invalid': !validationStates.contactNumber.valid && validationStates.contactNumber.touched,
                  'is-valid': validationStates.contactNumber.valid && validationStates.contactNumber.touched,
                }"
                id="contactNumber"
                v-model="formData.contactNumber"
                placeholder="Enter Contact Number"
                @input="handleContactNumberInput"
                @keydown="handleKeyDown($event, 'email')"
              />
              <label for="contactNumber" class="form-label">Contact Number</label>
              <div
                class="invalid-feedback"
                v-if="!validationStates.contactNumber.valid && validationStates.contactNumber.touched"
              >
                Please enter a valid contact number
              </div>
            </div>
          </div>

          <!-- Email -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="form-floating">
              <input
                ref="emailInput"
                type="email"
                class="form-control"
                :class="{
                  'is-invalid': !validationStates.email.valid && validationStates.email.touched,
                  'is-valid': validationStates.email.valid && validationStates.email.touched,
                }"
                id="email"
                v-model="formData.email"
                placeholder="Enter Email"
                @input="handleEmailInput"
              />
              <label for="email" class="form-label">Email</label>
              <div
                class="invalid-feedback"
                v-if="!validationStates.email.valid && validationStates.email.touched"
              >
                Please enter a valid email address
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
                {{ isSubmitting ? 'Processing...' : 'Register & Login' }}
              </button>
            </div>
            <div class="text-center mt-3">
              <p class="text-muted">Already registered? <a href="#" @click.prevent="goToLogin" class="text-decoration-none">Login here</a></p>
            </div>
          </div>

          <!-- Messages -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div v-if="errorMessage" class="alert alert-danger text-center">{{ errorMessage }}</div>
            <div v-if="successMessage" class="alert alert-success text-center">{{ successMessage }}</div>
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
        {{ isRedirecting ? 'Redirecting to exam page...' : 'Registering and logging you in...' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
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
  contactNumber: '',
  email: '',
  boardId: null as number | null,
  collegeId: null as number | null,
  standardId: null as number | null,
})

// Validation states
const validationStates = reactive({
  name: { valid: false, touched: false },
  rollNo: { valid: false, touched: false },
  contactNumber: { valid: true, touched: false }, // Optional field, starts as valid
  email: { valid: true, touched: false }, // Optional field, starts as valid
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
const isSubmitting = ref(false)
const isRedirecting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const rollNoErrorMessage = ref('')

// Refs for form inputs
const nameInput = ref<HTMLInputElement | null>(null)
const rollNoInput = ref<HTMLInputElement | null>(null)
const contactNumberInput = ref<HTMLInputElement | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)

// Validation functions
const validateName = (name: string): boolean => {
  return name.trim().length >= 2
}

const validateRollNo = (rollNo: string): boolean => {
  return rollNo.length >= 1
}

const formatRollNo = (rollNo: string): string => {
  // Remove all spaces and non-alphanumeric characters, then convert to uppercase
  return rollNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

const validateContactNumber = (contactNumber: string): boolean => {
  if (!contactNumber.trim()) return true // Optional field
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/
  return phoneRegex.test(contactNumber.trim())
}

const validateEmail = (email: string): boolean => {
  if (!email.trim()) return true // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

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
  validationStates.name.valid = validateName(formData.name)
}



const handleRollNoInput = async () => {
  // Format the roll number in real-time as user types
  formData.rollNo = formatRollNo(formData.rollNo)
  validationStates.rollNo.touched = true
  const isValidFormat = validateRollNo(formData.rollNo)
  validationStates.rollNo.valid = isValidFormat
  rollNoErrorMessage.value = ''
  
  // Note: We'll check roll number availability during form submission
  // since we need both roll number and college ID
}

const handleContactNumberInput = () => {
  validationStates.contactNumber.touched = true
  validationStates.contactNumber.valid = validateContactNumber(formData.contactNumber)
}

const handleEmailInput = () => {
  validationStates.email.touched = true
  validationStates.email.valid = validateEmail(formData.email)
}

const handleBoardChange = (board: Item | null) => {
  selectedBoard.value = board
  formData.boardId = board?.id as number | null
  validationStates.boardId.touched = true
  validationStates.boardId.valid = !!board
  
  // Reset college and standard when board changes
  selectedCollege.value = null
  formData.collegeId = null
  validationStates.collegeId.valid = false
  validationStates.collegeId.touched = false
  
  selectedStandard.value = null
  formData.standardId = null
  validationStates.standardId.valid = false
  validationStates.standardId.touched = false
  
  colleges.value = []
  standards.value = []
  
  if (board) {
    fetchColleges(board.id as number)
  }
}

const handleCollegeChange = (college: Item | null) => {
  selectedCollege.value = college
  formData.collegeId = college?.id as number | null
  validationStates.collegeId.touched = true
  validationStates.collegeId.valid = !!college
  
  // Reset standard when college changes
  selectedStandard.value = null
  formData.standardId = null
  validationStates.standardId.valid = false
  validationStates.standardId.touched = false
  
  standards.value = []
  
  if (college) {
    fetchStandards(college.id as number)
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

const fetchColleges = async (boardId: number) => {
  try {
    const response = await axiosInstance.get(`/iti-mocktest/schools/${boardId}`)
    colleges.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching colleges:', error)
    colleges.value = []
  }
}

const fetchStandards = async (collegeId: number) => {
  try {
    const response = await axiosInstance.get(`/iti-mocktest/standards/${collegeId}`)
    standards.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching standards:', error)
    standards.value = []
  }
}

// Form validation
const validateForm = (): boolean => {
  let isValid = true
  
  // Mark all fields as touched
  Object.keys(validationStates).forEach(key => {
    validationStates[key as keyof typeof validationStates].touched = true
  })
  
  // Validate required fields
  if (!validationStates.name.valid) isValid = false
  if (!validationStates.rollNo.valid) isValid = false
  if (!validationStates.boardId.valid) isValid = false
  if (!validationStates.collegeId.valid) isValid = false
  if (!validationStates.standardId.valid) isValid = false
  
  return isValid
}

// Form submission
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!validateForm()) {
    errorMessage.value = 'Please fill all required fields'
    return
  }
  
  isSubmitting.value = true
  
  try {
    const submitData: any = {
      name: formData.name.trim(),
      roll_no: formData.rollNo.trim(),
      board_id: formData.boardId,
      school_id: formData.collegeId,
      standard_id: formData.standardId
    }
    
    // Add optional fields only if they have values
    if (formData.contactNumber.trim()) {
      submitData.contact_number = formData.contactNumber.trim()
    }
    if (formData.email.trim()) {
      submitData.email = formData.email.trim()
    }
    
    const response = await axiosInstance.post('/iti-mocktest/register', submitData)
    
    if (response.data && response.data.access_token) {
      successMessage.value = 'Registration successful! Logging you in...'
      
      // Store the token and user data using auth store
      const { access_token, user } = response.data
      authStore.setAuth(access_token, 'STUDENT', user.id)
      
      // Set redirecting state and redirect to student exam after a short delay
      isRedirecting.value = true
      setTimeout(() => {
        router.push({ name: 'studentExam' })
      }, 1500)
    } else {
      throw new Error('Registration failed')
    }
    
  } catch (error) {
    console.error('Registration error:', error)
    const axiosError = error as AxiosError
    if (axiosError.response?.status === 409) {
      errorMessage.value = 'Roll number already exists in this college. Please use a different roll number.'
    } else if (axiosError.response?.status === 404) {
      errorMessage.value = 'College and standard combination not found. Please check your selections.'
    } else {
      errorMessage.value = 'Registration failed. Please try again.'
    }
  } finally {
    // Only reset isSubmitting if there's an error (not redirecting)
    if (!isRedirecting.value) {
      isSubmitting.value = false
    }
  }
}

// Navigation
const goToLogin = () => {
  router.push({ name: 'login' })
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

// Initialize
onMounted(async () => {
  await fetchBoards()
  await nextTick()
  nameInput.value?.focus()
})
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

/* Loading spinner styling */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.125em;
}

/* Ensure button doesn't change size when spinner appears */
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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