<template>
  <div class="result-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading results...</span>
        </div>
        <p class="loading-text mt-3">Loading your exam results...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error Loading Results</h4>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="retryLoadResults">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    </div>

    <!-- Main Results -->
    <div v-else class="container mt-4 mb-5">
      <div class="result-container">
        <!-- Congratulations Header -->
        <div class="text-center mb-4">
          <h2 class="fw-bold text-success">
            <i class="bi bi-trophy-fill"></i> Exam Completed!
          </h2>
          <p class="text-muted">Here are your results</p>
        </div>

        <!-- Score Card -->
        <div class="score-card">
          <div class="score-circle" ref="scoreCircle">
            {{ result.percentage }}%
          </div>
          <h3 class="mb-2">{{ result.title }}</h3>
          <p class="mb-3">{{ getPerformanceText(result.percentage) }}</p>
          <div class="row">
            <div class="col-md-3 col-6 mb-2">
              <i class="bi bi-check-circle-fill d-block mb-1"></i>
              <strong>{{ result.correct_answers }}/{{ result.total_questions }}</strong>
              <small class="d-block">Correct</small>
            </div>
            <div class="col-md-3 col-6 mb-2">
              <i class="bi bi-x-circle-fill d-block mb-1"></i>
              <strong>{{ result.wrong_answers }}/{{ result.total_questions }}</strong>
              <small class="d-block">Wrong</small>
            </div>
            <div class="col-md-3 col-6 mb-2">
              <i class="bi bi-clock-fill d-block mb-1"></i>
              <strong>{{ formatTime(result.time_taken_seconds) }}</strong>
              <small class="d-block">Time Taken</small>
            </div>
            <div class="col-md-3 col-6 mb-2">
              <i class="bi bi-award-fill d-block mb-1"></i>
              <strong>{{ result.obtained_marks }}/{{ result.total_marks }}</strong>
              <small class="d-block">Marks</small>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="text-center">
          <button 
            class="btn btn-outline-primary btn-lg me-3"
            @click="viewDetailedReport"
            :disabled="isLoadingReport"
          >
            <span v-if="isLoadingReport" class="spinner-border spinner-border-sm me-2" role="status"></span>
            <i class="bi bi-file-text" v-else></i>
            {{ isLoadingReport ? 'Loading...' : 'Detailed Report' }}
          </button>
          <button class="btn btn-primary btn-lg" @click="backToExams">
            <i class="bi bi-house"></i> Back to Home
          </button>
        </div>
      </div>
    </div>

    <!-- Leave Confirmation Modal -->
    <div class="modal" :class="{ show: showLeaveConfirmation }" tabindex="-1" style="display: block;" v-if="showLeaveConfirmation">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-warning">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle"></i> Confirm Navigation
            </h5>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to leave the results page?</p>
            <p class="text-muted">You can always view your results later from the exam history.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="cancelLeave">
              <i class="bi bi-x-circle"></i> Cancel
            </button>
            <button class="btn btn-warning" @click="confirmLeave">
              <i class="bi bi-check-circle"></i> Yes, Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import testAssignmentService from '@/services/testAssignmentService'

const route = useRoute()
const router = useRouter()

// Reactive data
const isLoading = ref(true)
const isLoadingReport = ref(false)
const error = ref('')
const result = ref<any>({})
const showLeaveConfirmation = ref(false)
const scoreCircle = ref<HTMLElement>()

// Methods
const loadExamResult = async () => {
  try {
    isLoading.value = true
    error.value = ''
    
    const attemptId = route.query.attemptId
    console.log('Loading exam result for attemptId:', attemptId)
    
    if (!attemptId) {
      throw new Error('Attempt ID is required')
    }
    
    const examResult = await testAssignmentService.getExamResult(attemptId)
    console.log('API Response:', examResult)
    
    result.value = examResult
    console.log('Result data mapped:', result.value)
    
    // Animate score after data is loaded
    setTimeout(() => {
      animateScore()
    }, 100)
    
  } catch (err: any) {
    console.error('Error loading exam result:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load exam results'
  } finally {
    isLoading.value = false
  }
}

const retryLoadResults = () => {
  loadExamResult()
}

const viewDetailedReport = async () => {
  try {
    isLoadingReport.value = true
    
    const attemptId = route.query.attemptId
    if (attemptId) {
      router.push({
        path: '/student/exam/detailed-report',
        query: { attemptId }
      })
    }
  } catch (err) {
    console.error('Failed to navigate to detailed report:', err)
  } finally {
    isLoadingReport.value = false
  }
}

const backToExams = () => {
  router.push('/student/exam')
}

const formatTime = (seconds: number): string => {
  if (!seconds) return '0m 0s'
  
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  return `${minutes}m ${secs}s`
}

const getPerformanceText = (percentage: number): string => {
  if (percentage >= 90) return 'Outstanding Performance!'
  if (percentage >= 80) return 'Excellent Performance!'
  if (percentage >= 70) return 'Good Performance!'
  if (percentage >= 60) return 'Average Performance'
  return 'Needs Improvement'
}

const animateScore = () => {
  if (!scoreCircle.value) return
  
  let currentScore = 0
  const targetScore = result.value.percentage || 0
  const increment = targetScore / 50
  
  const timer = setInterval(() => {
    currentScore += increment
    if (currentScore >= targetScore) {
      currentScore = targetScore
      clearInterval(timer)
    }
    if (scoreCircle.value) {
      scoreCircle.value.textContent = Math.round(currentScore) + '%'
    }
  }, 30)
}

const exitFullscreen = () => {
  if (document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).msFullscreenElement) {
    
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
    }
  }
}

const blockBackNavigation = () => {
  window.history.pushState(null, '', window.location.href)
  
  window.addEventListener('popstate', (event) => {
    window.history.pushState(null, '', window.location.href)
    showLeaveConfirmation.value = true
  })
  
  window.addEventListener('keydown', (e) => {
    if ((e.altKey && e.key === 'ArrowLeft') ||
        (e.altKey && e.key === 'ArrowRight') ||
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'r')) {
      e.preventDefault()
      return false
    }
  })
  
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })
}

const confirmLeave = () => {
  showLeaveConfirmation.value = false
  router.push('/student/exam')
}

const cancelLeave = () => {
  showLeaveConfirmation.value = false
}

// Lifecycle hooks
onMounted(() => {
  loadExamResult()
  exitFullscreen()
  blockBackNavigation()
})

onUnmounted(() => {
  // Clean up event listeners if needed
})
</script>

<style scoped>
.result-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding: 20px 0;
}

.loading-container,
.error-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result-container {
  max-width: 900px;
  margin: 0 auto;
}

.score-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  margin-bottom: 30px;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 2.5rem;
  font-weight: bold;
}

.score-card h3 {
  color: white;
  font-weight: 600;
}

.score-card p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
}

.score-card .row .col-md-3 {
  margin-bottom: 10px;
}

.score-card i {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.score-card strong {
  display: block;
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.score-card small {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Action Buttons */
.text-center .btn {
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.text-center .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.text-center .btn-lg {
  font-size: 1.1rem;
  padding: 15px 30px;
}

/* Bootstrap Icons */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css');

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog {
  max-width: 500px;
  width: 90%;
}

.modal-content {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.modal-footer .btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .result-container {
    padding: 0 15px;
  }
  
  .score-card {
    padding: 20px;
  }
  
  .score-circle {
    width: 120px;
    height: 120px;
    font-size: 2rem;
  }
  
  .text-center .btn-lg {
    font-size: 1rem;
    padding: 12px 20px;
    margin-bottom: 10px;
  }
  
  .text-center .me-3 {
    margin-right: 0 !important;
    margin-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .score-card {
    padding: 15px;
  }
  
  .score-circle {
    width: 100px;
    height: 100px;
    font-size: 1.8rem;
  }
  
  .score-card .row .col-6 {
    margin-bottom: 15px;
  }
}
</style> 