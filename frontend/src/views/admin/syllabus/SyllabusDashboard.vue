<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1 mt-2">
      <div class="row g-2 justify-content-center align-items-center mb-4">
        <div class="col-12 col-sm-10">
          <h5 class="text-left fw-bolder text-uppercase m-0">SYLLABUS MANAGEMENT</h5>
        </div>
      </div>
      <hr />
    </div>

    <!-- Form Section -->
    <div class="row gy-2 g-3 justify-content-center">
      <form @submit.prevent="handleSubmit" id="viewSyllabusForm">
        <div class="row gy-2 justify-content-center">
          <!-- Board Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterBoard"
                label="Board"
                placeholder="Search for Board"
                :items="boards"
                v-model="selectedBoard"
                :search-keys="['name', 'abbreviation']"
                :class="{
                  'is-invalid': !validationStates.board.valid && validationStates.board.touched,
                  'is-valid': validationStates.board.valid && validationStates.board.touched,
                }"
                required
                @change="handleBoardChange"
                @update:modelValue="handleBoardInput"
                next-field-id="filterMedium"
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
          </div>

          <!-- Medium Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterMedium"
                label="Medium"
                placeholder="Search for Medium"
                :items="boardMediums"
                v-model="selectedMedium"
                label-key="instruction_medium"
                :search-keys="['instruction_medium']"
                :disabled="!selectedBoard"
                :class="{
                  'is-invalid': !validationStates.medium.valid && validationStates.medium.touched,
                  'is-valid': validationStates.medium.valid && validationStates.medium.touched,
                }"
                required
                @change="handleMediumChange"
                @update:modelValue="handleMediumInput"
                next-field-id="filterStandard"
              >
                <template #label> Medium <span class="text-danger">*</span> </template>
              </SearchableDropdown>
              <div
                class="invalid-feedback"
                v-if="!validationStates.medium.valid && validationStates.medium.touched"
              >
                Please select a medium
              </div>
            </div>
          </div>

          <!-- Standard Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <SearchableDropdown
                id="filterStandard"
                label="Standard"
                placeholder="Search for Standard"
                :items="boardStandards"
                v-model="selectedStandard"
                :disabled="!selectedBoard"
                :class="{
                  'is-invalid':
                    !validationStates.standard.valid && validationStates.standard.touched,
                  'is-valid': validationStates.standard.valid && validationStates.standard.touched,
                }"
                required
                @change="handleStandardChange"
                @update:modelValue="handleStandardInput"
                next-field-id="viewSyllabusBtn"
              >
                <template #label> Standard <span class="text-danger">*</span> </template>
                <template #item="{ item }">Standard {{ item.name }}</template>
              </SearchableDropdown>
              <div
                class="invalid-feedback"
                v-if="!validationStates.standard.valid && validationStates.standard.touched"
              >
                Please select a standard
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewSyllabusBtn"
              :disabled="!isFormValid"
            >
              Manage Syllabus
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
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import axiosInstance from '@/config/axios'

interface Board {
  id: number
  name: string
  abbreviation: string
}

interface InstructionMedium {
  id: number
  board_id: number
  instruction_medium: string
}

interface Standard {
  id: number
  board_id: number
  name: string
}

interface BoardDetails extends Board {
  instruction_mediums: InstructionMedium[]
  standards: Standard[]
}

// Update Item interface to match SearchableDropdown's interface
interface Item {
  id?: number | string
  [key: string]: unknown
}

const router = useRouter()

// Form data
const selectedBoard = ref<BoardDetails | null>(null)
const selectedMedium = ref<InstructionMedium | null>(null)
const selectedStandard = ref<Standard | null>(null)

// Validation states
const validationStates = ref({
  board: { valid: false, touched: false },
  medium: { valid: false, touched: false },
  standard: { valid: false, touched: false },
})

// Data lists
const boards = ref<Board[]>([])
const boardMediums = computed(() => selectedBoard.value?.instruction_mediums ?? [])
const boardStandards = computed(() => selectedBoard.value?.standards ?? [])

// Computed
const isFormValid = computed(() => {
  return (
    validationStates.value.board.valid &&
    validationStates.value.medium.valid &&
    validationStates.value.standard.valid
  )
})

// Input handlers
const handleBoardInput = (value: unknown) => {
  validationStates.value.board.touched = true
  validationStates.value.board.valid = value !== null
}

const handleMediumInput = (value: unknown) => {
  validationStates.value.medium.touched = true
  validationStates.value.medium.valid = value !== null
}

const handleStandardInput = (value: unknown) => {
  validationStates.value.standard.touched = true
  validationStates.value.standard.valid = value !== null
}

// Fetch boards on component mount
onMounted(async () => {
  try {
    const response = await axiosInstance.get('/boards')
    // Check if the response has the new format with pagination
    if (response.data?.data) {
      // New format with pagination
      boards.value = response.data.data
    } else {
      // Old format (direct array)
      boards.value = response.data
    }
  } catch (error) {
    console.error('Error fetching boards:', error)
    // Set boards to empty array to show "No data available" message
    boards.value = []
  }
})

// Selection handlers
const handleBoardChange = async (board: Item | null) => {
  try {
    // Reset dependent selections and validation states
    selectedMedium.value = null
    selectedStandard.value = null
    validationStates.value.medium.valid = false
    validationStates.value.medium.touched = false
    validationStates.value.standard.valid = false
    validationStates.value.standard.touched = false

    if (!board?.id) return

    // Fetch board details
    const response = await axiosInstance.get(`/boards/${board.id}`)

    // Check if the response has the new format with pagination
    if (response.data?.data) {
      // New format with pagination - use the first item in the data array
      if (response.data.data.length > 0) {
        selectedBoard.value = response.data.data[0]
      } else {
        selectedBoard.value = null
      }
    } else {
      // Old format (direct object)
      selectedBoard.value = response.data
    }
  } catch (error) {
    console.error('Error fetching board details:', error)
    selectedBoard.value = null
  }
}

const handleMediumChange = (medium: Item | null) => {
  selectedMedium.value = medium as InstructionMedium | null
  selectedStandard.value = null
  validationStates.value.standard.valid = false
  validationStates.value.standard.touched = false
}

const handleStandardChange = (standard: Item | null) => {
  selectedStandard.value = standard as Standard | null
}

// Form submission handler
const handleSubmit = () => {
  // Mark all fields as touched
  Object.keys(validationStates.value).forEach((key) => {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  })

  if (!isFormValid.value) {
    return
  }

  if (selectedBoard.value && selectedMedium.value && selectedStandard.value) {
    router.push({
      name: 'syllabusStandard',
      query: {
        board: selectedBoard.value.id,
        medium: selectedMedium.value.id,
        standard: selectedStandard.value.id,
      },
    })
  }
}
</script>

<style scoped>
/* Default styles for screens above 576px */
.dynamic-style {
  position: static;
  background-color: transparent;
  box-shadow: none;
  width: auto;
}

/* Styles for screens below 576px */
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
  }

  #viewSyllabusBtn {
    width: 100% !important;
  }
}

/* Mobile styles for nav link */
@media (max-width: 768px) {
  #navSyllabus {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

/* Button styling */
.btn-dark {
  transition: all 0.3s ease;
}

.btn-dark:hover {
  background-color: #343a40;
  border-color: #343a40;
}

.btn-dark:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Form validation styles */
.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}
</style>
