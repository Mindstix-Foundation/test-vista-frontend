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
                :disabled="!selectedStandard"
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

// Define a flexible subject type for normalization
interface FlexibleSubject {
  id?: number;
  subject_id?: number;
  name?: string;
  subject_name?: string;
  subject?: string;
  board_id?: number;
  [key: string]: unknown; // Allow any other properties with unknown type
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

const handleBoardChange = () => {
  if (!selectedBoard.value) {
    resetForm()
    return
  }

  // Populate standards and mediums from the selected board
  standards.value = selectedBoard.value.standards || []
  mediums.value = selectedBoard.value.instruction_mediums || []

  console.log('Board changed, mediums:', mediums.value)
  console.log('Sample medium:', mediums.value.length > 0 ? mediums.value[0] : 'No mediums')

  // Reset dependent fields
  selectedMedium.value = null
  selectedStandard.value = null
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  subjects.value = []
  mediumStandardSubjectId.value = null
}

const handleMediumChange = () => {
  // Reset dependent fields
  selectedStandard.value = null
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  subjects.value = []
  mediumStandardSubjectId.value = null
}

const handleStandardChange = async () => {
  // Reset dependent fields
  selectedSubject.value = null
  selectedChapter.value = null
  chapters.value = []
  subjects.value = []
  mediumStandardSubjectId.value = null

  // Fetch subjects for the selected medium and standard
  if (selectedBoard.value && selectedMedium.value && selectedStandard.value) {
    try {
      console.log('Fetching subjects with params:', {
        mediumId: selectedMedium.value.id,
        standardId: selectedStandard.value.id,
        boardId: selectedBoard.value.id
      })

      // First try to get subjects directly from the board
      if (selectedBoard.value.subjects && selectedBoard.value.subjects.length > 0) {
        console.log('Using subjects from board data:', selectedBoard.value.subjects)
        subjects.value = selectedBoard.value.subjects
      } else {
        // If not available in board data, fetch from API
        const response = await axiosInstance.get(
          `/boards/${selectedBoard.value.id}/subjects`
        )

        console.log('Raw subject response from board API:', response.data)

        if (Array.isArray(response.data)) {
          subjects.value = response.data
        } else if (response.data && Array.isArray(response.data.subjects)) {
          subjects.value = response.data.subjects
        } else {
          console.error('Unexpected subject data structure from board API:', response.data)

          // Try the medium-standard-subjects endpoint as a fallback
          const mssResponse = await axiosInstance.get(
            `/medium-standard-subjects/medium/${selectedMedium.value.id}/standard/${selectedStandard.value.id}`,
            {
              params: {
                board_id: selectedBoard.value.id
              }
            }
          )

          console.log('Raw subject response from MSS API:', mssResponse.data)

          // Check for different possible data structures
          if (Array.isArray(mssResponse.data)) {
            subjects.value = mssResponse.data
          } else if (mssResponse.data && Array.isArray(mssResponse.data.subjects)) {
            subjects.value = mssResponse.data.subjects
          } else if (mssResponse.data && typeof mssResponse.data === 'object') {
            // If it's an object, try to extract subject information
            const extractedSubjects = [];

            // Log all keys to help diagnose the structure
            console.log('MSS response keys:', Object.keys(mssResponse.data));

            // Check if there's a subject property
            if (mssResponse.data.subject) {
              extractedSubjects.push({
                id: mssResponse.data.subject_id || mssResponse.data.id,
                name: mssResponse.data.subject_name || mssResponse.data.subject,
                board_id: selectedBoard.value.id
              });
            }

            if (extractedSubjects.length > 0) {
              subjects.value = extractedSubjects;
              console.log('Extracted subjects from object:', extractedSubjects);
            } else {
              console.error('Could not extract subjects from MSS response');
              subjects.value = [];
            }
          } else {
            console.error('Unexpected subject data structure from MSS API:', mssResponse.data)
            subjects.value = []
          }
        }
      }

      // Normalize subject data to ensure it has the correct structure
      subjects.value = subjects.value.map((subject: FlexibleSubject) => {
        // Make sure each subject has an id and name property
        return {
          id: subject.id || subject.subject_id || 1,
          name: subject.name || subject.subject_name || subject.subject || 'Unknown Subject',
          board_id: subject.board_id || selectedBoard.value?.id || 1
        };
      });

      console.log('Final normalized subjects:', subjects.value)
      console.log('Sample subject:', subjects.value.length > 0 ? subjects.value[0] : 'No subjects')

      // If we still don't have subjects, create a dummy one for testing
      if (subjects.value.length === 0) {
        console.warn('No subjects found, creating a dummy subject for testing');
        subjects.value = [{
          id: 1,
          name: 'Dummy Subject',
          board_id: selectedBoard.value.id
        }];
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      subjects.value = []
    }
  }
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
