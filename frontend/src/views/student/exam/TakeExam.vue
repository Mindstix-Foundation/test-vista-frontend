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
    <div v-else class="exam-container">
      <!-- Exam Header -->
      <div class="exam-header">
        <div class="container-fluid">
          <div class="row align-items-center">
            <div class="col-md-4">
              <h1 class="exam-title">{{ examData.title }}</h1>
              <div class="exam-info">
                <span>{{ examData.subject }}</span> • <span>{{ examData.total_marks }}</span> Marks • <span>{{ questions.length }}</span> Questions
              </div>
            </div>
            <div class="col-md-3">
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
            <div class="col-md-2">
              <div class="timer-container" :class="timerClass">
                <div class="timer-display">{{ formattedTime }}</div>
                <div class="timer-label">Time Remaining</div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="student-info">
                <div class="student-name">{{ studentName }}</div>
                <div class="student-label">Student</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="exam-content">
        <!-- Question Panel -->
        <div class="question-panel">
          <div class="question-header">
            <div class="question-number">Question {{ currentQuestionIndex + 1 }}</div>
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
            <button 
              class="btn btn-nav btn-previous" 
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              <i class="bi bi-arrow-left"></i> Previous
            </button>
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

        <!-- Navigation Panel -->
        <div class="navigation-panel">
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
            <button class="btn btn-submit w-100" @click="submitExam" :disabled="isSubmittingExam">
              <span v-if="isSubmittingExam" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i class="bi bi-check-circle" v-else></i> 
              {{ isSubmittingExam ? 'Submitting...' : 'Submit Exam' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Fullscreen Warning Modal -->
    <div class="modal" :class="{ show: showFullscreenWarning }" tabindex="-1" style="display: block;" v-if="showFullscreenWarning">
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

    <!-- Exit Warning Modal -->
    <div class="modal" :class="{ show: showExitWarning }" tabindex="-1" style="display: block;" v-if="showExitWarning">
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

    <!-- Submit Confirmation Modal -->
    <div class="modal" :class="{ show: showSubmitConfirmation }" tabindex="-1" style="display: block;" v-if="showSubmitConfirmation">
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
            <button class="btn btn-secondary" @click="cancelSubmitExam">
              <i class="bi bi-x-circle"></i> Cancel
            </button>
            <button class="btn btn-primary" @click="confirmSubmitExam" :disabled="isSubmittingExam">
              <span v-if="isSubmittingExam" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i class="bi bi-check-circle" v-else></i> 
              {{ isSubmittingExam ? 'Submitting...' : 'Submit Exam' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import testAssignmentService from '@/services/testAssignmentService'

const route = useRoute()
const router = useRouter()

// Reactive data
const isLoading = ref(true)
const error = ref('')
const examData = ref<any>({})
const attemptId = ref<number | null>(null)
const currentQuestionIndex = ref(0)
const questions = ref<any[]>([])
const answers = reactive<{ [key: number]: number }>({})
const markedQuestions = ref(new Set<number>())
const visitedQuestions = ref(new Set<number>())
const timeRemaining = ref(0)
const timer = ref<any>(null)
const questionStartTime = ref(0)
const questionTimeSpent = ref<any>({})
const showFullscreenWarning = ref(false)
const studentName = ref('')
const showExitWarning = ref(false)
const showSubmitConfirmation = ref(false)
const fullscreenChecker = ref<NodeJS.Timeout | null>(null)
const isSubmittingAnswer = ref(false)
const isSubmittingExam = ref(false)

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
    
    // Set up timer
    if (examResponse.timeRemaining !== undefined) {
      timeRemaining.value = examResponse.timeRemaining
    } else {
      // Calculate time remaining based on duration
      timeRemaining.value = examResponse.duration_minutes * 60
    }
  
    // Get student info from localStorage or API
    studentName.value = localStorage.getItem('studentName') || 'Student'
  
    // Start timer
    startTimer()
    
    // Mark first question as visited
    visitedQuestions.value.add(0)
    
    // Check fullscreen
    checkFullscreen()
    
    // Start periodic fullscreen monitoring
    startFullscreenMonitoring()
    
    isLoading.value = false
  } catch (err: any) {
    error.value = err.message || 'Failed to load exam'
    isLoading.value = false
  }
}

const retryLoadExam = () => {
  initializeExam()
}

const loadQuestion = (index: number) => {
  if (index < 0 || index >= questions.value.length) return
  
  // Record time spent on previous question
  if (questionStartTime.value > 0 && currentQuestionIndex.value >= 0) {
    const timeSpent = Date.now() - questionStartTime.value
    if (!questionTimeSpent.value[currentQuestionIndex.value]) {
      questionTimeSpent.value[currentQuestionIndex.value] = 0
    }
    questionTimeSpent.value[currentQuestionIndex.value] += timeSpent
  }
  
  currentQuestionIndex.value = index
  questionStartTime.value = Date.now()
  visitedQuestions.value.add(index)
}

const selectOption = async (optionIndex: number) => {
  console.log('=== SELECT OPTION DEBUG ===')
  console.log('currentQuestionIndex.value:', currentQuestionIndex.value)
  console.log('optionIndex:', optionIndex)
  console.log('answers before:', answers)
  console.log('answers keys before:', Object.keys(answers))
  
  // Store the answer
  answers[currentQuestionIndex.value] = optionIndex
  
  console.log('answers after:', answers)
  console.log('answers keys after:', Object.keys(answers))
  console.log('answers stringified:', JSON.stringify(answers))
  console.log('answers[currentQuestionIndex.value]:', answers[currentQuestionIndex.value])

  // Auto-save answer when option is selected
  if (attemptId.value && currentQuestion.value) {
    const question = currentQuestion.value
    const questionTextId = question.question_text_id || question.question_id
    const selectedOptionId = question.option_ids?.[optionIndex as number]
    
    if (!selectedOptionId) {
      console.error('No option ID found for index:', optionIndex, 'in option_ids:', question.option_ids)
      return
    }
    
    const timeSpent = Math.floor((Date.now() - questionStartTime.value) / 1000)
    
    const submissionData = {
      test_attempt_id: attemptId.value,
      question_id: question.question_id,
      question_text_id: questionTextId,
      selected_option_id: selectedOptionId,
      time_spent_seconds: timeSpent,
      is_flagged: markedQuestions.value.has(currentQuestionIndex.value)
    }
    
    console.log('Auto-saving answer:', submissionData)
    
    try {
      await testAssignmentService.submitAnswer(submissionData)
      console.log('Answer submitted successfully')
    } catch (error) {
      console.error('Error saving answer:', error)
      // Don't block user interaction, just log the error
    }
  }
}

const saveAndNext = async () => {
  if (isSubmittingAnswer.value) return
  
  // Simply move to next question without API call
  // The answer is already saved when user selects an option
  if (currentQuestionIndex.value < questions.value.length - 1) {
    nextQuestion()
  } else {
    submitExam()
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    loadQuestion(currentQuestionIndex.value - 1)
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    loadQuestion(currentQuestionIndex.value + 1)
  }
}

const toggleMark = () => {
  if (markedQuestions.value.has(currentQuestionIndex.value)) {
    markedQuestions.value.delete(currentQuestionIndex.value)
  } else {
    markedQuestions.value.add(currentQuestionIndex.value)
  }
}

const clearAnswer = () => {
  delete answers[currentQuestionIndex.value]
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

const submitExam = () => {
  showSubmitConfirmation.value = true
}

const confirmSubmitExam = async () => {
  if (isSubmittingExam.value) return
  
  try {
    isSubmittingExam.value = true
    
    console.log('=== EXAM SUBMISSION DEBUG ===')
    console.log('attemptId.value:', attemptId.value)
    
    if (attemptId.value) {
      const submissionData = {
        test_attempt_id: attemptId.value
      }
      
      console.log('Final submission data:', submissionData)
      
      const response = await testAssignmentService.submitExam(submissionData)
      
      console.log('Submission response:', response)
      
      showSubmitConfirmation.value = false
      
      // Navigate to result page
      router.push({
        path: '/student/exam/result',
        query: { attemptId: attemptId.value }
      })
    }
  } catch (err) {
    console.error('Failed to submit exam:', err)
    error.value = 'Failed to submit exam. Please try again.'
  } finally {
    isSubmittingExam.value = false
  }
}

const cancelSubmitExam = () => {
  showSubmitConfirmation.value = false
}

const autoSubmitExam = async () => {
  alert('Time is up! Your exam will be submitted automatically.')
  
  try {
    // Submit exam automatically
    if (attemptId.value) {
      const submissionData = {
        test_attempt_id: attemptId.value
      }
  
      await testAssignmentService.submitExam(submissionData)
  
      // Navigate to result page
      router.push({
        path: '/student/exam/result',
        query: { attemptId: attemptId.value }
      })
    }
  } catch (err) {
    console.error('Failed to auto-submit exam:', err)
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
  const isFullscreen = !!(
    document.fullscreenElement || 
    (document as any).webkitFullscreenElement || 
    (document as any).msFullscreenElement
  )
  
  if (!isFullscreen) {
    showFullscreenWarning.value = true
  }
}

const enterFullscreen = () => {
  const element = document.documentElement
  
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if ((element as any).webkitRequestFullscreen) {
    (element as any).webkitRequestFullscreen()
  } else if ((element as any).msRequestFullscreen) {
    (element as any).msRequestFullscreen()
  }
  
  showFullscreenWarning.value = false
}

const returnToFullscreen = () => {
  enterFullscreen()
  showExitWarning.value = false
}

const startFullscreenMonitoring = () => {
  fullscreenChecker.value = setInterval(() => {
    const isFullscreen = !!(
      document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).msFullscreenElement
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

// Lifecycle hooks
onMounted(() => {
  initializeExam()
  
  // Expose test function for debugging
  ;(window as any).testAddAnswers = testAddAnswers
  ;(window as any).debugAnswers = () => {
    console.log('Current answers:', answers)
    console.log('Current answers keys:', Object.keys(answers))
    console.log('Current answers stringified:', JSON.stringify(answers))
  }
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  if (fullscreenChecker.value) {
    clearInterval(fullscreenChecker.value)
  }
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
}

.timer-display {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.timer-label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.timer-warning {
  animation: pulse 1s infinite;
  background: rgba(255, 193, 7, 0.2) !important;
}

.timer-critical {
  animation: pulse 0.5s infinite;
  background: rgba(220, 53, 69, 0.2) !important;
}

/* Student info styles */
.student-info {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 15px;
  text-align: center;
}

.student-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
}

.student-label {
  font-size: 0.8rem;
  opacity: 0.8;
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
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 15px;
  margin-bottom: 25px;
}

.question-number {
  color: #dc3545;
  font-weight: 600;
  font-size: 1.1rem;
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
  border-radius: 15px;
  padding: 15px 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav-section {
  margin-bottom: 15px;
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
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn-nav {
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
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

/* Responsive design */
@media (max-width: 768px) {
  .exam-content {
    flex-direction: column;
    padding: 10px;
  }

  .navigation-panel {
    width: 100%;
    order: -1;
  }

  .question-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .question-btn {
    width: 40px;
    height: 40px;
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
</style> 