<template>
  <div class="take-exam-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading exam...</span>
      </div>
      <p class="loading-text">Loading exam questions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error Loading Exam</h4>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="retryLoadExam">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    </div>

    <!-- Main Exam Interface -->
    <div v-else class="exam-container" :class="{ 'with-recovery-notification': showRecoveryNotification }">
      <!-- Exam Header -->
      <div class="exam-header">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-md-4 col-12 text-center">
              <h1 class="exam-title">{{ examData.title }}</h1>
              <div class="exam-info">
                <span>{{ examData.subject }}</span> • <span>{{ examData.total_marks }}</span> Marks • <span>{{ questions.length }}</span> Questions
              </div>
            </div>
            <div class="col-md-3 col-12">
              <div class="progress-container">
                <div class="d-flex justify-content-between mb-1">
                  <small>Progress</small>
                  <small>{{ answeredCount }}/{{ questions.length }}</small>
                </div>
                <div class="progress">
                  <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
                </div>
              </div>
            </div>
            <div class="col-md-5 col-12">
              <div class="row g-2 align-items-center">
                <div class="col-6">
                  <div class="timer-container" :class="timerClass">
                    <div class="timer-display">{{ formattedTime }}</div>
                    <div class="timer-label">Time Remaining</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="student-info">
                    <div class="student-content">
                      <div class="student-name">{{ studentName }}</div>
                      <div class="student-label">Student</div>
                    </div>
                    <div class="nav-menu-wrapper">
                      <button 
                        class="btn btn-nav-menu" 
                        @click="toggleNavigationPanel"
                        :class="{ 'active': showNavigationPanel }"
                        title="Question Navigation"
                      >
                        <i class="bi bi-grid-3x3-gap-fill"></i>
                        <span class="nav-count">{{ questions.length }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- iOS Notice Bar - Only shown on iOS devices -->
      <div v-if="isIOSDevice" class="ios-notice-bar">
        <div class="container-fluid">
          <div class="alert alert-info mb-0 py-2 text-center">
            <small>
              <i class="bi bi-info-circle me-1"></i>
              <strong>iOS Notice:</strong> Fullscreen mode is not available on iPhone. Please avoid switching apps during your exam.
            </small>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="exam-content">
        <!-- Question Panel -->
        <div class="question-panel">
          <div class="question-header">
            <div class="question-number">Question {{ currentQuestionIndex + 1 }}</div>
            <div class="question-timer">
              <div class="timer-icon">
                <i class="bi bi-stopwatch"></i>
              </div>
              <div class="timer-info">
                <div class="timer-current">{{ formatQuestionTime(currentQuestionTime) }}</div>
                <div class="timer-label">Time on Question</div>
              </div>
            </div>
          </div>
          
          <div class="question-text" v-if="currentQuestion" v-html="currentQuestion.question_text"></div>
          
          <!-- Question Image -->
          <div v-if="currentQuestion?.question_image" class="question-image">
            <img :src="currentQuestion.question_image" :alt="'Question ' + (currentQuestionIndex + 1)" class="img-fluid">
          </div>

          <div class="option-container" v-if="currentQuestion">
            <div 
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="option-item"
              :class="{ selected: answers[currentQuestionIndex] === index }"
              @click="selectOption(index)"
            >
              <div class="option-radio"></div>
              <div class="option-text">{{ String.fromCharCode(65 + index) }}. {{ option }}</div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="nav-buttons">
            <!-- Action buttons row -->
            <div class="action-buttons">
              <button 
                class="btn btn-mark"
                :class="{ active: markedQuestions.has(currentQuestionIndex) }"
                @click="toggleMark"
              >
                <i class="bi bi-bookmark-fill" v-if="markedQuestions.has(currentQuestionIndex)"></i>
                <i class="bi bi-bookmark" v-else></i>
                {{ markedQuestions.has(currentQuestionIndex) ? 'Marked' : 'Mark for Review' }}
              </button>
              <button 
                class="btn btn-clear" 
                @click="clearAnswer"
                :disabled="!answers[currentQuestionIndex]"
              >
                <i class="bi bi-x-circle"></i> Clear Response
              </button>
            </div>
            
            <!-- Navigation buttons row (50-50) -->
            <div class="nav-buttons-row">
              <button 
                class="btn btn-nav btn-previous" 
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
              >
                <i class="bi bi-arrow-left"></i> Previous
              </button>
              <button 
                class="btn btn-nav btn-next" 
                @click="saveAndNext"
                :disabled="isSubmittingAnswer"
              >
                <span v-if="isSubmittingAnswer" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next' }} 
                <i class="bi bi-arrow-right" v-if="!isSubmittingAnswer"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation Panel -->
        <div class="navigation-panel" :class="{ 'panel-open': showNavigationPanel }">
          <!-- Close Button -->
          <div class="panel-header">
            <button class="btn btn-close-panel" @click="toggleNavigationPanel">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <!-- Question Status Legend -->
          <div class="nav-section">
            <div class="nav-title">Question Status</div>
            <div class="legend">
              <div class="legend-row">
                <div class="legend-item">
                  <div class="legend-color not-visited"></div>
                  <span>Not Visited</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color not-answered"></div>
                  <span>Not Answered</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color answered"></div>
                  <span>Answered</span>
                </div>
              </div>
              <div class="legend-row">
                <div class="legend-item">
                  <div class="legend-color marked"></div>
                  <span>Marked for Review</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color answered-marked"></div>
                  <span>Answered and Marked</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Question Grid -->
          <div class="nav-section">
            <!-- Navigation header -->
            <div class="nav-header">
              <div class="nav-title">Question Navigation</div>
              <!-- Navigation summary -->
              <div class="nav-summary">
                <div class="summary-item">
                  <span class="summary-count text-success">{{ answeredCount }}</span>
                  <span class="summary-label">Answered</span>
                </div>
                <div class="summary-item">
                  <span class="summary-count text-warning">{{ markedQuestions.size }}</span>
                  <span class="summary-label">Marked</span>
                </div>
              </div>
            </div>
            <div class="question-grid">
              <button 
                v-for="(question, index) in questions"
                :key="question.id"
                class="question-btn"
                :class="getQuestionBtnClass(index)"
                @click="loadQuestion(index)"
              >
                {{ index + 1 }}
              </button>
            </div>
          </div>

          <!-- Submit Section -->
          <div class="submit-section">
            <button 
              class="btn btn-submit"
              @click="showSubmitConfirmation = true"
              :disabled="isSubmittingExam"
            >
              <span v-if="isSubmittingExam" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ isSubmittingExam ? 'Submitting...' : 'Submit Exam' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Fullscreen Warning Modal - Only show for devices that support fullscreen -->
    <div v-if="showFullscreenWarning && isFullscreenSupported">
      <div class="modal-backdrop fade show"></div>
      <div class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-warning">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle"></i> Fullscreen Required
              </h5>
            </div>
            <div class="modal-body">
              <p>This exam must be taken in fullscreen mode for security purposes.</p>
              <p>Please click "Enter Fullscreen" to continue with your exam.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-warning" @click="enterFullscreen">
                <i class="bi bi-arrows-fullscreen"></i> Enter Fullscreen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Exit Warning Modal - Only show for devices that support fullscreen -->
    <div v-if="showExitWarning && isFullscreenSupported">
      <div class="modal-backdrop fade show"></div>
      <div class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">
                <i class="bi bi-exclamation-triangle"></i> Warning: Fullscreen Exited
              </h5>
            </div>
            <div class="modal-body">
              <p><strong>You have exited fullscreen mode!</strong></p>
              <p>This action has been recorded. Please return to fullscreen mode immediately to continue your exam.</p>
              <p class="text-danger">Multiple violations may result in automatic submission of your exam.</p>
            </div>
            <div class="modal-footer">
              <button class="btn btn-danger" @click="returnToFullscreen">
                <i class="bi bi-arrows-fullscreen"></i> Return to Fullscreen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <div v-if="showSubmitConfirmation">
      <div class="modal-backdrop fade show"></div>
      <div class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="bi bi-check-circle"></i> Submit Exam
              </h5>
            </div>
            <div class="modal-body">
              <p><strong>Are you sure you want to submit your exam?</strong></p>
              <div class="submission-summary">
                <p>Questions Answered: <strong>{{ answeredCount }} / {{ questions.length }}</strong></p>
                <p>Questions Marked: <strong>{{ markedQuestions.size }}</strong></p>
                <p>Time Remaining: <strong>{{ formattedTime }}</strong></p>
              </div>
              <p class="text-warning">
                <i class="bi bi-exclamation-triangle"></i>
                Once submitted, you cannot make any changes to your answers.
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showSubmitConfirmation = false">
                Cancel
              </button>
              <button 
                type="button" 
                class="btn btn-danger" 
                @click="submitExam"
                :disabled="isSubmittingExam"
              >
                <span v-if="isSubmittingExam" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ isSubmittingExam ? 'Submitting...' : 'Yes, Submit' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recovery Notification -->
    <div v-if="showRecoveryNotification" class="recovery-notification">
      <div class="container-fluid">
        <div class="alert alert-success alert-dismissible mb-0 py-2 text-center">
          <small>
            <i class="bi bi-check-circle me-1"></i>
            <strong>Exam Restored:</strong> Your previous answers have been recovered. You can continue from where you left off.
          </small>
          <button type="button" class="btn-close btn-close-sm" @click="showRecoveryNotification = false"></button>
        </div>
      </div>
    </div>

    <!-- Offline Warning Notification -->
    <div v-if="showOfflineWarning" class="offline-notification">
      <div class="container-fluid">
        <div class="alert alert-warning alert-dismissible mb-0 py-2 text-center">
          <small>
            <i class="bi bi-wifi-off me-1"></i>
            <strong>Connection Lost:</strong> You are currently offline. Your answers are being saved locally and will sync when connection is restored.
          </small>
          <button type="button" class="btn-close btn-close-sm" @click="showOfflineWarning = false"></button>
        </div>
      </div>
    </div>

    <!-- Navigation Panel Backdrop -->
    <div v-if="showNavigationPanel" class="navigation-backdrop" @click="toggleNavigationPanel"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import testAssignmentService from '@/services/testAssignmentService'

// Types
interface ExamData {
  title: string
  subject: string
  total_marks: number
  timeRemaining?: number
  duration_minutes?: number
  attemptId: number
  questions: Question[]
}

interface Question {
  id: number
  question_id: number
  question_text: string
  question_text_id?: number
  question_image?: string
  options: string[]
  option_ids?: number[]
}

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element
  msFullscreenElement?: Element
}

const route = useRoute()
const router = useRouter()

// Reactive data
const isLoading = ref(true)
const error = ref('')
const examData = ref<ExamData>({} as ExamData)
const attemptId = ref<number | null>(null)
const currentQuestionIndex = ref(0)
const questions = ref<Question[]>([])
const answers = reactive<{ [key: number]: number }>({})
const markedQuestions = ref(new Set<number>())
const visitedQuestions = ref(new Set<number>())
const timeRemaining = ref(0)
const timer = ref<NodeJS.Timeout | null>(null)
const questionStartTime = ref(0)
const questionTimeSpent = ref<{ [key: number]: number }>({})
const currentQuestionTime = ref(0)
const questionTimer = ref<NodeJS.Timeout | null>(null)
const autoSaveTimer = ref<NodeJS.Timeout | null>(null)
const showFullscreenWarning = ref(false)
const studentName = ref('')
const showExitWarning = ref(false)
const showSubmitConfirmation = ref(false)
const fullscreenChecker = ref<NodeJS.Timeout | null>(null)
const showRecoveryNotification = ref(false)

// Device detection
const isIOSDevice = ref(false)
const isFullscreenSupported = ref(true)

// Additional reactive variables
const isSubmittingAnswer = ref(false)
const isSubmittingExam = ref(false)
const showNavigationPanel = ref(false)
const isOnline = ref(navigator.onLine)
const showOfflineWarning = ref(false)

// Network status monitoring
const handleOnlineStatus = () => {
  isOnline.value = navigator.onLine
  if (!isOnline.value) {
    showOfflineWarning.value = true
    console.warn('Device went offline during exam')
  } else {
    showOfflineWarning.value = false
    console.log('Device back online')
    // Try to save state when back online
    saveExamState()
  }
}

// State persistence functions
const saveExamState = () => {
  if (!attemptId.value) return
  
  const examState = {
    attemptId: attemptId.value,
    currentQuestionIndex: currentQuestionIndex.value,
    answers: { ...answers },
    markedQuestions: Array.from(markedQuestions.value),
    visitedQuestions: Array.from(visitedQuestions.value),
    timeRemaining: timeRemaining.value,
    questionTimeSpent: questionTimeSpent.value,
    timestamp: Date.now()
  }
  
  try {
    const stateString = JSON.stringify(examState)
    
    // Check if localStorage is available and has enough space
    if (typeof Storage !== 'undefined') {
      // Test localStorage availability (might fail in private mode)
      localStorage.setItem('test_storage', 'test')
      localStorage.removeItem('test_storage')
      
      // Try to save the state
      localStorage.setItem(`exam_state_${attemptId.value}`, stateString)
      console.log('Exam state saved to localStorage')
    } else {
      console.warn('localStorage not available, state not saved')
      // Fallback: try to use sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(`exam_state_${attemptId.value}`, stateString)
        console.log('Exam state saved to sessionStorage (fallback)')
      }
    }
  } catch (error) {
    console.error('Failed to save exam state:', error)
    
    // Handle quota exceeded error (common on mobile)
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('Storage quota exceeded, clearing old data and retrying...')
      try {
        // Clear old exam states to free up space
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('exam_state_') && key !== `exam_state_${attemptId.value}`) {
            localStorage.removeItem(key)
          }
        }
        // Retry saving
        localStorage.setItem(`exam_state_${attemptId.value}`, JSON.stringify(examState))
        console.log('Exam state saved after clearing old data')
      } catch (retryError) {
        console.error('Failed to save exam state even after clearing old data:', retryError)
        // Show user warning about potential data loss
        if (Object.keys(answers).length > 0) {
          console.warn('Unable to save exam progress locally. Please ensure you have a stable connection.')
        }
      }
    } else if (error.name === 'SecurityError') {
      console.warn('Storage access blocked (private browsing mode?)')
    } else {
      console.error('Unknown storage error:', error)
    }
  }
}

const loadExamState = (): boolean => {
  if (!attemptId.value) return false
  
  try {
    const savedState = localStorage.getItem(`exam_state_${attemptId.value}`)
    if (!savedState) return false
    
    const examState = JSON.parse(savedState)
    
    // Verify state is not too old (max 24 hours)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    if (Date.now() - examState.timestamp > maxAge) {
      localStorage.removeItem(`exam_state_${attemptId.value}`)
      return false
    }
    
    // Check if there are any answers to restore
    const hasAnswers = examState.answers && Object.keys(examState.answers).length > 0
    
    // Restore state
    currentQuestionIndex.value = examState.currentQuestionIndex || 0
    Object.assign(answers, examState.answers || {})
    markedQuestions.value = new Set(examState.markedQuestions || [])
    visitedQuestions.value = new Set(examState.visitedQuestions || [])
    questionTimeSpent.value = examState.questionTimeSpent || {}
    
    console.log('Exam state loaded from localStorage', {
      answers: Object.keys(answers).length,
      currentQuestion: currentQuestionIndex.value
    })
    
    // Show recovery notification if there are answers to restore
    if (hasAnswers) {
      showRecoveryNotification.value = true
      // Auto-hide notification after 8 seconds
      setTimeout(() => {
        showRecoveryNotification.value = false
      }, 8000)
    }
    
    return true
  } catch (error) {
    console.error('Failed to load exam state:', error)
    return false
  }
}

const clearExamState = () => {
  if (!attemptId.value) return
  
  try {
    localStorage.removeItem(`exam_state_${attemptId.value}`)
    console.log('Exam state cleared from localStorage')
  } catch (error) {
    console.error('Failed to clear exam state:', error)
  }
}

// Enhanced auto-save with state persistence
const saveCurrentAnswerWithState = async () => {
  await saveCurrentAnswer()
  saveExamState() // Save state after every answer
}

// Page visibility API to handle screen sleep/wake
const handleVisibilityChange = () => {
  if (document.hidden) {
    // Page is hidden (screen sleep, tab switch, etc.)
    console.log('Page hidden - saving exam state')
    saveExamState()
  } else {
    // Page is visible again
    console.log('Page visible - checking for state recovery')
    // Optionally refresh data or check for updates
  }
}

// Enhanced beforeunload handler
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  // Save state before page unload
  saveExamState()
  
  // Show warning for accidental navigation
  const message = 'Your exam is in progress. Are you sure you want to leave?'
  event.returnValue = message
  return message
}

// Methods
const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  isIOSDevice.value = /iphone|ipod/.test(userAgent) && !window.MSStream
  
  // Check if fullscreen API is actually supported
  const element = document.documentElement as FullscreenElement
  isFullscreenSupported.value = !!(
    element.requestFullscreen || 
    element.webkitRequestFullscreen || 
    element.msRequestFullscreen
  )
  
  // iOS iPhones don't support fullscreen API
  if (isIOSDevice.value) {
    isFullscreenSupported.value = false
  }
}

// Computed properties
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const answeredCount = computed(() => Object.keys(answers).length)
const progressPercentage = computed(() => 
  questions.value.length > 0 ? (answeredCount.value / questions.value.length) * 100 : 0
)

const formattedTime = computed(() => {
  const hours = Math.floor(timeRemaining.value / 3600)
  const minutes = Math.floor((timeRemaining.value % 3600) / 60)
  const seconds = timeRemaining.value % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const timerClass = computed(() => {
  if (timeRemaining.value <= 300) return 'timer-critical'
  if (timeRemaining.value <= 900) return 'timer-warning'
  return ''
})

// Format question time in MM:SS format
const formatQuestionTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Methods
const initializeExam = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    // Check for assignment ID in multiple query parameter names
    const assignmentId = Number(route.query.assignmentId) || Number(route.query.test)
    if (!assignmentId) {
      throw new Error('Assignment ID is required')
    }

    // Start the exam
    const examResponse = await testAssignmentService.startExam(assignmentId)
    examData.value = examResponse
    attemptId.value = examResponse.attemptId
    questions.value = examResponse.questions
    
    // Try to load saved state first
    const stateLoaded = loadExamState()
    
    // Set up timer
    if ('timeRemaining' in examResponse && examResponse.timeRemaining !== undefined) {
      timeRemaining.value = examResponse.timeRemaining
    } else if ('duration_minutes' in examResponse && examResponse.duration_minutes) {
      // Calculate time remaining based on duration
      timeRemaining.value = examResponse.duration_minutes * 60
    } else {
      // Default to 1 hour if no duration specified
      timeRemaining.value = 3600
    }
  
    // Get student info from localStorage or API
    studentName.value = localStorage.getItem('studentName') ?? 'Student'
  
    // Start timer
    startTimer()
    
    // If no saved state, initialize fresh
    if (!stateLoaded) {
      // Mark first question as visited and start question timer
      visitedQuestions.value.add(0)
      currentQuestionIndex.value = 0
    }
    
    // Always ensure current question is visited
    visitedQuestions.value.add(currentQuestionIndex.value)
    questionStartTime.value = Date.now()
    currentQuestionTime.value = Math.floor((questionTimeSpent.value[currentQuestionIndex.value] ?? 0) / 1000)
    
    // Start question timer
    questionTimer.value = setInterval(() => {
      currentQuestionTime.value++
    }, 1000)
    
    // Enhanced auto-save with state persistence (every 10 seconds for better reliability)
    autoSaveTimer.value = setInterval(async () => {
      await saveCurrentAnswerWithState()
    }, 10000)
    
    // Check fullscreen
    checkFullscreen()
    
    // Start periodic fullscreen monitoring
    startFullscreenMonitoring()
    
    // Save initial state
    saveExamState()
    
    isLoading.value = false
    
    console.log('Exam initialized', {
      stateLoaded,
      answersCount: Object.keys(answers).length,
      currentQuestion: currentQuestionIndex.value
    })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load exam'
    error.value = errorMessage
    isLoading.value = false
  }
}

const retryLoadExam = () => {
  initializeExam()
}

const loadQuestion = async (index: number) => {
  if (index < 0 || index >= questions.value.length) return
  
  // Save current answer before navigating away
  await saveCurrentAnswerWithState()
  
  // Record time spent on previous question
  if (questionStartTime.value > 0 && currentQuestionIndex.value >= 0) {
    const timeSpent = Date.now() - questionStartTime.value
    if (!questionTimeSpent.value[currentQuestionIndex.value]) {
      questionTimeSpent.value[currentQuestionIndex.value] = 0
    }
    questionTimeSpent.value[currentQuestionIndex.value] += timeSpent
  }
  
  // Stop previous question timer
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
  }
  
  currentQuestionIndex.value = index
  questionStartTime.value = Date.now()
  visitedQuestions.value.add(index)
  
  // Initialize current question time with previously spent time
  currentQuestionTime.value = Math.floor((questionTimeSpent.value[index] ?? 0) / 1000)
  
  // Start new question timer
  questionTimer.value = setInterval(() => {
    currentQuestionTime.value++
  }, 1000)
  
  // Save state after navigation
  saveExamState()
  
  // Close navigation panel after question selection (mobile only)
  if (window.innerWidth <= 768) {
    showNavigationPanel.value = false
  }
}

const selectOption = (optionIndex: number) => {
  console.log('=== SELECT OPTION DEBUG ===')
  console.log('currentQuestionIndex.value:', currentQuestionIndex.value)
  console.log('optionIndex:', optionIndex)
  console.log('answers before:', answers)
  console.log('answers keys before:', Object.keys(answers))
  
  // Store the answer locally (no API call yet)
  answers[currentQuestionIndex.value] = optionIndex
  
  console.log('answers after:', answers)
  console.log('answers keys after:', Object.keys(answers))
  console.log('answers stringified:', JSON.stringify(answers))
  console.log('answers[currentQuestionIndex.value]:', answers[currentQuestionIndex.value])
  
  // Immediately save state when answer is selected (critical for mobile)
  saveExamState()
  
  // Also trigger immediate API save (don't wait for auto-save)
  saveCurrentAnswerWithState().catch(error => {
    console.error('Failed to save answer immediately:', error)
  })
}

// Save current answer to API
const saveCurrentAnswer = async () => {
  if (!attemptId.value || !currentQuestion.value || answers[currentQuestionIndex.value] === undefined) {
    return // No answer to save
  }
  
  const question = currentQuestion.value
  const optionIndex = answers[currentQuestionIndex.value]
  const questionTextId = question.question_text_id ?? question.question_id
  const selectedOptionId = question.option_ids?.[optionIndex]
  
  if (!selectedOptionId) {
    console.error('No option ID found for index:', optionIndex, 'in option_ids:', question.option_ids)
    return
  }
  
  const timeSpent = currentQuestionTime.value
  
  const submissionData = {
    test_attempt_id: attemptId.value,
    question_id: question.question_id,
    question_text_id: questionTextId,
    selected_option_id: selectedOptionId,
    time_spent_seconds: timeSpent,
    is_flagged: markedQuestions.value.has(currentQuestionIndex.value)
  }
  
  console.log('Saving answer:', submissionData)
  
  try {
    await testAssignmentService.submitAnswer(submissionData)
    console.log('Answer saved successfully')
  } catch (error) {
    console.error('Error saving answer:', error)
    // Don't block navigation, just log the error
  }
}

const saveAndNext = async () => {
  if (isSubmittingAnswer.value) return
  
  isSubmittingAnswer.value = true
  
  // Save current answer and move to next question
  if (currentQuestionIndex.value < questions.value.length - 1) {
    await nextQuestion()
  } else {
    // Save current answer before submitting exam
    await saveCurrentAnswer()
    submitExam()
  }
  
  isSubmittingAnswer.value = false
}

const previousQuestion = async () => {
  if (currentQuestionIndex.value > 0) {
    await loadQuestion(currentQuestionIndex.value - 1)
  }
}

const nextQuestion = async () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    await loadQuestion(currentQuestionIndex.value + 1)
  }
}

const toggleMark = () => {
  if (markedQuestions.value.has(currentQuestionIndex.value)) {
    markedQuestions.value.delete(currentQuestionIndex.value)
  } else {
    markedQuestions.value.add(currentQuestionIndex.value)
  }
  saveExamState() // Save state after marking/unmarking
}

const clearAnswer = () => {
  delete answers[currentQuestionIndex.value]
  saveExamState() // Save state after clearing answer
}

const startTimer = () => {
  timer.value = setInterval(() => {
    timeRemaining.value--
    if (timeRemaining.value <= 0) {
      clearInterval(timer.value)
      autoSubmitExam()
    }
  }, 1000)
}

const submitExam = async () => {
  if (isSubmittingExam.value) return
  
  try {
    isSubmittingExam.value = true
    
    // Save final state before submission
    await saveCurrentAnswerWithState()
    
    console.log('=== EXAM SUBMISSION DEBUG ===')
    console.log('attemptId.value:', attemptId.value)
    
    if (attemptId.value) {
      const submissionData = {
        test_attempt_id: attemptId.value
      }
      
      console.log('Final submission data:', submissionData)
      
      const response = await testAssignmentService.submitExam(submissionData)
      
      console.log('Submission response:', response)
      
      // Clear saved state after successful submission
      clearExamState()
      
      showSubmitConfirmation.value = false
      
      // Add a small delay before navigating to give backend time to process
      setTimeout(() => {
        // Navigate to result page
        router.push({
          path: '/student/exam/result',
          query: { attemptId: attemptId.value }
        })
      }, 500) // 500ms delay
    }
  } catch (error) {
    console.error('Failed to submit exam:', error)
    
    // Handle specific error types
    if (error.response?.status === 401) {
      alert('Your session has expired. Please log in again and restart the exam.')
      router.push('/login')
    } else if (error.response?.status === 404) {
      alert('Exam not found. Please contact support.')
    } else if (error.response?.status === 409) {
      alert('Exam has already been submitted.')
      router.push(`/student/exam/result?attemptId=${attemptId.value}`)
    } else {
      alert('Failed to submit exam. Please try again.')
    }
  } finally {
    isSubmittingExam.value = false
    showSubmitConfirmation.value = false
  }
}

const autoSubmitExam = async () => {
  const MAX_RETRIES = 3
  let retryCount = 0
  
  const attemptAutoSubmission = async (): Promise<any> => {
    try {
      isSubmittingExam.value = true
      
      // Save the current answer before auto-submitting
      await saveCurrentAnswerWithState()
      
      if (attemptId.value) {
        const submissionData = {
          test_attempt_id: attemptId.value
        }
        
        const response = await testAssignmentService.submitExam(submissionData)
        
        // Clear saved state after successful submission
        clearExamState()
        
        // Navigate to result page
        router.push({
          path: '/student/exam/result',
          query: { attemptId: attemptId.value }
        })
        
        return response
      }
    } catch (error) {
      console.error(`Auto-submission attempt ${retryCount + 1} failed:`, error)
      
      // Check if it's a network error and we can retry
      if (retryCount < MAX_RETRIES && (
        error.code === 'NETWORK_ERROR' || 
        error.code === 'ECONNABORTED' ||
        error.response?.status >= 500 ||
        !error.response // Network timeout
      )) {
        retryCount++
        console.log(`Retrying auto-submission (${retryCount}/${MAX_RETRIES})...`)
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
        return attemptAutoSubmission()
      }
      
      // If auto-submission fails after retries, save state and show error
      console.error('Auto-submission failed after retries, preserving exam state')
      error.value = 'Time expired but failed to submit exam automatically. Your answers have been saved. Please check your connection and try submitting manually.'
      
      // Don't navigate away, let user try manual submission
      throw error
    }
  }
  
  try {
    await attemptAutoSubmission()
  } catch (err) {
    console.error('Final auto-submission error:', err)
    // Keep the exam interface open so user can try manual submission
  } finally {
    isSubmittingExam.value = false
  }
}

const getQuestionBtnClass = (index: number) => {
  const classes = ['question-btn']
  
  if (index === currentQuestionIndex.value) {
    classes.push('current')
  }
  
  const isVisited = visitedQuestions.value.has(index)
  const isAnswered = answers[index] !== undefined
  const isMarked = markedQuestions.value.has(index)
  
  if (!isVisited) {
    classes.push('not-visited')
  } else if (isAnswered && isMarked) {
    classes.push('answered-marked')
  } else if (isAnswered) {
    classes.push('answered')
  } else if (isMarked) {
    classes.push('marked')
  } else {
    classes.push('not-answered')
  }
  
  return classes.join(' ')
}

const checkFullscreen = () => {
  // Skip fullscreen check for iOS devices
  if (isIOSDevice.value || !isFullscreenSupported.value) {
    return
  }
  
  const doc = document as FullscreenDocument
  const isFullscreen = !!(
    document.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.msFullscreenElement
  )

  if (!isFullscreen) {
    showFullscreenWarning.value = true
  }
}

const enterFullscreen = () => {
  // Skip fullscreen for iOS devices since it's not supported
  if (isIOSDevice.value || !isFullscreenSupported.value) {
    console.log('Fullscreen not supported on this device, proceeding without fullscreen')
    showFullscreenWarning.value = false
    return
  }
  
  const element = document.documentElement as FullscreenElement
  
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
  
  showFullscreenWarning.value = false
}

const returnToFullscreen = () => {
  enterFullscreen()
  showExitWarning.value = false
}

const startFullscreenMonitoring = () => {
  // Skip fullscreen monitoring for iOS devices
  if (isIOSDevice.value || !isFullscreenSupported.value) {
    return
  }
  
  fullscreenChecker.value = setInterval(() => {
    const doc = document as FullscreenDocument
    const isFullscreen = !!(
      document.fullscreenElement ?? 
      doc.webkitFullscreenElement ?? 
      doc.msFullscreenElement
    )

    if (!isFullscreen && !showExitWarning.value && !showFullscreenWarning.value && !showSubmitConfirmation.value) {
      showExitWarning.value = true
    }
  }, 1000)
}

// Test function for debugging
const testAddAnswers = () => {
  console.log('Adding test answers...')
  answers[0] = 0
  answers[1] = 1
  answers[2] = 2
  console.log('Test answers added:', answers)
}

const toggleNavigationPanel = () => {
  showNavigationPanel.value = !showNavigationPanel.value
}

// Security functions to prevent cheating
const blockBackNavigation = () => {
  window.history.pushState(null, '', window.location.href)
  
  window.addEventListener('popstate', (event) => {
    window.history.pushState(null, '', window.location.href)
    // Don't show confirmation during exam, just block navigation
    event.preventDefault()
    return false
  })
  
  // Block keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.altKey && e.key === 'ArrowLeft') ||
        (e.altKey && e.key === 'ArrowRight') ||
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u') ||
        e.key === 'F12') {
      e.preventDefault()
      return false
    }
  })
  
  // Block right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    return false
  })
  
  // Block text selection
  document.addEventListener('selectstart', (e) => {
    e.preventDefault()
    return false
  })
  
  // Block drag and drop
  document.addEventListener('dragstart', (e) => {
    e.preventDefault()
    return false
  })
}

// Lifecycle hooks
onMounted(() => {
  initializeExam()
  blockBackNavigation()
  detectDevice() // Call detectDevice on mount
  
  // Expose test function for debugging
  ;(window as Window & { testAddAnswers?: () => void; debugAnswers?: () => void }).testAddAnswers = testAddAnswers
  ;(window as Window & { testAddAnswers?: () => void; debugAnswers?: () => void }).debugAnswers = () => {
    console.log('Current answers:', answers)
    console.log('Current answers keys:', Object.keys(answers))
    console.log('Current answers stringified:', JSON.stringify(answers))
  }

  // Add event listeners for page visibility and beforeunload
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  if (questionTimer.value) {
    clearInterval(questionTimer.value)
  }
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value)
  }
  if (fullscreenChecker.value) {
    clearInterval(fullscreenChecker.value)
  }

  // Remove event listeners
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOnlineStatus)
})
</script>

<style scoped>
body {
  background-color: #f8f9fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

/* Loading and Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
}

.loading-text {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #6c757d;
}

/* Fullscreen styles */
.exam-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Exam container adjustments for recovery notification */
.exam-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: padding-top 0.3s ease;
}

.exam-container.with-recovery-notification {
  padding-top: 60px; /* Adjust based on notification height */
}

/* Header styles */
.exam-header {
  background: #000000;
  color: white;
  padding: 15px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* Header Layout Fix - Force horizontal layout */
.exam-header .col-md-5 .row {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
}

.exam-header .col-md-5 .col-6 {
  flex: 0 0 50% !important;
  max-width: 50% !important;
  padding: 0 4px;
}

.exam-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.exam-info {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Timer styles */
.timer-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 15px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 60px;
}

.timer-display {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
}

.timer-label {
  font-size: 0.7rem;
  color: #6c757d;
  margin-top: 2px;
}

.timer-warning {
  animation: pulse 1s infinite;
  background: rgba(255, 193, 7, 0.2) !important;
}

.timer-critical {
  animation: pulse 0.5s infinite;
  background: rgba(220, 53, 69, 0.2) !important;
}

/* Student Info Styles */
.student-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
}

.student-content {
  flex: 1;
}

.student-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  line-height: 1.2;
}

.student-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}

.nav-menu-wrapper {
  margin-left: 8px;
}

/* Navigation Menu Button */
.btn-nav-menu {
  background: #007bff;
  border: none;
  border-radius: 6px;
  color: white;
  padding: 8px 10px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  height: 45px;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 2px 4px rgba(0,123,255,0.2);
}

.btn-nav-menu:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,123,255,0.3);
}

.btn-nav-menu.active {
  background: #28a745;
  box-shadow: 0 2px 4px rgba(40,167,69,0.3);
}

.btn-nav-menu i {
  font-size: 14px;
  margin-bottom: 2px;
}

.nav-count {
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  opacity: 0.9;
}

/* Progress bar */
.progress-container {
  margin-bottom: 20px;
}

.progress {
  height: 8px;
  border-radius: 4px;
}

.progress-bar {
  background: linear-gradient(90deg, #28a745, #20c997);
}

/* Main content area */
.exam-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
}

/* Question panel */
.question-panel {
  flex: 1;
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.question-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.question-number {
  color: #dc3545;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Question Timer Styles */
.question-timer {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 8px 12px;
}

.timer-icon {
  color: #28a745;
  font-size: 1.2rem;
}

.timer-info {
  text-align: center;
}

.timer-current {
  font-size: 1rem;
  font-weight: bold;
  color: #28a745;
  line-height: 1;
}

.question-text {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 20px 0;
  color: #333;
}

.question-image {
  margin: 20px 0;
  text-align: center;
}

.question-image img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.option-container {
  margin: 15px 0;
}

.option-item {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 15px;
  margin: 10px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.option-item:hover {
  background: #e3f2fd;
  border-color: #2196f3;
}

.option-item.selected {
  background: #e8f5e9;
  border-color: #28a745;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.option-radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #6c757d;
  position: relative;
  flex-shrink: 0;
}

.option-item.selected .option-radio {
  border-color: #28a745;
  background: #28a745;
}

.option-item.selected .option-radio::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

.option-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.4;
}

/* Navigation panel */
.navigation-panel {
  width: 350px;
  background: white;
  padding: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  right: -350px;
  height: 100vh;
  z-index: 1001;
  transition: right 0.3s ease-in-out;
  border-radius: 0;
}

.navigation-panel.panel-open {
  right: 0;
}

.navigation-panel .nav-section {
  padding: 0 25px;
  margin-bottom: 15px;
}

.navigation-panel .nav-section:first-of-type {
  padding-top: 15px;
}

/* Navigation header */
.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.nav-title {
  font-weight: 600;
  color: #495057;
  font-size: 1.1rem;
  margin: 0;
}

/* Navigation summary */
.nav-summary {
  display: flex;
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.summary-count {
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
}

.summary-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 2px;
}

/* Question grid */
.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 5px;
}

.question-grid::-webkit-scrollbar {
  width: 6px;
}

.question-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.question-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.question-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Question status colors */
.question-btn.not-visited {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
}

.question-btn.not-answered {
  background: #fff3cd;
  border-color: #ffc107;
  color: #856404;
}

.question-btn.answered {
  background: #d4edda;
  border-color: #28a745;
  color: #155724;
}

.question-btn.marked {
  background: #ccbdff;
  border-color: #6f42c1;
  color: #4c2a85;
}

.question-btn.answered-marked {
  background: linear-gradient(45deg, #d4edda 50%, #ccbdff 50%);
  border-color: #28a745;
  color: #155724;
}

.question-btn.current {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.3);
  border-color: #dc3545;
}

.question-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Legend */
.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.legend-row {
  display: flex;
  gap: 15px;
}

.legend-row:first-child {
  justify-content: space-between;
}

.legend-row:last-child {
  justify-content: space-around;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  min-width: 0;
}

.legend-item span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px solid #dee2e6;
  flex-shrink: 0;
}

.legend-color.not-visited {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.legend-color.not-answered {
  background: #fff3cd;
  border-color: #ffc107;
}

.legend-color.answered {
  background: #d4edda;
  border-color: #28a745;
}

.legend-color.marked {
  background: #ccbdff;
  border-color: #6f42c1;
}

.legend-color.answered-marked {
  background: linear-gradient(45deg, #d4edda 50%, #ccbdff 50%);
  border-color: #28a745;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-mark {
  background: #6f42c1;
  border-color: #6f42c1;
  color: white;
}

.btn-mark:hover {
  background: #5a2d91;
  border-color: #5a2d91;
  color: white;
}

.btn-mark.active {
  background: #5a2d91;
  border-color: #5a2d91;
}

.btn-clear {
  background: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-clear:hover {
  background: #545b62;
  border-color: #545b62;
  color: white;
}

/* Navigation buttons */
.nav-buttons {
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  padding-top: 15px;
}

.action-buttons .btn {
  flex: 1;
  padding: 8px 12px;
  font-size: 0.85rem;
}

.nav-buttons-row {
  display: flex;
  gap: 10px;
}

.nav-buttons-row .btn-nav {
  flex: 1;
  padding: 10px 20px;
  font-size: 0.9rem;
}

/* Submit section */
.submit-section {
  margin-top: auto;
  padding: 15px 0 0 0;
  border-top: 1px solid #e9ecef;
}

.btn-submit {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
  font-weight: 600;
  padding: 10px 20px;
  font-size: 0.9rem;
  border-radius: 8px;
  width: 100%;
}

.btn-submit:hover {
  background: #c82333;
  border-color: #c82333;
  color: white;
}

/* Mobile Responsive Design */
@media (max-width: 768px) {
  .exam-header {
    padding: 8px 0;
    margin-bottom: 12px;
  }
  
  .exam-header .row {
    margin: 0;
  }
  
  .exam-header .col-12,
  .exam-header .col-6 {
    padding: 0 8px;
    margin-bottom: 8px;
  }
  
  /* Timer Container Mobile */
  .timer-container {
    padding: 10px;
    min-height: 55px;
  }
  
  .timer-display {
    font-size: 16px;
    font-weight: 700;
  }
  
  .timer-label {
    font-size: 10px;
    margin-top: 2px;
  }
  
  /* Student Info Mobile */
  .student-info {
    padding: 10px;
    min-height: 55px;
  }
  
  .student-name {
    font-size: 13px;
    font-weight: 600;
  }
  
  .student-label {
    font-size: 10px;
  }
  
  /* Navigation Button Mobile */
  .btn-nav-menu {
    min-width: 40px;
    height: 40px;
    padding: 6px 8px;
    font-size: 11px;
  }
  
  .btn-nav-menu i {
    font-size: 12px;
    margin-bottom: 1px;
  }
  
  .nav-count {
    font-size: 8px;
  }
  
  .nav-menu-wrapper {
    margin-left: 6px;
  }
  
  .exam-content {
    flex-direction: column;
    padding: 10px;
    gap: 15px;
  }

  /* Mobile Navigation Panel */
  .navigation-panel {
    position: fixed !important;
    top: 0 !important;
    right: -100% !important;
    width: 100% !important;
    height: 100vh !important;
    border-radius: 0 !important;
    padding: 0 !important;
    z-index: 1001 !important;
    transition: right 0.3s ease-in-out !important;
    transform: none !important;
  }
  
  .navigation-panel.panel-open {
    right: 0 !important;
  }
  
  .navigation-panel .nav-section {
    padding: 0 20px !important;
    margin-bottom: 15px !important;
  }
  
  .navigation-panel .nav-section:first-of-type {
    padding-top: 15px !important;
  }

  .question-panel {
    padding: 20px 15px;
    max-height: none;
    border-radius: 10px;
    width: 100%;
  }

  .question-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }

  /* Question Timer Mobile */
  .question-timer {
    padding: 6px 8px;
    font-size: 0.85rem;
  }
  
  .timer-icon {
    font-size: 1rem;
  }
  
  .timer-current {
    font-size: 0.9rem;
    font-weight: bold;
  }
  
  /* Question timer label mobile - more specific than general timer label */
  .question-timer .timer-label {
    font-size: 0.6rem;
  }
  
  .question-number {
    font-size: 1rem;
    font-weight: 600;
  }

  .nav-buttons {
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    padding-top: 15px;
  }
  
  .nav-buttons .btn-nav {
    width: 100%;
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  /* Mobile specific action buttons styling */
  .action-buttons {
    gap: 8px;
    justify-content: center;
    margin-bottom: 10px;
    order: 1;
  }
  
  .btn-previous {
    order: 2;
  }
  
  .btn-next {
    order: 3;
  }
}

/* Desktop - restore original sidebar layout */
@media (min-width: 769px) {
  .exam-content {
    display: flex;
    flex-direction: row;
    gap: 20px;
    padding: 20px;
  }
  
  .question-panel {
    flex: 1;
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
  
  .navigation-panel {
    width: 350px !important;
    background: white;
    border-radius: 15px !important;
    padding: 25px !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: static !important;
    top: auto !important;
    right: auto !important;
    height: auto !important;
    z-index: auto !important;
    transform: none !important;
    transition: none !important;
  }
  
  .navigation-panel .nav-section {
    padding: 0 !important;
    margin-bottom: 20px !important;
  }
  
  .navigation-panel .nav-section:first-of-type {
    padding-top: 0 !important;
  }
  
  .panel-header {
    display: none !important;
  }
  
  /* Hide navigation button on desktop */
  .btn-nav-menu {
    display: none !important;
  }
  
  /* Hide navigation backdrop on desktop */
  .navigation-backdrop {
    display: none !important;
  }
  
  /* Restore original navigation buttons layout for desktop */
  .nav-buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
  }
  
  /* Desktop specific action buttons styling */
  .action-buttons {
    justify-content: center;
  }
  
  .action-buttons .btn {
    padding: 10px 15px;
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  .nav-buttons-row {
    display: flex;
    gap: 15px;
  }
  
  .nav-buttons-row .btn-nav {
    flex: 1;
    padding: 12px 20px;
    font-size: 1rem;
    font-weight: 500;
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.question-btn {
  width: 45px;
  height: 45px;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

/* Custom modal backdrop - darker than default */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.8) !important;
}

/* Navigation Panel Backdrop */
.navigation-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* Navigation Panel Styles */
.panel-header {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  display: flex;
  justify-content: flex-end;
}

.btn-close-panel {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
}

.btn-previous {
  background: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-previous:hover {
  background: #545b62;
  border-color: #545b62;
  color: white;
}

.btn-next {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-next:hover {
  background: #0056b3;
  border-color: #0056b3;
  color: white;
}

/* iOS Notice Bar */
.ios-notice-bar {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 999;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.ios-notice-bar .alert {
  margin-bottom: 0;
  border-radius: 0;
  border: none;
  padding: 0.5rem 1rem;
}

.ios-notice-bar .alert-info {
  background-color: #e3f2fd;
  color: #1976d2;
  border-color: #90caf9;
}

.ios-notice-bar .alert-info .bi-info-circle {
  color: #1976d2;
}

/* Recovery Notification */
.recovery-notification {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1002; /* Ensure it's above other content */
  background-color: #e8f5e9; /* Light green background */
  border-bottom: 1px solid #a5d6a7; /* Green border */
  box-shadow: 0 2px 8px rgba(165, 214, 167, 0.3);
}

.recovery-notification .alert {
  margin-bottom: 0;
  border-radius: 0;
  border: none;
  padding: 0.5rem 1rem;
}

.recovery-notification .alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-color: #a5d6a7;
}

.recovery-notification .alert-success .bi-check-circle {
  color: #2e7d32;
}

.recovery-notification .btn-close {
  color: #2e7d32;
}

.recovery-notification .btn-close:hover {
  color: #2e7d32;
  opacity: 0.8;
}

/* Offline Warning Notification */
.offline-notification {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1002; /* Ensure it's above other content */
  background-color: #fff3cd; /* Light yellow background */
  border-bottom: 1px solid #ffeeba; /* Yellow border */
  box-shadow: 0 2px 8px rgba(255, 238, 186, 0.3);
}

.offline-notification .alert {
  margin-bottom: 0;
  border-radius: 0;
  border: none;
  padding: 0.5rem 1rem;
}

.offline-notification .alert-warning {
  background-color: #fff3cd;
  color: #856404;
  border-color: #ffeeba;
}

.offline-notification .alert-warning .bi-wifi-off {
  color: #856404;
}
</style> 