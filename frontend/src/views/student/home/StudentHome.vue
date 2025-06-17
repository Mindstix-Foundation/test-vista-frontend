<template>
  <div class="student-home">
    <!-- Main Content -->
    <div class="container mt-4 mb-5">
      <!-- Welcome Section -->
      <div class="row p-2 justify-content-center mb-4">
        <div class="col-12 col-sm-10">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <h4 class="card-title mb-3">
                <i class="bi bi-person-circle"></i> Welcome back, {{ studentName }}!
              </h4>
              <p class="card-text mb-0">Ready to continue your learning journey? Check out your latest progress and upcoming tests.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row gy-2 g-3 justify-content-center mb-4">
        <div class="col-6 col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <div class="text-primary mb-2">
                <i class="bi bi-file-text" style="font-size: 2rem;"></i>
              </div>
              <h5 class="card-title text-primary">{{ stats.testsCompleted }}</h5>
              <p class="card-text text-muted small">Tests Completed</p>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <div class="text-success mb-2">
                <i class="bi bi-trophy" style="font-size: 2rem;"></i>
              </div>
              <h5 class="card-title text-success">{{ stats.averageScore }}%</h5>
              <p class="card-text text-muted small">Average Score</p>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <div class="text-warning mb-2">
                <i class="bi bi-clock" style="font-size: 2rem;"></i>
              </div>
              <h5 class="card-title text-warning">{{ stats.pendingTests }}</h5>
              <p class="card-text text-muted small">Pending Tests</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row p-2 justify-content-center mb-4">
        <div class="col-12 col-sm-10">
          <h6 class="text-left fw-bold text-uppercase mb-3">
            <i class="bi bi-lightning"></i> Quick Actions
          </h6>
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <button class="btn btn-outline-primary w-100 h-100" @click="navigateTo('/student/practice')">
                <i class="bi bi-pencil-square d-block mb-2" style="font-size: 1.5rem;"></i>
                <span class="small">Practice Tests</span>
              </button>
            </div>
            <div class="col-6 col-md-3">
              <button class="btn btn-outline-success w-100 h-100" @click="navigateTo('/student/test-series')">
                <i class="bi bi-collection d-block mb-2" style="font-size: 1.5rem;"></i>
                <span class="small">Test Series</span>
              </button>
            </div>
            <div class="col-6 col-md-3">
              <button class="btn btn-outline-info w-100 h-100" @click="navigateTo('/student/results')">
                <i class="bi bi-bar-chart d-block mb-2" style="font-size: 1.5rem;"></i>
                <span class="small">Results</span>
              </button>
            </div>
            <div class="col-6 col-md-3">
              <button class="btn btn-outline-warning w-100 h-100" @click="navigateTo('/student/profile')">
                <i class="bi bi-person-gear d-block mb-2" style="font-size: 1.5rem;"></i>
                <span class="small">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Results -->
      <div class="row p-2 justify-content-center mb-4">
        <div class="col-12 col-sm-10">
          <h6 class="text-left fw-bold text-uppercase mb-3">
            <i class="bi bi-graph-up"></i> Recent Results
          </h6>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Test Name</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in recentResults" :key="result.id">
                  <td>{{ result.testName }}</td>
                  <td>{{ result.subject }}</td>
                  <td>{{ result.score }}%</td>
                  <td>
                    <span 
                      :class="['badge', result.score >= 70 ? 'bg-success' : result.score >= 50 ? 'bg-warning' : 'bg-danger']"
                    >
                      {{ result.status }}
                    </span>
                  </td>
                  <td>{{ formatDate(result.date) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="text-end mt-3">
            <button class="btn btn-outline-primary" @click="navigateTo('/student/results')">
              View All Results <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const studentName = ref('John Doe')
const stats = ref({
  testsCompleted: 24,
  averageScore: 85,
  pendingTests: 3
})

const recentResults = ref([
  {
    id: 1,
    testName: 'Algebra Fundamentals',
    subject: 'Mathematics',
    score: 85,
    status: 'Passed',
    date: new Date('2024-12-20')
  },
  {
    id: 2,
    testName: 'Physics Motion',
    subject: 'Science',
    score: 78,
    status: 'Passed',
    date: new Date('2024-12-18')
  },
  {
    id: 3,
    testName: 'Grammar Essentials',
    subject: 'English',
    score: 92,
    status: 'Passed',
    date: new Date('2024-12-15')
  },
  {
    id: 4,
    testName: 'World History',
    subject: 'History',
    score: 65,
    status: 'Needs Improvement',
    date: new Date('2024-12-12')
  }
])

// Methods
const navigateTo = (path: string) => {
  router.push(path)
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadUserStats = () => {
  // This would normally fetch data from server
  // For demo, we're using static data
  console.log('Loading user stats...')
}

const loadRecentActivity = () => {
  // This would normally fetch recent activity from server
  // For demo, we're using static data
  console.log('Loading recent activity...')
}

// Lifecycle
onMounted(() => {
  loadUserStats()
  loadRecentActivity()
})
</script>

<style scoped>
.student-home {
  background-color: #f8f9fa;
  min-height: calc(100vh - 76px); /* Adjust based on navbar height */
}

.card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.table-responsive {
  border-radius: 8px;
  overflow: hidden;
}

.badge {
  font-size: 0.75rem;
}
</style> 