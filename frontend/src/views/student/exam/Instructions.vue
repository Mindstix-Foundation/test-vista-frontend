<template>
  <div class="instructions-page">
    <!-- Main Content -->
    <div class="container mt-1 mb-1 px-2 px-md-3">
      <div class="instructions-container">
        <!-- Page Header -->
        <div class="text-center mb-2">
          <h3 class="fw-bold mb-1 h4 h3-md">
            <i class="bi bi-info-circle"></i> Exam Instructions
          </h3>
          <p class="text-muted mb-0 small">Please read carefully before starting</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-3 py-md-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 mb-0">Loading exam instructions...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-danger py-2" role="alert">
          <i class="bi bi-exclamation-triangle"></i> {{ error }}
          <div class="mt-2">
            <button class="btn btn-outline-danger btn-sm" @click="loadExamInstructions">
              <i class="bi bi-arrow-clockwise"></i> Retry
            </button>
          </div>
        </div>

        <!-- Instructions Content -->
        <div v-else class="instructions-content-wrapper">
          <!-- Exam Info Card -->
          <div class="card exam-info-card mb-2">
            <div class="card-body text-center py-2">
              <h5 class="mb-2 fw-bold h6 h5-md">{{ examInstructions.title }}</h5>
              <div class="row g-1 g-md-2">
                <div class="col-4">
                  <small class="d-block text-center">
                    <i class="bi bi-clock-fill me-1"></i>
                    <strong class="d-block d-sm-inline">{{ formatDuration(examInstructions.duration_minutes) }}</strong>
                  </small>
                </div>
                <div class="col-4">
                  <small class="d-block text-center">
                    <i class="bi bi-question-circle-fill me-1"></i>
                    <strong class="d-block d-sm-inline">{{ examInstructions.total_questions }} Questions</strong>
                  </small>
                </div>
                <div class="col-4">
                  <small class="d-block text-center">
                    <i class="bi bi-award-fill me-1"></i>
                    <strong class="d-block d-sm-inline">{{ examInstructions.total_marks }} Marks</strong>
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Fullscreen Warning -->
          <div class="fullscreen-warning text-center mb-2">
            <h6 class="mb-1 small-title"><i class="bi bi-fullscreen"></i> Fullscreen Mode Required</h6>
            <p class="mb-0 small">This exam must be taken in fullscreen mode. Click "Enter Fullscreen" below to continue.</p>
          </div>

          <!-- Scrollable Instructions Container -->
          <div class="instructions-card-container">
            <!-- Instructions -->
            <div class="card">
              <div class="card-header py-2 fixed-header">
                <h6 class="mb-0 small-title"><i class="bi bi-list-check"></i> Exam Instructions</h6>
              </div>
              <div class="card-body py-2 scrollable-body">
                <!-- Custom Instructions -->
                <div v-if="examInstructions.instructions" class="alert alert-info mb-2 py-2">
                  <h6 class="mb-1 small-title"><i class="bi bi-info-circle"></i> Special Instructions</h6>
                  <p class="mb-0 small">{{ examInstructions.instructions }}</p>
                </div>

                <!-- Negative Marking Warning -->
                <div v-if="examInstructions.negative_marking" class="alert alert-warning mb-2 py-2">
                  <h6 class="mb-1 small-title"><i class="bi bi-exclamation-triangle"></i> Negative Marking</h6>
                  <p class="mb-0 small">
                    This exam has negative marking. Each wrong answer will deduct 
                    <strong>{{ examInstructions.negative_marks_per_question || 0.25 }} marks</strong>.
                  </p>
                </div>

                <!-- General Instructions -->
                <div class="row g-2 g-md-3">
                  <div class="col-12 col-md-6">
                    <div class="instruction-item">
                      <strong><i class="bi bi-clock text-warning"></i> Time:</strong>
                      <small class="d-block">Limited time with visible timer</small>
                    </div>
                    
                    <div class="instruction-item">
                      <strong><i class="bi bi-arrow-left-right text-info"></i> Navigation:</strong>
                      <small class="d-block">Use Previous/Next or click question numbers</small>
                    </div>
                    
                    <div class="instruction-item">
                      <strong><i class="bi bi-check-square text-success"></i> Answering:</strong>
                      <small class="d-block">Click options to select, can change anytime</small>
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="instruction-item">
                      <strong><i class="bi bi-bookmark text-primary"></i> Review:</strong>
                      <small class="d-block">Mark questions for later review</small>
                    </div>
                    
                    <div class="instruction-item">
                      <strong><i class="bi bi-send text-danger"></i> Submit:</strong>
                      <small class="d-block">Click "Submit Exam" when done</small>
                    </div>
                    
                    <div class="instruction-item">
                      <strong><i class="bi bi-exclamation-triangle text-warning"></i> Important:</strong>
                      <small class="d-block">Don't refresh page or close browser</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Card Footer with Attempt Information -->
              <div class="card-footer py-2">
                <div class="row g-1 g-md-2">
                  <div class="col-12 col-md-6 mb-1 mb-md-0">
                    <small class="d-block text-center text-md-start">
                      <strong><i class="bi bi-repeat"></i> Attempts Left:</strong> {{ examInstructions.attempts_left }}
                    </small>
                  </div>
                  <div class="col-12 col-md-6">
                    <small class="d-block text-center text-md-end">
                      <strong><i class="bi bi-calendar"></i> Available Until:</strong> {{ formatDate(examInstructions.due_date) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons-fixed">
            <div class="d-flex flex-column gap-2">
              <!-- Top row: Fullscreen and Start Exam -->
              <div class="d-flex justify-content-center gap-2">
                <button 
                  class="btn btn-compact flex-fill" 
                  :class="isFullscreen ? 'btn-success' : 'btn-warning'"
                  @click="toggleFullscreen"
                >
                  <i :class="isFullscreen ? 'bi bi-fullscreen-exit me-2' : 'bi bi-fullscreen me-2'"></i>
                  <span class="d-none d-sm-inline">{{ isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }}</span>
                  <span class="d-inline d-sm-none">{{ isFullscreen ? 'Exit' : 'Fullscreen' }}</span>
                </button>
                <button 
                  class="btn btn-success start-exam-btn btn-compact flex-fill" 
                  @click="startExam" 
                  :disabled="!isFullscreen || isStarting"
                >
                  <span v-if="isStarting" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-play-circle-fill me-2"></i>
                  {{ isStarting ? 'Starting...' : 'Start Exam' }}
                </button>
              </div>
              <!-- Bottom row: Back button centered -->
              <div class="d-flex justify-content-center">
                <button class="btn btn-outline-secondary btn-compact" @click="goBack" style="min-width: 120px;">
                  <i class="bi bi-arrow-left"></i> Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import testAssignmentService, { type ExamInstructions } from '@/services/testAssignmentService'

const route = useRoute()
const router = useRouter()

// Reactive data
const isFullscreen = ref(false)
const isLoading = ref(false)
const isStarting = ref(false)
const error = ref('')
const examInstructions = ref<ExamInstructions>({} as ExamInstructions)

// Methods
const loadExamInstructions = async () => {
  // Check for assignment ID in multiple parameter names for compatibility
  const assignmentId = Number(route.query.test) || Number(route.query.assignmentId)
  if (!assignmentId) {
    error.value = 'Invalid exam assignment ID'
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    examInstructions.value = await testAssignmentService.getExamInstructions(assignmentId)
  } catch (err: any) {
    console.error('Error loading exam instructions:', err)
    error.value = err.message || 'Failed to load exam instructions'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/student/exam')
}

const toggleFullscreen = () => {
  if (!isFullscreen.value) {
    enterFullscreen()
  } else {
    exitFullscreen()
  }
}

const enterFullscreen = () => {
  const elem = document.documentElement
  
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen()
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen()
  }
}

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if ((document as any).webkitExitFullscreen) {
    (document as any).webkitExitFullscreen()
  } else if ((document as any).msExitFullscreen) {
    (document as any).msExitFullscreen()
  }
}

const startExam = async () => {
  if (!isFullscreen.value) {
    alert('Please enable fullscreen mode before starting the exam.')
    return
  }

  // Check for assignment ID in multiple parameter names for compatibility
  const assignmentId = Number(route.query.test) || Number(route.query.assignmentId)
  if (!assignmentId) {
    alert('Invalid exam assignment ID')
    return
  }
  
  try {
    isStarting.value = true
    const examData = await testAssignmentService.startExam(assignmentId)
    
    // Store exam data for the take exam component
    localStorage.setItem('currentExamData', JSON.stringify(examData))
    
    // Navigate to take exam page
    router.push({
      path: '/student/exam/take',
      query: { 
        assignmentId: assignmentId,
        attemptId: examData.attemptId
      }
    })
  } catch (err: any) {
    console.error('Error starting exam:', err)
    alert(err.message || 'Failed to start exam. Please try again.')
  } finally {
    isStarting.value = false
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement || 
    (document as any).webkitFullscreenElement || 
    (document as any).msFullscreenElement
  )
}

const formatDuration = (minutes: number): string => {
  return testAssignmentService.formatTimeFromMinutes(minutes)
}

const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle hooks
onMounted(() => {
  loadExamInstructions()
  
  // Add fullscreen event listeners
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  // Remove fullscreen event listeners
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('msfullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.instructions-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.instructions-container {
  max-width: 1000px;
  margin: 0 auto;
  min-height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
}

.instructions-content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.instructions-card-container {
  flex: 1;
  padding-right: 8px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.instructions-card-container .card {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.fixed-header {
  flex-shrink: 0;
  background-color: rgba(0,0,0,.03);
  border-bottom: 1px solid rgba(0,0,0,.125);
  padding: 8px 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.scrollable-body {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  max-height: none;
}

.scrollable-body::-webkit-scrollbar {
  width: 6px;
}

.scrollable-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 8px;
}

.scrollable-body::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 8px;
}

.scrollable-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.card-footer {
  flex-shrink: 0;
  background-color: #f8f9fa;
  border-top: 1px solid rgba(0,0,0,.125);
  padding: 8px 12px;
  font-size: 0.9rem;
  color: #6c757d;
}

.card-footer .row {
  margin: 0;
}

.card-footer strong {
  color: #495057;
}

.action-buttons-fixed {
  flex-shrink: 0;
  padding: 10px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  margin-top: 10px;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.fullscreen-warning {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border-radius: 8px;
  padding: 8px 12px;
  flex-shrink: 0;
}

.instruction-item {
  padding: 6px 8px;
  margin-bottom: 6px;
  border-left: 3px solid #007bff;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.btn-compact {
  padding: 8px 16px;
  font-size: 0.9rem;
  min-height: 44px;
  border-radius: 6px;
  font-weight: 500;
}

.start-exam-btn {
  font-size: 1rem;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  min-height: 48px;
}

.exam-info-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 10px;
  flex-shrink: 0;
  border: none;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.exam-info-card .card-body {
  padding: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-header {
  background-color: rgba(0,0,0,.03);
  border-bottom: 1px solid rgba(0,0,0,.125);
  padding: 8px 12px;
}

.card {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,.125);
}

.alert {
  border-radius: 6px;
  border: 1px solid transparent;
}

.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.alert-secondary {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #6c757d;
}

/* Responsive typography utilities */
.small-title {
  font-size: 0.9rem;
  font-weight: 600;
}

/* Enhanced responsive adjustments */
@media (min-width: 768px) {
  .h3-md {
    font-size: 1.75rem;
  }
  
  .h5-md {
    font-size: 1.25rem;
  }
  
  .small-title {
    font-size: 1rem;
  }
  
  .btn-compact {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
  
  .start-exam-btn {
    font-size: 1rem;
    padding: 10px 20px;
  }
  
  .scrollable-body {
    max-height: 60vh;
  }
}

@media (max-width: 767.98px) {
  .instructions-page {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .instructions-container {
    max-width: 100%;
    padding: 0 8px;
    min-height: auto;
    height: auto;
  }
  
  .h4 {
    font-size: 1.3rem;
  }
  
  .h6 {
    font-size: 0.9rem;
  }
  
  .small-title {
    font-size: 0.85rem;
  }
  
  .btn-compact {
    font-size: 0.85rem;
    padding: 8px 12px;
    flex: 1;
  }
  
  .start-exam-btn {
    font-size: 0.9rem;
    padding: 10px 16px;
    min-height: 44px;
  }
  
  .action-buttons-fixed {
    padding: 8px;
    position: relative;
    margin-top: 15px;
  }
  
  .exam-info-card .card-body {
    padding: 10px;
  }
  
  .exam-info-card small {
    font-size: 0.8rem;
  }
  
  .fullscreen-warning {
    padding: 8px 10px;
  }
  
  .instruction-item {
    padding: 6px;
    margin-bottom: 6px;
  }
  
  .instruction-item strong {
    font-size: 0.85rem;
  }
  
  .instruction-item small {
    font-size: 0.8rem;
  }
  
  .scrollable-body {
    padding: 10px;
    max-height: none;
    overflow-y: visible;
  }
  
  .fixed-header {
    padding: 8px 10px;
  }
  
  .card-footer {
    padding: 8px 10px;
    font-size: 0.8rem;
  }
  
  .instructions-card-container {
    padding-right: 0;
    margin-bottom: 5px;
  }
}

@media (max-width: 575.98px) {
  .instructions-container {
    padding: 0 6px;
  }
  
  .h4 {
    font-size: 1.2rem;
  }
  
  .h6 {
    font-size: 0.85rem;
  }
  
  .small-title {
    font-size: 0.8rem;
  }
  
  .btn-compact {
    font-size: 0.8rem;
    padding: 8px 10px;
    min-height: 42px;
  }
  
  .start-exam-btn {
    font-size: 0.85rem;
    padding: 9px 14px;
    min-height: 42px;
  }
  
  .action-buttons-fixed {
    padding: 6px;
    margin-top: 10px;
  }
  
  .exam-info-card .card-body {
    padding: 8px;
  }
  
  .exam-info-card small {
    font-size: 0.75rem;
  }
  
  .fullscreen-warning {
    padding: 6px 8px;
  }
  
  .fullscreen-warning p {
    font-size: 0.8rem;
  }
  
  .instruction-item {
    padding: 5px;
    margin-bottom: 5px;
  }
  
  .instruction-item strong {
    font-size: 0.8rem;
  }
  
  .instruction-item small {
    font-size: 0.75rem;
  }
  
  .scrollable-body {
    padding: 8px;
  }
  
  .fixed-header {
    padding: 6px 8px;
  }
  
  .card-footer {
    padding: 6px 8px;
    font-size: 0.75rem;
  }
  
  .alert {
    padding: 6px 8px;
  }
  
  .alert h6 {
    font-size: 0.8rem;
  }
  
  .alert p {
    font-size: 0.75rem;
  }
}

@media (max-width: 479.98px) {
  .instructions-container {
    padding: 0 4px;
  }
  
  .h4 {
    font-size: 1.1rem;
  }
  
  .btn-compact {
    font-size: 0.75rem;
    padding: 7px 8px;
    min-height: 40px;
  }
  
  .start-exam-btn {
    font-size: 0.8rem;
    padding: 8px 12px;
    min-height: 40px;
  }
  
  .exam-info-card .card-body {
    padding: 6px;
  }
  
  .exam-info-card small {
    font-size: 0.7rem;
  }
  
  .fullscreen-warning {
    padding: 6px;
  }
  
  .instruction-item {
    padding: 4px;
    margin-bottom: 4px;
  }
  
  .scrollable-body {
    padding: 6px;
  }
  
  .fixed-header {
    padding: 6px;
  }
  
  .card-footer {
    padding: 6px;
    font-size: 0.7rem;
  }
}

/* Height-based responsive adjustments - only for desktop */
@media (min-width: 768px) and (max-height: 800px) {
  .scrollable-body {
    max-height: 50vh;
  }
  
  .instruction-item {
    padding: 4px 6px;
    margin-bottom: 4px;
  }
  
  .fullscreen-warning {
    padding: 6px 10px;
  }
  
  .action-buttons-fixed {
    padding: 8px;
  }
  
  .btn-compact {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
}

@media (min-width: 768px) and (max-height: 600px) {
  .scrollable-body {
    max-height: 40vh;
  }
  
  .exam-info-card .card-body {
    padding: 8px;
  }
  
  .fullscreen-warning {
    padding: 6px 8px;
  }
  
  .instruction-item {
    padding: 3px 6px;
    margin-bottom: 3px;
  }
  
  .action-buttons-fixed {
    padding: 6px;
  }
  
  .btn-compact {
    padding: 5px 10px;
    font-size: 0.8rem;
    min-height: 38px;
  }
  
  .start-exam-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
    min-height: 38px;
  }
}

@media (min-width: 768px) and (min-height: 900px) {
  .scrollable-body {
    max-height: 65vh;
  }
}

@media (min-width: 768px) and (min-height: 1200px) {
  .scrollable-body {
    max-height: 70vh;
  }
}

/* Touch improvements for mobile */
@media (max-width: 768px) {
  .btn {
    touch-action: manipulation;
  }
  
  .btn:hover {
    transform: none;
  }
  
  .scrollable-body::-webkit-scrollbar {
    width: 8px;
  }
  
  .scrollable-body::-webkit-scrollbar-thumb {
    background: #aaa;
  }
  
  /* Ensure smooth scrolling on mobile */
  .instructions-page {
    scroll-behavior: smooth;
  }
  
  /* Fix iOS momentum scrolling */
  .instructions-page,
  .scrollable-body {
    -webkit-overflow-scrolling: touch;
  }
}

/* Enhanced visual improvements */
.card-body {
  padding: 12px;
}

.text-center h3 {
  color: #2c3e50;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.fullscreen-warning h6 {
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.instruction-item strong {
  color: #2c3e50;
}

.instruction-item small {
  color: #6c757d;
  line-height: 1.3;
}

/* Bootstrap Icons - ensure they're available */
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css');
</style>