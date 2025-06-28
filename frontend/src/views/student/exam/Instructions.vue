<template>
  <div class="instructions-page">
    <!-- Main Content -->
    <div class="container mt-1 mb-1">
      <div class="instructions-container">
        <!-- Page Header -->
        <div class="text-center mb-2">
          <h3 class="fw-bold mb-1">
            <i class="bi bi-info-circle"></i> Exam Instructions
          </h3>
          <p class="text-muted mb-0 small">Please read carefully before starting</p>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-4">
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
              <h5 class="mb-2 fw-bold">{{ examInstructions.title }}</h5>
              <div class="row">
                <div class="col-4">
                  <small><i class="bi bi-clock-fill me-1"></i><strong>{{ formatDuration(examInstructions.duration_minutes) }}</strong></small>
                </div>
                <div class="col-4">
                  <small><i class="bi bi-question-circle-fill me-1"></i><strong>{{ examInstructions.total_questions }} Questions</strong></small>
                </div>
                <div class="col-4">
                  <small><i class="bi bi-award-fill me-1"></i><strong>{{ examInstructions.total_marks }} Marks</strong></small>
                </div>
              </div>
            </div>
          </div>

          <!-- Fullscreen Warning -->
          <div class="fullscreen-warning text-center mb-2">
            <h6 class="mb-1"><i class="bi bi-fullscreen"></i> Fullscreen Mode Required</h6>
            <p class="mb-0 small">This exam must be taken in fullscreen mode. Click "Enter Fullscreen" below to continue.</p>
          </div>

          <!-- Scrollable Instructions Container -->
          <div class="instructions-card-container">
            <!-- Instructions -->
            <div class="card">
              <div class="card-header py-2 fixed-header">
                <h6 class="mb-0"><i class="bi bi-list-check"></i> Exam Instructions</h6>
              </div>
              <div class="card-body py-2 scrollable-body">
                <!-- Custom Instructions -->
                <div v-if="examInstructions.instructions" class="alert alert-info mb-2 py-2">
                  <h6 class="mb-1"><i class="bi bi-info-circle"></i> Special Instructions</h6>
                  <p class="mb-0 small">{{ examInstructions.instructions }}</p>
                </div>

                <!-- Negative Marking Warning -->
                <div v-if="examInstructions.negative_marking" class="alert alert-warning mb-2 py-2">
                  <h6 class="mb-1"><i class="bi bi-exclamation-triangle"></i> Negative Marking</h6>
                  <p class="mb-0 small">
                    This exam has negative marking. Each wrong answer will deduct 
                    <strong>{{ examInstructions.negative_marks_per_question || 0.25 }} marks</strong>.
                  </p>
                </div>

                <!-- General Instructions -->
                <div class="row">
                  <div class="col-md-6">
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
                  <div class="col-md-6">
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
                <div class="row">
                  <div class="col-md-6">
                    <small><strong><i class="bi bi-repeat"></i> Attempts Left:</strong> {{ examInstructions.attempts_left }}</small>
                  </div>
                  <div class="col-md-6">
                    <small><strong><i class="bi bi-calendar"></i> Available Until:</strong> {{ formatDate(examInstructions.due_date) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="text-center action-buttons-fixed">
            <button class="btn btn-outline-secondary me-2 btn-compact" @click="goBack">
              <i class="bi bi-arrow-left"></i> Back
            </button>
            <button 
              class="btn me-2 btn-compact" 
              :class="isFullscreen ? 'btn-success' : 'btn-warning'"
              @click="toggleFullscreen"
            >
              <i :class="isFullscreen ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen'"></i>
              {{ isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen' }}
            </button>
            <button 
              class="btn btn-success start-exam-btn btn-compact" 
              @click="startExam" 
              :disabled="!isFullscreen || isStarting"
            >
              <span v-if="isStarting" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-play-circle-fill me-2"></i>
              {{ isStarting ? 'Starting...' : 'Start Exam' }}
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
  overflow: hidden;
}

.instructions-container {
  max-width: 1000px;
  margin: 0 auto;
  height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
}

.instructions-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.instructions-card-container {
  flex: 1;
  padding-right: 8px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.instructions-card-container .card {
  display: flex;
  flex-direction: column;
  overflow: visible;
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
  max-height: 60vh;
  overflow-y: auto;
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

.card-footer .col-md-6 {
  padding: 2px 8px;
}

.card-footer strong {
  color: #495057;
}

.action-buttons-fixed {
  flex-shrink: 0;
  padding: 10px 0;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  margin-top: auto;
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
  padding: 6px 12px;
  font-size: 0.9rem;
}

.start-exam-btn {
  font-size: 1rem;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
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

/* Responsive adjustments */
@media (max-height: 800px) {
  .instructions-container {
    height: calc(100vh - 15px);
  }
  
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
    padding: 8px 0;
  }
  
  .btn-compact {
    padding: 4px 10px;
    font-size: 0.85rem;
  }
}

@media (max-height: 600px) {
  .instructions-container {
    height: calc(100vh - 10px);
  }
  
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
    padding: 6px 0;
  }
  
  .btn-compact {
    padding: 3px 8px;
    font-size: 0.8rem;
  }
  
  .start-exam-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}

@media (min-height: 900px) {
  .scrollable-body {
    max-height: 65vh;
  }
}

@media (min-height: 1200px) {
  .scrollable-body {
    max-height: 70vh;
  }
}

@media (max-width: 768px) {
  .instructions-container {
    max-width: 100%;
    padding: 0 10px;
  }
  
  .btn-compact {
    font-size: 0.8rem;
    padding: 5px 8px;
    margin-bottom: 5px;
  }
  
  .action-buttons-fixed {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .action-buttons-fixed .btn {
    flex: 1;
    min-width: 100px;
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