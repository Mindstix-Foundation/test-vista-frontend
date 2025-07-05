<template>
  <div class="result-page">
    <!-- Loading Spinner -->
    <LoadingSpinner :show="isLoading" :showOverlay="true" />

    <!-- Error State -->
    <div v-if="!isLoading && error" class="error-container">
      <div class="alert alert-danger" role="alert">
        <h4 class="alert-heading">Error Loading Results</h4>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="retryLoadResults">
          <i class="bi bi-arrow-clockwise"></i> Retry
        </button>
      </div>
    </div>

    <!-- Main Results -->
    <div v-if="!isLoading && !error" class="container mt-4 mb-5">
      <div class="result-container">
        <!-- Congratulations Header -->
        <div class="text-center mb-4">
          <h2 class="fw-bold text-success">
            <i class="bi bi-trophy-fill"></i> Exam Completed!
          </h2>
          <p class="text-muted">Here are your detailed results</p>
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

        <!-- Chapter-wise Performance Analysis -->
        <div v-if="result.chapter_wise_analysis && result.chapter_wise_analysis.length > 0" class="chapter-analysis-section">
          <h4 class="section-title">
            <i class="bi bi-bar-chart-fill"></i> Chapter-wise Performance
          </h4>
          <div class="chapter-cards">
            <div 
              v-for="analysis in result.chapter_wise_analysis" 
              :key="analysis.chapterName"
              class="chapter-card"
              :class="getChapterCardClass(analysis.performanceLevel)"
            >
              <div class="chapter-header">
                <h5 class="chapter-name">{{ analysis.chapterName }}</h5>
                <span class="performance-badge" :class="getPerformanceBadgeClass(analysis.performanceLevel)">
                  {{ analysis.performanceLevel }}
                </span>
              </div>
              <div class="chapter-stats">
                <div class="stat-item">
                  <span class="stat-label">Questions:</span>
                  <span class="stat-value">{{ analysis.correct }}/{{ analysis.total }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Accuracy:</span>
                  <span class="stat-value">{{ analysis.percentage }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Marks:</span>
                  <span class="stat-value">{{ analysis.obtainedMarks }}/{{ analysis.totalMarks }}</span>
                </div>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: analysis.percentage + '%' }"
                  :class="getProgressBarClass(analysis.performanceLevel)"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Strengths and Weaknesses -->
        <div v-if="result.strengths || result.weaknesses" class="strengths-weaknesses-section">
          <div class="row">
            <div class="col-md-6" v-if="result.strengths && result.strengths.length > 0">
              <div class="strength-card">
                <h5 class="card-title">
                  <i class="bi bi-star-fill"></i> Your Strengths
                </h5>
                <ul class="strength-list">
                  <li v-for="strength in result.strengths" :key="strength">
                    <i class="bi bi-check-circle-fill text-success"></i>
                    {{ strength }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-md-6" v-if="result.weaknesses && result.weaknesses.length > 0">
              <div class="weakness-card">
                <h5 class="card-title">
                  <i class="bi bi-exclamation-triangle-fill"></i> Areas for Improvement
                </h5>
                <ul class="weakness-list">
                  <li v-for="weakness in result.weaknesses" :key="weakness">
                    <i class="bi bi-x-circle-fill text-danger"></i>
                    {{ weakness }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="result.recommendations && result.recommendations.length > 0" class="recommendations-section">
          <h4 class="section-title">
            <i class="bi bi-lightbulb-fill"></i> Recommendations
          </h4>
          <div class="recommendations-card">
            <div class="recommendations-content">
              <div v-for="recommendation in result.recommendations" :key="recommendation" class="recommendation-item">
                <i class="bi bi-arrow-right-circle-fill"></i>
                <span>{{ recommendation }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning for missing detailed report -->
        <div v-if="result && !detailedReport" class="detailed-analysis-section">
          <div class="alert alert-warning" role="alert">
            <h5 class="alert-heading">
              <i class="bi bi-exclamation-triangle-fill"></i> Detailed Analysis 
              <span v-if="isLoadingDetailedReport">Loading...</span>
              <span v-else>Unavailable</span>
            </h5>
            <p class="mb-2" v-if="isLoadingDetailedReport">
              Your exam results are ready! The detailed question-by-question analysis is being loaded...
            </p>
            <p class="mb-2" v-else>
              Your exam results are ready, but the detailed question-by-question analysis is still being processed.
            </p>
            <button 
              class="btn btn-warning btn-sm" 
              @click="retryLoadResults"
              :disabled="isLoadingDetailedReport"
            >
              <span v-if="isLoadingDetailedReport" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i class="bi bi-arrow-clockwise" v-else></i> 
              {{ isLoadingDetailedReport ? 'Loading...' : 'Load Detailed Analysis' }}
            </button>
          </div>
        </div>

        <!-- Detailed Question Analysis -->
        <div v-if="detailedReport && detailedReport.questions" class="detailed-analysis-section">
          <h4 class="section-title">
            <i class="bi bi-list-check"></i> Question-wise Analysis
          </h4>
          <div class="questions-container">
            <div 
              v-for="(question, index) in detailedReport.questions" 
              :key="question.question_id"
              class="question-card"
              :class="getQuestionCardClass(question)"
            >
              <div class="question-header">
                <span class="question-number">Q{{ index + 1 }}</span>
                <span class="question-status" :class="getQuestionStatusClass(question)">
                  <i :class="getQuestionStatusIcon(question)"></i>
                  {{ getQuestionStatusText(question) }}
                </span>
                <span class="question-marks">{{ question.marks_obtained }} marks</span>
              </div>
              <div class="question-content">
                <p class="question-text">{{ question.question_text }}</p>
                <div v-if="question.question_image" class="question-image">
                  <img :src="question.question_image" alt="Question Image" class="img-fluid">
                </div>
              </div>
              <div class="options-container">
                <div v-if="question.selected_option === null || question.selected_option === undefined" class="not-attempted-message">
                  <i class="bi bi-exclamation-triangle-fill text-warning"></i>
                  <span>This question was not attempted</span>
                </div>
                <div 
                  v-for="(option, optionIndex) in question.options" 
                  :key="optionIndex"
                  class="option-item"
                  :class="getOptionClass(optionIndex, question.correct_option, question.selected_option_index)"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}.</span>
                  <span class="option-text">{{ option }}</span>
                  <span v-if="optionIndex === question.correct_option" class="correct-indicator">
                    <i class="bi bi-check-circle-fill text-success"></i>
                  </span>
                  <span v-if="optionIndex === question.selected_option_index && optionIndex !== question.correct_option && question.selected_option_index !== -1" class="wrong-indicator">
                    <i class="bi bi-x-circle-fill text-danger"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="text-center mt-5">
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { testAssignmentService, type ExamResult, type DetailedReport } from '@/services/testAssignmentService'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

// Reactive data
const isLoading = ref(true)
const error = ref('')
const result = ref<ExamResult>({} as ExamResult)
const detailedReport = ref<DetailedReport | null>(null)
const showLeaveConfirmation = ref(false)
const scoreCircle = ref<HTMLElement>()
const isLoadingDetailedReport = ref(false)

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
    
    // Convert attemptId to number, handling both string and array cases
    const attemptIdNumber = Array.isArray(attemptId) ? Number(attemptId[0]) : Number(attemptId)
    
    // Load basic result first
    const examResult = await testAssignmentService.getExamResult(attemptIdNumber)
    console.log('API Response - Result:', examResult)
    result.value = examResult
    
    // Animate score after basic result is loaded
    setTimeout(() => {
      animateScore()
    }, 100)
    
    // Load detailed report separately with retry mechanism
    await loadDetailedReportWithRetry(attemptIdNumber)
    
  } catch (err: any) {
    console.error('Error loading exam result:', err)
    error.value = err.response?.data?.message || err.message || 'Failed to load exam results'
  } finally {
    isLoading.value = false
  }
}

const loadDetailedReportWithRetry = async (attemptId: number, retryCount = 0) => {
  const maxRetries = 3
  const retryDelay = 1000 // 1 second
  
  if (retryCount === 0) {
    isLoadingDetailedReport.value = true
  }
  
  try {
    const detailedReportData = await testAssignmentService.getDetailedReport(attemptId)
    console.log('API Response - Detailed Report:', detailedReportData)
    detailedReport.value = detailedReportData
    isLoadingDetailedReport.value = false
  } catch (err: any) {
    console.error(`Error loading detailed report (attempt ${retryCount + 1}):`, err)
    
    // If we haven't reached max retries and it's a 400 error (likely processing delay), retry
    if (retryCount < maxRetries && (err.response?.status === 400 || err.response?.status === 404)) {
      console.log(`Retrying detailed report in ${retryDelay}ms...`)
      setTimeout(() => {
        loadDetailedReportWithRetry(attemptId, retryCount + 1)
      }, retryDelay)
    } else {
      console.warn('Failed to load detailed report after retries, continuing without it')
      isLoadingDetailedReport.value = false
      // Don't throw error here, just log it - the basic result is already loaded
    }
  }
}

const retryLoadResults = () => {
  // If basic result is already loaded, just retry the detailed report
  if (result.value && !detailedReport.value) {
    const attemptId = route.query.attemptId
    const attemptIdNumber = Array.isArray(attemptId) ? Number(attemptId[0]) : Number(attemptId)
    loadDetailedReportWithRetry(attemptIdNumber)
  } else {
    // Otherwise, reload everything
    loadExamResult()
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
  if (percentage >= 70) return 'Excellent Performance!'
  if (percentage >= 50) return 'Good Performance!'
  if (percentage >= 30) return 'Average Performance'
  return 'Needs Improvement'
}

const getChapterCardClass = (performanceLevel: string): string => {
  switch (performanceLevel) {
    case 'excellent': return 'chapter-excellent'
    case 'good': return 'chapter-good'
    case 'average': return 'chapter-average'
    default: return 'chapter-poor'
  }
}

const getPerformanceBadgeClass = (performanceLevel: string): string => {
  switch (performanceLevel) {
    case 'excellent': return 'badge-excellent'
    case 'good': return 'badge-good'
    case 'average': return 'badge-average'
    default: return 'badge-poor'
  }
}

const getProgressBarClass = (performanceLevel: string): string => {
  switch (performanceLevel) {
    case 'excellent': return 'progress-excellent'
    case 'good': return 'progress-good'
    case 'average': return 'progress-average'
    default: return 'progress-poor'
  }
}

const getQuestionCardClass = (question: any): string => {
  if (question.selected_option === null || question.selected_option === undefined) return 'question-skipped'
  if (question.is_correct === true) return 'question-correct'
  if (question.is_correct === false) return 'question-wrong'
  return 'question-skipped'
}

const getQuestionStatusClass = (question: any): string => {
  if (question.selected_option === null || question.selected_option === undefined) return 'status-skipped'
  if (question.is_correct === true) return 'status-correct'
  if (question.is_correct === false) return 'status-wrong'
  return 'status-skipped'
}

const getQuestionStatusIcon = (question: any): string => {
  if (question.selected_option === null || question.selected_option === undefined) return 'bi bi-dash-circle-fill'
  if (question.is_correct === true) return 'bi bi-check-circle-fill'
  if (question.is_correct === false) return 'bi bi-x-circle-fill'
  return 'bi bi-dash-circle-fill'
}

const getQuestionStatusText = (question: any): string => {
  if (question.selected_option === null || question.selected_option === undefined) return 'Not Attempted'
  if (question.is_correct === true) return 'Correct'
  if (question.is_correct === false) return 'Wrong'
  return 'Not Attempted'
}

const getOptionClass = (optionIndex: number, correctOption: number, selectedOption: number): string => {
  if (optionIndex === correctOption) return 'option-correct'
  if (selectedOption !== -1 && optionIndex === selectedOption && optionIndex !== correctOption) return 'option-wrong'
  if (selectedOption !== -1 && optionIndex === selectedOption) return 'option-selected'
  return ''
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

.error-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result-container {
  max-width: 1200px;
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

/* Chapter Analysis Section */
.chapter-analysis-section {
  margin-bottom: 30px;
}

.section-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
}

.chapter-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.chapter-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #dee2e6;
  transition: all 0.3s ease;
}

.chapter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.chapter-excellent {
  border-left-color: #28a745;
}

.chapter-good {
  border-left-color: #17a2b8;
}

.chapter-average {
  border-left-color: #ffc107;
}

.chapter-poor {
  border-left-color: #dc3545;
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.chapter-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.performance-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-excellent {
  background-color: #d4edda;
  color: #155724;
}

.badge-good {
  background-color: #d1ecf1;
  color: #0c5460;
}

.badge-average {
  background-color: #fff3cd;
  color: #856404;
}

.badge-poor {
  background-color: #f8d7da;
  color: #721c24;
}

.chapter-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-excellent {
  background-color: #28a745;
}

.progress-good {
  background-color: #17a2b8;
}

.progress-average {
  background-color: #ffc107;
}

.progress-poor {
  background-color: #dc3545;
}

/* Strengths and Weaknesses Section */
.strengths-weaknesses-section {
  margin-bottom: 30px;
}

.strength-card,
.weakness-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.strength-card {
  border-left: 4px solid #28a745;
}

.weakness-card {
  border-left: 4px solid #dc3545;
}

.card-title {
  color: #333;
  font-weight: 600;
  margin-bottom: 15px;
}

.strength-list,
.weakness-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.strength-list li,
.weakness-list li {
  padding: 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Recommendations Section */
.recommendations-section {
  margin-bottom: 30px;
}

.recommendations-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #17a2b8;
}

.recommendations-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  border-left: 4px solid #17a2b8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.recommendation-item i {
  color: #17a2b8;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.recommendation-item span {
  color: #2c3e50;
  font-weight: 600;
  line-height: 1.5;
  font-size: 0.95rem;
}

/* Detailed Analysis Section */
.detailed-analysis-section {
  margin-bottom: 30px;
}

.questions-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #dee2e6;
}

.question-correct {
  border-left-color: #28a745;
}

.question-wrong {
  border-left-color: #dc3545;
}

.question-skipped {
  border-left-color: #ffc107;
  background: linear-gradient(90deg, rgba(255, 193, 7, 0.05), white);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.question-number {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.question-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-correct {
  background-color: #d4edda;
  color: #155724;
}

.status-wrong {
  background-color: #f8d7da;
  color: #721c24;
}

.status-skipped {
  background-color: #fff3cd;
  color: #856404;
}

.question-marks {
  font-weight: 600;
  color: #333;
}

.question-content {
  margin-bottom: 15px;
}

.question-text {
  font-size: 1rem;
  color: #333;
  margin-bottom: 10px;
}

.question-image {
  margin-bottom: 10px;
}

.question-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.option-correct {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.option-wrong {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.option-selected {
  background-color: #e2e3e5;
  border-color: #d6d8db;
}

.not-attempted-message {
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #856404;
}

.option-label {
  font-weight: 600;
  color: #333;
  min-width: 20px;
}

.option-text {
  flex: 1;
  color: #333;
}

.correct-indicator,
.wrong-indicator {
  margin-left: auto;
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
  
  .chapter-cards {
    grid-template-columns: 1fr;
  }
  
  .chapter-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .stat-item {
    text-align: left;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .text-center .btn-lg {
    font-size: 1rem;
    padding: 12px 20px;
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
  
  .chapter-card,
  .strength-card,
  .weakness-card,
  .recommendations-card,
  .question-card {
    padding: 15px;
  }
}
</style> 