<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row justify-content-between align-items-center mb-4">
      <div class="col-12 col-sm-6">
        <h5 class="m-0 fw-bolder text-uppercase">Result Dashboard</h5>
      </div>
      <div class="col-12 col-sm-6 text-end">
        <router-link to="/teacher/assign-test" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>Back to Tests
        </router-link>
      </div>
    </div>
    <hr class="mb-4">

    <!-- Test Paper Info -->
    <div class="row justify-content-center mb-4" v-if="testPaperInfo">
      <div class="col-md-10">
        <div class="card test-info-card">
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <h6 class="card-title text-primary mb-3">{{ testPaperInfo.name }}</h6>
                <div class="row">
                  <div class="col-md-6">
                    <div class="info-item">
                      <i class="bi bi-book text-dark me-2"></i>
                      <span class="fw-medium">Subject: <span class="fw-bold">{{ testPaperInfo.subject }}</span></span>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-mortarboard text-dark me-2"></i>
                      <span class="fw-medium">Standard: <span class="fw-bold">{{ testPaperInfo.standard }}</span></span>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <i class="bi bi-award text-dark me-2"></i>
                      <span class="fw-medium">Total Marks: <span class="fw-bold">{{ testPaperInfo.totalMarks }}</span></span>
                    </div>
                    <div class="info-item">
                      <i class="bi bi-clock text-dark me-2"></i>
                      <span class="fw-medium">Duration: <span class="fw-bold">{{ testPaperInfo.duration }} minutes</span></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-4 d-flex flex-column justify-content-center">
                <div class="stats-summary">
                  <div class="stat-item">
                    <span class="stat-value">{{ studentResults.length }}</span>
                    <span class="stat-label">Total Students</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ completedCount }}</span>
                    <span class="stat-label">Completed</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ pendingCount }}</span>
                    <span class="stat-label">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Summary -->
    <div class="row justify-content-center mb-4" v-if="completedCount > 0">
      <div class="col-md-10">
        <div class="card statistics-card">
          <div class="card-body py-3">
            <div class="d-flex justify-content-between align-items-center">
              <h6 class="mb-0 text-muted">
                <i class="bi bi-bar-chart me-2"></i>Test Statistics
              </h6>
              <div class="d-flex gap-4">
                <div class="stat-item-small">
                  <span class="stat-number-small text-success">{{ calculatedStats.highest }}</span>
                  <span class="stat-label-small">Highest</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-primary">{{ calculatedStats.average }}</span>
                  <span class="stat-label-small">Average</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-warning">{{ calculatedStats.lowest }}</span>
                  <span class="stat-label-small">Lowest</span>
                </div>
                <div class="stat-item-small">
                  <span class="stat-number-small text-info">{{ calculatedStats.passRate }}%</span>
                  <span class="stat-label-small">Pass Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Controls -->
    <div class="row justify-content-center mb-4">
      <div class="col-md-10">
        <div class="row align-items-center">
          <!-- Search Container -->
          <div class="col-12 col-lg-5 mb-3 mb-lg-0">
            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control" 
                placeholder="Search by student name or roll number"
                @input="filterResults"
              >
              <i v-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
            </div>
          </div>

          <!-- Filter Select -->
          <div class="col-12 col-lg-4 mb-3 mb-lg-0">
            <div class="filter-field">
              <select 
                v-model="statusFilter" 
                class="form-select filter-select" 
                @change="filterResults"
              >
                <option value="all">All Students</option>
                <option value="completed">Completed Only</option>
                <option value="pending">Pending Only</option>
              </select>
              <i class="bi bi-funnel filter-icon"></i>
            </div>
          </div>

          <!-- Auto Refresh Button -->
          <div class="col-12 col-lg-3 text-lg-end">
            <button 
              @click="toggleAutoRefresh" 
              class="btn w-100 w-lg-auto"
              :class="autoRefresh ? 'btn-success' : 'btn-outline-secondary'"
              :title="autoRefresh ? 'Auto-refresh ON (every 1 sec)' : 'Auto-refresh OFF'"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              <span>{{ autoRefresh ? 'Live' : 'Refresh' }}</span>
              <span v-if="autoRefresh" class="spinner-border spinner-border-sm ms-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="row justify-content-center">
      <div class="col-md-10">
        <!-- Loading indicator -->
        <div v-if="isLoading" class="text-center my-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading student results...</p>
        </div>

        <!-- Error message -->
        <div v-else-if="error" class="text-center my-5">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
          </div>
        </div>

        <!-- Results Table -->
        <div v-else-if="filteredResults.length > 0" class="table-container">
          <div class="table-responsive">
            <table class="table table-hover results-table">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Roll Number</th>
                  <th scope="col">Student Name</th>
                  <th scope="col">Marks Obtained</th>
                  <th scope="col">Time Taken</th>
                  <th scope="col">Status</th>
                  <th scope="col">Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(result, index) in filteredResults" :key="result.id" class="result-row">
                  <td class="text-muted">{{ result.rollNumber }}</td>
                  <td class="student-name">
                    {{ result.name }}
                  </td>
                  <td>
                    <div class="marks-display">
                      <span class="marks-obtained fw-bold">{{ result.marksObtained || '-' }}</span>
                      <span class="marks-total text-muted">/ {{ testPaperInfo?.totalMarks }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="time-taken">{{ formatTime(result.timeTaken) }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(result.status)">
                      {{ result.status }}
                    </span>
                  </td>
                  <td>
                    <div class="rank-badge" :class="getRankClass(result.rank)">
                      {{ result.rank === 0 ? '-' : result.rank || '-' }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No results message -->
        <div v-else-if="!isLoading && filteredResults.length === 0" class="text-center mt-4">
          <div class="empty-state">
            <i class="bi bi-graph-up display-1 text-muted"></i>
            <p class="mt-3 text-muted">No student results found. Students haven't taken the test yet.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'

const route = useRoute()
const router = useRouter()

// Define interfaces
interface StudentResult {
  id: number
  name: string
  rollNumber: string
  marksObtained: number | null
  timeTaken: number | null // in seconds
  percentage: number | null
  rank: number | null
  status: 'completed' | 'pending'
  submittedAt: string | null
}

interface TestPaperInfo {
  id: number
  name: string
  subject: string
  standard: string
  totalMarks: number
  duration: number
}

interface ApiTestPaperResult {
  rank: number
  student_name: string
  roll_number: string
  marks_obtained: number
  total_marks: number
  time_taken_seconds: number
  percentage: number
  status: 'completed' | 'pending'
  submitted_at?: string
  student_id: number
  test_attempt_id?: number
}

interface ApiTestPaperResultsResponse {
  test_paper_id: number
  test_paper_name: string
  subject: string
  standard: string
  total_marks: number
  duration_minutes: number
  total_students: number
  completed_students: number
  pending_students: number
  highest_score: number
  average_score: number
  lowest_score: number
  pass_rate: number
  results: ApiTestPaperResult[]
}

// Reactive variables
const isLoading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const error = ref<string | null>(null)
const autoRefresh = ref(false)
const refreshInterval = ref<number | null>(null)

// Test paper info
const testPaperInfo = ref<TestPaperInfo | null>(null)

// Student results
const studentResults = ref<StudentResult[]>([])

// Computed properties
const filteredResults = computed(() => {
  let filtered = studentResults.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(result => 
      result.name.toLowerCase().includes(query) ||
      result.rollNumber.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(result => {
      if (statusFilter.value === 'completed') return result.status === 'completed'
      if (statusFilter.value === 'pending') return result.status === 'pending'
      return true
    })
  }

  // Sort by rank first, then by roll number
  filtered = [...filtered].sort((a, b) => {
    // Pending students (rank 0) come first
    if (a.rank === 0 && b.rank !== 0) return -1
    if (a.rank !== 0 && b.rank === 0) return 1
    
    // Both pending - sort by roll number
    if (a.rank === 0 && b.rank === 0) {
      return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true })
    }
    
    // Both completed - sort by rank first, then by roll number
    if (a.rank !== b.rank) {
      return (a.rank || 999) - (b.rank || 999)
    }
    
    // Same rank - sort by roll number
    return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true })
  })

  return filtered
})

const completedCount = computed(() => {
  return studentResults.value.filter(result => result.status === 'completed').length
})

const pendingCount = computed(() => {
  return studentResults.value.filter(result => result.status === 'pending').length
})

const calculatedStats = computed(() => {
  const completedResults = studentResults.value.filter(result => result.status === 'completed')
  
  if (completedResults.length === 0) {
    return {
      highest: 0,
      average: 0,
      lowest: 0,
      passRate: 0
    }
  }

  // Use marks for highest/lowest/average (not percentage)
  const marks = completedResults.map(result => result.marksObtained || 0)
  const percentages = completedResults.map(result => result.percentage || 0)
  
  const highest = Math.max(...marks)
  const lowest = Math.min(...marks)
  const average = Math.round(marks.reduce((sum, mark) => sum + mark, 0) / marks.length)
  
  // Pass rate based on percentage >= 40%
  const passRate = Math.round((percentages.filter(perc => perc >= 40).length / percentages.length) * 100)

  return {
    highest,
    average,
    lowest,
    passRate
  }
})

// Methods
const fetchTestPaperResults = async () => {
  try {
    const testPaperId = route.params.testPaperId
    if (!testPaperId) {
      throw new Error('Test paper ID not found')
    }

    const response = await axiosInstance.get<ApiTestPaperResultsResponse>(
      `/test-assignments/test-paper/${testPaperId}/results`
    )

    const data = response.data

    // Set test paper info
    testPaperInfo.value = {
      id: data.test_paper_id,
      name: data.test_paper_name,
      subject: data.subject,
      standard: data.standard,
      totalMarks: data.total_marks,
      duration: data.duration_minutes
    }

    // Transform API results to component format
    studentResults.value = data.results.map((result, index) => ({
      id: result.student_id,
      name: result.student_name,
      rollNumber: result.roll_number,
      marksObtained: result.marks_obtained,
      timeTaken: result.time_taken_seconds,
      percentage: result.percentage,
      rank: result.rank,
      status: result.status,
      submittedAt: result.submitted_at || null
    }))



  } catch (err) {
    console.error('Error fetching test paper results:', err)
    error.value = 'Failed to load test results. Please try again.'
  }
}

const filterResults = () => {
  // Filter logic is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    // Start auto-refresh every 1 second
    refreshInterval.value = setInterval(async () => {
      await fetchTestPaperResults()
    }, 1000)
  } else {
    // Stop auto-refresh
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }
}



const getRankClass = (rank: number | null) => {
  if (!rank || rank === 0) return 'rank-pending'
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return 'rank-default'
}



const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-success'
    case 'pending':
      return 'bg-warning'
    default:
      return 'bg-secondary'
  }
}



const formatTime = (seconds: number | null) => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}



// Lifecycle
onMounted(async () => {
  try {
    isLoading.value = true
    await fetchTestPaperResults()
  } catch (err) {
    console.error('Error loading result dashboard:', err)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  // Clean up auto-refresh interval when component is unmounted
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})
</script>

<style scoped>
/* Search and Filter Styling */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
}

.clear-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
  cursor: pointer;
}

.clear-search-icon:hover {
  color: #212529;
}

input[type="text"] {
  padding-left: 35px;
  padding-right: 35px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  height: 48px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input[type="text"]:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.filter-field {
  position: relative;
}

.filter-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 8px;
  appearance: none;
  background-image: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.filter-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 10;
}

/* Test Info Card */
.test-info-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.info-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
}

/* Table Styling */
.table-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.results-table {
  margin-bottom: 0;
}

.results-table thead th {
  border: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 1rem 0.75rem;
  vertical-align: middle;
}

.results-table tbody td {
  padding: 1rem 0.75rem;
  vertical-align: middle;
}



.result-row:hover {
  background-color: #f8f9fa;
}

.student-name {
  font-weight: 500;
}

.marks-display {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.marks-obtained {
  font-size: 1.1rem;
}

.marks-total {
  font-size: 0.9rem;
}

.time-taken {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}



.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.85rem;
  min-width: 32px;
  min-height: 32px;
}

.rank-gold {
  background: #ffd700;
  color: #b45309;
  border: 2px solid #ffed4a;
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}

.rank-silver {
  background: #c0c0c0;
  color: #374151;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(192, 192, 192, 0.3);
}

.rank-bronze {
  background: #cd7f32;
  color: white;
  border: 2px solid #d97706;
  box-shadow: 0 2px 4px rgba(205, 127, 50, 0.3);
}

.rank-default {
  background: #f1f3f4;
  color: #5f6368;
  border: 2px solid #e8eaed;
  box-shadow: 0 2px 4px rgba(241, 243, 244, 0.3);
}

.rank-pending {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 32px;
  height: 32px;
}



/* Statistics Card */
.statistics-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number-small {
  font-size: 1.25rem;
  font-weight: bold;
  display: block;
  line-height: 1;
}

.stat-label-small {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
}

/* Button Styling */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-summary {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    width: 100%;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
  
  .d-flex.gap-4 {
    gap: 1rem !important;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .stat-number-small {
    font-size: 1rem;
  }
  
  .stat-label-small {
    font-size: 0.7rem;
  }
}

@media (max-width: 992px) {
  .text-lg-end {
    text-align: center !important;
  }
  
  .w-lg-auto {
    width: 100% !important;
  }
}

/* Custom scrollbar for table */
.table-responsive::-webkit-scrollbar {
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 