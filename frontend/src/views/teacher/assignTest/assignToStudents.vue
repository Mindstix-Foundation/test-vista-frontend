<template>
  <div class="container-fluid mt-3 mb-3 px-2 px-md-4">
    <!-- Header Section -->
    <div class="row mb-4">
      <div class="col-12">
        <!-- Loading state for test paper -->
        <div v-if="loadingTestPaper" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading test paper details...</p>
        </div>
        
        <!-- Test paper loaded -->
        <div v-else-if="selectedPaper" class="header-section">
          <!-- Mobile Header -->
          <div class="d-block d-lg-none">
            <div class="d-flex align-items-center gap-2 mb-3">
              <div class="flex-grow-1">
                <h5 class="m-0 fw-bold text-dark">Assign Test Paper</h5>
                <p class="m-0 text-muted small text-truncate">{{ selectedPaper?.name }}</p>
              </div>
              <div class="d-flex gap-2">
                <button @click="goToResultDashboard" class="btn btn-primary btn-sm">
                  <i class="bi bi-graph-up"></i>
                </button>
                <button @click="goBack" class="btn btn-outline-dark btn-sm">
                  <i class="bi bi-arrow-left"></i>
                </button>
              </div>
            </div>
            
            <!-- Mobile Test Info Cards -->
            <div class="row g-2 mb-3">
              <div class="col-4">
                <div class="mobile-info-card">
                  <i class="bi bi-clock text-primary"></i>
                  <div class="info-text">
                    <span class="info-value">{{ selectedPaper?.duration_minutes }}</span>
                    <span class="info-label">min</span>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div class="mobile-info-card">
                  <i class="bi bi-award text-success"></i>
                  <div class="info-text">
                    <span class="info-value">{{ selectedPaper?.pattern?.total_marks }}</span>
                    <span class="info-label">marks</span>
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div class="mobile-info-card">
                  <i class="bi bi-question-circle text-info"></i>
                  <div class="info-text">
                    <span class="info-value">{{ selectedPaper?.question_count }}</span>
                    <span class="info-label">questions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Desktop Header -->
          <div class="d-none d-lg-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="flex-grow-1">
              <h4 class="m-0 fw-bold text-dark">Assign Test Paper</h4>
              <p class="m-0 text-muted">{{ selectedPaper?.name }}</p>
            </div>
            <div class="header-buttons-container">
              <div class="d-flex gap-2 mb-2">
                <button @click="goToResultDashboard" class="btn btn-primary">
                  <i class="bi bi-graph-up me-2"></i>Results
                </button>
                <button @click="goBack" class="btn btn-outline-dark">
                  <i class="bi bi-arrow-left me-2"></i>Back
                </button>
              </div>
            </div>
            <div class="test-info-card">
              <div class="row g-3">
                <div class="col-auto">
                  <div class="info-item">
                    <i class="bi bi-clock text-primary"></i>
                    <span>{{ selectedPaper?.duration_minutes }} min</span>
                  </div>
                </div>
                <div class="col-auto">
                  <div class="info-item">
                    <i class="bi bi-award text-success"></i>
                    <span>{{ selectedPaper?.pattern?.total_marks }} marks</span>
                  </div>
                </div>
                <div class="col-auto">
                  <div class="info-item">
                    <i class="bi bi-question-circle text-info"></i>
                    <span>{{ selectedPaper?.question_count }} questions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Error state -->
        <div v-else class="text-center py-5">
          <i class="bi bi-exclamation-triangle display-1 text-muted mb-3"></i>
          <h5 class="text-muted mb-2">Test Paper Not Found</h5>
          <p class="text-muted">The requested test paper could not be loaded.</p>
          <button @click="goBack" class="btn btn-outline-primary">
            <i class="bi bi-arrow-left me-2"></i>Back to Dashboard
          </button>
        </div>
        
        <hr class="my-4" v-if="selectedPaper">
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="selectedPaper" class="row g-3 g-lg-4">
      <!-- Assignment Form -->
      <div class="col-12 col-lg-4 order-1">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="card-title m-0">
              <i class="bi bi-calendar-event me-2"></i>Assignment Details
            </h5>
          </div>
          <div class="card-body">
            <!-- Available From -->
            <div class="mb-3">
              <label for="availableFrom" class="form-label">
                Available From *
                <button 
                  type="button"
                  @click="showAvailableFromHelp = !showAvailableFromHelp"
                  class="btn btn-link p-0 ms-2 text-primary helper-toggle"
                  title="Click for more information"
                >
                  <i class="bi bi-info-circle"></i>
                </button>
              </label>
              
              <div v-if="showAvailableFromHelp" class="helper-text-collapsible">
                <div class="helper-content">
                  <span>When should students be able to start taking this test? <strong>(Default: In a moment)</strong></span>
                </div>
              </div>
              <div class="custom-datetime-picker">
                <input 
                  type="text" 
                  class="form-control datetime-input-modern" 
                  id="availableFrom" 
                  v-model="formattedAvailableFrom"
                  placeholder="DD-MM-YYYY HH:MM"
                  @click="showAvailablePicker = true"
                  @focus="showAvailablePicker = true"
                  readonly
                  required
                >
                <i class="bi bi-calendar-event date-icon"></i>
                
                <!-- Custom DateTime Picker Dropdown -->
                <div v-if="showAvailablePicker" class="date-picker-dropdown datetime-dropdown">
                  <div class="date-picker-header">
                    <button @click="previousMonth('available')" class="nav-btn">&lt;</button>
                    <span class="month-year">{{ currentMonthYear('available') }}</span>
                    <button @click="nextMonth('available')" class="nav-btn">&gt;</button>
                  </div>
                  <div class="datetime-content">
                    <div class="date-picker-calendar">
                      <div class="weekdays">
                        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                      </div>
                      <div class="dates">
                        <button 
                          v-for="date in getCalendarDates('available')" 
                          :key="date.key"
                          @click="selectDate('available', date)"
                          class="date-btn"
                          :class="{
                            'other-month': date.otherMonth,
                            'selected': date.selected,
                            'today': date.today,
                            'past-date': date.isPastDate,
                            'disabled': date.disabled
                          }"
                          :disabled="date.disabled"
                          :title="date.isPastDate ? 'Past dates cannot be selected' : ''"
                        >
                          {{ date.day }}
                        </button>
                      </div>
                    </div>
                    <div class="time-picker-section">
                      <div class="time-picker-header">Select Time</div>
                      <div class="time-inputs">
                        <div class="time-input-group">
                          <input 
                            type="number" 
                            v-model="displayHour" 
                            min="1" 
                            max="12" 
                            class="time-input"
                            placeholder="HH"
                            @input="updateDisplayTime"
                          >
                          <label>Hour</label>
                        </div>
                        <span class="time-separator">:</span>
                        <div class="time-input-group">
                          <input 
                            type="number" 
                            v-model="availableTime.minute" 
                            min="0" 
                            max="59" 
                            class="time-input"
                            placeholder="MM"
                            @input="updateAvailableTime"
                          >
                          <label>Minute</label>
                        </div>
                        <div class="ampm-toggle">
                          <button 
                            @click="toggleAMPM('AM')" 
                            class="ampm-btn"
                            :class="{ active: availableTime.ampm === 'AM' }"
                          >
                            AM
                          </button>
                          <button 
                            @click="toggleAMPM('PM')" 
                            class="ampm-btn"
                            :class="{ active: availableTime.ampm === 'PM' }"
                          >
                            PM
                          </button>
                        </div>
                      </div>
                      <div class="quick-time-buttons">
                        <button @click="setQuickTime12('9:00 AM')" class="btn btn-sm btn-outline-secondary">9AM</button>
                        <button @click="setQuickTime12('12:00 PM')" class="btn btn-sm btn-outline-secondary">12PM</button>
                        <button @click="setQuickTime12('3:00 PM')" class="btn btn-sm btn-outline-secondary">3PM</button>
                        <button @click="setQuickTime12('6:00 PM')" class="btn btn-sm btn-outline-secondary">6PM</button>
                      </div>
                    </div>
                  </div>
                  <div class="date-picker-footer">
                    <button @click="clearDate('available')" class="btn btn-sm btn-outline-secondary">Clear</button>
                    <button @click="selectNow('available')" class="btn btn-sm btn-outline-primary" title="Set to current date and time">Now</button>
                    <button @click="confirmAvailableDateTime" class="btn btn-sm btn-success">Select</button>
                  </div>
                </div>
              </div>
              <small class="form-text text-muted">Format: DD-MM-YYYY HH:MM</small>
              <!-- <small v-if="assignmentData.availableFrom" class="form-text text-success">
                <i class="bi bi-check-circle me-1"></i>Available from: {{ formattedAvailableFrom }}
              </small> -->
            </div>

            <!-- Due Date -->
            <div class="mb-3">
              <label for="dueDate" class="form-label">
                Due Date *
                <button 
                  type="button"
                  @click="showDueDateHelp = !showDueDateHelp"
                  class="btn btn-link p-0 ms-2 text-primary helper-toggle"
                  title="Click for more information"
                >
                  <i class="bi bi-info-circle"></i>
                </button>
              </label>
              
              <div v-if="showDueDateHelp" class="helper-text-collapsible">
                <div class="helper-content">
                  <span>When should the test expire and no longer be available? <strong>(Default: 7 days from now)</strong></span>
                </div>
              </div>
              <div class="custom-date-picker">
                <input 
                  type="text" 
                  class="form-control date-input-modern" 
                  id="dueDate" 
                  v-model="formattedDueDate"
                  placeholder="DD-MM-YYYY"
                  @click="showDueDatePicker = true"
                  @focus="showDueDatePicker = true"
                  readonly
                  required
                >
                <i class="bi bi-calendar3 date-icon"></i>
                
                <!-- Custom Date Picker Dropdown -->
                <div v-if="showDueDatePicker" class="date-picker-dropdown">
                  <div class="date-picker-header">
                    <button @click="previousMonth('due')" class="nav-btn">&lt;</button>
                    <span class="month-year">{{ currentMonthYear('due') }}</span>
                    <button @click="nextMonth('due')" class="nav-btn">&gt;</button>
                  </div>
                  <div class="date-picker-calendar">
                    <div class="weekdays">
                      <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
                    </div>
                    <div class="dates">
                      <button 
                        v-for="date in getCalendarDates('due')" 
                        :key="date.key"
                        @click="selectDate('due', date)"
                        class="date-btn"
                        :class="{
                          'other-month': date.otherMonth,
                          'selected': date.selected,
                          'today': date.today,
                          'past-date': date.isPastDate,
                          'invalid-due-date': date.isInvalidDueDate,
                          'disabled': date.disabled
                        }"
                        :disabled="date.disabled"
                        :title="date.disabledReason || ''"
                      >
                        {{ date.day }}
                      </button>
                    </div>
                  </div>
                  <div class="date-picker-footer">
                    <button @click="clearDate('due')" class="btn btn-sm btn-outline-secondary">Clear</button>
                    <button @click="selectToday('due')" class="btn btn-sm btn-outline-primary">Today</button>
                  </div>
                </div>
              </div>
              <small class="form-text text-muted">Format: DD-MM-YYYY</small>
              <!-- <small v-if="assignmentData.dueDate" class="form-text text-success">
                <i class="bi bi-check-circle me-1"></i>Due date selected: {{ formattedDueDate }}
              </small> -->
            </div>

            <!-- Max Attempts and Time Limit -->
            <!-- TODO: Feature to be implemented later - Max Attempts and Time Limit controls -->
            <!-- Currently hidden but code preserved for future implementation -->
            <div class="row mb-3" style="display: none;">
              <div class="col-6">
                <label for="maxAttempts" class="form-label">Max Attempts</label>
                <input type="number" class="form-control" id="maxAttempts" v-model="assignmentData.maxAttempts" min="1" max="10">
              </div>
              <div class="col-6">
                <label for="timeLimitMinutes" class="form-label">Time Limit</label>
                <input type="number" class="form-control" id="timeLimitMinutes" v-model="assignmentData.timeLimitMinutes" min="1" placeholder="Minutes">
                <small class="form-text text-muted d-none d-md-block">Leave empty to use default</small>
              </div>
            </div>

            <!-- Date Validation Status -->
            <div v-if="assignmentData.dueDate || assignmentData.availableFrom" class="mb-3">
              <div class="alert" :class="{
                'alert-success': dateValidationStatus.type === 'success',
                'alert-info': dateValidationStatus.type === 'info',
                'alert-warning': dateValidationStatus.type === 'warning',
                'alert-danger': dateValidationStatus.type === 'error'
              }" role="alert">
                <i class="bi" :class="{
                  'bi-check-circle': dateValidationStatus.type === 'success',
                  'bi-info-circle': dateValidationStatus.type === 'info',
                  'bi-exclamation-triangle': dateValidationStatus.type === 'warning',
                  'bi-x-circle': dateValidationStatus.type === 'error'
                }"></i>
                <small>{{ dateValidationStatus.message }}</small>
              </div>
            </div>

            <!-- Assign Button -->
            <div class="d-grid">
              <button 
                @click="confirmAssignment"
                class="btn btn-success btn-lg"
                :disabled="loadingStudents || !hasSelectedStudents || assigningTest"
              >
                <span v-if="assigningTest" class="spinner-border spinner-border-sm me-2" role="status"></span>
                <i v-else class="bi bi-person-plus me-2"></i>
                <span class="d-none d-sm-inline">
                  {{ assigningTest ? 'Assigning...' : `Assign to ${selectedStudentsCount} Student(s)` }}
                </span>
                <span class="d-sm-none">
                  {{ assigningTest ? 'Assigning...' : `Assign (${selectedStudentsCount})` }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Student Selection -->
      <div class="col-12 col-lg-8 order-2">
        <div class="card shadow-sm h-100">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 class="card-title m-0">
                <i class="bi bi-people me-2"></i>
                <span class="d-none d-sm-inline">Select Students</span>
                <span class="d-sm-none">Students</span>
                <span v-if="!loadingStudents" class="text-muted ms-2">({{ filteredStudents.length }} {{ assignedOnlyToggle ? 'assigned' : 'available' }})</span>
              </h5>
              
              <!-- Student Filter Toggle -->
              <div class="d-flex align-items-center">
                <span class="me-2 small text-muted d-none d-sm-inline">Show:</span>
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="assignedOnlyToggle" 
                    v-model="assignedOnlyToggle" 
                    @change="filterStudents"
                  >
                  <label class="form-check-label ms-2 fw-semibold toggle-label-fixed" for="assignedOnlyToggle">
                    {{ assignedOnlyToggle ? 'Assigned' : 'Non-Assigned' }}
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-body d-flex flex-column">
            <!-- Loading indicator -->
            <div v-if="loadingStudents" class="text-center py-5 d-flex flex-column justify-content-center align-items-center flex-grow-1">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3 text-muted">Loading ITI students...</p>
            </div>
            
            <!-- Student selection -->
            <div v-else-if="filteredStudents.length > 0" class="d-flex flex-column h-100">
              <div class="form-check mb-3 p-3 border rounded bg-light">
                <input class="form-check-input" type="checkbox" id="selectAllStudents" v-model="selectAllStudents" @change="toggleAllStudents">
                <label class="form-check-label fw-semibold" for="selectAllStudents">
                  <span class="d-none d-sm-inline">Select All Visible Students ({{ filteredStudents.length }})</span>
                  <span class="d-sm-none">Select All ({{ filteredStudents.length }})</span>
                </label>
              </div>
              
              <div class="student-grid flex-grow-1">
                <div v-for="student in filteredStudents" :key="student.id" class="student-card">
                  <div class="form-check h-100">
                    <input class="form-check-input" type="checkbox" :id="`student-${student.id}`" v-model="student.selected">
                    <label class="form-check-label w-100" :for="`student-${student.id}`">
                      <div class="student-info">
                        <div class="student-header">
                          <h6 class="student-name mb-1">{{ student.name }}</h6>
                          <span class="student-roll">Roll: {{ student.rollNumber }}</span>
                        </div>
                        <div class="student-actions">
                          <span v-if="student.isAssigned" class="badge bg-success">Assigned</span>
                          <span v-else class="badge bg-secondary">Not Assigned</span>
                          <!-- Remove assignment button for assigned students -->
                          <button 
                            v-if="student.isAssigned" 
                            @click.stop="removeAssignment(student)"
                            class="btn btn-sm btn-outline-danger ms-2"
                            :disabled="removingAssignment"
                            title="Remove Assignment"
                          >
                            <i class="bi bi-x-circle"></i>
                          </button>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No students message -->
            <div v-else class="text-center py-5 d-flex flex-column justify-content-center align-items-center flex-grow-1">
              <i class="bi bi-person-x display-1 text-muted mb-3"></i>
              <h5 class="text-muted mb-2">
                {{ assignedOnlyToggle ? 'No assigned students found for this test.' : 'No non-assigned students found for this test.' }}
              </h5>
              <p class="text-muted">
                Students need to request enrollment and be approved by you before they can be assigned tests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification Component -->
    <ToastNotification />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/stores/toast'
import ToastNotification from '@/components/common/ToastNotification.vue'

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

// Get test paper ID from route params
const testPaperId = route.params.testPaperId as string

// Interfaces
interface TestPaper {
  id: number
  name: string
  marks_per_question: number
  question_count: number
  duration_minutes: number
  pattern: {
    id: number
    total_marks: number
    standard: {
      id: number
      name: string
    }
    subject: {
      id: number
      name: string
    }
  }
  school: {
    id: number
    name: string
  }
}

interface Student {
  id: number
  name: string
  rollNumber: string
  selected: boolean
  isAssigned?: boolean
}

// Reactive variables
const selectedPaper = ref<TestPaper | null>(null)
const loadingTestPaper = ref(false)
const students = ref<Student[]>([])
const loadingStudents = ref(false)
const assigningTest = ref(false)
const removingAssignment = ref(false)
const assignedOnlyToggle = ref(false)
const selectAllStudents = ref(false)
const initializingDefaults = ref(true)

// Helper text visibility controls
const showAvailableFromHelp = ref(false)
const showDueDateHelp = ref(false)

// Date picker reactive variables
const showDueDatePicker = ref(false)
const showAvailablePicker = ref(false)
const dueDatePicker = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})
const availableDatePicker = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})
const availableTime = ref({
  hour: 9,
  minute: 0,
  ampm: 'AM' as 'AM' | 'PM'
})

// Calendar configuration
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Assignment data
const assignmentData = ref({
  dueDate: '',
  availableFrom: '',
  // TODO: Features below are temporarily hidden - will be implemented later
  maxAttempts: 1,                    // Currently hidden - Max attempts feature
  timeLimitMinutes: null as number | null  // Currently hidden - Time limit feature
})

// Set smart defaults for dates
const setSmartDefaults = () => {
  const now = new Date()
  
  // Set Available From to current date and time + 1 minute buffer to ensure it's in the future
  const availableFromTime = new Date(now.getTime() + 60 * 1000) // Add 1 minute
  assignmentData.value.availableFrom = availableFromTime.toISOString()
  
  // Update time picker to current time (rounded to next minute)
  const currentHour = availableFromTime.getHours()
  const currentMinute = availableFromTime.getMinutes()
  const ampm = currentHour >= 12 ? 'PM' : 'AM'
  
  availableTime.value.hour = currentHour
  availableTime.value.minute = currentMinute
  availableTime.value.ampm = ampm
  
  // Set date picker for available from to current month
  availableDatePicker.value.year = now.getFullYear()
  availableDatePicker.value.month = now.getMonth()
  
  // Set Due Date to 7 days from now
  const dueDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)) // Add 7 days
  const year = dueDate.getFullYear()
  const month = (dueDate.getMonth() + 1).toString().padStart(2, '0')
  const day = dueDate.getDate().toString().padStart(2, '0')
  assignmentData.value.dueDate = `${year}-${month}-${day}`
  
  // Set date picker for due date to the correct month
  dueDatePicker.value.year = dueDate.getFullYear()
  dueDatePicker.value.month = dueDate.getMonth()
  
  // Mark initialization as complete
  initializingDefaults.value = false
}

// Computed properties
const filteredStudents = computed(() => students.value)

const hasSelectedStudents = computed(() => {
  return filteredStudents.value.some(student => student.selected)
})

const selectedStudentsCount = computed(() => {
  return filteredStudents.value.filter(student => student.selected).length
})

// Date validation status computed property
const dateValidationStatus = computed(() => {
  // Skip validation during initialization to avoid false positives
  if (initializingDefaults.value) {
    return {
      isValid: false,
      message: 'Setting up smart defaults...',
      type: 'info'
    }
  }
  
  // Handle different workflow combinations
  if (!assignmentData.value.availableFrom && !assignmentData.value.dueDate) {
    return {
      isValid: false,
      message: 'Select when the test should be available and when it should expire',
      type: 'info'
    }
  }
  
  if (assignmentData.value.availableFrom && !assignmentData.value.dueDate) {
    return {
      isValid: false,
      message: 'Now select when the test should expire (due date)',
      type: 'info'
    }
  }
  
  if (!assignmentData.value.availableFrom && assignmentData.value.dueDate) {
    return {
      isValid: false,
      message: 'Now select when the test should become available to students',
      type: 'info'
    }
  }
  
  const validation = validateDates()
  
  if (validation.isValid && assignmentData.value.dueDate && assignmentData.value.availableFrom) {
    const dueDate = new Date(assignmentData.value.dueDate)
    const availableFrom = new Date(assignmentData.value.availableFrom)
    const timeDiff = dueDate.getTime() - availableFrom.getTime()
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hoursDiff = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    let timeInfo = ''
    if (daysDiff > 0) {
      timeInfo = `${daysDiff} day(s) and ${hoursDiff} hour(s)`
    } else {
      timeInfo = `${Math.floor(timeDiff / (1000 * 60 * 60))} hour(s)`
    }
    
    return {
      isValid: true,
      message: `Ready to assign! Students will have ${timeInfo} to complete the test (you can adjust these dates if needed)`,
      type: 'success'
    }
  }
  
  return {
    isValid: validation.isValid,
    message: validation.message,
    type: validation.isValid ? 'success' : 'warning'
  }
})

// Date formatting computed properties
const formattedDueDate = computed({
  get: () => {
    if (!assignmentData.value.dueDate) return ''
    const date = new Date(assignmentData.value.dueDate)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  },
  set: (value: string) => {
    // This will be handled by the date picker
  }
})

const formattedAvailableFrom = computed({
  get: () => {
    if (!assignmentData.value.availableFrom) return ''
    const date = new Date(assignmentData.value.availableFrom)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    // Convert to 12-hour format
    let hour = date.getHours()
    const minute = date.getMinutes().toString().padStart(2, '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12
    if (hour === 0) hour = 12
    
    return `${day}-${month}-${year} ${hour}:${minute} ${ampm}`
  },
  set: (value: string) => {
    // This will be handled by the date picker
  }
})

// Display hour computed property for 12-hour format
const displayHour = computed({
  get: () => {
    let hour = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && hour !== 12) hour += 12
    if (availableTime.value.ampm === 'AM' && hour === 12) hour = 0
    
    // Convert back to 12-hour display
    const displayHour = hour % 12
    return displayHour === 0 ? 12 : displayHour
  },
  set: (value: number) => {
    // Convert 12-hour to 24-hour and update
    let hour24 = value
    if (availableTime.value.ampm === 'PM' && value !== 12) {
      hour24 = value + 12
    } else if (availableTime.value.ampm === 'AM' && value === 12) {
      hour24 = 0
    }
    availableTime.value.hour = hour24
    updateAvailableTime()
  }
})

// Toast helper functions
const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  toastStore.showToast({ title, message, type })
}

// Navigation
const goBack = () => {
  router.push('/teacher/assign-test')
}

const goToResultDashboard = () => {
  if (selectedPaper.value) {
    router.push(`/teacher/result-dashboard/${selectedPaper.value.id}`)
  }
}

// API Methods
const fetchTestPaper = async () => {
  try {
    loadingTestPaper.value = true
    
    // Try to get test paper data from sessionStorage first
    const cachedData = sessionStorage.getItem(`testPaper_${testPaperId}`)
    if (cachedData) {
      selectedPaper.value = JSON.parse(cachedData)
      // Clean up the cached data
      sessionStorage.removeItem(`testPaper_${testPaperId}`)
      
      // Load students for this test paper
      await loadEnrolledStudents()
      return
    }
    
    // Fallback: Try to fetch from the dashboard API that lists all test papers
    console.log('No cached data found, fetching from dashboard API...')
    const response = await axiosInstance.get('/create-test-paper/online')
    
    if (response.data && Array.isArray(response.data)) {
      // Find the specific test paper by ID
      const testPaper = response.data.find((paper: any) => paper.id.toString() === testPaperId)
      
      if (testPaper) {
        selectedPaper.value = testPaper
        console.log('Found test paper from dashboard API:', testPaper.name)
        
        // Load students for this test paper
        await loadEnrolledStudents()
        return
      } else {
        throw new Error(`Test paper with ID ${testPaperId} not found`)
      }
    } else {
      throw new Error('Invalid API response format')
    }
  } catch (error: any) {
    console.error('Error fetching test paper:', error)
    
    if (error.response?.status === 404) {
      showToast('Test Paper Not Found', 'The requested test paper could not be found. You will be redirected to the dashboard.', 'error')
    } else if (error.message.includes('not found')) {
      showToast('Test Paper Not Found', 'The requested test paper could not be found in your test papers. You will be redirected to the dashboard.', 'error')
    } else {
      showToast('Error', 'Failed to load test paper details. You will be redirected to the dashboard.', 'error')
    }
    
    // Wait a moment for user to see the toast, then redirect
    setTimeout(() => {
      goBack()
    }, 2000)
  } finally {
    loadingTestPaper.value = false
  }
}

const loadEnrolledStudents = async () => {
  try {
    loadingStudents.value = true
    
    if (!selectedPaper.value) return
    
    // Use ITI students API
    const response = await axiosInstance.get('/iti-mocktest/students', {
      params: {
        schoolId: selectedPaper.value.school.id,
        standardId: selectedPaper.value.pattern.standard.id
      }
    })
    
    if (response.data && response.data.statusCode === 200 && Array.isArray(response.data.data)) {
      // Get existing assignments for this paper to determine assignment status
      let assignedStudentIds = new Set<number>()
      
      try {
        const assignmentsResponse = await axiosInstance.get('/test-assignments', {
          params: {
            test_paper_id: selectedPaper.value.id
          }
        })
        
        if (assignmentsResponse.data && Array.isArray(assignmentsResponse.data)) {
          assignedStudentIds = new Set(assignmentsResponse.data.map((a: any) => a.student_id))
        }
      } catch (assignmentError) {
        console.warn('Could not fetch existing assignments:', assignmentError)
      }
      
      // Transform ITI students API response to match Student interface
      students.value = response.data.data.map((itiStudent: any) => ({
        id: itiStudent.id,
        name: itiStudent.user.name,
        rollNumber: itiStudent.student_id,
        selected: false,
        isAssigned: assignedStudentIds.has(itiStudent.id)
      }))
      
      // Filter based on assignedOnlyToggle
      if (assignedOnlyToggle.value === true) {
        students.value = students.value.filter(student => student.isAssigned)
      } else if (assignedOnlyToggle.value === false) {
        students.value = students.value.filter(student => !student.isAssigned)
      }
    } else {
      students.value = []
    }
  } catch (error: any) {
    console.error('Error loading ITI students:', error)
    students.value = []
  } finally {
    loadingStudents.value = false
  }
}

// Date picker methods
const currentMonthYear = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  return `${months[picker.month]} ${picker.year}`
}

const previousMonth = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  if (picker.month === 0) {
    picker.month = 11
    picker.year--
  } else {
    picker.month--
  }
}

const nextMonth = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  if (picker.month === 11) {
    picker.month = 0
    picker.year++
  } else {
    picker.month++
  }
}

const getCalendarDates = (type: 'due' | 'available') => {
  const picker = type === 'due' ? dueDatePicker.value : availableDatePicker.value
  const firstDay = new Date(picker.year, picker.month, 1)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time for accurate comparison
  const selectedDate = type === 'due' 
    ? (assignmentData.value.dueDate ? new Date(assignmentData.value.dueDate) : null)
    : (assignmentData.value.availableFrom ? new Date(assignmentData.value.availableFrom) : null)
  
  const dates = []
  
  // Calculate the start date of the calendar (first day of the week containing the first day of the month)
  const startDate = new Date(picker.year, picker.month, 1 - firstDay.getDay())
  
  for (let i = 0; i < 42; i++) {
    // Create dates using year, month, date constructor to avoid DST issues
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i)
    
    const isSelected = selectedDate && 
      currentDate.getDate() === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    
    const isToday = currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    
    // Check if date is in the past
    const isPastDate = currentDate < today
    
    // Additional validation for due date calendar
    let isInvalidDueDate = false
    let invalidReason = ''
    
    if (type === 'due' && assignmentData.value.availableFrom) {
      const availableFromDate = new Date(assignmentData.value.availableFrom)
      availableFromDate.setHours(0, 0, 0, 0)
      
      if (currentDate < availableFromDate) {
        isInvalidDueDate = true
        invalidReason = 'Due date cannot be before available from date'
      }
    }
    
    const isDisabled = isPastDate || currentDate.getMonth() !== picker.month || isInvalidDueDate
    
    const dateInfo = {
      key: `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`,
      day: currentDate.getDate(),
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
      otherMonth: currentDate.getMonth() !== picker.month,
      selected: isSelected,
      today: isToday,
      isPastDate: isPastDate,
      isInvalidDueDate: isInvalidDueDate,
      disabled: isDisabled,
      disabledReason: invalidReason || (isPastDate ? 'Past dates cannot be selected' : '')
    }
    
    dates.push(dateInfo)
  }
  
  return dates
}

const selectDate = (type: 'due' | 'available', dateObj: any) => {
  if (dateObj.otherMonth || dateObj.disabled) return
  
  // Create a new date object using the exact date components to avoid timezone issues
  const year = dateObj.date.getFullYear()
  const month = dateObj.date.getMonth()
  const day = dateObj.date.getDate()
  const selectedDate = new Date(year, month, day)
  
  // Validate the selected date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (selectedDate < today) {
    showToast('Invalid Date', 'Cannot select a date in the past.', 'warning')
    return
  }
  
  if (type === 'due') {
    // Additional validation for due date
    if (assignmentData.value.availableFrom) {
      const availableFromDate = new Date(assignmentData.value.availableFrom)
      availableFromDate.setHours(0, 0, 0, 0)
      
      if (selectedDate < availableFromDate) {
        const availableFromFormatted = new Date(assignmentData.value.availableFrom).toLocaleDateString('en-GB')
        showToast('Invalid Due Date', `Due date must be on or after ${availableFromFormatted} when the test becomes available.`, 'warning')
        return
      }
      
      // Check if there's enough time between available from and due date
      const timeDifference = selectedDate.getTime() - availableFromDate.getTime()
      const hoursDifference = timeDifference / (1000 * 60 * 60)
      
      if (hoursDifference < 1) {
        showToast('Insufficient Time', 'Students need at least 1 hour to complete the test. Please select a later due date.', 'warning')
        return
      }
    }
    // If available from is not set, allow due date selection but show helpful info
    else {
      showToast('Due Date Set', 'Great! Now set when the test should become available to students.', 'info')
    }
    
    // Format date as YYYY-MM-DD to avoid timezone issues
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    assignmentData.value.dueDate = formattedDate
    showDueDatePicker.value = false
  } else {
    // Additional validation for available from date
    if (assignmentData.value.dueDate) {
      const dueDate = new Date(assignmentData.value.dueDate)
      dueDate.setHours(23, 59, 59, 999) // End of due date
      
      if (selectedDate > dueDate) {
        showToast('Invalid Available Date', 'Available from date cannot be later than the due date.', 'warning')
        return
      }
    }
    
    // For available from, preserve the selected time
    let hour24 = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && availableTime.value.hour !== 12) {
      hour24 = availableTime.value.hour + 12
    } else if (availableTime.value.ampm === 'AM' && availableTime.value.hour === 12) {
      hour24 = 0
    }
    selectedDate.setHours(hour24, availableTime.value.minute, 0, 0)
    assignmentData.value.availableFrom = selectedDate.toISOString()
  }
}

const selectToday = (type: 'due' | 'available') => {
  const today = new Date()
  
  if (type === 'due') {
    // Validate due date against available from
    if (assignmentData.value.availableFrom) {
      const availableFromDate = new Date(assignmentData.value.availableFrom)
      availableFromDate.setHours(0, 0, 0, 0)
      const todayDate = new Date(today)
      todayDate.setHours(0, 0, 0, 0)
      
      if (todayDate < availableFromDate) {
        showToast('Invalid Due Date', 'Due date cannot be earlier than the available from date.', 'warning')
        return
      }
    }
    
    assignmentData.value.dueDate = today.toISOString().split('T')[0]
    showDueDatePicker.value = false
  } else {
    // Validate available from against due date
    if (assignmentData.value.dueDate) {
      const dueDate = new Date(assignmentData.value.dueDate)
      dueDate.setHours(23, 59, 59, 999)
      
      if (today > dueDate) {
        showToast('Invalid Available Date', 'Available from date cannot be later than the due date.', 'warning')
        return
      }
    }
    
    // Convert 12-hour to 24-hour format
    let hour24 = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && availableTime.value.hour !== 12) {
      hour24 = availableTime.value.hour + 12
    } else if (availableTime.value.ampm === 'AM' && availableTime.value.hour === 12) {
      hour24 = 0
    }
    
    today.setHours(hour24, availableTime.value.minute, 0, 0)
    assignmentData.value.availableFrom = today.toISOString()
  }
}

const selectNow = (type: 'due' | 'available') => {
  const now = new Date()
  
  if (type === 'due') {
    // For due date, just select today's date (same as selectToday)
    selectToday('due')
  } else {
    // For available from, set current date and time
    
    // Validate available from against due date
    if (assignmentData.value.dueDate) {
      const dueDate = new Date(assignmentData.value.dueDate)
      dueDate.setHours(23, 59, 59, 999)
      
      if (now > dueDate) {
        showToast('Invalid Available Date', 'Current time is after the due date. Please adjust the due date first.', 'warning')
        return
      }
    }
    
    // Update the time picker controls to current time
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const ampm = currentHour >= 12 ? 'PM' : 'AM'
    let displayHour = currentHour % 12
    if (displayHour === 0) displayHour = 12
    
    // Update the time picker state
    availableTime.value.hour = currentHour
    availableTime.value.minute = currentMinute
    availableTime.value.ampm = ampm
    
    // Set the available from date and time
    assignmentData.value.availableFrom = now.toISOString()
    
    showToast('Time Set', 'Available from set to current date and time.', 'success')
  }
}

const clearDate = (type: 'due' | 'available') => {
  if (type === 'due') {
    assignmentData.value.dueDate = ''
    showDueDatePicker.value = false
  } else {
    assignmentData.value.availableFrom = ''
    showAvailablePicker.value = false
  }
}

const confirmAvailableDateTime = () => {
  // Convert 12-hour to 24-hour format
  let hour24 = availableTime.value.hour
  if (availableTime.value.ampm === 'PM' && availableTime.value.hour !== 12) {
    hour24 = availableTime.value.hour + 12
  } else if (availableTime.value.ampm === 'AM' && availableTime.value.hour === 12) {
    hour24 = 0
  }

  let selectedDateTime: Date

  // If no date is selected yet, select today
  if (!assignmentData.value.availableFrom) {
    const today = new Date()
    today.setHours(hour24, availableTime.value.minute, 0, 0)
    selectedDateTime = today
  } else {
    // Update the existing date with current time selection
    const date = new Date(assignmentData.value.availableFrom)
    date.setHours(hour24, availableTime.value.minute, 0, 0)
    selectedDateTime = date
  }

  // Validate that the selected datetime is not in the past
  const now = new Date()
  if (selectedDateTime < now) {
    showToast('Invalid Time', 'Selected date and time cannot be in the past.', 'warning')
    return
  }

  // Validate against due date if set
  if (assignmentData.value.dueDate) {
    const dueDate = new Date(assignmentData.value.dueDate)
    dueDate.setHours(23, 59, 59, 999)
    
    if (selectedDateTime > dueDate) {
      showToast('Invalid Available Date', 'Available from date cannot be later than the due date.', 'warning')
      return
    }
  }

  assignmentData.value.availableFrom = selectedDateTime.toISOString()
  
  // Close the picker automatically since we've set everything
  showAvailablePicker.value = false
}

// Simplified version without automatic adjustments
const updateAvailableTime = () => {
  if (assignmentData.value.availableFrom) {
    const date = new Date(assignmentData.value.availableFrom)
    
    // Convert 12-hour to 24-hour format for storage
    let hour24 = availableTime.value.hour
    if (availableTime.value.ampm === 'PM' && availableTime.value.hour !== 12) {
      hour24 = availableTime.value.hour + 12
    } else if (availableTime.value.ampm === 'AM' && availableTime.value.hour === 12) {
      hour24 = 0
    }
    
    // Simply update the time without any automatic adjustments
    date.setHours(hour24, availableTime.value.minute, 0, 0)
    
    assignmentData.value.availableFrom = date.toISOString()
  }
}

// New methods for 12-hour time picker
const updateDisplayTime = () => {
  updateAvailableTime()
}

const toggleAMPM = (period: 'AM' | 'PM') => {
  availableTime.value.ampm = period
  updateAvailableTime()
}

const setQuickTime12 = (timeStr: string) => {
  // Parse time like "9:00 AM" or "3:00 PM"
  const [time, period] = timeStr.split(' ')
  const [hour, minute] = time.split(':').map(Number)
  
  // Convert to 24-hour format
  let hour24 = hour
  if (period === 'PM' && hour !== 12) {
    hour24 = hour + 12
  } else if (period === 'AM' && hour === 12) {
    hour24 = 0
  }
  
  availableTime.value.hour = hour24
  availableTime.value.minute = minute
  availableTime.value.ampm = period as 'AM' | 'PM'
  updateAvailableTime()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const dueDatePicker = document.querySelector('.custom-date-picker')
  const availablePicker = document.querySelector('.custom-datetime-picker')
  
  if (showDueDatePicker.value && dueDatePicker && !dueDatePicker.contains(target)) {
    showDueDatePicker.value = false
  }
  
  if (showAvailablePicker.value && availablePicker && !availablePicker.contains(target)) {
    showAvailablePicker.value = false
  }
}

// Student management
const toggleAllStudents = () => {
  filteredStudents.value.forEach(student => {
    student.selected = selectAllStudents.value
  })
}

const filterStudents = async () => {
  selectAllStudents.value = false
  students.value.forEach(student => {
    student.selected = false
  })
  
  await loadEnrolledStudents()
}

// Add comprehensive validation function
const validateDates = (): { isValid: boolean; message: string } => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (!assignmentData.value.availableFrom) {
    return { isValid: false, message: 'Please select when the test should become available to students.' }
  }
  
  if (!assignmentData.value.dueDate) {
    return { isValid: false, message: 'Please select the due date for the test.' }
  }
  
  const dueDate = new Date(assignmentData.value.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  
  const availableFromDate = new Date(assignmentData.value.availableFrom)
  
  // Check if available from is in the past
  // Allow a 1-minute tolerance to handle timing differences when setting defaults
  const now = new Date()
  const oneMinuteAgo = new Date(now.getTime() - 60 * 1000) // 1 minute ago
  
  if (availableFromDate < oneMinuteAgo) {
    return { isValid: false, message: 'Available from date and time cannot be in the past.' }
  }
  
  // Check if due date is in the past
  if (dueDate < today) {
    return { isValid: false, message: 'Due date cannot be in the past.' }
  }
  
  // Check if available from is after due date
  const dueDateEndOfDay = new Date(dueDate)
  dueDateEndOfDay.setHours(23, 59, 59, 999)
  
  if (availableFromDate > dueDateEndOfDay) {
    return { isValid: false, message: 'The test must be available before the due date. Please select an earlier available from time or a later due date.' }
  }
  
  // Check if there's reasonable time between available from and due date
  const timeDifference = dueDateEndOfDay.getTime() - availableFromDate.getTime()
  const hoursDifference = timeDifference / (1000 * 60 * 60)
  
  if (hoursDifference < 1) {
    return { isValid: false, message: 'Students need at least 1 hour to complete the test. Please adjust your dates.' }
  }
  
  return { isValid: true, message: '' }
}

const confirmAssignment = async () => {
  if (!hasSelectedStudents.value) {
    showToast('No Students Selected', 'Please select at least one student to assign the test.', 'info')
    return
  }
  
  // Comprehensive date validation
  const dateValidation = validateDates()
  if (!dateValidation.isValid) {
    showToast('Invalid Date Selection', dateValidation.message, 'warning')
    return
  }
  
  // Additional validations
  // TODO: Uncomment when Max Attempts and Time Limit features are implemented
  /*
  if (assignmentData.value.maxAttempts < 1 || assignmentData.value.maxAttempts > 10) {
    showToast('Invalid Max Attempts', 'Max attempts should be between 1 and 10.', 'warning')
    return
  }
  
  if (assignmentData.value.timeLimitMinutes !== null && 
      (assignmentData.value.timeLimitMinutes < 1 || assignmentData.value.timeLimitMinutes > 1440)) {
    showToast('Invalid Time Limit', 'Time limit should be between 1 and 1440 minutes (24 hours).', 'warning')
    return
  }
  */

  const selectedStudents = filteredStudents.value.filter(s => s.selected)
  await executeAssignment(selectedStudents)
}

const executeAssignment = async (selectedStudents: Student[]) => {
  try {
    assigningTest.value = true
    
    const assignmentPayload = {
      test_paper_id: selectedPaper.value!.id,
      student_ids: selectedStudents.map(s => s.id),
      due_date: new Date(assignmentData.value.dueDate).toISOString(),
      available_from: new Date(assignmentData.value.availableFrom).toISOString(),
      // TODO: Uncomment when Max Attempts and Time Limit features are implemented
      // max_attempts: assignmentData.value.maxAttempts,
      // time_limit_minutes: assignmentData.value.timeLimitMinutes
    }
    
    const response = await axiosInstance.post('/test-assignments/bulk', assignmentPayload)
    
    if (response.status === 201) {
      const result = response.data
      
      // Update assignment status for successfully assigned students
      selectedStudents.forEach(student => {
        student.isAssigned = true
        student.selected = false
      })
      
      // Show success message
      let message = `Test assigned successfully to ${result.assigned || selectedStudents.length} student(s)!`
      
      if (result.failed && result.failed.length > 0) {
        message += ` Failed: ${result.failed.length} students.`
      }
      
      showToast('Assignment Successful', message, 'success')
      
      // Reset form
      selectAllStudents.value = false
      assignmentData.value = {
        dueDate: '',
        availableFrom: '',
        maxAttempts: 1,
        timeLimitMinutes: null
      }
    }
  } catch (error: any) {
    console.error('Error assigning test:', error)
    
    let errorMessage = 'Failed to assign test. Please try again.'
    
    if (error.response?.status === 400) {
      errorMessage = 'Invalid assignment data. Please check your inputs.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Test paper or students not found.'
    }
    
    showToast('Assignment Failed', errorMessage, 'error')
  } finally {
    assigningTest.value = false
  }
}

const removeAssignment = async (student: Student) => {
  try {
    removingAssignment.value = true
    
    const response = await axiosInstance.delete('/test-assignments', {
      data: {
        student_id: student.id,
        test_paper_id: selectedPaper.value!.id
      }
    })
    
    if (response.status === 200) {
      student.isAssigned = false
      student.selected = false
      
      showToast('Assignment Removed', `Test assignment removed successfully for ${student.name}.`, 'success')
    }
  } catch (error: any) {
    console.error('Error removing assignment:', error)
    
    let errorMessage = 'Failed to remove assignment. Please try again.'
    
    if (error.response?.status === 404) {
      errorMessage = 'Assignment not found.'
    } else if (error.response?.status === 400) {
      errorMessage = 'Cannot remove assignment - student may have already started the test.'
    }
    
    showToast('Remove Assignment Failed', errorMessage, 'error')
  } finally {
    removingAssignment.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  setSmartDefaults()
  fetchTestPaper()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Header Section */
.header-section {
  margin-bottom: 0;
}

/* Header Buttons Styling */
.header-buttons-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.header-buttons-container .btn {
  font-weight: 500;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-buttons-container .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.header-buttons-container .btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  color: white;
}

.header-buttons-container .btn-primary:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
}

.header-buttons-container .btn-outline-dark {
  border: 2px solid #495057;
  color: #495057;
  background: white;
}

.header-buttons-container .btn-outline-dark:hover {
  background: #495057;
  color: white;
  border-color: #495057;
}

.test-info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  border: 1px solid #dee2e6;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #495057;
}

.info-item i {
  font-size: 1.1rem;
}

/* Mobile Info Cards */
.mobile-info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  min-height: 80px;
  justify-content: center;
}

.mobile-info-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

.mobile-info-card i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.mobile-info-card .info-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mobile-info-card .info-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #212529;
  line-height: 1;
}

.mobile-info-card .info-label {
  font-size: 0.75rem;
  color: #6c757d;
  font-weight: 500;
  margin-top: 2px;
}

/* Card Styling */
.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-header {
  border-radius: 12px 12px 0 0 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

/* Student Grid */
.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
  min-height: 400px;
}

.student-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.student-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

.student-card .form-check {
  margin: 0;
}

.student-card .form-check-input {
  transform: scale(1.2);
  margin-top: 0.2rem;
}

.student-card .form-check-label {
  cursor: pointer;
  width: 100%;
}

.student-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.student-header h6 {
  color: #212529;
  margin-bottom: 0.25rem;
}

.student-roll {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

.student-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Custom scrollbar for student grid */
.student-grid::-webkit-scrollbar {
  width: 6px;
}

.student-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.student-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.student-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Date Picker Dropdown Styles */
.custom-date-picker,
.custom-datetime-picker {
  position: relative;
}

.date-input-modern,
.datetime-input-modern {
  cursor: pointer;
  padding-right: 40px;
  background-color: white;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.date-input-modern:focus,
.datetime-input-modern:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.date-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1.1rem;
  pointer-events: none;
  z-index: 5;
}

/* Date Picker Dropdown */
.date-picker-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
  animation: fadeInDown 0.2s ease-out;
  width: 100%;
}

.datetime-dropdown {
  width: 100%;
}

/* Side-by-side layout for datetime picker */
.datetime-content {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.datetime-content .date-picker-calendar {
  flex: 1;
  border-right: 1px solid #e9ecef;
  min-width: 60%;
}

.datetime-content .time-picker-section {
  flex: 0 0 40%;
  border-top: none;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Date Picker Header */
.date-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 8px 8px 0 0;
}

.month-year {
  font-size: 1rem;
  font-weight: 700;
  color: #2c3e50;
  min-width: 120px;
  text-align: center;
}

.nav-btn {
  background: #ffffff;
  border: 1px solid #dee2e6;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-btn:hover {
  background: #007bff;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,123,255,0.3);
}

/* Calendar Grid */
.date-picker-calendar {
  padding: 0.75rem;
  background-color: white;
  width: 100%;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6c757d;
  padding: 6px 2px;
  text-transform: uppercase;
  background: #f8f9fa;
  border-radius: 4px;
}

.dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.date-btn {
  border: 1px solid transparent;
  background: #ffffff;
  padding: 6px 2px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 32px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.date-btn:not(.other-month):hover {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.3);
  border-color: #007bff;
}

.date-btn.other-month {
  color: #ced4da;
  cursor: not-allowed;
  background: #f8f9fa;
}

.date-btn.disabled,
.date-btn.past-date,
.date-btn.invalid-due-date {
  color: #ced4da !important;
  cursor: not-allowed !important;
  background: #f8f9fa !important;
  opacity: 0.5;
  pointer-events: none;
}

.date-btn.invalid-due-date {
  background: #fff5f5 !important;
  border: 1px solid #fed7d7 !important;
  color: #c53030 !important;
}

.date-btn.disabled:hover,
.date-btn.past-date:hover,
.date-btn.invalid-due-date:hover {
  background: #f8f9fa !important;
  color: #ced4da !important;
  transform: none !important;
  box-shadow: none !important;
  border-color: transparent !important;
}

.date-btn.invalid-due-date:hover {
  background: #fff5f5 !important;
  color: #c53030 !important;
  border-color: #fed7d7 !important;
}

.date-btn.selected {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  font-weight: 600;
  border: 1px solid #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.3);
}

.date-btn.today {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  font-weight: 600;
  border: 1px solid #28a745;
  box-shadow: 0 2px 8px rgba(40,167,69,0.3);
}

.date-btn.selected.today {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border: 1px solid #007bff;
}

/* Time Picker Section */
.time-picker-section {
  border-top: 1px solid #e9ecef;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 100%;
}

.time-picker-header {
  font-size: 0.875rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  text-align: center;
}

.time-inputs {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.time-input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.time-input {
  width: 50px;
  padding: 8px 6px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  background: white;
  transition: all 0.3s ease;
}

.time-input:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
  transform: translateY(-1px);
}

.time-input-group label {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 4px;
  font-weight: 600;
}

.time-separator {
  font-size: 1.25rem;
  font-weight: bold;
  color: #495057;
  margin: 0 0.25rem;
  align-self: center;
  margin-top: 8px;
  line-height: 1;
}

.ampm-toggle {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 0.5rem;
  align-self: flex-start;
  margin-top: 0;
}

.ampm-btn {
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 32px;
  text-align: center;
}

.ampm-btn:hover {
  border-color: #007bff;
  background: #f8f9fa;
  transform: translateY(-1px);
}

.ampm-btn.active {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-color: #007bff;
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0,123,255,0.3);
}

.quick-time-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  justify-content: center;
  margin-top: auto;
  padding-top: 0.5rem;
}

.quick-time-buttons .btn {
  font-size: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: #495057;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.quick-time-buttons .btn:hover {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-color: #007bff;
  transform: translateY(-1px);
}

/* Date Picker Footer */
.date-picker-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 0 0 8px 8px;
  flex-wrap: wrap;
}

.date-picker-footer .btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 70px;
}

.date-picker-footer .btn:hover {
  transform: translateY(-1px);
}

.date-picker-footer .btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  color: white;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
}

.date-picker-footer .btn-success:hover {
  background: linear-gradient(135deg, #218838 0%, #1aa179 100%);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

/* Button Enhancements */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #218838 0%, #1aa179 100%);
}

/* Badge Styling */
.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.35em 0.65em;
}

/* Responsive Design */
@media (max-width: 1199.98px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 991.98px) {
  .test-info-card {
    margin-top: 1rem;
    width: 100%;
  }
  
  .test-info-card .row {
    justify-content: center;
  }
  
  .student-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    max-height: 55vh;
    min-height: 350px;
  }
  
  .row.g-lg-4 {
    row-gap: 1.5rem;
  }
}

@media (max-width: 767.98px) {
  .container-fluid {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .mobile-info-card {
    padding: 0.5rem;
    min-height: 70px;
  }
  
  .mobile-info-card i {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }
  
  .mobile-info-card .info-value {
    font-size: 1rem;
  }
  
  .mobile-info-card .info-label {
    font-size: 0.7rem;
  }
  
  .student-grid {
    grid-template-columns: 1fr;
    max-height: 50vh;
    min-height: 300px;
    gap: 0.75rem;
  }
  
  .student-card {
    padding: 0.75rem;
  }
  
  .student-name {
    font-size: 0.95rem;
  }
  
  .student-roll {
    font-size: 0.8rem;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
  
  .row.g-3 {
    row-gap: 1rem;
  }
  
  .card-header h5 {
    font-size: 1rem;
  }
  
  .form-label {
    font-size: 0.9rem;
  }
  
  .btn-lg {
    font-size: 1rem;
    padding: 0.75rem 1rem;
  }
  
  /* Date/Time Picker Mobile Optimizations */
  .date-picker-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 1050;
  }
  
  .datetime-dropdown {
    max-width: 500px;
  }
  
  .datetime-content {
    flex-direction: column;
  }
  
  .datetime-content .date-picker-calendar {
    border-right: none;
    border-bottom: 1px solid #e9ecef;
    min-width: auto;
  }
  
  .datetime-content .time-picker-section {
    flex: none;
  }
  
  .date-picker-header {
    padding: 0.75rem;
  }
  
  .month-year {
    font-size: 0.95rem;
    min-width: 100px;
  }
  
  .nav-btn {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
  
  .date-picker-calendar {
    padding: 0.5rem;
  }
  
  .weekday {
    font-size: 0.7rem;
    padding: 4px 2px;
  }
  
  .date-btn {
    min-height: 28px;
    font-size: 0.8rem;
    padding: 4px 2px;
  }
  
  .time-picker-section {
    padding: 0.75rem;
  }
  
  .time-picker-header {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
  
  .time-input {
    width: 45px;
    padding: 6px 4px;
    font-size: 0.8rem;
  }
  
  .time-input-group label {
    font-size: 0.7rem;
  }
  
  .ampm-btn {
    padding: 4px 6px;
    font-size: 0.7rem;
    min-width: 28px;
  }
  
  .quick-time-buttons {
    gap: 0.25rem;
    grid-template-columns: 1fr 1fr;
  }
  
  .quick-time-buttons .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .date-picker-footer {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    justify-content: space-between;
  }
  
  .date-picker-footer .btn {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
    min-width: 60px;
    flex: 1;
    max-width: 80px;
  }
}

@media (max-width: 575.98px) {
  .container-fluid {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .mobile-info-card {
    padding: 0.375rem;
    min-height: 60px;
  }
  
  .mobile-info-card i {
    font-size: 1.1rem;
    margin-bottom: 0.125rem;
  }
  
  .mobile-info-card .info-value {
    font-size: 0.9rem;
  }
  
  .mobile-info-card .info-label {
    font-size: 0.65rem;
  }
  
  .student-grid {
    min-height: 250px;
    max-height: 45vh;
  }
  
  .student-card {
    padding: 0.5rem;
  }
  
  .form-check-label {
    font-size: 0.9rem;
  }
  
  .card-header {
    padding: 0.75rem;
  }
  
  .card-body {
    padding: 0.75rem;
  }
  
  .btn-sm {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
  
  .date-picker-dropdown {
    width: 95vw;
    max-width: 350px;
  }
  
  .time-inputs {
    gap: 0.25rem;
    justify-content: space-around;
  }
  
  .quick-time-buttons {
    grid-template-columns: 1fr 1fr;
  }
}

/* Touch-friendly improvements */
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  .btn-sm {
    min-height: 38px;
    min-width: 38px;
  }
  
  .form-check-input {
    transform: scale(1.2);
  }
  
  .date-btn {
    min-height: 36px;
  }
  
  .time-input {
    min-height: 40px;
  }
  
  .ampm-btn {
    min-height: 36px;
    min-width: 36px;
  }
}

/* Landscape mobile improvements */
@media (max-width: 767.98px) and (orientation: landscape) {
  .student-grid {
    max-height: 35vh;
    min-height: 200px;
  }
  
  .date-picker-dropdown {
    max-height: 70vh;
  }
  
  .datetime-content {
    flex-direction: row;
  }
  
  .datetime-content .date-picker-calendar {
    border-right: 1px solid #e9ecef;
    border-bottom: none;
    min-width: 60%;
  }
  
  .datetime-content .time-picker-section {
    flex: 0 0 40%;
  }
}

/* Container and Layout Improvements */
.container-fluid {
  max-width: 1400px;
}

/* Card Layout Improvements */
.card.h-100 {
  display: flex;
  flex-direction: column;
}

.card-body.d-flex.flex-column {
  flex: 1;
}

/* Form enhancements */
.form-control {
  border-radius: 8px;
  border: 1px solid #ced4da;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

/* Improved Helper Text */
.helper-text-improved {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #1565c0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.helper-text-improved i {
  font-size: 1.1rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.helper-text-improved span {
  line-height: 1.4;
}

.helper-text-improved strong {
  color: #0d47a1;
  font-weight: 600;
}

/* Helper Text Collapsible */
.helper-text-collapsible {
  background: linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%);
  border: 1px solid #bbdefb;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.helper-content {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #1565c0;
  line-height: 1.4;
}

.helper-content strong {
  color: #0d47a1;
  font-weight: 600;
}

/* Helper Toggle Button */
.helper-toggle {
  border: none !important;
  text-decoration: none !important;
  font-size: 1rem;
  transition: all 0.2s ease;
  vertical-align: middle;
}

.helper-toggle:hover {
  color: #0d47a1 !important;
  transform: scale(1.1);
}

.helper-toggle:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  outline: none;
}

/* Slide down animation */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation for cards */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: slideInUp 0.3s ease-out;
}

/* Loading spinner enhancement */
.spinner-border {
  animation-duration: 0.8s;
}

/* Focus states for accessibility */
.btn:focus,
.form-control:focus,
.form-check-input:focus {
  outline: none;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .date-picker-dropdown {
    background: #2d3748;
    color: #e2e8f0;
   
  }
  
  .date-picker-header {
  
  }
  
  .time-picker-section {
   
  }
  
  .weekday {
    color: #a0aec0;
  }
  
  .date-btn:not(.other-month):hover {
    background-color: #4299e1;
    color: white;
  }
  
  .date-btn.other-month {
    color: #718096;
  }
  
  .time-input {
    
    border-color: #718096;
   
  }
}

/* Validation Status Alerts */
.alert {
  padding: 0.5rem 0.75rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.alert small {
  margin: 0;
  font-weight: 500;
}

.alert i {
  font-size: 1rem;
  flex-shrink: 0;
}

.alert-success {
  background-color: #d1eddd;
  color: #155724;
}

.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
}

/* Assignment Details Card Spacing */
.card-body .mb-3:last-of-type {
  margin-bottom: 1.5rem !important;
}

/* Animation for cards */

/* Mobile Header Buttons */
.d-block.d-lg-none .btn {
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.d-block.d-lg-none .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.d-block.d-lg-none .btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  color: white;
}

.d-block.d-lg-none .btn-primary:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
}

.d-block.d-lg-none .btn-outline-dark {
  border: 2px solid #495057;
  color: #495057;
  background: white;
}

.d-block.d-lg-none .btn-outline-dark:hover {
  background: #495057;
  color: white;
  border-color: #495057;
}

.toggle-label-fixed {
  min-width: 110px;
  display: inline-block;
  text-align: left;
  transition: all 0.3s ease;
  white-space: nowrap;
}

/* Enhanced Form Switch Styling */
.form-check.form-switch .form-check-input {
  width: 2.5rem;
  height: 1.25rem;
  background-color: #dee2e6;
  border: 2px solid #dee2e6;
  border-radius: 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.form-check.form-switch .form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-check.form-switch .form-check-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.form-check.form-switch .form-check-input:hover {
  transform: scale(1.05);
}
</style> 