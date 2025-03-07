<template>
  <form @submit.prevent="handleSubmit" novalidate>
    <div class="row gx-2 justify-content-center">
      <!-- Pattern Details Section -->
      <div class="col-12 col-sm-10 col-md-8 mb-2">
        <div class="row g-3">
          <!-- Pattern Name -->
          <div class="col-12">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                :class="{
                  'is-invalid':
                    !validationStates.patternName.valid && validationStates.patternName.touched,
                  'is-valid': validationStates.patternName.valid,
                }"
                id="patternName"
                placeholder="Enter Pattern Name"
                v-model="formData.patternName"
                @input="handlePatternNameInput"
                @blur="handlePatternNameBlur"
                required
              />
              <label for="patternName">Pattern Name <span class="text-danger">*</span></label>
              <div class="invalid-feedback">Please enter a pattern name</div>
            </div>
          </div>

          <!-- Board Selection -->
          <div class="col-12">
            <SearchableDropdown
              id="filterBoard"
              label="Board"
              placeholder="Search for Board"
              :items="boards"
              v-model="formData.selectedBoard"
              :search-keys="['name', 'abbreviation']"
              :class="{
                'is-invalid': !validationStates.board.valid && validationStates.board.touched,
                'is-valid': validationStates.board.valid && validationStates.board.touched,
              }"
              required
              @change="handleBoardChange"
              @update:modelValue="handleBoardInput"
            >
              <template #label> Board <span class="text-danger">*</span> </template>
            </SearchableDropdown>
            <div
              class="invalid-feedback"
              v-if="!validationStates.board.valid && validationStates.board.touched"
            >
              Please select a board
            </div>
          </div>

          <!-- Standard and Subject Selection -->
          <div class="d-flex flex-column flex-md-row gap-3">
            <div class="flex-grow-1">
              <SearchableDropdown
                id="filterStandard"
                label="Standard"
                placeholder="Search for Standard"
                :items="availableStandards"
                v-model="formData.selectedStandard"
                :disabled="!formData.selectedBoard"
                :search-keys="['name']"
                :next-field-id="'filterSubject'"
                :class="{
                  'is-invalid':
                    !validationStates.standard.valid && validationStates.standard.touched,
                  'is-valid': validationStates.standard.valid && validationStates.standard.touched,
                }"
                required
                @update:modelValue="handleStandardInput"
              >
                <template #label> Standard <span class="text-danger">*</span> </template>
              </SearchableDropdown>
              <div
                class="invalid-feedback"
                v-if="!validationStates.standard.valid && validationStates.standard.touched"
              >
                Please select a standard
              </div>
            </div>

            <div class="flex-grow-1">
              <SearchableDropdown
                id="filterSubject"
                label="Subject"
                placeholder="Search for Subject"
                :items="availableSubjects"
                v-model="formData.selectedSubject"
                :disabled="!formData.selectedBoard"
                :search-keys="['name']"
                :class="{
                  'is-invalid': !validationStates.subject.valid && validationStates.subject.touched,
                  'is-valid': validationStates.subject.valid && validationStates.subject.touched,
                }"
                required
                @update:modelValue="handleSubjectInput"
              >
                <template #label> Subject <span class="text-danger">*</span> </template>
              </SearchableDropdown>
              <div
                class="invalid-feedback"
                v-if="!validationStates.subject.valid && validationStates.subject.touched"
              >
                Please select a subject
              </div>
            </div>
          </div>

          <!-- Total Marks -->
          <div class="col-12">
            <div class="form-floating">
              <input
                type="number"
                class="form-control"
                :class="{
                  'is-invalid':
                    !validationStates.totalMarks.valid && validationStates.totalMarks.touched,
                  'is-valid': validationStates.totalMarks.valid,
                }"
                id="totalMarks"
                placeholder="Enter Total Marks"
                v-model="formData.totalMarks"
                @input="handleTotalMarksInput"
                @blur="handleTotalMarksBlur"
                required
              />
              <label for="totalMarks">Total Marks <span class="text-danger">*</span></label>
              <div class="invalid-feedback">Please enter total marks greater than 0</div>
            </div>
          </div>

          <!-- Remaining Marks Display -->
          <div class="col-12">
            <div class="d-flex justify-content-end align-items-center">
              <span
                :class="{ 'text-danger': remainingMarks > 0, 'text-success': remainingMarks === 0 }"
              >
                Remaining Marks: {{ remainingMarks }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Section Button -->
      <div class="col-12 col-sm-10 col-md-8 mt-3">
        <div class="row g-3 justify-content-center mb-3">
          <div class="col-12">
            <div class="btn-group w-100">
              <button
                type="button"
                class="btn btn-light"
                style="border: 1px solid gray !important"
                @click="addSection"
                :disabled="remainingMarks <= 0"
              >
                Add Section
              </button>
            </div>
            <div
              v-if="validationStates.totalMarks.valid && remainingMarks <= 0"
              class="alert alert-warning mt-2"
            >
              Cannot add more sections as all marks have been allocated.
            </div>
          </div>
        </div>
      </div>

      <!-- Added Sections Display -->
      <div v-if="sections.length > 0" class="col-12 col-sm-10 col-md-8 mb-3">
        <h5 class="mb-3">Added Sections</h5>
        <div v-for="(section, index) in sections" :key="index" class="mb-3">
          <div class="card">
            <div class="card-body">
              <div class="container">
                <div class="row mb-2 justify-content-between">
                  <div class="col-12 col-sm-3 text-center">
                    <strong>Total Questions:</strong> <span>{{ section.totalQuestions }}</span>
                  </div>
                  <div class="col-12 col-sm-3 text-center">
                    <strong>Mandatory Questions:</strong>
                    <span>{{ section.requiredQuestions }}</span>
                  </div>
                  <div class="col-12 col-sm-3 text-center">
                    <strong>Section Marks:</strong>
                    <span>{{ section.requiredQuestions * section.marksPerQuestion }}</span>
                  </div>
                  <div class="col-12 col-sm-auto text-end">
                    <button
                      type="button"
                      class="btn btn-link text-decoration-none text-black me-2 fs-5"
                      @click="$emit('editSection', index)"
                    >
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button
                      type="button"
                      class="btn btn-link text-decoration-none text-black fs-5"
                      @click.prevent.stop="$emit('deleteSection', index)"
                    >
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </div>
                <div class="row">
                  <div class="mt-2">
                    <span>
                      <strong class="me-3"
                        >Q{{ section.questionNumber }} {{ section.subQuestion }}</strong
                      >
                      {{ section.sectionName }}
                    </span>
                  </div>
                </div>
                <hr />
                <ul class="list-group list-group-flush">
                  <template v-if="section.sameType">
                    <li class="list-group-item">Question Type: {{ section.questionType }}</li>
                  </template>
                  <template v-else>
                    <li
                      v-for="(type, idx) in section.questionTypes"
                      :key="idx"
                      class="list-group-item"
                    >
                      {{ toRomanNumeral(idx + 1) }} - {{ type }}
                    </li>
                  </template>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="text-center mt-2">
          <button
            type="submit"
            class="btn btn-dark"
            :disabled="!isFormValid || remainingMarks !== 0"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            Save
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import axiosInstance from '@/config/axios'

interface Board {
  id: number
  name: string
  abbreviation: string
  standards: Array<{
    id: number
    name: string
  }>
  subjects: Array<{
    id: number
    name: string
  }>
}

interface StandardSubject {
  id: number
  name: string
}

export interface FormData {
  patternName: string
  selectedBoard: Board | null
  selectedStandard: StandardSubject | null
  selectedSubject: StandardSubject | null
  totalMarks: number
  remainingMarks?: number
}

interface Props {
  isEditMode?: boolean
  initialData?: FormData
  sections: Array<{
    id?: number
    questionNumber: string
    subQuestion: string
    sectionName: string
    totalQuestions: number
    requiredQuestions: number
    marksPerQuestion: number
    sameType: boolean
    questionType: string
    questionTypes: string[]
    seqencial_section_number?: number
    sub_section?: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
})

// Emits
const emit = defineEmits<{
  (e: 'submit', data: FormData): void
  (e: 'addSection', data: FormData): void
  (e: 'editSection', index: number): void
  (e: 'deleteSection', index: number): void
  (
    e: 'updatePatternInfo',
    data: {
      pattern_name: string
      board_id: number | undefined
      standard_id: number | undefined
      subject_id: number | undefined
      total_marks: number
    },
  ): void
}>()

// Form data
const formData = ref<FormData>({
  patternName: '',
  selectedBoard: null,
  selectedStandard: null,
  selectedSubject: null,
  totalMarks: 0,
})

// Set default value for sections prop
const sections = props.sections || []

// If initialData is provided, use it to initialize the form
onMounted(async () => {
  console.log('Component mounted, initial data:', props.initialData)
  await fetchBoards()
  console.log('Boards fetched:', boards.value)

  if (props.initialData) {
    console.log('Setting form data from initial data')
    // Store standard and subject temporarily
    const savedStandard = props.initialData.selectedStandard
    const savedSubject = props.initialData.selectedSubject

    // First set the form data without standard and subject
    formData.value = {
      ...props.initialData,
      selectedStandard: null,
      selectedSubject: null,
    }
    console.log('Form data after setting:', formData.value)

    // Validate the initial data
    if (formData.value.patternName) {
      validationStates.value.patternName.valid = true
      validationStates.value.patternName.touched = true
    }
    if (formData.value.selectedBoard) {
      console.log('Selected board found:', formData.value.selectedBoard)
      validationStates.value.board.valid = true
      validationStates.value.board.touched = true
      // Fetch the complete board data to get standards and subjects
      console.log('Fetching board details for ID:', formData.value.selectedBoard.id)
      await fetchBoardDetails(formData.value.selectedBoard.id)
      console.log('Board details fetched, updated board:', formData.value.selectedBoard)

      // Now restore standard and subject after board is fully loaded
      if (savedStandard) {
        console.log('Restoring standard:', savedStandard)
        const standard = formData.value.selectedBoard.standards.find(
          (s) => s.id === savedStandard.id,
        )
        console.log('Found standard:', standard)
        formData.value.selectedStandard = standard || null
        validationStates.value.standard.valid = !!standard
        validationStates.value.standard.touched = true
      }
      if (savedSubject) {
        console.log('Restoring subject:', savedSubject)
        const subject = formData.value.selectedBoard.subjects.find((s) => s.id === savedSubject.id)
        console.log('Found subject:', subject)
        formData.value.selectedSubject = subject || null
        validationStates.value.subject.valid = !!subject
        validationStates.value.subject.touched = true
      }
      console.log('Final form data after initialization:', formData.value)
    }
    if (formData.value.totalMarks) {
      validationStates.value.totalMarks.valid = true
      validationStates.value.totalMarks.touched = true
      calculateRemainingMarks()
    }
  }
})

const remainingMarks = ref(0)
const boards = ref<Board[]>([])
const isSubmitting = ref(false)

// Add validation states
const validationStates = ref({
  patternName: { valid: false, touched: false },
  board: { valid: false, touched: false },
  standard: { valid: false, touched: false },
  subject: { valid: false, touched: false },
  totalMarks: { valid: false, touched: false },
})

// Computed properties
const isFormValid = computed(() => {
  return (
    validationStates.value.patternName.valid &&
    validationStates.value.board.valid &&
    validationStates.value.standard.valid &&
    validationStates.value.subject.valid &&
    validationStates.value.totalMarks.valid &&
    remainingMarks.value === 0
  )
})

const availableStandards = computed(() => {
  return formData.value.selectedBoard?.standards || []
})

const availableSubjects = computed(() => {
  return formData.value.selectedBoard?.subjects || []
})

// Methods
const handlePatternNameInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  validationStates.value.patternName.touched = true
  validationStates.value.patternName.valid = value.trim().length > 0
}

const handlePatternNameBlur = () => {
  validationStates.value.patternName.touched = true
}

const handleBoardInput = async (value: unknown) => {
  console.log('Board input changed:', value)
  validationStates.value.board.touched = true
  validationStates.value.board.valid = value !== null

  // Clear standard and subject before setting new board
  formData.value.selectedStandard = null
  formData.value.selectedSubject = null
  validationStates.value.standard.valid = false
  validationStates.value.subject.valid = false
  validationStates.value.standard.touched = false
  validationStates.value.subject.touched = false

  formData.value.selectedBoard = value as Board | null

  if (formData.value.selectedBoard) {
    console.log('Fetching details for new board:', formData.value.selectedBoard)
    await fetchBoardDetails(formData.value.selectedBoard.id)
  }
}

// Fetch complete board details including standards and subjects
const fetchBoardDetails = async (boardId: number) => {
  try {
    console.log('Fetching board details, ID:', boardId)
    const response = await axiosInstance.get(`/boards/${boardId}`)
    console.log('Board details response:', response.data)

    // Update the board in formData with complete data
    if (formData.value.selectedBoard) {
      formData.value.selectedBoard = {
        ...formData.value.selectedBoard,
        standards: response.data.standards,
        subjects: response.data.subjects,
      }
      console.log('Updated board in form data:', formData.value.selectedBoard)
    }
  } catch (error) {
    console.error('Error fetching board details:', error)
  }
}

const handleBoardChange = () => {
  console.log('Board changed, resetting standard and subject')
  formData.value.selectedStandard = null
  formData.value.selectedSubject = null
  validationStates.value.standard.valid = false
  validationStates.value.subject.valid = false
  validationStates.value.standard.touched = false
  validationStates.value.subject.touched = false
}

const handleStandardInput = (value: unknown) => {
  validationStates.value.standard.touched = true
  validationStates.value.standard.valid = value !== null
  formData.value.selectedStandard = value as StandardSubject | null
}

const handleSubjectInput = (value: unknown) => {
  validationStates.value.subject.touched = true
  validationStates.value.subject.valid = value !== null
  formData.value.selectedSubject = value as StandardSubject | null
}

const handleTotalMarksInput = () => {
  validationStates.value.totalMarks.touched = true
  validationStates.value.totalMarks.valid = formData.value.totalMarks > 0
  calculateRemainingMarks()
}

const handleTotalMarksBlur = () => {
  validationStates.value.totalMarks.touched = true
}

const calculateRemainingMarks = () => {
  // Calculate total section marks from all added sections
  const totalSectionMarks = sections.reduce((total, section) => {
    const sectionMarks = section.requiredQuestions * section.marksPerQuestion;
    console.log(`PatternForm - Section ${section.sectionName}: ${sectionMarks} marks`);
    return total + sectionMarks;
  }, 0);

  console.log('PatternForm - Total marks calculation:', {
    totalPatternMarks: formData.value.totalMarks,
    totalSectionMarks,
    remainingMarks: formData.value.totalMarks - totalSectionMarks
  });

  remainingMarks.value = formData.value.totalMarks - totalSectionMarks;

  // Update the formData with the current remaining marks
  formData.value.remainingMarks = remainingMarks.value;
}

// Watch for changes in sections to recalculate remaining marks
watch(
  () => props.sections,
  () => {
    calculateRemainingMarks()
  },
  { deep: true, immediate: true },
)

const fetchBoards = async () => {
  try {
    const response = await axiosInstance.get('/boards')
    boards.value = response.data
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

const handleSubmit = async () => {
  // Mark all fields as touched
  Object.keys(validationStates.value).forEach((key) => {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  })

  if (!isFormValid.value) {
    return
  }

  // Only emit submit if not in edit mode
  if (!props.isEditMode) {
    emit('submit', formData.value)
  } else {
    // For edit mode, emit a different event for pattern info update
    emit('updatePatternInfo', {
      pattern_name: formData.value.patternName,
      board_id: formData.value.selectedBoard?.id,
      standard_id: formData.value.selectedStandard?.id,
      subject_id: formData.value.selectedSubject?.id,
      total_marks: formData.value.totalMarks,
    })
  }
}

const addSection = () => {
  // Don't proceed if no remaining marks
  if (remainingMarks.value <= 0) {
    return
  }

  // Mark all fields as touched to show validation errors
  Object.keys(validationStates.value).forEach((key) => {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  })

  // Check if form is valid for adding section
  if (!formData.value.patternName) {
    return
  }
  if (!formData.value.selectedBoard) {
    return
  }
  if (!formData.value.selectedStandard) {
    return
  }
  if (!formData.value.selectedSubject) {
    return
  }
  if (!formData.value.totalMarks || formData.value.totalMarks <= 0) {
    return
  }

  emit('addSection', { ...formData.value, remainingMarks: remainingMarks.value })
}

// Keep the computed watchers for debugging
watch(
  () => availableStandards.value,
  (newStandards) => {
    console.log('Available standards updated:', newStandards)
  },
)

watch(
  () => availableSubjects.value,
  (newSubjects) => {
    console.log('Available subjects updated:', newSubjects)
  },
)

// Update the defineExpose section
defineExpose({
  remainingMarks: computed(() => remainingMarks.value),
  recalculateRemainingMarks: () => {
    console.log('PatternForm - Recalculating remaining marks');
    calculateRemainingMarks();
    return remainingMarks.value;
  }
})

// Add toRomanNumeral function
const toRomanNumeral = (num: number): string => {
  const romanNumerals = [
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' },
  ]

  let result = ''
  let remaining = num

  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }

  return result
}
</script>

<style scoped>
/* Button styles */
.btn-dark {
  min-width: 120px;
}

.btn-dark:hover:not(:disabled) {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Spacing utilities */
.g-3 {
  gap: 0.5rem !important;
}

.mb-4 {
  margin-bottom: 1rem !important;
}

/* Mobile responsive styles */
@media (max-width: 575.98px) {
  .d-flex.flex-column.flex-sm-row {
    gap: 1rem !important;
  }
}
</style>
