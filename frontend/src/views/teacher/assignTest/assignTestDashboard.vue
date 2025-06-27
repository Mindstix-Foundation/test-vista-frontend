<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4" style="margin-left:4px">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">assign online test</h5>
        </div>

        <div class="col-12 col-sm-5 dynamic-style text-end">
          <router-link to="/teacher/assign-test/create" class="btn btn-dark">
            <i class="bi bi-plus-circle me-2"></i>Create Test Paper
          </router-link>
        </div>
      </div>
      <hr>
    </div>

    <div class="row justify-content-center align-items-center g-2 mb-4">
      <div class="col-md-10">
        <!-- Search and Sorting Controls -->
        <div class="row mb-4">
          <!-- Search Container -->
          <div class="col-12 col-md-8 mb-3">
            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control" 
                placeholder="Search by Name, Subject, Standard, Marks"
                @input="searchTestPapers"
              >
              <i v-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
            </div>
          </div>

          <!-- Sort Select -->
          <div class="col-12 col-md-4 mb-3">
            <div class="sort-field">
              <select 
                v-model="sortOption" 
                class="form-select sort-select" 
                @change="sortTestPapers"
              >
                <option value="name-asc">Sort by Name (A-Z)</option>
                <option value="name-desc">Sort by Name (Z-A)</option>
                <option value="date-asc">Sort by Date (Oldest First)</option>
                <option value="date-desc">Sort by Date (Newest First)</option>
                <option value="marks-asc">Sort by Marks (Low to High)</option>
                <option value="marks-desc">Sort by Marks (High to Low)</option>
              </select>
              <i class="bi bi-filter sort-icon"></i>
            </div>
          </div>
        </div>

        <!-- Test Papers Cards -->
        <div id="testPaperCards">
          <!-- Loading indicator -->
          <div v-if="isLoading" class="text-center my-5">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading test papers...</p>
          </div>

          <!-- Display filtered test papers -->
          <div 
            v-else-if="filteredTestPapers.length > 0"
            v-for="(paper, index) in filteredTestPapers" 
            :key="paper.id"
            class="mb-4"
          >
            <div class="card test-paper-card shadow-sm">
              <div class="card-body">
                <div class="row">
                  <!-- Paper Details -->
                  <div class="col-md-8">
                    <h5 class="card-title mb-3">
                      {{ paper.name }}
                    </h5>
                    
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <div class="paper-info-item">
                          <i class="bi bi-book text-dark me-2"></i>
                          <span class="fw-medium">Subject: <span class="fw-bold">{{ formatSubject(paper) }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-mortarboard text-dark me-2"></i>
                          <span class="fw-medium">Standard: <span class="fw-bold">{{ formatStandard(paper) }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-award text-dark me-2"></i>
                          <span class="fw-medium">Total Marks: <span class="fw-bold">{{ paper.pattern.total_marks }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-calculator text-dark me-2"></i>
                          <span class="fw-medium">Marks per Question: <span class="fw-bold">{{ paper.marks_per_question }}</span></span>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="paper-info-item">
                          <i class="bi bi-exclamation-triangle text-dark me-2"></i>
                          <span class="fw-medium">Negative Marking: <span class="fw-bold">{{ paper.negative_marking ? 'Yes' : 'No' }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-translate text-dark me-2"></i>
                          <span class="fw-medium">Mediums: 
                            <span v-for="(medium, idx) in formatMediums(paper)" :key="idx" class="fw-bold">{{ medium }}</span>
                          </span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-question-circle text-dark me-2"></i>
                          <span class="fw-medium">Total Questions: <span class="fw-bold">{{ paper.question_count }}</span></span>
                        </div>
                        <div class="paper-info-item">
                          <i class="bi bi-clock text-dark me-2"></i>
                          <span class="fw-medium">Duration: <span class="fw-bold">{{ paper.duration_minutes }} minutes</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Actions Section -->
                  <div class="col-md-4 d-flex flex-column justify-content-center align-items-md-end gap-2">
                    <button 
                      @click="assignToStudents(paper)" 
                      class="btn btn-primary action-btn w-100"
                    >
                      <i class="bi bi-person-plus me-2"></i>Assign to Students
                    </button>
                    <button 
                      @click="viewQuestions(paper)" 
                      class="btn btn-outline-dark action-btn w-100"
                    >
                      <i class="bi bi-eye me-2"></i>View Questions
                    </button>
                    <button 
                      @click="deleteTestPaper(paper)" 
                      class="btn btn-outline-danger action-btn w-100"
                    >
                      <i class="bi bi-trash me-2"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-else-if="!isLoading && filteredTestPapers.length === 0" class="text-center mt-4">
            <div class="empty-state">
              <i class="bi bi-file-earmark-x display-1 text-muted"></i>
              <p class="mt-3 text-muted">No test papers found. Try adjusting your search or create a new test paper.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Confirm Delete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            Are you sure you want to delete the test paper "{{ selectedPaper?.name }}"? This action cannot be undone.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Students Modal -->
    <div class="modal fade" id="assignModal" tabindex="-1" aria-labelledby="assignModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="assignModalLabel">Assign Test Paper: {{ selectedPaper?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body modal-body-fixed">
            <!-- Test Assignment Form -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="dueDate" class="form-label">Due Date *</label>
                <input type="date" class="form-control" id="dueDate" v-model="assignmentData.dueDate" required>
              </div>
              <div class="col-md-6">
                <label for="availableFrom" class="form-label">Available From *</label>
                <input type="datetime-local" class="form-control" id="availableFrom" v-model="assignmentData.availableFrom" required>
              </div>
            </div>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="maxAttempts" class="form-label">Max Attempts</label>
                <input type="number" class="form-control" id="maxAttempts" v-model="assignmentData.maxAttempts" min="1" max="10">
              </div>
              <div class="col-md-6">
                <label for="timeLimitMinutes" class="form-label">Time Limit (Minutes)</label>
                <input type="number" class="form-control" id="timeLimitMinutes" v-model="assignmentData.timeLimitMinutes" min="1">
                <small class="form-text text-muted">Leave empty to use test paper's default time limit</small>
              </div>
            </div>

            <!-- Student Filter Toggle -->
            <div class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <label class="form-label mb-0 fw-semibold">
                  Select Students 
                  <span v-if="!loadingStudents" class="text-muted small">({{ filteredStudents.length }} {{ assignedOnlyToggle ? 'assigned' : 'available' }})</span>
                </label>
                
                <!-- Student Filter Toggle - Top Right -->
                <div class="d-flex align-items-center">
                  <span class="me-2 small text-muted">Show:</span>
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
              
              <!-- Fixed height container for consistent modal sizing -->
              <div class="students-container">
                <!-- Loading indicator -->
                <div v-if="loadingStudents" class="students-loading">
                  <div class="text-center">
                    <div class="spinner-border spinner-border-sm text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 mb-0 text-muted small">Loading enrolled students...</p>
                  </div>
                </div>
                
                <!-- Student selection -->
                <div v-else-if="filteredStudents.length > 0" class="students-content">
                  <div class="form-check select-all-container">
                    <input class="form-check-input" type="checkbox" id="selectAllStudents" v-model="selectAllStudents" @change="toggleAllStudents">
                    <label class="form-check-label fw-semibold" for="selectAllStudents">
                      Select All Visible Students ({{ filteredStudents.length }})
                    </label>
                  </div>
                  <hr class="my-2">
                  <div class="student-list">
                    <div v-for="student in filteredStudents" :key="student.id" class="student-item">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" :id="`student-${student.id}`" v-model="student.selected">
                        <label class="form-check-label" :for="`student-${student.id}`">
                          <div class="d-flex justify-content-between align-items-center w-100">
                            <div class="student-info">
                              <span class="student-name">{{ student.name }} <span class="student-roll text-muted">({{ student.rollNumber }})</span></span>
                            </div>
                            <div class="student-actions">
                              <span v-if="student.isAssigned" class="badge bg-success me-2">Assigned</span>
                              <span v-else class="badge bg-secondary me-2">Not Assigned</span>
                              <!-- Remove assignment button for assigned students -->
                              <button 
                                v-if="student.isAssigned" 
                                @click="removeAssignment(student)"
                                class="btn btn-sm btn-outline-danger"
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
                <div v-else class="students-empty">
                  <div class="text-center">
                    <i class="bi bi-person-x display-6 text-muted mb-3"></i>
                    <h6 class="text-muted mb-2">
                      {{ assignedOnlyToggle ? 'No assigned students found for this test.' : 'No non-assigned students found for this test.' }}
                    </h6>
                    <p class="text-muted small mb-0">
                      Students need to request enrollment and be approved by you before they can be assigned tests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="confirmAssignment"
              :disabled="loadingStudents || filteredStudents.length === 0 || assigningTest || !hasSelectedStudents"
            >
              <span v-if="assigningTest" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-person-plus me-2"></i>
              {{ assigningTest ? 'Assigning...' : 'Assign Test' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Questions Modal -->
    <div class="modal fade" id="questionsModal" tabindex="-1" aria-labelledby="questionsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="questionsModalLabel">Test Questions</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Loading indicator -->
            <div v-if="loadingQuestions" class="text-center my-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3">Loading questions...</p>
            </div>

            <!-- Display questions -->
            <div v-else-if="currentQuestions">
              <div class="test-paper-info mb-4">
                <h6 class="text-primary">{{ currentQuestions.test_paper.name }}</h6>
                <div class="row">
                  <div class="col-md-4">
                    <small class="text-muted">Total Questions: {{ currentQuestions.test_paper.total_questions }}</small>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Total Marks: {{ currentQuestions.test_paper.total_marks }}</small>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Duration: {{ currentQuestions.test_paper.duration_minutes }} mins</small>
                  </div>
                </div>
              </div>

              <div class="questions-container">
                <div 
                  v-for="(question, questionIndex) in getAllQuestionsFlat()" 
                  :key="question.id"
                  class="question-item"
                >
                  <div class="question-wrapper">
                    <div class="d-flex w-100">
                      <!-- Question Content -->
                      <div class="question-content">
                        <div class="question-text">
                          {{ questionIndex + 1 }}. {{ question.question_text }}
                          <span v-if="question.chapter" class="chapter-badge">
                            {{ question.chapter.name }}
                          </span>
                        </div>
                        
                        <!-- MCQ Options -->
                        <div v-if="question.mcq_options && question.mcq_options.length > 0" class="options-container">
                          <div class="options-column">
                            <div 
                              v-for="(option, optionIndex) in question.mcq_options" 
                              :key="option.id"
                              class="option-item-column"
                              :class="{ 'correct-option': option.is_correct }"
                            >
                              <div class="option-prefix">
                                <i v-if="option.is_correct" class="bi bi-check-circle-fill correct-tick"></i>
                                <span v-else class="tick-placeholder"></span>
                              </div>
                              <span class="option-label">{{ getOptionLabel(optionIndex) }})</span>
                              <span class="option-text">{{ option.option_text }}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div v-else class="text-muted">
                          <i class="bi bi-info-circle me-1"></i>
                          No options available for this question
                        </div>
                      </div>
                      
                      <!-- Marks -->
                      <div class="question-marks">
                        <div class="marks-row">
                          <span class="marks fw-bold">{{ question.marks }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr class="question-divider" />
                </div>
                
                <div v-if="getAllQuestionsFlat().length === 0" class="text-center py-4 text-muted">
                  <i class="bi bi-question-circle me-2"></i>
                  No questions available in this test paper
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'

const router = useRouter()

// Define interfaces for type safety
interface TestPaper {
  id: number
  name: string
  marks_per_question: number
  question_count: number
  duration_minutes: number
  instructions: string
  negative_marking: boolean
  negative_marks_per_question: number
  randomize_questions: boolean
  randomize_options: boolean
  is_online: boolean
  created_at: string
  pattern: {
    id: number
    pattern_name: string
    total_marks: number
    standard: {
      id: number
      name: string
    }
    subject: {
      id: number
      name: string
    }
    sections: Array<{
      id: number
      marks_per_question: number
    }>
  }
  chapters: Array<{
    id: number
    name: string
  }>
  school: {
    id: number
    name: string
  }
}

interface QuestionOption {
  id: number
  option_text: string
  is_correct: boolean
  image?: {
    id: number
    image_url: string
    original_filename: string
  } | null
}

interface Question {
  id: number
  question_id: number
  question_text_id: number
  question_order: number
  marks: number
  is_mandatory: boolean
  question_type: {
    id: number
    type_name: string
  }
  question_text: string
  question_image?: {
    id: number
    image_url: string
    original_filename: string
  } | null
  chapter: {
    id: number
    name: string
  }
  topic: {
    id: number
    name: string
  }
  mcq_options: QuestionOption[]
  match_pairs: any[]
}

interface QuestionSubsection {
  id: number
  sequential_number: number
  question_type: {
    id: number
    type_name: string
  }
  questions: Question[]
}

interface QuestionSection {
  id: number
  section_name: string
  sequence_number: number
  section_number: number
  sub_section: string
  total_questions: number
  mandotory_questions: number
  marks_per_question: number
  subsections: QuestionSubsection[]
}

interface TestPaperQuestions {
  test_paper: {
    id: number
    name: string
    duration_minutes: number
    instructions: string
    negative_marking: boolean
    negative_marks_per_question: number
    randomize_questions: boolean
    randomize_options: boolean
    pattern: {
      id: number
      pattern_name: string
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
    total_questions: number
    total_marks: number
  }
  sections: QuestionSection[]
}

interface Student {
  id: number
  name: string
  rollNumber: string
  selected: boolean
  isAssigned?: boolean
}

// New reactive variables for filtering and assignment management
const assignedOnlyToggle = ref(false) // boolean: false = all students, true = assigned only
const assigningTest = ref(false)
const removingAssignment = ref(false)

// Reactive variables
const testPapers = ref<TestPaper[]>([])
const filteredTestPapers = computed(() => {
  let filtered = testPapers.value

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(paper => 
      paper.name.toLowerCase().includes(query) ||
      formatSubject(paper).toLowerCase().includes(query) ||
      formatStandard(paper).toLowerCase().includes(query) ||
      paper.pattern.total_marks.toString().includes(query)
    )
  }

  // Apply sorting
  if (sortOption.value) {
    const [field, direction] = sortOption.value.split('-')
    filtered = [...filtered].sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (field) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'date':
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case 'marks':
          aValue = a.pattern.total_marks
          bValue = b.pattern.total_marks
          break
        default:
          return 0
      }
      
      if (direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  return filtered
})

const isLoading = ref(false)
const searchQuery = ref('')
const sortOption = ref('date-desc')

// Modal and assignment related variables
const selectedPaper = ref<TestPaper | null>(null)
const students = ref<Student[]>([])
const filteredStudents = computed(() => {
  // Backend already filters based on assigned_only parameter
  // So we just return all students from the API response
  return students.value
})

const loadingStudents = ref(false)
const selectAllStudents = ref(false)
const assignmentData = ref({
  dueDate: '',
  availableFrom: '',
  maxAttempts: 1,
  timeLimitMinutes: null as number | null
})

// Questions modal variables
const currentQuestions = ref<any>(null)
const loadingQuestions = ref(false)

// Computed properties
const showQuestionsModal = ref(false)

const hasSelectedStudents = computed(() => {
  return filteredStudents.value.some(student => student.selected)
})

// API Methods
const fetchOnlineTestPapers = async () => {
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/create-test-paper/online')
    
    if (response.data && Array.isArray(response.data)) {
      testPapers.value = response.data
      console.log('Fetched online test papers:', response.data)
    } else {
      console.warn('Unexpected API response format:', response.data)
      testPapers.value = []
    }
  } catch (error: any) {
    console.error('Error fetching online test papers:', error)
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('User not authenticated')
      // Optionally redirect to login
    } else if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data?.message)
    } else {
      console.error('Failed to fetch test papers')
    }
    
    testPapers.value = []
  } finally {
    isLoading.value = false
  }
}

// Helper functions to format data for display
const formatSubject = (paper: TestPaper) => {
  // Use the pattern's subject information
  if (paper.pattern?.subject) {
    return paper.pattern.subject.name
  }
  // Fallback to pattern name
  return paper.pattern?.pattern_name || paper.name
}

const formatStandard = (paper: TestPaper) => {
  // Use the pattern's standard information
  if (paper.pattern?.standard) {
    return paper.pattern.standard.name
  }
  // Fallback to pattern name
  return paper.pattern?.pattern_name || paper.name
}

const formatMediums = (paper: TestPaper) => {
  // This would come from the API in a real implementation
  // For now, return a default value
  return ['English'] // Placeholder
}

// Methods
const searchTestPapers = () => {
  // Search is handled by computed property
}

const clearSearch = () => {
  searchQuery.value = ''
}

const sortTestPapers = () => {
  // Sorting is handled by computed property
}

const assignToStudents = async (paper: TestPaper) => {
  selectedPaper.value = paper
  
  // Reset toggle to show all students by default
  assignedOnlyToggle.value = false
  
  // Load enrolled students for this test paper's standard and subject
  await loadEnrolledStudents(paper)
  
  const modal = new Modal(document.getElementById('assignModal')!)
  modal.show()
}

// API method to load enrolled students
const loadEnrolledStudents = async (paper: TestPaper) => {
  try {
    loadingStudents.value = true
    console.log('Loading enrolled students for paper:', paper.name, 'Toggle:', assignedOnlyToggle.value)
    
    const params: any = {
      standard_id: paper.pattern.standard.id,
      subject_id: paper.pattern.subject.id,
      paper_id: paper.id
    }
    
    // Set assigned_only parameter based on toggle state
    params.assigned_only = assignedOnlyToggle.value
    
    const response = await axiosInstance.get('/student-subject-enrollments/teacher/enrolled-students', {
      params
    })
    
    console.log('API Response - Students found:', response.data?.length || 0)
    
    if (response.data && Array.isArray(response.data)) {
      // Transform API response to match Student interface
      students.value = response.data.map((enrollment: any) => ({
        id: enrollment.student_id,
        name: enrollment.student_name,
        rollNumber: enrollment.student_roll_number,
        selected: false,
        isAssigned: enrollment.is_assigned || false
      }))
      
      console.log('Loaded students:', students.value.length)
    } else {
      console.warn('Unexpected API response format:', response.data)
      students.value = []
    }
  } catch (error: any) {
    console.error('Error loading enrolled students:', error)
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      console.error('No students found or teacher does not teach this subject-standard combination')
      students.value = []
    } else if (error.response?.status === 401) {
      console.error('User not authenticated')
    } else {
      console.error('Failed to load enrolled students')
      students.value = []
    }
  } finally {
    loadingStudents.value = false
  }
}

const viewQuestions = async (paper: TestPaper) => {
  try {
    loadingQuestions.value = true
    console.log('Fetching questions for test paper:', paper.id)
    
    const response = await axiosInstance.get(`/create-test-paper/online/${paper.id}/questions`)
    currentQuestions.value = response.data
    
    // Show the modal
    const modal = new Modal(document.getElementById('questionsModal')!)
    modal.show()
    
    console.log('Questions loaded:', response.data)
  } catch (error) {
    console.error('Error fetching questions:', error)
    alert('Failed to load questions. Please try again.')
  } finally {
    loadingQuestions.value = false
  }
}

const closeQuestionsModal = () => {
  const modal = Modal.getInstance(document.getElementById('questionsModal')!)
  modal?.hide()
  currentQuestions.value = null
}

// New function to flatten all questions from nested structure
const getAllQuestionsFlat = () => {
  if (!currentQuestions.value || !currentQuestions.value.sections) {
    return []
  }
  
  const allQuestions: Question[] = []
  
  currentQuestions.value.sections.forEach(section => {
    section.subsections.forEach(subsection => {
      subsection.questions.forEach(question => {
        allQuestions.push(question)
      })
    })
  })
  
  return allQuestions
}

// New function to get option label (A, B, C, D, etc.)
const getOptionLabel = (index: number) => {
  return String.fromCharCode(65 + index) // Returns A, B, C, D, etc.
}

const deleteTestPaper = (paper: TestPaper) => {
  selectedPaper.value = paper
  const modal = new Modal(document.getElementById('deleteModal')!)
  modal.show()
}

const confirmDelete = async () => {
  if (!selectedPaper.value) return

  try {
    // Call delete API (to be implemented in backend)
    console.log('Deleting test paper:', selectedPaper.value.id)
    
    // For now, just remove from local array
    const index = testPapers.value.findIndex(p => p.id === selectedPaper.value!.id)
    if (index > -1) {
      testPapers.value.splice(index, 1)
    }
    
    const modal = Modal.getInstance(document.getElementById('deleteModal')!)
    modal?.hide()
    selectedPaper.value = null
    
    // TODO: Implement actual delete API call
    // await axiosInstance.delete(`/create-test-paper/online/${selectedPaper.value.id}`)
  } catch (error) {
    console.error('Error deleting test paper:', error)
    alert('Failed to delete test paper. Please try again.')
  }
}

const toggleAllStudents = () => {
  filteredStudents.value.forEach(student => {
    student.selected = selectAllStudents.value
  })
}

const confirmAssignment = async () => {
  if (filteredStudents.value.length === 0) {
    alert('No students are available for assignment.')
    return
  }
  
  const selectedStudents = filteredStudents.value.filter(s => s.selected)
  if (selectedStudents.length === 0) {
    alert('Please select at least one student')
    return
  }
  
  if (!assignmentData.value.dueDate || !assignmentData.value.availableFrom) {
    alert('Please fill in all required fields (Due Date and Available From)')
    return
  }

  try {
    assigningTest.value = true
    
    const assignmentPayload = {
      test_paper_id: selectedPaper.value!.id,
      student_ids: selectedStudents.map(s => s.id),
      due_date: new Date(assignmentData.value.dueDate).toISOString(),
      available_from: new Date(assignmentData.value.availableFrom).toISOString(),
      max_attempts: assignmentData.value.maxAttempts,
      time_limit_minutes: assignmentData.value.timeLimitMinutes
    }
    
    console.log('Assigning test with payload:', assignmentPayload)
    
    const response = await axiosInstance.post('/test-assignments/bulk', assignmentPayload)
    
    if (response.status === 201) {
      const result = response.data
      
      // Update assignment status for successfully assigned students
      selectedStudents.forEach(student => {
        student.isAssigned = true
        student.selected = false
      })
      
      // Show success message
      let message = `Test assigned successfully!\n`
      message += `Assigned: ${result.assigned || selectedStudents.length} students\n`
      
      if (result.failed && result.failed.length > 0) {
        message += `Failed: ${result.failed.length} students\n`
        message += `Reasons: ${result.failed.map((f: any) => `${f.student_name}: ${f.reason}`).join(', ')}`
      }
      
      alert(message)
      
      console.log('Assignment completed:', result)
    }
  } catch (error: any) {
    console.error('Error assigning test:', error)
    
    if (error.response?.status === 400) {
      alert('Invalid assignment data. Please check your inputs.')
    } else if (error.response?.status === 404) {
      alert('Test paper or students not found.')
    } else {
      alert('Failed to assign test. Please try again.')
    }
  } finally {
    assigningTest.value = false
  }
  
  // Close modal and reset form
  const modal = Modal.getInstance(document.getElementById('assignModal')!)
  modal?.hide()
  
  // Reset form
  selectAllStudents.value = false
  assignmentData.value = {
    dueDate: '',
    availableFrom: '',
    maxAttempts: 1,
    timeLimitMinutes: null
  }
  selectedPaper.value = null
  assignedOnlyToggle.value = false
}

const filterStudents = async () => {
  console.log('Toggle changed to:', assignedOnlyToggle.value)
  
  // Reset select all when filter changes
  selectAllStudents.value = false
  // Clear all selections when filter changes
  students.value.forEach(student => {
    student.selected = false
  })
  
  // Reload students with new filter if we have a selected paper
  if (selectedPaper.value) {
    await loadEnrolledStudents(selectedPaper.value)
  }
}

const removeAssignment = async (student: Student) => {
  if (!selectedPaper.value) return
  
  try {
    removingAssignment.value = true
    
    const response = await axiosInstance.delete('/test-assignments', {
      data: {
        student_id: student.id,
        test_paper_id: selectedPaper.value.id
      }
    })
    
    if (response.status === 200) {
      // Update student assignment status
      student.isAssigned = false
      student.selected = false
      
      console.log('Assignment removed successfully for student:', student.name)
      
      // Show success message
      alert(`Test assignment removed for ${student.name}`)
    }
  } catch (error: any) {
    console.error('Error removing assignment:', error)
    
    if (error.response?.status === 404) {
      alert('Assignment not found')
    } else if (error.response?.status === 400) {
      alert('Cannot remove assignment - student may have already started the test')
    } else {
      alert('Failed to remove assignment. Please try again.')
    }
  } finally {
    removingAssignment.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchOnlineTestPapers()
})
</script>

<style scoped>
/* Search field styling */
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  color: #6c757d;
}

.clear-search-icon {
  position: absolute;
  right: 10px;
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
  padding-left: 30px;
  border-radius: 8px;
  border: 1px solid #ced4da;
  height: 48px;
}

/* Sort field styling */
.sort-field {
  position: relative;
}

.sort-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 8px;
  appearance: none;
  background-image: none;
  transition: all 0.3s ease;
}

.sort-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  pointer-events: none;
  z-index: 10;
}

/* Questions Modal Styling */
.question-card {
  background-color: #f8f9fa;
  transition: all 0.2s ease;
}

.question-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.question-number {
  font-size: 0.8rem;
  min-width: 40px;
}

.question-type {
  font-size: 0.75rem;
  text-transform: uppercase;
}

.question-marks {
  font-size: 0.75rem;
}

.question-text {
  font-size: 1rem;
  line-height: 1.5;
  color: #212529;
}

.option-item {
  transition: all 0.2s ease;
  min-height: 50px;
}

.option-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.option-label {
  font-size: 0.9rem;
  min-width: 25px;
}

.option-content {
  font-size: 0.9rem;
  line-height: 1.4;
}

.test-paper-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

#questionsModal .modal-dialog {
  max-width: 900px;
}

#questionsModal .modal-body {
  max-height: 70vh;
  overflow-y: auto;
}

.subsection-type {
  margin-bottom: 0.5rem;
}

.subsection-type .badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
}

.chapter-topic-info {
  margin-top: 0.5rem;
}

.chapter-topic-info .badge {
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.match-pairs-container {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

/* Card styling aligned with project design */
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

.paper-info-item {
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.medium-badge {
  background-color: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #555;
  margin-right: 0.5rem;
}

.action-btn {
  min-width: 180px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  padding: 3rem 1rem;
}

.student-list {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
}

.form-check {
  margin-bottom: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .action-btn {
    min-width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .dynamic-style {
    text-align: left !important;
    margin-top: 1rem;
  }
}

/* Questions Display Styling (matching previewTestPaper.vue) */
.questions-container {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 0.75rem;
  background-color: #fafafa;
}

.question-item {
  background-color: transparent;
  border-radius: 0;
  border: none;
  box-shadow: none;
  transition: none;
  margin: 0;
  padding: 0;
}

.question-item:hover {
  box-shadow: none;
  transform: none;
}

.question-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin: 0;
  padding: 0;
  width: 100%;
}

.question-content {
  flex: 1;
}

.question-text {
  font-size: 1rem;
  font-weight: 500;
  color: #212529;
  line-height: 1.4;
  margin-bottom: 0.15rem;
}

.chapter-badge {
  background-color: #6c757d;
  color: white;
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.5rem;
}

.options-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.options-column {
  flex: 1;
}

.option-item-column {
  display: flex;
  align-items: center;
  border-radius: 0;
  border: none;
  background: none;
  transition: background-color 0.3s ease;
}

.option-item-column:hover {
  background-color: transparent;
}

.option-item-column.correct-option {
  background-color: transparent !important;
  color: #1e7e34;
}

.option-item-column.correct-option:hover {
  background-color: transparent !important;
}

.option-item-column.correct-option .option-label,
.option-item-column.correct-option .option-text {
  color: #1e7e34;
  font-weight: 600;
}

.option-prefix {
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.correct-tick {
  color: #1e7e34;
  font-size: 0.9rem;
}

.tick-placeholder {
  width: 16px;
  height: 16px;
  display: inline-block;
}

.option-label {
  font-weight: 600;
  margin-right: 0.5rem;
  min-width: 20px;
  color: #495057;
  font-size: 0.9rem;
}

.option-text {
  flex: 1;
  color: #212529;
  font-size: 0.9rem;
}

.question-marks {
  text-align: right;
}

.marks-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.marks {
  font-size: 0.9rem;
  font-weight: 500;
}

.question-divider {
  color: inherit;
  border: 0;
  border-top: var(--bs-border-width) solid;
  opacity: .25;
}

/* Assignment Modal Specific Styling */
.modal-body-fixed {
  min-height: 500px;
  max-height: 50vh;
  overflow-y: auto;
}

.students-container {
  min-height: 300px;
  max-height: 350px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background-color: #fafafa;
  position: relative;
}

.students-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
}

.students-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.students-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 250px;
  text-align: center;
}

.select-all-container {
  flex-shrink: 0;
  margin-bottom: 0.5rem;
}

.student-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
}

.student-item {
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.student-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.student-item .form-check {
  margin-bottom: 0;
}

.student-item .form-check-label {
  width: 100%;
  cursor: pointer;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.student-name {
  font-weight: 500;
  color: #212529;
}

.student-roll {
  font-size: 0.85rem;
}

.student-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Modal Dialog Adjustments */
#assignModal .modal-dialog {
  max-width: 800px;
}

#assignModal .modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

#assignModal .modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1.25rem 1.5rem;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

#assignModal .modal-title {
  font-weight: 600;
  color: #212529;
}

#assignModal .modal-body {
  padding: 1.5rem;
}

#assignModal .modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
}

/* Custom scrollbar for student list */
.student-list::-webkit-scrollbar {
  width: 6px;
}

.student-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.student-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.student-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Form styling improvements */
.form-label.fw-semibold {
  font-weight: 600;
  color: #495057;
}

.form-check-label.fw-semibold {
  font-weight: 600;
}

/* Toggle switch styling */
.form-check-input:checked {
  background-color: #007bff;
  border-color: #007bff;
}

.form-check-input:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Badge improvements */
.badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.35em 0.65em;
}

/* Button improvements */
.btn-sm {
  --bs-btn-padding-y: 0.25rem;
  --bs-btn-padding-x: 0.5rem;
  --bs-btn-font-size: 0.875rem;
}

.btn-outline-danger:hover {
  transform: translateY(-1px);
}

/* Loading spinner color */
.text-primary .spinner-border {
  color: #007bff !important;
}

/* Fix toggle label position jumping */
.toggle-label-fixed {
  min-width: 110px;
  text-align: left;
  display: inline-block;
}
</style>