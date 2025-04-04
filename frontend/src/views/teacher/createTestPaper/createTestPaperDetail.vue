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
              {{ decodeURIComponent(subjectName) }} | {{ patternName }}
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
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Question Source Selection -->
            <div class="mb-4">
              <label class="form-label fw-bold mb-3">Generate Test Paper From <span class="text-danger">*</span></label>
              
              <div class="d-flex flex-column gap-2">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    name="questionSource" 
                    id="bothQuestions" 
                    value="both"
                    v-model="questionSource"
                  >
                  <label class="form-check-label" for="bothQuestions">
                    Both Board and Other Questions
                  </label>
                </div>
                
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    name="questionSource" 
                    id="boardQuestionsOnly" 
                    value="board"
                    v-model="questionSource"
                  >
                  <label class="form-check-label" for="boardQuestionsOnly">
                    Board Questions Only
                  </label>
                </div>
                
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="radio" 
                    name="questionSource" 
                    id="otherQuestionsOnly" 
                    value="other"
                    v-model="questionSource"
                  >
                  <label class="form-check-label" for="otherQuestionsOnly">
                    Other Questions Only
                  </label>
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
              disabled
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

// State variables for profile and school data
const userProfile = ref<UserProfile | null>(null)
const schoolData = ref<School | null>(null)
const isLoading = ref(false)
const schoolId = computed(() => userProfile.value?.schools?.[0]?.id || 0)

// Question source selection
const questionSource = ref('both') // Default selection

// Get details from query parameters
const boardId = route.query.boardId as string
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

// Form submission handler (currently disabled)
const createTestPaper = () => {
  // This functionality will be implemented in the future
  console.log('Creating test paper with question source:', questionSource.value)
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
}
</style> 