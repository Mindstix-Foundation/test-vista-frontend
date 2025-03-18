<template>
  <!-- Main Container -->
  <div class="container mt-4 mb-5">
    <div class="row p-2 g-2 mb-1">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10 col-md-10">
          <h5 class="text-left m-0 fw-bolder text-uppercase">QUESTION BANK MANAGEMENT</h5>
        </div>
      </div>
      <hr />
    </div>

    <div class="row gy-2 g-3 justify-content-center">
      <form id="viewQuestionForm" @submit.prevent="viewQuestions">
        <div class="row gy-2 justify-content-center">
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Board Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterBoard"
                label="Board"
                placeholder="Search for Board"
                :items="boards"
                v-model="selectedBoard"
                :search-keys="['name', 'abbreviation']"
                required
                @change="handleBoardChange"
                next-field-id="filterMedium"
              >
                <template #label>Board <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Medium Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterMedium"
                label="Medium"
                placeholder="Search for Medium"
                :items="mediums"
                v-model="selectedMedium"
                :search-keys="['instruction_medium']"
                :disabled="!selectedBoard"
                required
                @change="handleMediumChange"
                next-field-id="filterClass"
                label-key="instruction_medium"
              >
                <template #label>Medium <span class="text-danger">*</span></template>
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
                v-model="selectedStandard"
                :search-keys="['name']"
                :disabled="!selectedMedium"
                required
                @change="handleStandardChange"
                next-field-id="filterSubject"
              >
                <template #label>Standard <span class="text-danger">*</span></template>
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
                v-model="selectedSubject"
                :search-keys="['name', 'subject_name', 'subject']"
                :disabled="!selectedBoard"
                required
                @change="handleSubjectChange"
                next-field-id="filterChapter"
                label-key="name"
                item-key="id"
              >
                <template #label>Subject <span class="text-danger">*</span></template>
                <template #item="{ item }">
                  {{ item.name || item.subject_name || item.subject }}
                </template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8">
            <!-- Chapter Selection -->
            <div class="mb-3">
              <SearchableDropdown
                id="filterChapter"
                label="Chapter"
                placeholder="Search for Chapter"
                :items="chapters"
                v-model="selectedChapter"
                :search-keys="['name']"
                :disabled="!selectedSubject || !mediumStandardSubjectId"
                required
                label-key="name"
              >
                <template #label>Chapter <span class="text-danger">*</span></template>
              </SearchableDropdown>
            </div>
          </div>
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <!-- View Questions Button -->
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewQuestionBtn"
              :disabled="!isFormValid"
            >
              View Questions
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'

// Component name (for linter)
defineOptions({
  name: 'QuestionBank'
})

// Define interfaces for data structures
interface Board {
  id: number
  name: string
  abbreviation: string
  standards: Standard[]
  instruction_mediums: Medium[]
  subjects?: Subject[]
}

interface Standard {
  id: number
  board_id: number
  name: string
}

interface Subject {
  id: number
  board_id: number
  name: string
}

interface Medium {
  id: number
  board_id: number
  instruction_medium: string
}

interface MediumStandardSubject {
  id: number
  instruction_medium_id: number
  standard_id: number
  subject_id: number
}

interface Chapter {
  id: number
  medium_standard_subject_id: number
  name: string
  description?: string
}

const router = useRouter()

// Data
const boards = ref<Board[]>([])
const standards = ref<Standard[]>([])
const subjects = ref<Subject[]>([])
const mediums = ref<Medium[]>([])
const chapters = ref<Chapter[]>([])

// Selected items (objects instead of IDs)
const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<Medium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const selectedSubject = ref<Subject | null>(null)
const selectedChapter = ref<Chapter | null>(null)
const mediumStandardSubjectId = ref<number | null>(null)

// Computed
const isFormValid = computed(() => {
  return (
    selectedBoard.value !== null &&
    selectedMedium.value !== null &&
    selectedStandard.value !== null &&
    selectedSubject.value !== null &&
    selectedChapter.value !== null
  )
})

// Methods
const fetchBoards = async () => {
  try {
    const response = await axiosInstance.get('/boards')
    boards.value = response.data
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

const handleBoardChange = async () => {
  if (!selectedBoard.value) {
    resetForm()
    return
  }

  // Reset dependent fields
  selectedMedium.value = null
  selectedStandard.value = null
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  subjects.value = []
  mediums.value = []
  mediumStandardSubjectId.value = null

  try {
    // Fetch board details using the specific API endpoint that returns all data in one call
    const response = await axiosInstance.get(`/boards/${selectedBoard.value.id}`)

    // Extract data from the response
    const boardDetails = response.data

    // Update the selected board with the full details
    selectedBoard.value = boardDetails

    // Set mediums, standards, and subjects from the API response
    mediums.value = boardDetails.instruction_mediums || []
    standards.value = boardDetails.standards || []

    // Make sure we extract subjects properly
    if (boardDetails.subjects && boardDetails.subjects.length > 0) {
      subjects.value = boardDetails.subjects.map((subject: Subject) => ({
        id: subject.id,
        name: subject.name,
        board_id: boardDetails.id
      }))
    } else {
      subjects.value = []
    }

    console.log('Board details fetched successfully:', boardDetails)
    console.log('Mediums:', mediums.value)
    console.log('Standards:', standards.value)
    console.log('Subjects:', subjects.value)
  } catch (error) {
    console.error('Error fetching board details:', error)
    resetForm()
  }
}

const handleMediumChange = () => {
  // Reset dependent fields
  selectedStandard.value = null
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  mediumStandardSubjectId.value = null
  // Do not clear subjects here as they should persist
}

const handleStandardChange = () => {
  // Reset dependent fields
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  mediumStandardSubjectId.value = null
  // Do not clear subjects here as they should persist
}

const handleSubjectChange = async () => {
  // Reset chapter selection
  selectedChapter.value = null
  chapters.value = []

  // Find medium-standard-subject association
  await fetchMediumStandardSubject()

  // If we have a medium-standard-subject ID, fetch chapters
  if (mediumStandardSubjectId.value) {
    await fetchChapters()
  }
}

const fetchMediumStandardSubject = async () => {
  try {
    if (!selectedBoard.value || !selectedMedium.value ||
        !selectedStandard.value || !selectedSubject.value) {
      return
    }

    const response = await axiosInstance.get<MediumStandardSubject[]>('/medium-standard-subjects', {
      params: {
        boardId: selectedBoard.value.id,
        instruction_medium_id: selectedMedium.value.id,
        standard_id: selectedStandard.value.id,
        subject_id: selectedSubject.value.id
      }
    })

    if (response.data && response.data.length > 0) {
      mediumStandardSubjectId.value = response.data[0].id
    } else {
      mediumStandardSubjectId.value = null
    }
  } catch (error) {
    console.error('Error fetching medium-standard-subject:', error)
    mediumStandardSubjectId.value = null
  }
}

const fetchChapters = async () => {
  try {
    if (!mediumStandardSubjectId.value) return

    console.log('Fetching chapters with mediumStandardSubjectId:', mediumStandardSubjectId.value)

    const response = await axiosInstance.get('/chapters', {
      params: {
        mediumStandardSubjectId: mediumStandardSubjectId.value
      }
    })

    console.log('Raw chapter response:', response.data)

    // Make sure chapters have the expected structure
    if (Array.isArray(response.data)) {
      chapters.value = response.data
    } else if (response.data && Array.isArray(response.data.chapters)) {
      chapters.value = response.data.chapters
    } else {
      console.error('Unexpected chapter data structure:', response.data)
      chapters.value = []
    }

    console.log('Processed chapters:', chapters.value)
    console.log('Sample chapter:', chapters.value.length > 0 ? chapters.value[0] : 'No chapters')
  } catch (error) {
    console.error('Error fetching chapters:', error)
    chapters.value = []
  }
}

const resetForm = () => {
  selectedMedium.value = null
  selectedStandard.value = null
  selectedSubject.value = null
  selectedChapter.value = null
  standards.value = []
  subjects.value = []
  mediums.value = []
  chapters.value = []
  mediumStandardSubjectId.value = null
}

const viewQuestions = () => {
  if (!isFormValid.value) return

  // Store selected values in localStorage or state management
  localStorage.setItem('questionBank', JSON.stringify({
    boardId: selectedBoard.value?.id,
    boardName: selectedBoard.value?.name || '',
    mediumId: selectedMedium.value?.id,
    mediumName: selectedMedium.value?.instruction_medium || '',
    standardId: selectedStandard.value?.id,
    standardName: selectedStandard.value?.name || '',
    subjectId: selectedSubject.value?.id,
    subjectName: selectedSubject.value?.name || '',
    chapterId: selectedChapter.value?.id,
    chapterName: selectedChapter.value?.name || '',
    mediumStandardSubjectId: mediumStandardSubjectId.value
  }))

  // Navigate to question dashboard page
  router.push({ name: 'questionDashboard' })
}

// Lifecycle hooks
onMounted(() => {
  fetchBoards()
})
</script>

<style scoped>
/* Styles for nav link */
#navQuestion {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navQuestion {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

/* Form styles */
.form-floating > label {
  left: 0.5rem;
}

/* Button styles */
.btn-dark {
  min-width: 150px;
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
</style>
