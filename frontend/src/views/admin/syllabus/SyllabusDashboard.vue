<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">SYLLABUS MANAGEMENT</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Selection Form -->
    <div class="row p-2 gy-2 justify-content-center">
      <div class="col-12 col-sm-10 col-md-8">
        <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
          <!-- Board Selection -->
          <div class="form-floating mb-3">
            <select
              class="form-select"
              id="boardSelect"
              v-model="selectedBoard"
              @change="handleBoardChange"
              required
            >
              <option value="" disabled selected>Select a board</option>
              <option v-for="board in boards" :key="board.id" :value="board.id">
                {{ board.name }}
              </option>
            </select>
            <label for="boardSelect">Select Board</label>
          </div>

          <!-- Medium Selection (enabled only if board is selected) -->
          <div class="form-floating mb-3">
            <select
              class="form-select"
              id="mediumSelect"
              v-model="selectedMedium"
              :disabled="!selectedBoard"
              required
            >
              <option value="" disabled selected>Select a medium</option>
              <option v-for="medium in mediums" :key="medium.id" :value="medium.id">
                {{ medium.instruction_medium }}
              </option>
            </select>
            <label for="mediumSelect">Select Medium</label>
          </div>

          <!-- Standard Selection (enabled only if board is selected) -->
          <div class="form-floating mb-3">
            <select
              class="form-select"
              id="standardSelect"
              v-model="selectedStandard"
              :disabled="!selectedBoard"
              required
            >
              <option value="" disabled selected>Select a standard</option>
              <option v-for="standard in standards" :key="standard.id" :value="standard.id">
                {{ standard.name }}
              </option>
            </select>
            <label for="standardSelect">Select Standard</label>
          </div>

          <!-- Subjects Checkboxes (shown only if board is selected) -->
          <div v-if="selectedBoard" class="card mt-4">
            <div class="card-header">
              <h6 class="mb-0">Select Subjects</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div v-for="subject in subjects" :key="subject.id" class="col-md-6">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'subject' + subject.id"
                      v-model="selectedSubjects"
                      :value="subject.id"
                    />
                    <label class="form-check-label" :for="'subject' + subject.id">
                      {{ subject.name }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="d-grid gap-2 mt-4">
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getApiUrl } from '@/config/api'

interface Board {
  id: number
  name: string
  abbreviation: string
}

interface Medium {
  id: number
  instruction_medium: string
  board_id: number
}

interface Standard {
  id: number
  name: string
  board_id: number
}

interface Subject {
  id: number
  name: string
  board_id: number
}

interface MediumStandardSubject {
  id: number
  instruction_medium_id: number
  standard_id: number
  subject_id: number
}

// State
const boards = ref<Board[]>([])
const mediums = ref<Medium[]>([])
const standards = ref<Standard[]>([])
const subjects = ref<Subject[]>([])
const initialSubjectMappings = ref<MediumStandardSubject[]>([])

const selectedBoard = ref<number | ''>('')
const selectedMedium = ref<number | ''>('')
const selectedStandard = ref<number | ''>('')
const selectedSubjects = ref<number[]>([])
const isLoading = ref(false)

// Computed
const isFormValid = computed(() => {
  return (
    selectedBoard.value &&
    selectedMedium.value &&
    selectedStandard.value &&
    selectedSubjects.value.length > 0
  )
})

// Methods
const fetchBoards = async () => {
  try {
    const response = await fetch(getApiUrl('/boards'))
    if (!response.ok) throw new Error('Failed to fetch boards')
    boards.value = await response.json()
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

const handleBoardChange = async () => {
  if (!selectedBoard.value) return

  try {
    isLoading.value = true
    // Reset selections
    selectedMedium.value = ''
    selectedStandard.value = ''
    selectedSubjects.value = []
    initialSubjectMappings.value = []

    // Fetch mediums, standards, and subjects for selected board
    const [mediumsResponse, standardsResponse, subjectsResponse] = await Promise.all([
      fetch(getApiUrl(`/instruction-mediums/board/${selectedBoard.value}`)),
      fetch(getApiUrl(`/standards/board/${selectedBoard.value}`)),
      fetch(getApiUrl(`/subjects/board/${selectedBoard.value}`)),
    ])

    if (!mediumsResponse.ok) throw new Error('Failed to fetch mediums')
    if (!standardsResponse.ok) throw new Error('Failed to fetch standards')
    if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects')

    mediums.value = await mediumsResponse.json()
    standards.value = await standardsResponse.json()
    subjects.value = await subjectsResponse.json()
  } catch (error) {
    console.error('Error fetching board data:', error)
  } finally {
    isLoading.value = false
  }
}

const loadExistingMappings = async () => {
  if (!selectedMedium.value || !selectedStandard.value || !selectedBoard.value) return

  try {
    isLoading.value = true
    const response = await fetch(
      getApiUrl(
        `/medium-standard-subjects/medium/${selectedMedium.value}/standard/${selectedStandard.value}?board_id=${selectedBoard.value}`,
      ),
    )

    if (!response.ok) {
      throw new Error('Failed to fetch existing mappings')
    }

    const mappings: MediumStandardSubject[] = await response.json()
    console.log('Loaded existing mappings:', mappings)
    initialSubjectMappings.value = mappings
    selectedSubjects.value = mappings.map((m) => m.subject_id)
  } catch (error) {
    console.error('Error loading existing mappings:', error)
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    isLoading.value = true
    console.log('Starting submit with selections:', {
      medium: selectedMedium.value,
      standard: selectedStandard.value,
      subjects: selectedSubjects.value,
      initialMappings: initialSubjectMappings.value,
    })

    // Find mappings that were initially selected but are now unchecked
    const mappingsToDelete = initialSubjectMappings.value.filter(
      (mapping) => !selectedSubjects.value.includes(mapping.subject_id),
    )

    // Delete only the unchecked mappings
    for (const mapping of mappingsToDelete) {
      console.log(`Deleting mapping for subject ${mapping.subject_id} that was unchecked`)
      const deleteResponse = await fetch(getApiUrl(`/medium-standard-subjects/${mapping.id}`), {
        method: 'DELETE',
      })
      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete mapping for subject ${mapping.subject_id}`)
      }
    }

    // Find subjects that are newly checked
    const existingSubjectIds = initialSubjectMappings.value.map((m) => m.subject_id)
    const newlySelectedSubjects = selectedSubjects.value.filter(
      (subjectId) => !existingSubjectIds.includes(subjectId),
    )

    // Create mappings only for newly checked subjects
    for (const subjectId of newlySelectedSubjects) {
      console.log(`Creating new mapping for subject ${subjectId}`)
      const createResponse = await fetch(getApiUrl('/medium-standard-subjects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction_medium_id: selectedMedium.value,
          standard_id: selectedStandard.value,
          subject_id: subjectId,
        }),
      })

      if (!createResponse.ok) {
        throw new Error(`Failed to create mapping for subject ${subjectId}`)
      }
    }

    // Show success message
    alert('Syllabus mappings updated successfully!')

    // Reset form and initial mappings
    selectedSubjects.value = []
    selectedMedium.value = ''
    selectedStandard.value = ''
    initialSubjectMappings.value = []
  } catch (error) {
    console.error('Error updating syllabus mappings:', error)
    alert('Failed to update syllabus mappings. Please try again.')
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch([selectedMedium, selectedStandard], async () => {
  if (selectedMedium.value && selectedStandard.value) {
    await loadExistingMappings()
  } else {
    selectedSubjects.value = []
    initialSubjectMappings.value = []
  }
})

// Lifecycle hooks
onMounted(() => {
  fetchBoards()
})
</script>

<style scoped>
.form-floating > label {
  z-index: 3;
}

.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.card {
  border-radius: 0.5rem;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.form-check-label {
  cursor: pointer;
}

.form-check-input {
  cursor: pointer;
}
</style>
