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
              <div class="form-floating dropdown">
                <input
                  type="text"
                  class="form-control"
                  id="filterBoard"
                  placeholder="Search for Board"
                  v-model="boardSearch"
                  @input="filterBoards"
                  @focus="showBoardDropdown = true"
                  @click="showBoardDropdown = true"
                  autocomplete="off"
                  required
                  @keydown="handleBoardKeydown"
                />
                <div
                  class="dropdown-menu"
                  :class="{ show: showBoardDropdown && filteredBoards.length > 0 }"
                  style="position: absolute; width: 100%; z-index: 1000"
                >
                  <button
                    v-for="(board, index) in filteredBoards"
                    :key="board.id"
                    class="dropdown-item"
                    :class="{ active: index === selectedBoardIndex }"
                    @click="selectBoard(board)"
                    type="button"
                  >
                    {{ board.name }}
                  </button>
                </div>
                <label for="filterBoard">Board <span class="text-danger">*</span></label>
              </div>
            </div>
          </div>

          <!-- Medium Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <div class="form-floating">
                <select
                  id="filterMedium"
                  class="form-select"
                  required
                  v-model="selectedMediumId"
                  :disabled="!selectedBoard"
                >
                  <option value="">Select Medium</option>
                  <option v-for="medium in boardMediums" :key="medium.id" :value="medium.id">
                    {{ medium.instruction_medium }}
                  </option>
                </select>
                <label for="filterMedium" class="form-label">
                  Medium <span class="text-danger">*</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Standard Selection -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="mb-3">
              <div class="form-floating">
                <select
                  id="filterClass"
                  class="form-select"
                  required
                  v-model="selectedStandardId"
                  :disabled="!selectedBoard"
                >
                  <option value="">Select Standard</option>
                  <option
                    v-for="standard in boardStandards"
                    :key="standard.id"
                    :value="standard.id"
                  >
                    Standard {{ standard.name }}
                  </option>
                </select>
                <label for="filterClass" class="form-label">
                  Standard <span class="text-danger">*</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col-12 col-sm-10 col-md-8 text-end">
            <button
              type="submit"
              class="btn btn-dark mt-3"
              id="viewSyllabusBtn"
              :disabled="!selectedBoard || !selectedMediumId || !selectedStandardId"
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

const router = useRouter()
const boardDropdownRef = ref<HTMLElement | null>(null)

// Form data
const boardSearch = ref('')
const selectedBoard = ref<BoardDetails | null>(null)
const selectedMediumId = ref('')
const selectedStandardId = ref('')
const showBoardDropdown = ref(false)
const selectedBoardIndex = ref(-1)

// Data lists
const boards = ref<Board[]>([])
const boardMediums = computed(() => selectedBoard.value?.instruction_mediums || [])
const boardStandards = computed(() => selectedBoard.value?.standards || [])

// Computed property for filtered boards
const filteredBoards = computed(() => {
  const search = boardSearch.value.toLowerCase()
  return boards.value.filter(
    (board) =>
      board.name.toLowerCase().includes(search) ||
      board.abbreviation.toLowerCase().includes(search),
  )
})

// Handle click outside board dropdown
const handleClickOutside = (event: MouseEvent) => {
  if (boardDropdownRef.value && !boardDropdownRef.value.contains(event.target as Node)) {
    showBoardDropdown.value = false
  }
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

// Filter boards based on search input
const filterBoards = () => {
  showBoardDropdown.value = true
}

// Handle board keyboard navigation
const handleBoardKeydown = (event: KeyboardEvent) => {
  if (!showBoardDropdown.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedBoardIndex.value = Math.min(
        selectedBoardIndex.value + 1,
        filteredBoards.value.length - 1,
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedBoardIndex.value = Math.max(selectedBoardIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedBoardIndex.value >= 0 && filteredBoards.value[selectedBoardIndex.value]) {
        selectBoard(filteredBoards.value[selectedBoardIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      showBoardDropdown.value = false
      break
  }
}

// Select board and fetch its details
const selectBoard = async (board: Board) => {
  try {
    // Reset dependent selections
    selectedMediumId.value = ''
    selectedStandardId.value = ''
    boardSearch.value = board.name
    showBoardDropdown.value = false

    // Fetch board details
    const response = await fetch(getApiUrl(`/boards/${board.id}`))
    if (!response.ok) throw new Error('Failed to fetch board details')
    const boardDetails = await response.json()
    selectedBoard.value = boardDetails
  } catch (error) {
    console.error('Error fetching board details:', error)
  }
}

// Form submission handler
const handleSubmit = () => {
  if (selectedBoard.value) {
    router.push({
      name: 'syllabusStandard',
      query: {
        board: selectedBoard.value.id,
        medium: selectedMediumId.value,
        standard: selectedStandardId.value,
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

/* Form styling */
.form-floating > .form-control,
.form-floating > .form-select {
  height: calc(3.5rem + 2px);
  line-height: 1.25;
}

.form-floating > label {
  padding: 1rem 0.75rem;
}

.form-select option[disabled] {
  color: #6c757d;
  font-style: italic;
}

/* Dropdown styling */
.dropdown-menu {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
}

.dropdown-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  display: block;
  color: #212529;
}

.dropdown-item:hover,
.dropdown-item.active {
  background-color: #f8f9fa;
  color: #212529;
}

.dropdown-item.active {
  background-color: #e9ecef;
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
