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
        </div>
      </div>
      <hr>
    </div>
    
    <div id="form-container" class="row mt-4 justify-content-center">
      <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
        <div class="row g-3 justify-content-center">
          
          <!-- Personal Information -->
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
                @keydown="handleKeyDown($event, 'emailId')"
                required
              />
              <label for="studentName" class="form-label">Full Name <span class="text-danger">*</span></label>
              <div
                class="invalid-feedback"
                v-if="!validationStates.name.valid && validationStates.name.touched"
              >
                {{ VALIDATION_MESSAGES.NAME.INVALID }}
              </div>
            </div>
          </div>

          <div class="col col-12 col-sm-10 col-md-8">
            <div class="form-floating">
              <input
                ref="emailInput"
                type="email"
                class="form-control"
                :class="{
                  'is-valid': validationStates.emailId.valid && validationStates.emailId.touched,
                  'is-invalid': !validationStates.emailId.valid && validationStates.emailId.touched,
                }"
                id="emailId"
                v-model="formData.emailId"
                placeholder="Enter Email Address"
                @input="handleEmailInput"
                @blur="handleEmailBlur"
                @keydown="handleKeyDown($event, 'password')"
                required
              />
              <label for="emailId" class="form-label">Email Address <span class="text-danger">*</span></label>
              <div
                class="invalid-feedback"
                v-if="!validationStates.emailId.valid && validationStates.emailId.touched"
              >
                {{ emailErrorMessage }}
              </div>
            </div>
          </div>

          <div class="col col-12 col-sm-10 col-md-8">
            <div class="row g-3 justify-content-center">
              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    ref="passwordInput"
                    type="password"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.password.valid && validationStates.password.touched,
                      'is-valid': validationStates.password.valid && validationStates.password.touched,
                    }"
                    id="password"
                    v-model="formData.password"
                    placeholder="Enter Password"
                    @input="handlePasswordInput"
                    @keydown="handleKeyDown($event, 'confirmPassword')"
                    required
                  />
                  <label for="password" class="form-label">Password <span class="text-danger">*</span></label>
                  <div
                    class="invalid-feedback"
                    v-if="!validationStates.password.valid && validationStates.password.touched"
                  >
                    {{ VALIDATION_MESSAGES.PASSWORD.COMPLEXITY }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    ref="confirmPasswordInput"
                    type="password"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.confirmPassword.valid && validationStates.confirmPassword.touched,
                      'is-valid': validationStates.confirmPassword.valid && validationStates.confirmPassword.touched,
                    }"
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    placeholder="Confirm Password"
                    @input="handleConfirmPasswordInput"
                    @keydown="handleKeyDown($event, 'contactNumber')"
                    required
                  />
                  <label for="confirmPassword" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                  <div
                    class="invalid-feedback"
                    v-if="!validationStates.confirmPassword.valid && validationStates.confirmPassword.touched"
                  >
                    {{ VALIDATION_MESSAGES.PASSWORD.MISMATCH }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col col-12 col-sm-10 col-md-8">
            <div class="row g-3 justify-content-center">
              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    ref="contactInput"
                    type="tel"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.contactNumber.valid && validationStates.contactNumber.touched,
                      'is-valid': validationStates.contactNumber.valid && formData.contactNumber.trim().length > 0,
                    }"
                    id="contactNumber"
                    v-model="formData.contactNumber"
                    placeholder="Enter Contact Number"
                    @input="handleContactInput"
                    @keydown="handleKeyDown($event, 'alternateContactNumber')"
                    required
                  />
                  <label for="contactNumber" class="form-label">Contact Number <span class="text-danger">*</span></label>
                  <div
                    class="invalid-feedback"
                    v-if="!validationStates.contactNumber.valid && validationStates.contactNumber.touched"
                  >
                    {{ VALIDATION_MESSAGES.CONTACT.INVALID }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    ref="alternateContactInput"
                    type="tel"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.alternateContactNumber.valid && validationStates.alternateContactNumber.touched && (formData.alternateContactNumber?.trim().length ?? 0) > 0,
                      'is-valid': validationStates.alternateContactNumber.valid && (formData.alternateContactNumber?.trim().length ?? 0) > 0,
                    }"
                    id="alternateContactNumber"
                    v-model="formData.alternateContactNumber"
                    placeholder="Enter Alternate Contact Number"
                    @input="handleAlternateContactInput"
                    @keydown="handleKeyDown($event, 'dateOfBirth')"
                  />
                  <label for="alternateContactNumber" class="form-label">Alternate Contact Number (Optional)</label>
                  <div
                    class="invalid-feedback"
                    v-if="!validationStates.alternateContactNumber.valid && validationStates.alternateContactNumber.touched"
                  >
                    {{ VALIDATION_MESSAGES.CONTACT.INVALID }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col col-12 col-sm-10 col-md-8">
            <div class="date-input-container">
              <input
                ref="dateOfBirthInput"
                type="date"
                class="form-control date-input"
                id="dateOfBirth"
                v-model="formData.dateOfBirth"
                @keydown="handleKeyDown($event, 'board')"
              />
              <label for="dateOfBirth" class="date-label">Date of Birth</label>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="col col-12 col-sm-10 col-md-8">
            <SearchableDropdown
              id="board"
              label="Board"
              required
              placeholder="Search for Board"
              :items="boards"
              :model-value="selectedBoard"
              :class="{
                'is-invalid': !validationStates.boardId.valid && validationStates.boardId.touched,
                'is-valid': validationStates.boardId.valid && validationStates.boardId.touched,
              }"
              :disabled="false"
              next-field-id="school"
              @update:model-value="handleBoardChange"
              @change="handleBoardChange"
            />
            <div
              class="invalid-feedback"
              v-show="!validationStates.boardId.valid && validationStates.boardId.touched"
            >
              {{ VALIDATION_MESSAGES.BOARD.REQUIRED }}
            </div>
          </div>

          <div class="col col-12 col-sm-10 col-md-8">
            <SearchableDropdown
              id="school"
              label="School"
              required
              placeholder="Search for School"
              :items="schools"
              :model-value="selectedSchool"
              :class="{
                'is-invalid': !validationStates.schoolId.valid && validationStates.schoolId.touched,
                'is-valid': validationStates.schoolId.valid && validationStates.schoolId.touched,
              }"
              :disabled="!formData.boardId"
              next-field-id="standard"
              @update:model-value="handleSchoolChange"
              @change="handleSchoolChange"
            >
              <template #item="{ item }">
                {{ item.name }}
              </template>
            </SearchableDropdown>
            <div
              class="invalid-feedback"
              v-show="!validationStates.schoolId.valid && validationStates.schoolId.touched"
            >
              {{
                !formData.boardId
                  ? VALIDATION_MESSAGES.SCHOOL.SELECT_BOARD_FIRST
                  : formData.boardId && schools.length === 0
                    ? VALIDATION_MESSAGES.SCHOOL.NO_SCHOOLS
                    : VALIDATION_MESSAGES.SCHOOL.REQUIRED
              }}
            </div>
          </div>

          <!-- Standard and Student ID in 50-50 layout -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="row g-3 justify-content-center">
              <div class="col-12 col-md-6">
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
                  :disabled="!formData.schoolId"
                  next-field-id="studentId"
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
                  {{ VALIDATION_MESSAGES.STANDARD.REQUIRED }}
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <input
                    ref="studentIdInput"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.studentId.valid && validationStates.studentId.touched,
                      'is-valid': validationStates.studentId.valid && validationStates.studentId.touched,
                    }"
                    id="studentId"
                    v-model="formData.studentId"
                    placeholder="Enter Student ID"
                    @input="handleStudentIdInput"
                    :disabled="!formData.schoolStandardId"
                    required
                  />
                  <label for="studentId" class="form-label">Student ID <span class="text-danger">*</span></label>
                  <div
                    class="invalid-feedback"
                    v-if="!validationStates.studentId.valid && validationStates.studentId.touched"
                  >
                    {{ studentIdErrorMessage || VALIDATION_MESSAGES.STUDENT.ID_REQUIRED }}
                  </div>
                  <div
                    class="form-text"
                    v-if="!formData.schoolStandardId"
                  >
                    {{ VALIDATION_MESSAGES.STUDENT.SELECT_STANDARD_FIRST }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col col-12 col-sm-10 col-md-8 mt-4">
            <div class="text-center">
              <button 
                type="submit" 
                class="btn btn-dark"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Submitting...' : 'Submit' }}
              </button>
            </div>
            <div class="text-center mt-3">
              <p class="text-muted">Already have an account? <a href="#" @click.prevent="goToLogin" class="text-decoration-none">Login here</a></p>
            </div>
          </div>

          <!-- Messages -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div v-if="errorMessage" class="error-message text-center">{{ errorMessage }}</div>
            <div v-if="successMessage" class="success-message text-center">{{ successMessage }}</div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import LoginNavBar from '@/components/LoginNavBar.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import type { Item } from '@/components/common/SearchableDropdown.vue'
import axiosInstance from '@/config/axios'
import { VALIDATION_MESSAGES, validateContactNumber, validateEmail, validateName, validatePassword, formatContactNumber, toTitleCase, formatContactNumberForAPI } from '@/utils/validationConstants'
import type { AxiosError } from 'axios'

const router = useRouter()

// Form data
const formData = reactive({
  name: '',
  emailId: '',
  password: '',
  confirmPassword: '',
  contactNumber: '',
  alternateContactNumber: '',
  dateOfBirth: '',
  studentId: '',
  boardId: null as number | null,
  schoolId: null as number | null,
  standardId: null as number | null,
  schoolStandardId: null as number | null,
})

// Validation states
const validationStates = reactive({
  name: { valid: false, touched: false },
  emailId: { valid: false, touched: false },
  password: { valid: false, touched: false },
  confirmPassword: { valid: false, touched: false },
  contactNumber: { valid: false, touched: false },
  alternateContactNumber: { valid: true, touched: false },
  studentId: { valid: false, touched: false },
  boardId: { valid: false, touched: false },
  schoolId: { valid: false, touched: false },
  standardId: { valid: false, touched: false },
})

// Dropdown data
const boards = ref<Item[]>([])
const schools = ref<Item[]>([])
const standards = ref<Item[]>([])

// Selected items
const selectedBoard = ref<Item | null>(null)
const selectedSchool = ref<Item | null>(null)
const selectedStandard = ref<Item | null>(null)

// UI states
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Refs for form inputs
const nameInput = ref<HTMLInputElement | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
const confirmPasswordInput = ref<HTMLInputElement | null>(null)
const contactInput = ref<HTMLInputElement | null>(null)
const alternateContactInput = ref<HTMLInputElement | null>(null)
const dateOfBirthInput = ref<HTMLInputElement | null>(null)
const studentIdInput = ref<HTMLInputElement | null>(null)

// Add computed property for student ID error message
const studentIdErrorMessage = ref('')
const emailAvailabilityMessage = ref('')

// Computed properties
const emailErrorMessage = computed(() => {
  if (!formData.emailId) return VALIDATION_MESSAGES.EMAIL.REQUIRED
  if (!validateEmail(formData.emailId)) return VALIDATION_MESSAGES.EMAIL.INVALID
  if (emailAvailabilityMessage.value) return emailAvailabilityMessage.value
  return ''
})

// Input handlers
const handleNameInput = () => {
  validationStates.name.touched = true
  // Convert to title case as user types
  formData.name = toTitleCase(formData.name)
  validationStates.name.valid = validateName(formData.name)
}

const handleEmailInput = async () => {
  validationStates.emailId.touched = true
  const isValidFormat = validateEmail(formData.emailId)
  validationStates.emailId.valid = isValidFormat
  emailAvailabilityMessage.value = ''
  
  // Check email availability if valid format
  if (isValidFormat && formData.emailId.trim()) {
    try {
      const response = await axiosInstance.get(`/users/check-email/${encodeURIComponent(formData.emailId.trim())}`)
      if (!response.data.available) {
        validationStates.emailId.valid = false
        emailAvailabilityMessage.value = 'Email address is already registered'
      }
    } catch (error) {
      console.error('Error checking email availability:', error)
    }
  }
}

const handleEmailBlur = async () => {
  validationStates.emailId.touched = true
  const isValidFormat = validateEmail(formData.emailId)
  validationStates.emailId.valid = isValidFormat
  emailAvailabilityMessage.value = ''
  
  // Check email availability if valid format
  if (isValidFormat && formData.emailId.trim()) {
    try {
      const response = await axiosInstance.get(`/users/check-email/${encodeURIComponent(formData.emailId.trim())}`)
      if (!response.data.available) {
        validationStates.emailId.valid = false
        emailAvailabilityMessage.value = 'Email address is already registered'
      }
    } catch (error) {
      console.error('Error checking email availability:', error)
    }
  }
}

const handlePasswordInput = () => {
  validationStates.password.touched = true
  validationStates.password.valid = validatePassword(formData.password)
  
  // Re-validate confirm password if it has been touched
  if (validationStates.confirmPassword.touched) {
    validationStates.confirmPassword.valid = formData.password === formData.confirmPassword && validatePassword(formData.password)
  }
}

const handleConfirmPasswordInput = () => {
  validationStates.confirmPassword.touched = true
  validationStates.confirmPassword.valid = formData.password === formData.confirmPassword && validatePassword(formData.password)
}

const handleContactInput = () => {
  validationStates.contactNumber.touched = true
  formData.contactNumber = formatContactNumber(formData.contactNumber)
  validationStates.contactNumber.valid = validateContactNumber(formData.contactNumber)
  
  // Check if alternate contact is different
  if (validationStates.alternateContactNumber.touched && formData.alternateContactNumber) {
    validationStates.alternateContactNumber.valid = 
      validateContactNumber(formData.alternateContactNumber) && 
      formData.contactNumber !== formData.alternateContactNumber
  }
}

const handleAlternateContactInput = () => {
  validationStates.alternateContactNumber.touched = true
  formData.alternateContactNumber = formatContactNumber(formData.alternateContactNumber || '')
  
  if (formData.alternateContactNumber) {
    validationStates.alternateContactNumber.valid = 
      validateContactNumber(formData.alternateContactNumber) && 
      formData.contactNumber !== formData.alternateContactNumber
  } else {
    validationStates.alternateContactNumber.valid = true
  }
}

const handleStudentIdInput = async () => {
  validationStates.studentId.touched = true
  const isValidFormat = formData.studentId.trim().length > 0
  validationStates.studentId.valid = isValidFormat
  studentIdErrorMessage.value = ''
  
  // Check student ID availability if format is valid and we have school standard ID
  if (isValidFormat && formData.studentId.trim() && formData.schoolStandardId) {
    try {
      const response = await axiosInstance.get(`/students/check-student-id/${encodeURIComponent(formData.studentId.trim())}/${formData.schoolStandardId}`)
      if (!response.data.available) {
        validationStates.studentId.valid = false
        studentIdErrorMessage.value = response.data.message || 'Student ID is already taken in this school-standard'
      }
    } catch (error) {
      console.error('Error checking student ID availability:', error)
    }
  }
}

const handleBoardChange = (board: Item | null) => {
  selectedBoard.value = board
  formData.boardId = board?.id as number | null
  validationStates.boardId.touched = true
  validationStates.boardId.valid = !!board
  
  // Reset school and standard when board changes
  selectedSchool.value = null
  formData.schoolId = null
  validationStates.schoolId.valid = false
  validationStates.schoolId.touched = false
  
  selectedStandard.value = null
  formData.standardId = null
  validationStates.standardId.valid = false
  validationStates.standardId.touched = false
  
  schools.value = []
  standards.value = []
  
  if (board) {
    fetchSchools(board.id as number)
  }
}

const handleSchoolChange = (school: Item | null) => {
  selectedSchool.value = school
  formData.schoolId = school?.id as number | null
  validationStates.schoolId.touched = true
  validationStates.schoolId.valid = !!school
  
  // Reset standard when school changes
  selectedStandard.value = null
  formData.standardId = null
  validationStates.standardId.valid = false
  validationStates.standardId.touched = false
  
  standards.value = []
  
  if (school) {
    fetchStandards(school.id as number)
  }
}

const handleStandardChange = (standard: Item | null) => {
  selectedStandard.value = standard
  formData.standardId = standard?.id as number | null
  validationStates.standardId.touched = true
  validationStates.standardId.valid = !!standard
  
  // Set school standard ID for student ID validation
  if (standard && formData.schoolId) {
    // Find the school standard ID from the standards array
    const standardData = standards.value.find(s => s.id === standard.id)
    if (standardData && (standardData as any).schoolStandardId) {
      formData.schoolStandardId = (standardData as any).schoolStandardId
    }
  } else {
    formData.schoolStandardId = null
  }
  
  // Re-validate student ID if it has been entered
  if (validationStates.studentId.touched && formData.studentId.trim()) {
    handleStudentIdInput()
  }
}

// API calls
const fetchBoards = async () => {
  try {
    const response = await axiosInstance.get('/boards')
    boards.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

const fetchSchools = async (boardId: number) => {
  try {
    const response = await axiosInstance.get(`/schools?boardId=${boardId}`)
    schools.value = response.data.data || []
  } catch (error) {
    console.error('Error fetching schools:', error)
    schools.value = []
  }
}

const fetchStandards = async (schoolId: number) => {
  try {
    const response = await axiosInstance.get(`/school-standards/school/${schoolId}`)
    // The API returns data directly as an array, not wrapped in response.data.data
    const standardsData = response.data || []
    standards.value = standardsData.map((item: any) => ({
      id: item.standard.id,
      name: item.standard.name,
      schoolStandardId: item.id, // Store the school-standard relationship ID
      ...item.standard
    }))
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
  if (!validationStates.emailId.valid) isValid = false
  if (!validationStates.password.valid) isValid = false
  if (!validationStates.confirmPassword.valid) isValid = false
  if (!validationStates.contactNumber.valid) isValid = false
  if (!validationStates.studentId.valid) isValid = false
  if (!validationStates.boardId.valid) isValid = false
  if (!validationStates.schoolId.valid) isValid = false
  if (!validationStates.standardId.valid) isValid = false
  
  // Validate alternate contact if provided
  if (formData.alternateContactNumber && !validationStates.alternateContactNumber.valid) {
    isValid = false
  }
  
  return isValid
}

// Form submission
const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!validateForm()) {
    errorMessage.value = VALIDATION_MESSAGES.FORM.FILL_ALL_REQUIRED
    return
  }
  
  isSubmitting.value = true
  
  try {
    const submitData = {
      name: formData.name.trim(),
      email_id: formData.emailId.trim(),
      password: formData.password,
      contact_number: formatContactNumberForAPI(formData.contactNumber),
      alternate_contact_number: formData.alternateContactNumber ? formatContactNumberForAPI(formData.alternateContactNumber) : null,
      date_of_birth: formData.dateOfBirth || null,
      student_id: formData.studentId.trim(),
      school_standard_id: formData.schoolStandardId,
      status: 'active'
    }
    
    await axiosInstance.post('/students', submitData)
    
    successMessage.value = 'Registration successful! Redirecting to login page...'
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2000)
    
  } catch (error) {
    console.error('Registration error:', error)
    const axiosError = error as AxiosError
    if (axiosError.response?.status === 400) {
      errorMessage.value = 'Registration failed. Please check your information and try again.'
    } else if (axiosError.response?.status === 404) {
      errorMessage.value = 'School Standard not found. Please select a valid standard.'
    } else if (axiosError.response?.status === 409) {
      errorMessage.value = 'Email or Student ID already exists. Please use different credentials.'
    } else {
      errorMessage.value = 'An error occurred during registration. Please try again.'
    }
  } finally {
    isSubmitting.value = false
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
onMounted(() => {
  fetchBoards()
  nextTick(() => {
    nameInput.value?.focus()
  })
})
</script>

<style scoped>
body {
  background-color: #ffffff;
}

/* Centering the container */
.container {
  max-width: 1200px;
}

/* Form styling */
.form-control {
  background-color: #FBFBFB;
}

/* Date input styling */
.date-input-container {
  position: relative;
  margin-bottom: 1rem;
}

.date-input {
  height: calc(3.5rem + 2px);
  padding: 1rem 0.75rem 0.25rem 0.75rem;
  background-color: #FBFBFB;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 1rem;
  line-height: 1.25;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  width: 100%;
}

.date-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.date-label {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  padding: 1rem 0.75rem;
  pointer-events: none;
  border: 1px solid transparent;
  transform-origin: 0 0;
  transition: opacity 0.1s ease-in-out, transform 0.1s ease-in-out;
  color: #6c757d;
  font-size: 0.875rem;
  opacity: 0.65;
  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
}

/* Date input webkit styling */
.date-input::-webkit-calendar-picker-indicator {
  background: transparent;
  bottom: 0;
  color: transparent;
  cursor: pointer;
  height: auto;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: auto;
}

.date-input::-webkit-inner-spin-button,
.date-input::-webkit-clear-button {
  display: none;
}

.error-message {
  color: red;
  font-size: 0.875rem;
  margin-top: 5px;
}

.success-message {
  color: green;
  font-size: 0.875rem;
  margin-top: 5px;
}

/* Custom button styling */
.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  opacity: 0.5;
}

.btn-close:hover {
  opacity: 1;
}

.form-floating > .form-control {
  height: calc(3.5rem + 2px);
  line-height: 1.25;
}

.form-floating > label {
  padding: 1rem 0.75rem;
}

/* Validation styling */
.form-control.is-valid {
  border-color: #198754;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.form-control.is-valid:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.25);
}

.form-control.is-invalid {
  border-color: #dc3545;
  padding-right: calc(1.5em + 0.75rem);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath d='m5.8 4.6 1.4 1.4m0-1.4-1.4 1.4'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right calc(0.375em + 0.1875rem) center;
  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.form-control.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.form-text {
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #6c757d;
}

/* Disabled field styling */
.form-control:disabled {
  background-color: #e9ecef;
  opacity: 1;
}
</style> 