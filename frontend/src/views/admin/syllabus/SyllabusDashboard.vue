<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
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
                required
                @change="handleBoardChange"
                next-field-id="filterMedium"
              />
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
                required
                @change="handleMediumChange"
                next-field-id="filterStandard"
              />
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
                required
                @change="handleStandardChange"
                next-field-id="viewSyllabusBtn"
              >
                <template #item="{ item }">Standard {{ item.name }}</template>
              </SearchableDropdown>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewSyllabusBtn"
              :disabled="!selectedBoard || !selectedMedium || !selectedStandard"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getApiUrl } from '@/config/api'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'

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

// Add Item interface for dropdown component
interface Item {
  id: number | string
  [key: string]: unknown
}

const router = useRouter()

// Form data
const selectedBoard = ref<BoardDetails | null>(null)
const selectedMedium = ref<InstructionMedium | null>(null)
const selectedStandard = ref<Standard | null>(null)

// Data lists
const boards = ref<Board[]>([])
const boardMediums = computed(() => selectedBoard.value?.instruction_mediums || [])
const boardStandards = computed(() => selectedBoard.value?.standards || [])

// Handle click outside dropdowns
const handleClickOutside = () => {
  document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

// Fetch boards on component mount
onMounted(async () => {
  try {
    const response = await fetch(getApiUrl('/boards'))
    if (!response.ok) throw new Error('Failed to fetch boards')
    boards.value = await response.json()
    document.addEventListener('click', handleClickOutside)
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Selection handlers
const handleBoardChange = async (board: Item | null) => {
  try {
    // Reset dependent selections
    selectedMedium.value = null
    selectedStandard.value = null

    if (!board) return

    // Fetch board details
    const response = await fetch(getApiUrl(`/boards/${board.id}`))
    if (!response.ok) throw new Error('Failed to fetch board details')
    const boardDetails = await response.json()
    selectedBoard.value = boardDetails
  } catch (error) {
    console.error('Error fetching board details:', error)
  }
}

const handleMediumChange = (medium: Item | null) => {
  selectedMedium.value = medium as InstructionMedium | null
  selectedStandard.value = null
}

const handleStandardChange = (standard: Item | null) => {
  selectedStandard.value = standard as Standard | null
}

// Form submission handler
const handleSubmit = () => {
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
</style>
