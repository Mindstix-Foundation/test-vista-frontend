<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0 mb-3">Assigned Tests</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Main Content -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <div class="col-12 col-sm-10">
        <!-- Filter Tabs -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="d-flex gap-2 mb-3">
              <div class="btn-group flex-grow-1" role="group" aria-label="Assigned Test Filter">
                <button 
                  type="button" 
                  class="btn btn-outline-dark"
                  :class="{ active: activeFilter === 'all' }"
                  @click="filterTests('all')"
                >
                  All Tests
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-dark"
                  :class="{ active: activeFilter === 'active' }"
                  @click="filterTests('active')"
                >
                  Active
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-dark"
                  :class="{ active: activeFilter === 'upcoming' }"
                  @click="filterTests('upcoming')"
                >
                  Upcoming
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-dark"
                  :class="{ active: activeFilter === 'completed' }"
                  @click="filterTests('completed')"
                >
                  Completed
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-dark"
                  :class="{ active: activeFilter === 'absent' }"
                  @click="filterTests('absent')"
                >
                  Absent
                </button>
              </div>
            </div>
            
            <h6 class="mb-3 d-flex justify-content-between align-items-center">
              <span>{{ getFilterTitle() }}</span>
              <span class="badge bg-secondary">{{ filteredTests.length }} found</span>
            </h6>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading assigned tests...</p>
        </div>

        <!-- Assigned Test Cards -->
        <div v-else-if="filteredTests.length > 0">
          <div 
            v-for="test in filteredTests" 
            :key="test.id"
            class="card test-paper-card mb-4"
          >
            <div class="card-body">
              <div class="row">
                <!-- Test Details -->
                <div class="col-md-8">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <h5 class="card-title mb-0">{{ test.title }}</h5>
                    <span 
                      class="badge"
                      :class="getStatusBadgeClass(test.status)"
                    >
                      {{ getStatusDisplayText(test.status) }}
                    </span>
                  </div>
                  
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <div class="paper-info-item">
                        <i class="bi bi-calendar text-dark me-2"></i>
                        <span class="fw-medium">
                          {{ test.status === 'upcoming' ? 'Available:' : 'Due:' }} {{ test.dueDate }}
                        </span>
                      </div>
                      <div class="paper-info-item">
                        <i class="bi bi-clock text-dark me-2"></i>
                        <span class="fw-medium">Duration: {{ test.duration }} minutes</span>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="paper-info-item">
                        <i class="bi bi-question-circle text-dark me-2"></i>
                        <span class="fw-medium">Questions: {{ test.questions }}</span>
                      </div>
                      <div class="paper-info-item">
                        <i class="bi bi-trophy text-dark me-2"></i>
                        <span class="fw-medium">Max Score: {{ test.maxScore }} points</span>
                      </div>
                    </div>
                  </div>

                  <!-- Progress Section -->
                  <div v-if="test.status === 'active' && test.progress > 0" class="mb-3">
                    <div class="progress mb-2" style="height: 8px;">
                      <div 
                        class="progress-bar bg-success" 
                        role="progressbar" 
                        :style="`width: ${test.progress}%`"
                        :aria-valuenow="test.progress"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <p class="small text-muted mb-0">Progress: {{ test.progress }}% completed</p>
                    <p v-if="test.remainingTime && test.remainingTime !== '0:00'" class="small text-muted mb-0">
                      <i class="bi bi-clock me-1"></i>{{ formatRemainingTime(test.remainingTime) }}
                    </p>
                  </div>

                  <!-- Status Alerts -->
                  <div v-if="test.status === 'active' && test.progress === 0" class="alert alert-info py-2 mb-3">
                    <small><i class="bi bi-info-circle me-1"></i> Not started yet</small>
                  </div>
                  
                  <div v-if="test.status === 'upcoming'" class="alert alert-warning py-2 mb-3">
                    <small><i class="bi bi-clock me-1"></i> Available on {{ test.availableDate }}</small>
                  </div>

                  <div v-if="test.status === 'completed'" class="alert alert-success py-2 mb-3">
                    <small><i class="bi bi-check-circle me-1"></i> Test completed</small>
                  </div>

                  <div v-if="test.status === 'absent'" class="alert alert-danger py-2 mb-3">
                    <small><i class="bi bi-x-circle me-1"></i> Test deadline passed</small>
                  </div>
                </div>
                
                <!-- Actions Section -->
                <div class="col-md-4 d-flex flex-column justify-content-center align-items-md-end">
                  <button 
                    v-if="test.status === 'active' && test.progress > 0"
                    class="btn btn-continue-test action-btn mb-2" 
                    @click="continueTest(test.id)"
                  >
                    <i class="bi bi-play-circle me-2"></i>Continue Test
                  </button>
                  
                  <button 
                    v-if="test.status === 'active' && test.progress === 0"
                    class="btn btn-start-test action-btn mb-2" 
                    @click="startTest(test.id)"
                  >
                    <i class="bi bi-play-circle me-2"></i>Start Test
                  </button>
                  
                  <button 
                    v-if="test.status === 'upcoming'"
                    class="btn btn-secondary action-btn mb-2" 
                    disabled
                  >
                    <i class="bi bi-lock me-2"></i>Not Available Yet
                  </button>

                  <button 
                    v-if="test.status === 'completed'"
                    class="btn btn-success action-btn mb-2" 
                    @click="viewResults(test.id)"
                  >
                    <i class="bi bi-check-circle me-2"></i>View Results
                  </button>

                  <button 
                    v-if="test.status === 'absent'"
                    class="btn btn-danger action-btn mb-2" 
                    disabled
                  >
                    <i class="bi bi-x-circle me-2"></i>Deadline Passed
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="bi bi-journal-x display-1 text-muted"></i>
          <h5 class="mt-3 text-muted">No {{ activeFilter === 'all' ? '' : activeFilter }} tests found</h5>
          <p class="text-muted">Check back later for new assignments.</p>
        </div>
      </div>
    </div>

    <!-- Toast Notification for status messages -->
    <ToastNotification
      :show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :type="toastType"
      @close="closeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ToastNotification from '@/components/common/ToastNotification.vue'
import testAssignmentService, { type StudentAssignedTest } from '@/services/testAssignmentService'

// Define component name (for linter)
defineOptions({
  name: 'AssignedTest'
})

const router = useRouter()

// Reactive data
const activeFilter = ref('all')
const isLoading = ref(false)
const assignedTests = ref<StudentAssignedTest[]>([])

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref('success')

// Computed properties
const filteredTests = computed(() => {
  if (activeFilter.value === 'all') {
    return assignedTests.value
  }
  return assignedTests.value.filter(test => test.status === activeFilter.value)
})

// Methods
const filterTests = (type: string) => {
  activeFilter.value = type
}

const getFilterTitle = () => {
  switch (activeFilter.value) {
    case 'active':
      return 'Active Tests'
    case 'upcoming':
      return 'Upcoming Tests'
    case 'completed':
      return 'Completed Tests'
    case 'absent':
      return 'Absent Tests'
    default:
      return 'All Assigned Tests'
  }
}

const fetchAssignedTests = async () => {
  try {
    isLoading.value = true
    assignedTests.value = await testAssignmentService.getStudentAssignedTests()
  } catch (error) {
    console.error('Error fetching assigned tests:', error)
    showToastMessage(
      'Error',
      'Failed to load assigned tests. Please try again.',
      'error'
    )
  } finally {
    isLoading.value = false
  }
}

const continueTest = (testId: number) => {
  // Navigate to exam instructions page for continuing test
  router.push(`/student/exam/instructions?test=${testId}&type=continue`)
}

const startTest = (testId: number) => {
  // Navigate to exam instructions page for starting test
  router.push(`/student/exam/instructions?test=${testId}&type=start`)
}

const viewResults = (testId: number) => {
  // Navigate to view results page
  router.push(`/student/exam/results?test=${testId}`)
}

const closeToast = () => {
  showToast.value = false
}

const showToastMessage = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  toastTitle.value = title
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// Utility methods using the service
const getStatusBadgeClass = (status: string) => {
  return testAssignmentService.getStatusBadgeClass(status)
}

const getStatusDisplayText = (status: string) => {
  return testAssignmentService.getStatusDisplayText(status)
}

const formatRemainingTime = (remainingTime: string) => {
  return testAssignmentService.formatRemainingTime(remainingTime)
}

// Lifecycle
onMounted(() => {
  fetchAssignedTests()
})
</script>

<style scoped>
/* Test paper card styling to match project theme */
.test-paper-card {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.test-paper-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.test-paper-card .card-title {
  color: #212529;
  font-weight: 600;
}

/* Paper info item styling */
.paper-info-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

/* Action buttons styling */
.action-btn {
  min-width: 160px;
  border-radius: 5px;
  transition: all 0.3s ease;
}

/* Filter button styles to match project theme */
.btn-outline-dark {
  color: #212529;
  border-color: #212529;
}

.btn-outline-dark:hover:not(:disabled) {
  background-color: #212529;
  color: white;
  border-color: #212529;
}

.btn-outline-dark.active {
  background-color: #212529;
  border-color: #212529;
  color: white;
}

/* Test button styles */
.btn-start-test {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.btn-start-test:hover {
  background-color: #218838;
  border-color: #1e7e34;
  color: white;
}

.btn-continue-test {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-continue-test:hover {
  background-color: #0056b3;
  border-color: #004085;
  color: white;
}

/* Empty state styling to match project theme */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Responsive adjustments to match project patterns */
@media (max-width: 767.98px) {
  .action-btn {
    width: 100%;
    margin-bottom: 0.5rem;
    min-width: auto;
  }
  
  .paper-info-item {
    margin-bottom: 0.5rem;
  }
  
  /* Font size adjustments to match project */
  h5 {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
  }
  
  h6 {
    font-size: 1rem !important;
  }
  
  /* Button group adjustments for mobile */
  .btn-group {
    display: flex;
    width: 100%;
  }
  
  .btn-group .btn {
    flex: 1;
  }
}

@media (max-width: 576px) {
  /* Phone-specific adjustments to match project */
  h5 {
    font-size: 1.15rem !important;
  }
  
  h6 {
    font-size: 0.95rem !important;
  }
  
  /* Container padding adjustments */
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  /* Card body padding adjustments */
  .card-body {
    padding: 1rem 0.75rem;
  }
}
</style> 