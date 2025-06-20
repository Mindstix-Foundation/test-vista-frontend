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

          <!-- Email and Date of Birth -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="row g-3 justify-content-center">
              <div class="col-12 col-md-6">
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
                    @keydown="handleKeyDown($event, 'dateOfBirth')"
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
              <div class="col-12 col-md-6">
                <div class="form-floating date-picker-container">
                  <input
                    ref="dateOfBirthInput"
                    type="text"
                    class="form-control date-picker-input"
                    id="dateOfBirth"
                    v-model="formattedDateOfBirth"
                    placeholder="dd/mm/yyyy"
                    @input="handleDateInput"
                    @blur="handleDateBlur"
                    @focus="showDatePicker"
                    @keydown="handleKeyDown($event, 'contactNumber')"
                    readonly
                  />
                  <label for="dateOfBirth" class="form-label">Date of Birth</label>
                  <div class="calendar-icon" @click="showDatePicker">
                    <i class="bi bi-calendar3"></i>
                  </div>
                  
                  <!-- Custom Date Picker -->
                  <div v-if="showDatePickerModal" class="date-picker-modal" @click.stop>
                    <div class="date-picker-header">
                      <button type="button" @click="previousMonth" class="nav-btn">
                        <i class="bi bi-chevron-left"></i>
                      </button>
                      
                      <div class="month-year-selectors">
                        <select v-model="currentMonth" class="month-select">
                          <option v-for="(month, index) in monthNames" :key="index" :value="index">
                            {{ month }}
                          </option>
                        </select>
                        <select v-model="currentYear" class="year-select">
                          <option v-for="year in yearOptions" :key="year" :value="year">
                            {{ year }}
                          </option>
                        </select>
                      </div>
                      
                      <button type="button" @click="nextMonth" class="nav-btn">
                        <i class="bi bi-chevron-right"></i>
                      </button>
                    </div>
                    
                    <div class="date-picker-calendar">
                      <div class="weekdays">
                        <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
                      </div>
                      <div class="days">
                        <div 
                          v-for="date in calendarDays" 
                          :key="date.key"
                          class="day"
                          :class="{
                            'other-month': !date.isCurrentMonth,
                            'selected': date.isSelected,
                            'today': date.isToday
                          }"
                          @click="selectDate(date)"
                        >
                          {{ date.day }}
                        </div>
                      </div>
                    </div>
                    
                    <div class="date-picker-footer">
                      <button type="button" @click="clearDate" class="btn btn-outline-secondary btn-sm">Clear</button>
                      <button type="button" @click="closeDatePicker" class="btn btn-primary btn-sm">Done</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Numbers -->
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
                    @keydown="handleKeyDown($event, 'board')"
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

          <!-- Standard and Student ID -->
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
                    @keydown="handleKeyDown($event, 'password')"
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

          <!-- Password Fields -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="row g-3 justify-content-center">
              <div class="col-12 col-md-6">
                <div class="form-floating password-field">
                  <input
                    ref="passwordInput"
                    :type="showPassword ? 'text' : 'password'"
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
                  <div class="password-toggle" @click="togglePasswordVisibility">
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </div>
                  <div
                    class="invalid-feedback"
                    v-if="!validationStates.password.valid && validationStates.password.touched"
                  >
                    {{ VALIDATION_MESSAGES.PASSWORD.COMPLEXITY }}
                  </div>
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="form-floating password-field">
                  <input
                    ref="confirmPasswordInput"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.confirmPassword.valid && validationStates.confirmPassword.touched,
                      'is-valid': validationStates.confirmPassword.valid && validationStates.confirmPassword.touched,
                    }"
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    placeholder="Confirm Password"
                    @input="handleConfirmPasswordInput"
                    @keydown="handleKeyDown($event, 'submit')"
                    required
                  />
                  <label for="confirmPassword" class="form-label">Confirm Password <span class="text-danger">*</span></label>
                  <div class="password-toggle" @click="toggleConfirmPasswordVisibility">
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </div>
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
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
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

// Add refs for password visibility
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Date picker variables
const showDatePickerModal = ref(false)
const selectedDate = ref<Date | null>(null)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const formattedDateOfBirth = ref('')

// Date picker computed properties
const currentMonthYear = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  // Generate years from 100 years ago to current year
  for (let year = currentYear - 100; year <= currentYear; year++) {
    years.push(year)
  }
  return years.reverse() // Most recent years first
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const today = new Date()
  
  // Add days from previous month
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === currentMonth.value
    const isToday = date.toDateString() === today.toDateString()
    const isSelected = selectedDate.value && date.toDateString() === selectedDate.value.toDateString()
    
    days.push({
      day: date.getDate(),
      date: date,
      isCurrentMonth,
      isToday,
      isSelected,
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    })
  }
  
  return days
})

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

// Add methods for password visibility toggle
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Date picker methods
const formatDateToDDMMYYYY = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const formatDateToYYYYMMDD = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${year}-${month}-${day}`
}

const parseDDMMYYYY = (dateString: string): Date | null => {
  const parts = dateString.split('/')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  
  const date = new Date(year, month, day)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null
  }
  
  return date
}

const showDatePicker = () => {
  showDatePickerModal.value = true
  // Set current month/year to selected date or current date
  if (selectedDate.value) {
    currentMonth.value = selectedDate.value.getMonth()
    currentYear.value = selectedDate.value.getFullYear()
  }
}

const closeDatePicker = () => {
  showDatePickerModal.value = false
}

const selectDate = (dateObj: any) => {
  selectedDate.value = dateObj.date
  formattedDateOfBirth.value = formatDateToDDMMYYYY(dateObj.date)
  formData.dateOfBirth = formatDateToYYYYMMDD(dateObj.date) // Use timezone-safe formatting
  showDatePickerModal.value = false
}

const clearDate = () => {
  selectedDate.value = null
  formattedDateOfBirth.value = ''
  formData.dateOfBirth = ''
  showDatePickerModal.value = false
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const handleDateInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // Allow only numbers and forward slashes
  const sanitized = value.replace(/[^\d/]/g, '')
  
  // Auto-format as user types
  let formatted = sanitized
  if (sanitized.length >= 2 && sanitized.indexOf('/') === -1) {
    formatted = sanitized.substring(0, 2) + '/' + sanitized.substring(2)
  }
  if (sanitized.length >= 5 && sanitized.split('/').length === 2) {
    const parts = sanitized.split('/')
    formatted = parts[0] + '/' + parts[1].substring(0, 2) + '/' + parts[1].substring(2)
  }
  
  formattedDateOfBirth.value = formatted
}

const handleDateBlur = () => {
  const date = parseDDMMYYYY(formattedDateOfBirth.value)
  if (date) {
    selectedDate.value = date
    formData.dateOfBirth = formatDateToYYYYMMDD(date) // Use timezone-safe formatting
    formattedDateOfBirth.value = formatDateToDDMMYYYY(date)
  } else if (formattedDateOfBirth.value.trim()) {
    // Invalid date format, clear it
    formattedDateOfBirth.value = ''
    selectedDate.value = null
    formData.dateOfBirth = ''
  }
}

// Initialize
onMounted(() => {
  fetchBoards()
  nextTick(() => {
    nameInput.value?.focus()
  })
  
  // Close date picker when clicking outside
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    const datePickerContainer = target.closest('.date-picker-container')
    if (!datePickerContainer && showDatePickerModal.value) {
      showDatePickerModal.value = false
    }
  })
})

// Clean up event listener
onBeforeUnmount(() => {
  document.removeEventListener('click', () => {})
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

/* Modern Date Picker Styling */
.date-picker-container {
  position: relative;
}

.date-picker-input {
  cursor: pointer;
  background-color: #FBFBFB;
}

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 10;
  font-size: 1.1rem;
  padding: 4px;
}

.calendar-icon:hover {
  color: #495057;
}

.date-picker-modal {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  margin-top: 4px;
  overflow: hidden;
  width: 100%;
}

.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.month-year-selectors {
  display: flex;
  gap: 6px;
  align-items: center;
}

.month-select,
.year-select {
  border: 1px solid #ced4da;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 0.8rem;
  background-color: white;
  color: #495057;
  cursor: pointer;
  outline: none;
}

.month-select:focus,
.year-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.25);
}

.month-select {
  min-width: 80px;
}

.year-select {
  min-width: 60px;
}

.month-year {
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
}

.nav-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.nav-btn:hover {
  background-color: #e9ecef;
  color: #495057;
}

.date-picker-calendar {
  padding: 6px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 3px;
}

.weekday {
  text-align: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: #6c757d;
  padding: 4px 2px;
  text-transform: uppercase;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.day {
  text-align: center;
  padding: 6px 2px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.8rem;
  transition: all 0.15s ease;
  min-height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day:hover {
  background-color: #f8f9fa;
}

.day.other-month {
  color: #adb5bd;
}

.day.today {
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
}

.day.selected {
  background-color: #007bff;
  color: white;
  font-weight: 600;
}

.day.selected:hover {
  background-color: #0056b3;
}

.date-picker-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.date-picker-footer .btn {
  font-size: 0.8rem;
  padding: 4px 10px;
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

/* Password field styling for floating forms */
.password-field {
  position: relative;
}

.password-field .password-toggle {
  position: absolute;
  right: 8px;
  top: 1.75rem;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  width: 20px;
  height: 20px;
  line-height: 1;
  margin-top: 0;
}

.password-field .password-toggle:hover {
  color: #495057;
}

/* Adjust padding for password fields to accommodate the eye icon */
.password-field .form-control {
  padding-right: 2.5rem;
}

/* Override validation styling for password fields to account for eye icon */
.password-field .form-control.is-valid {
  padding-right: 5.5rem;
  background-position: right calc(0.375em + 4rem) center;
}

.password-field .form-control.is-invalid {
  padding-right: 5.5rem;
  background-position: right calc(0.375em + 4rem) center;
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
</style> 