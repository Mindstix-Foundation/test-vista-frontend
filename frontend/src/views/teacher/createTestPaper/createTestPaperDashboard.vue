<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">Create Test Paper</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Main Content -->
    <div class="row gy-2 g-3 justify-content-center mt-2">
      <form id="createTestPaperForm" @submit.prevent="selectPattern">
        <div class="row gy-2 justify-content-center">
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Instruction Medium Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterMedium"
                label="Instruction Medium"
                placeholder="Search for Instruction Medium"
                :items="instructionMediums"
                v-model="selectedMediumObj"
                :search-keys="['name']"
                required
                @change="handleMediumChange"
                next-field-id="filterClass"
              >
                <template #label>Instruction Medium <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Class Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterClass"
                label="Standard"
                placeholder="Search for Standard"
                :items="standards"
                v-model="selectedStandardObj"
                :search-keys="['name', 'sequence_number']"
                :disabled="!selectedMediumObj"
                required
                @change="handleStandardChange"
                next-field-id="filterSubject"
              >
                <template #label>Standard <span class="text-danger">*</span></template>
                <template #item="{ item }">
                  {{ item.name }} 
                </template>
              </SearchableDropdown>
            </div>
          </div>
          
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Subject Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterSubject"
                label="Subject"
                placeholder="Search for Subject"
                :items="subjects"
                v-model="selectedSubjectObj"
                :search-keys="['subject_name']"
                :disabled="!selectedStandardObj"
                required
                label-key="subject_name"
                item-key="subject_id"
              >
                <template #label>Subject <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <!-- View Syllabus Button -->
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewSyllabusBtn"
              :disabled="!isFormValid || isLoading"
            >
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              Select Pattern
            </button>
          </div>
        </div>
      </form>
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
import axiosInstance from '@/config/axios'
import ToastNotification from '@/components/common/ToastNotification.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'

// Define component name (for linter)
defineOptions({
  name: 'CreateTestPaperDashboard'
})

// Initialize router at the top level of setup
const router = useRouter()

// Define interfaces for our data types
interface SchoolInstructionMedium {
  id: number;
  instruction_medium_id: number;
  school_id: number;
  created_at: string;
  updated_at: string;
  instruction_medium: {
    id: number;
    board_id: number;
    instruction_medium: string;
    created_at: string;
    updated_at: string;
  };
}

// Interface for simplified instruction medium that will be used in the dropdown
interface InstructionMediumItem {
  id: number;
  name: string;
  original: SchoolInstructionMedium;
}

interface StandardItem {
  id: number;
  board_id: number;
  name: string;
  sequence_number: number;
  created_at: string;
  updated_at: string;
}

interface SubjectItem {
  subject_id: number;
  subject_name: string;
}

interface UserProfile {
  id: number;
  name: string;
  email_id: string;
  schools: {
    id: number;
    name: string;
    board?: {
      id: number;
      name: string;
      abbreviation: string;
    };
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
  }[];
}

// User data
const userProfile = ref<UserProfile | null>(null)
const schoolId = computed(() => userProfile.value?.schools?.[0]?.id || 0)

// Selected objects (not just IDs)
const selectedMediumObj = ref<InstructionMediumItem | null>(null)
const selectedStandardObj = ref<StandardItem | null>(null)
const selectedSubjectObj = ref<SubjectItem | null>(null)

// Computed values for form values
const selectedInstructionMedium = computed(() => selectedMediumObj.value?.original.instruction_medium.id.toString() || '')
const selectedStandard = computed(() => selectedStandardObj.value?.id?.toString() || '')
const selectedSubject = computed(() => selectedSubjectObj.value?.subject_id?.toString() || '')

// Options for dropdowns
const instructionMediums = ref<InstructionMediumItem[]>([])
const standards = ref<StandardItem[]>([])
const subjects = ref<SubjectItem[]>([])

// Form validation
const isFormValid = computed(() => {
  return (
    selectedMediumObj.value !== null &&
    selectedStandardObj.value !== null &&
    selectedSubjectObj.value !== null
  )
})

// Loading state
const isLoading = ref(false)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// Fetch user profile to get school ID
const fetchUserProfile = async () => {
  try {
    isLoading.value = true
    const response = await axiosInstance.get('/auth/profile')
    if (response.data && response.data.data) {
      userProfile.value = response.data.data
      // After getting user profile, fetch instruction mediums for the school
      await fetchInstructionMediums()
    } else {
      console.error('Unexpected API response format for user profile:', response.data)
      showErrorToast('Failed to load user profile data')
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    showErrorToast('Failed to load user profile. Please refresh the page and try again.')
  } finally {
    isLoading.value = false
  }
}

// Fetch instruction mediums based on school ID
const fetchInstructionMediums = async () => {
  if (!schoolId.value) {
    showErrorToast('No school assigned to your profile')
    return
  }
  
  try {
    isLoading.value = true
    // Use the school-specific API to fetch instruction mediums
    const response = await axiosInstance.get(`/school-instruction-mediums/school/${schoolId.value}`)
    
    // Transform the data into a format that works with SearchableDropdown
    instructionMediums.value = response.data.map((item: SchoolInstructionMedium) => ({
      id: item.instruction_medium.id,
      name: item.instruction_medium.instruction_medium,
      original: item
    }))
  } catch (error) {
    console.error('Error loading instruction mediums:', error)
    showErrorToast('Failed to load instruction mediums. Please refresh the page and try again.')
  } finally {
    isLoading.value = false
  }
}

// Handlers for dropdown changes
const handleMediumChange = async () => {
  if (!selectedMediumObj.value) {
    resetDependentFields('medium')
    return
  }
  
  try {
    isLoading.value = true
    
    // Use the teaching subjects from the user profile to filter standards
    if (userProfile.value && userProfile.value.teaching_subjects) {
      // Create a unique list of standards
      const uniqueStandards = new Map()
      userProfile.value.teaching_subjects.forEach(subject => {
        const standard = subject.standard
        if (!uniqueStandards.has(standard.id)) {
          uniqueStandards.set(standard.id, {
            id: standard.id,
            name: standard.name,
            sequence_number: standard.sequence_number,
            board_id: 0 // We don't have this info but it's required by the interface
          })
        }
      })
      
      standards.value = Array.from(uniqueStandards.values())
    } else {
      // Fallback to API if user profile doesn't have teaching subjects
      const response = await axiosInstance.get(`/standards`)
      standards.value = response.data
    }
    
    resetDependentFields('medium')
  } catch (error) {
    showErrorToast('Failed to load standards')
    console.error('Error loading standards:', error)
  } finally {
    isLoading.value = false
  }
}

const handleStandardChange = async () => {
  if (!selectedStandardObj.value) {
    resetDependentFields('standard')
    return
  }
  
  try {
    isLoading.value = true
    
    // Use the teaching subjects from the user profile to filter subjects
    if (userProfile.value && userProfile.value.teaching_subjects) {
      // Filter subjects based on the selected standard
      const teachingSubjects = userProfile.value.teaching_subjects.filter(
        subject => subject.standard.id === parseInt(selectedStandard.value)
      )
      
      // Map to the format expected by the component
      subjects.value = teachingSubjects.map(item => ({
        subject_id: item.subject.id,
        subject_name: item.subject.name
      }))
    } else {
      // Fallback to API if user profile doesn't have teaching subjects
      const response = await axiosInstance.get(
        `/medium-standard-subjects/medium/${selectedInstructionMedium.value}/standard/${selectedStandard.value}`
      )
      subjects.value = response.data
    }
    
    resetDependentFields('standard')
  } catch (error) {
    showErrorToast('Failed to load subjects')
    console.error('Error loading subjects:', error)
  } finally {
    isLoading.value = false
  }
}

// View syllabus function
const selectPattern = async () => {
  if (!isFormValid.value) {
    showErrorToast('Please fill all required fields')
    return
  }
  
  try {
    isLoading.value = true
    
    // Set test paper details with both display names and IDs
    const queryParams = {
      // Display names for UI
      medium: encodeURIComponent(selectedMediumObj.value?.name || ''),
      standard: encodeURIComponent(selectedStandardObj.value?.name || ''),
      subject: encodeURIComponent(selectedSubjectObj.value?.subject_name || ''),
      
      // IDs for API calls
      mediumId: selectedInstructionMedium.value,
      standardId: selectedStandard.value,
      subjectId: selectedSubject.value,
      schoolId: schoolId.value.toString()
    }
    
    // Navigate to the pattern selection page with query parameters
    router.push({
      name: 'selectTestPattern',
      query: queryParams
    })
    
    showSuccessToast('Navigating to pattern selection')
  } catch (error) {
    showErrorToast('Failed to select pattern')
    console.error('Error selecting pattern:', error)
  } finally {
    isLoading.value = false
  }
}

// Reset dependent fields based on starting point
const resetDependentFields = (startingField: 'medium' | 'standard'): void => {
  if (startingField === 'medium') {
    selectedStandardObj.value = null
    selectedSubjectObj.value = null
    subjects.value = []
  } else if (startingField === 'standard') {
    selectedSubjectObj.value = null
  }
}

// Toast notification functions
const showSuccessToast = (message: string): void => {
  toastTitle.value = 'Success'
  toastMessage.value = message
  toastType.value = 'success'
  showToast.value = true
}

const showErrorToast = (message: string): void => {
  toastTitle.value = 'Error'
  toastMessage.value = message
  toastType.value = 'error'
  showToast.value = true
}

const closeToast = (): void => {
  showToast.value = false
}

// Load initial data
onMounted(async () => {
  await fetchUserProfile()
})
</script>

<style scoped>
/* Styling the card */
.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
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

/* Responsive styles to match TeacherProfile.vue */
@media (max-width: 768px) {
  /* Font size adjustments to match TeacherProfile.vue */
  h5 {
    font-size: 1.2rem !important;
    font-weight: 600 !important;
  }
  
  /* Improve form spacing */
  .mb-3 {
    margin-bottom: 1rem !important;
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
  
  /* Container padding for better small screen layout */
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

@media (max-width: 576px) {
  /* Phone-specific adjustments to match TeacherProfile.vue */
  h5 {
    font-size: 1.15rem !important;
  }
  
  /* Form element spacing */
  .mb-3 {
    margin-bottom: 0.8rem !important;
  }
  
  /* Button full width on mobile */
  .btn-dark {
    width: 100%;
    min-width: auto;
  }
  
  /* Container padding adjustments for phones */
  .container {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  /* Better field spacing on small screens */
  form .col-12 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
}
</style> 