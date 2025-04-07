<template>
  <div class="container my-4">
    <!-- Header Section -->
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <div class="col-auto">
          <button type="button" class="btn-close" aria-label="Close" @click="goBack"></button>
        </div>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col-12 col-sm-10">
          <p class="text-muted text-start fs-5 mb-1">
            <span class="d-inline-block">{{ decodeURIComponent(boardName) }}</span>
            <span class="d-inline-block ms-1">| {{ decodeURIComponent(mediumName) }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark mb-2">
            Standard {{ decodeURIComponent(standardName) }}
            <span class="d-block text-start text-secondary mt-1">
              {{ decodeURIComponent(subjectName) }} <span class="optional-info-marks-heading fs-5" v-if="patternDetails">{{ patternDetails.total_marks }} Marks</span> 
              <span class="d-block text-start text-secondary mt-1" >{{ patternName }}</span>
            </span>
          </h4>
        </div>
      </div>
      <hr />
    </div>

    <!-- Main Content -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <form id="createTestPaperForm" @submit.prevent="createTestPaper">
        <div class="row gy-2 justify-content-center">
          <!-- Chapter Marks Distribution Section -->
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Single Chapter Selection Notification -->
            <div class="alert alert-dark fw-bold" role="alert" v-if="chapters.length === 1 && totalMarks">
              <small>
                <i class="fas fa-info-circle me-1"></i>
                All {{ totalMarks }} marks will be assigned to 
                <span class="chapter-name">"{{ chapters[0].sequential_chapter_number }}. {{ chapters[0].name }}".</span>
              </small>
            </div>

            <!-- Chapter Weightage Section (Updated for Marks) -->
            <div class="card mb-3" v-if="chapters.length > 1">
              <div class="card-header bg-light">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Chapter Marks Distribution</h6>
                  <button 
                    type="button" 
                    class="btn btn-sm btn-outline-secondary" 
                    @click="distributeMarksEqually"
                  >
                    Split Equally
                  </button>
                </div>
              </div>
              <div class="card-body">
                <div class="row gy-2">
                  <div 
                    v-for="chapter in chapters" 
                    :key="chapter.id" 
                    class="col-12"
                  >
                    <div class="d-flex flex-column flex-md-row align-items-md-center mb-0">
                      <label :for="`marks-${chapter.id}`" class="me-2 flex-grow-1 mb-0 mb-md-0">
                        {{ chapter.sequential_chapter_number }}. {{ chapter.name }}
                      </label>
                      <div class="d-flex align-items-center ms-auto chapter-marks-controls mb-2">
                        <small class="text-muted fw-bold me-3 percent-display">{{ formatPercentage(calculatePercentage(chapter.marks)) }} %</small>
                        <div class="input-group marks-input-group">
                          <input 
                            type="number" 
                            class="form-control text-center" 
                            :class="{'is-invalid': chapter.marks === 0, 'no-spinner-sm': true}"
                            :id="`marks-${chapter.id}`" 
                            v-model.number="chapter.marks" 
                            min="1" 
                            :max="totalMarks"
                            @input="validateMarksDistribution"
                          >
                          <span class="input-group-text">Marks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Marks Summary -->
                <div class="marks-summary border-top mt-3 pt-3">
                  <div class="d-flex flex-row justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <span class="me-1 text-muted">Total:</span>
                      <span class="fw-bold badge bg-secondary rounded-pill">{{ totalMarks }}</span>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="me-1 text-muted">Assigned:</span>
                      <span class="fw-bold badge rounded-pill" 
                        :class="{
                          'bg-success': totalAssignedMarks === totalMarks,
                          'bg-warning text-dark': totalMarks && totalAssignedMarks < totalMarks,
                          'bg-danger': totalMarks && totalAssignedMarks > totalMarks
                        }">
                        {{ totalAssignedMarks }}
                      </span>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="me-1 text-muted">{{ totalMarks && totalMarks - totalAssignedMarks >= 0 ? 'Remaining:' : 'Excess:' }}</span>
                      <span class="fw-bold badge rounded-pill" 
                        :class="{
                          'bg-success': totalMarks && totalMarks - totalAssignedMarks === 0,
                          'bg-warning text-dark': totalMarks && totalMarks - totalAssignedMarks > 0,
                          'bg-danger': totalMarks && totalMarks - totalAssignedMarks < 0
                        }">
                        {{ totalMarks ? Math.abs(totalMarks - totalAssignedMarks) : 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <!-- Create Test Paper Button -->
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="createTestPaperBtn"
              :disabled="!isMarksDistributionValid || hasZeroMarksChapters"
            >
              Create Test Paper
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Under Development Notice -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <div class="col-12 col-sm-10">
        <div class="alert alert-info">
          <h6 class="mb-2">This page is under development</h6>
          <p class="mb-0">
            The test paper creation functionality will be implemented in a future update.
            This component will allow teachers to create and customize test papers based on the
            selected pattern.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'

// Define component name (for linter)
defineOptions({
  name: 'CreateTestPaperDetail'
})

// Setup router and route
const router = useRouter()
const route = useRoute()

// User profile and school data interfaces
interface UserProfile {
  id: number;
  name: string;
  email_id: string;
  schools: {
    id: number;
    name: string;
  }[];
  teaching_subjects: {
    id: number;
    standard: {
      id: number;
      name: string;
      sequence_number: number;
    };
    subject: {
      id: number;
      name: string;
    };
    medium: {
      id: number;
      name: string;
    };
  }[];
}

interface School {
  id: number;
  name: string;
  board: {
    id: number;
    name: string;
    abbreviation: string;
  };
  // Other fields not needed for this implementation
}

// Pattern data interface
interface PatternSection {
  id: number;
  pattern_id: number;
  sequence_number: number;
  section_number: number;
  sub_section: string;
  section_name: string;
  total_questions: number;
  mandotory_questions: number;
  marks_per_question: number;
  created_at: string;
  updated_at: string;
}

interface Pattern {
  id: number;
  pattern_name: string;
  board_id: number;
  standard_id: number;
  subject_id: number;
  total_marks: number;
  created_at: string;
  updated_at: string;
  board?: {
    id: number;
    name: string;
    abbreviation: string;
  };
  standard?: {
    id: number;
    name: string;
    sequence_number: number;
  };
  subject?: {
    id: number;
    name: string;
  };
  sections?: PatternSection[];
}

// State variables for profile and school data
const userProfile = ref<UserProfile | null>(null)
const schoolData = ref<School | null>(null)
const patternDetails = ref<Pattern | null>(null)
const isLoading = ref(false)
const schoolId = computed(() => userProfile.value?.schools?.[0]?.id || 0)

// Get question source from query params (but we don't show UI for it anymore)
const questionSource = computed(() => route.query.questionSource as string || 'both')

// Interface for Chapter with marks
interface ChapterWithMarks {
  id: number;
  name: string;
  sequential_chapter_number: number;
  marks: number;
  percentage?: number;
}

// State for chapters and total marks
const chapters = ref<ChapterWithMarks[]>([])
const totalMarks = ref<number>(0)

// Computed property to get total marks assigned
const totalAssignedMarks = computed(() => {
  return chapters.value.reduce((total, chapter) => total + (chapter.marks || 0), 0)
})

// Check if marks distribution is valid (equals totalMarks)
const isMarksDistributionValid = computed(() => {
  if (chapters.value.length === 0 || !totalMarks.value) return true
  return totalAssignedMarks.value === totalMarks.value
})

// Check if any chapter has 0 marks
const hasZeroMarksChapters = computed(() => {
  return chapters.value.some(chapter => chapter.marks === 0)
})

// Get details from query parameters
const boardId = route.query.boardId as string
const patternId = route.query.patternId as string
const boardName = computed(() => {
  // If board name is in the query params, use it
  if (route.query.board) {
    return route.query.board as string
  }
  // Otherwise, try to get it from the school data
  if (schoolData.value?.board?.name) {
    return encodeURIComponent(schoolData.value.board.name)
  }
  // Fallback
  return 'Not Selected'
})
const mediumName = computed(() => route.query.medium as string || 'Not Selected')
const standardName = computed(() => route.query.standard as string || 'Not Selected')
const subjectName = computed(() => route.query.subject as string || 'Not Selected')
const patternName = computed(() => route.query.patternName as string || 'Not Selected')

// Fetch pattern details
const fetchPatternDetails = async () => {
  if (!patternId) return;
  
  try {
    isLoading.value = true;
    const response = await axiosInstance.get(`/patterns/${patternId}`);
    patternDetails.value = response.data;
    
    // Update total marks from pattern if not already set
    if (!totalMarks.value && patternDetails.value?.total_marks) {
      totalMarks.value = patternDetails.value.total_marks;
      
      // Re-distribute marks based on new total
      if (chapters.value.length === 1) {
        chapters.value[0].marks = totalMarks.value;
      } else if (chapters.value.length > 1) {
        distributeMarksEqually();
      }
    }
  } catch (error) {
    console.error('Error fetching pattern details:', error);
  } finally {
    isLoading.value = false;
  }
};

// Calculate percentage for a given marks value
const calculatePercentage = (marks: number): number => {
  if (!totalMarks.value) return 0
  return Math.round((marks / totalMarks.value) * 100)
}

// Format percentage with leading zero for single digits
const formatPercentage = (percentage: number): string => {
  return percentage < 10 ? `0${percentage}` : `${percentage}`
}

// Distribute marks equally among chapters
const distributeMarksEqually = () => {
  if (chapters.value.length === 0 || !totalMarks.value) return
  
  const total = totalMarks.value
  
  // Simple equal distribution
  const equalShare = Math.floor(total / chapters.value.length)
  
  // Distribute equal share to each chapter
  chapters.value.forEach(chapter => {
    chapter.marks = equalShare
  })
  
  // Distribute any leftover marks to first chapters
  const leftoverMarks = total - (equalShare * chapters.value.length)
  for (let i = 0; i < leftoverMarks; i++) {
    chapters.value[i].marks += 1
  }
}

// Validate marks distribution to ensure it sums to totalMarks
const validateMarksDistribution = () => {
  if (!totalMarks.value) return
  
  const total = totalMarks.value
  
  // Ensure all marks are whole numbers (no decimals)
  chapters.value.forEach(chapter => {
    // Round to whole numbers
    chapter.marks = Math.round(chapter.marks)
    
    // Cap at total marks
    if (chapter.marks > total) {
      chapter.marks = total
    }
  })
}

// Parse and set chapters from query parameters
const parseChaptersFromQuery = () => {
  try {
    if (route.query.chapters && typeof route.query.chapters === 'string') {
      const chaptersData = JSON.parse(decodeURIComponent(route.query.chapters))
      chapters.value = chaptersData.map((chapter: any) => ({
        ...chapter,
        marks: chapter.marks || 0
      }))
    }
    
    // Set total marks from query params
    if (route.query.totalMarks && typeof route.query.totalMarks === 'string') {
      totalMarks.value = parseInt(route.query.totalMarks, 10)
      
      // If only one chapter, assign all marks to it
      if (chapters.value.length === 1) {
        chapters.value[0].marks = totalMarks.value
      } else if (chapters.value.length > 1) {
        // Otherwise distribute equally
        distributeMarksEqually()
      }
    }
  } catch (error) {
    console.error('Error parsing chapters data:', error)
  }
}

// Form submission handler (currently disabled)
const createTestPaper = () => {
  if (!isMarksDistributionValid.value) {
    alert(`Total assigned marks must equal ${totalMarks.value}`)
    return
  }
  
  if (hasZeroMarksChapters.value) {
    // Just show a warning but allow submission if user confirms
    if (!confirm('Some chapters have 0 marks. Are you sure you want to continue?')) {
      return
    }
  }
  
  // This functionality will be implemented in the future
  console.log('Creating test paper with question source:', questionSource.value)
  console.log('Chapters with marks distribution:', chapters.value)
  console.log('Pattern details:', patternDetails.value)
}

// Fetch user profile to get school ID
const fetchUserProfile = async () => {
  if (route.query.board) {
    // If board is already provided in route, no need to fetch
    return
  }
  
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/auth/profile')
    if (response.data && response.data.data) {
      userProfile.value = response.data.data
      // Once we have the user profile with school ID, fetch the school details
      if (schoolId.value) {
        await fetchSchoolDetails()
      }
    } else {
      console.error('Unexpected API response format for user profile:', response.data)
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
  } finally {
    isLoading.value = false
  }
}

// Fetch school details to get board info
const fetchSchoolDetails = async () => {
  if (!schoolId.value) {
    return
  }
  
  try {
    isLoading.value = true
    const response = await axiosInstance.get(`/schools/${schoolId.value}`)
    if (response.data) {
      schoolData.value = response.data
    } else {
      console.error('Unexpected API response format for school details:', response.data)
    }
  } catch (error) {
    console.error('Error loading school details:', error)
  } finally {
    isLoading.value = false
  }
}

// Initialize data on component mount
onMounted(async () => {
  // Fetch user profile and school details if needed
  await fetchUserProfile()
  
  // Parse chapters from query parameters
  parseChaptersFromQuery()
  
  // Fetch pattern details
  await fetchPatternDetails()
})

// Go back to previous page
const goBack = () => {
  router.back()
}
</script>

<style scoped>
/* Header styling */
.text-muted {
  color: #6c757d !important;
}

h4 {
  font-weight: 600;
  color: #212529;
}

.optional-info-marks-heading {
  background-color: rgba(0,0,0,0.1);
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  display: inline-block;
  color: #6c757d;
  
}

/* Button styling */
.btn-close {
  transition: all 0.2s ease;
}

.btn-close:hover {
  transform: rotate(90deg);
}

/* Form element styling */
.form-label {
  font-size: 1rem;
  color: #343a40;
}

.form-check {
  padding-left: 1.8rem;
  margin-bottom: 0.5rem;
}

.form-check-input {
  width: 1.2rem;
  height: 1.2rem;
  margin-top: 0.2rem;
  margin-left: -1.8rem;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #212529;
  border-color: #212529;
}

.form-check-label {
  cursor: pointer;
  font-weight: 500;
  padding-top: 0.1rem;
}

/* Button styles */
.btn-dark {
  min-width: 150px;
  transition: all 0.3s ease;
}

.btn-dark:hover:not(:disabled):not(.disabled) {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled,
.btn-dark.disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
}

/* Alert styling */
.alert {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Chapter marks input styling */
.input-group .form-control {
  border-right: none;
}

.input-group .input-group-text {
  background-color: #f8f9fa;
}

/* Custom validation styling without exclamation mark */
.form-control.is-invalid {
  border-color: #dc3545;
  background-image: none;
}

/* Improved validation border for input group */
.form-control.is-invalid + .input-group-text {
  border-color: #dc3545;
  border-left: none;
}

/* Ensure text remains centered in invalid inputs */
.form-control.text-center.is-invalid {
  text-align: center !important;
}

/* Additional fix for centering numbers in inputs */
.marks-input-group input[type="number"] {
  text-align: center !important;
}

.marks-input-group input[type="number"].is-invalid {
  text-align: center !important;
  padding-right: 0.75rem !important; /* Override Bootstrap's padding for validation icon */
}

/* Mobile optimized marks input group */
.marks-input-group {
  width: 150px;
}

/* Styling for the card */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

/* Responsive styling */
@media (max-width: 768px) {
  h4 {
    font-size: 1.4rem;
  }
  
  .fs-5 {
    font-size: 1rem !important;
  }
  
  /* Button sizing */
  .btn-dark {
    min-width: 140px;
  }
  
  /* Form layout adjustments */
  form .row {
    margin-left: 0;
    margin-right: 0;
  }
  
  /* Input sizing for small screens */
  .marks-input-group {
    width: 140px;
  }
  
  .marks-input-group .form-control,
  .marks-input-group .input-group-text {
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
  }
  
 
}

@media (max-width: 576px) {
  h4 {
    font-size: 1.2rem;
  }
  
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  /* Button full width on mobile */
  .btn-dark {
    width: 100%;
    min-width: auto;
  }
  
  /* Form spacing */
  .mb-4 {
    margin-bottom: 1.5rem !important;
  }
  
  /* Radio option spacing */
  .form-check {
    margin-bottom: 0.5rem;
  }
  
  /* Make percentage and marks row full width on small screens */
  .chapter-marks-controls {
    width: 100%;
    margin-left: 0 !important;
    margin-top: 0.25rem;
    justify-content: space-evenly;
  }
  
  .chapter-marks-controls .percent-display {
    min-width: 50px;
    text-align: right;
  }
  
  /* Optimize marks summary for small screens */
  .marks-summary .text-muted {
    font-size: 0.9rem;
  }
  
  .marks-summary .badge {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
  }
  
  .marks-input-group .form-control,
  .marks-input-group .input-group-text {
    padding: 0.625rem 0.75rem;
    font-size: 1.1rem;
    height: auto;
  }
  
  /* Hide number input spinners on small screens */
  .no-spinner-sm::-webkit-inner-spin-button, 
  .no-spinner-sm::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  
  .no-spinner-sm {
    appearance: textfield;
    -moz-appearance: textfield;
  }
  
  /* Style for chapter name in single chapter alert */
  .alert-dark small .chapter-name {
    display: block;
    margin-top: 0.5rem;
    word-break: break-word;
  }
}
</style> 