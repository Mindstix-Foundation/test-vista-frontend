<template>
  <div class="container mt-4 mb-2">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">PATTERN MANAGEMENT</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <router-link
            class="btn btn-success stick-bottom"
            id="addButton"
            :to="{ name: 'createPattern' }"
          >
            Add Pattern
          </router-link>
        </div>
      </div>
      <hr />
    </div>

    <!-- Search and Filter Section -->
    <div class="row p-2 gy-2 justify-content-center">
      <!-- Search Bar -->
      <div class="col-12 col-sm-10">
        <div class="input-group">
          <div class="form-floating">
            <input
              type="text"
              class="form-control"
              id="patternFilter"
              placeholder="Search for pattern"
              v-model="searchQuery"
            />
            <label for="patternFilter">
              <i class="bi bi-search text-secondary"></i> Search for Pattern
            </label>
          </div>
          <span class="input-group-text clear-icon" @click="clearSearch" style="cursor: pointer">
            <i class="bi bi-x-lg"></i>
          </span>
          <span
            class="input-group-text"
            style="cursor: pointer"
            data-bs-toggle="collapse"
            data-bs-target="#filter"
            aria-expanded="false"
            aria-controls="filter"
          >
            Filter
          </span>
        </div>
      </div>

      <!-- Filter Section -->
      <div class="col-12 col-sm-10 collapse" id="filter">
        <div class="card border-0">
          <div class="card-body">
            <div class="container p-0">
              <div class="row g-2">
                <!-- Board Filter -->
                <div class="col-12 col-sm-6">
                  <SearchableDropdown
                    id="filterBoard"
                    label="Board"
                    placeholder="Search for Board"
                    :items="boards"
                    v-model="selectedBoard"
                    :search-keys="['name', 'abbreviation']"
                  />
                </div>

                <!-- Total Marks Filter -->
                <div class="col-6 col-sm-2">
                  <div class="form-floating">
                    <input
                      type="number"
                      class="form-control"
                      id="totalMarks"
                      placeholder="Enter Total Marks"
                      v-model="totalMarks"
                    />
                    <label for="totalMarks" class="form-label">Total Marks</label>
                  </div>
                </div>

                <!-- Standard Filter -->
                <div class="col-6 col-sm-2">
                  <SearchableDropdown
                    id="filterStandard"
                    label="Standard"
                    placeholder="Search for Standard"
                    :items="availableStandards"
                    v-model="selectedStandard"
                    :disabled="!selectedBoard"
                    :search-keys="['name']"
                    :next-field-id="'filterSubject'"
                  />
                </div>

                <!-- Subject Filter -->
                <div class="col-12 col-sm-2">
                  <SearchableDropdown
                    id="filterSubject"
                    label="Subject"
                    placeholder="Search for Subject"
                    :items="availableSubjects"
                    v-model="selectedSubject"
                    :disabled="!selectedBoard"
                    :search-keys="['name']"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pattern Cards -->
    <div class="row p-2 g-4 justify-content-center mb-5">
      <!-- No Patterns Message -->
      <div v-if="!loading && patterns.length === 0" class="col col-12 col-sm-10 text-center">
        <div class="card">
          <div class="card-body py-5">
            <i class="bi bi-clipboard2-x fs-1 text-secondary mb-3"></i>
            <h5 class="text-secondary mb-3">No patterns found</h5>
            <p class="text-muted mb-4">Start by adding your first pattern to get started</p>
            <router-link class="btn btn-success" :to="{ name: 'createPattern' }">
              <i class="bi bi-plus-circle me-2"></i>Add Pattern
            </router-link>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-else-if="loading" class="col col-12 col-sm-10 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Pattern Cards List -->
      <div
        v-else
        v-for="pattern in filteredPatterns"
        :key="pattern.id"
        class="col col-12 col-sm-10"
      >
        <div
          class="card"
          :class="{ 'border-danger border-2': !isPatternMarksValid(pattern) }"
          :data-pattern-id="pattern.id"
        >
          <div class="card-body">
            <div class="container p-0">
              <!-- Card Header with Actions -->
              <div class="row mb-2 justify-content-end">
                <div class="col-12 col-sm-auto text-end">
                  <router-link
                    :to="{ name: 'editPattern', params: { id: pattern.id.toString() } }"
                    class="text-decoration-none text-black me-2 ms-3 fs-4"
                  >
                    <i class="bi bi-pencil-square"></i>
                  </router-link>
                  <i
                    class="bi bi-trash3 ms-3 fs-4"
                    @click="showDeleteConfirmation(pattern)"
                    style="cursor: pointer"
                  ></i>
                </div>
              </div>

              <!-- Pattern Title and Marks -->
              <div class="row mb-2 justify-content-between">
                <div class="col-12 col-sm-6">
                  <strong class="text-uppercase fs-5">{{ pattern.pattern_name }}</strong>
                </div>
                <div class="col-12 col-sm-6">
                  <strong>Marks:</strong>
                  <span class="me-2">{{ pattern.total_marks }}</span>
                </div>
              </div>

              <!-- Board Name -->
              <div class="row mb-3">
                <span>{{ pattern.board.name }}</span>
              </div>

              <!-- Standard and Subject -->
              <div class="row">
                <div class="col-12 col-sm-6">
                  <strong>Standard:</strong>
                  <span>{{ pattern.standard.name }}</span>
                </div>
                <div class="col-12 col-sm-5">
                  <strong>Subject:</strong>
                  <span>{{ pattern.subject.name }}</span>
                </div>
                <div class="col-12 col-sm-1 text-end">
                  <button
                    class="btn chevron-btn"
                    @click="togglePattern(pattern.id)"
                    :title="pattern.isExpanded ? 'Hide details' : 'Show details'"
                  >
                    <i
                      class="bi bi-chevron-double-down fs-4"
                      :class="{ 'chevron-rotated': pattern.isExpanded }"
                    ></i>
                  </button>
                </div>
              </div>

              <!-- Pattern Details Table -->
              <transition name="slide-fade">
                <div class="row mt-3 pattern-details" v-if="pattern.isExpanded">
                  <table class="table table-sm table-striped table-bordered">
                    <tbody>
                      <tr class="table-dark">
                        <th><strong>Section Name</strong></th>
                        <th><strong>Number of Questions</strong></th>
                        <th><strong>Total Marks Allotted</strong></th>
                      </tr>
                      <tr v-for="section in pattern.sections" :key="section.id">
                        <td>{{ section.section_name }}</td>
                        <td>{{ section.total_questions }}</td>
                        <td>{{ section.mandotory_questions * section.marks_per_question }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteConfirmationModal"
      tabindex="-1"
      aria-labelledby="deleteConfirmationModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Remove Pattern</h5>
          </div>
          <div class="modal-body">Are you sure you want to delete this Pattern from system?</div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              style="border: 1px solid gray"
              id="cancelButton"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              id="deleteButton"
              @click="deletePattern"
              data-bs-dismiss="modal"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Modal } from 'bootstrap'
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

interface Pattern {
  id: number
  pattern_name: string
  board_id: number
  standard_id: number
  subject_id: number
  total_marks: number
  created_at: string
  updated_at: string
  board: {
    id: number
    name: string
    abbreviation: string
    address_id: number
    created_at: string
    updated_at: string
  }
  standard: {
    id: number
    name: string
  }
  subject: {
    id: number
    name: string
  }
  sections: Array<{
    id: number
    pattern_id: number
    seqencial_section_number: number
    sub_section: string
    section_name: string
    total_questions: number
    mandotory_questions: number
    marks_per_question: number
    created_at: string
    updated_at: string
  }>
  isExpanded?: boolean
}

// Data
const searchQuery = ref('')
const selectedBoard = ref<Board | null>(null)
const totalMarks = ref('')
const selectedStandard = ref<{ id: number; name: string } | null>(null)
const selectedSubject = ref<{ id: number; name: string } | null>(null)
const patterns = ref<Pattern[]>([])
const boards = ref<Board[]>([])
const selectedPatternForDelete = ref<Pattern | null>(null)
const loading = ref(false)

// Computed properties for available standards and subjects
const availableStandards = computed(() => {
  return selectedBoard.value?.standards || []
})

const availableSubjects = computed(() => {
  return selectedBoard.value?.subjects || []
})

// Watch for changes in filters to refetch patterns
watch([selectedBoard, selectedStandard, selectedSubject, totalMarks], async () => {
  await fetchPatterns()
})

// Methods
const clearSearch = () => {
  searchQuery.value = ''
}

const togglePattern = (patternId: number) => {
  // Find the pattern to toggle
  const pattern = patterns.value.find((p) => p.id === patternId)
  if (!pattern) return

  // Toggle the expanded state
  pattern.isExpanded = !pattern.isExpanded

  // If expanding, scroll to the pattern after a short delay to allow animation
  if (pattern.isExpanded) {
    setTimeout(() => {
      const element = document.querySelector(`[data-pattern-id="${patternId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }
}

const showDeleteConfirmation = (pattern: Pattern) => {
  selectedPatternForDelete.value = pattern
  const modal = new Modal(document.getElementById('deleteConfirmationModal')!)
  modal.show()
}

const deletePattern = async () => {
  if (!selectedPatternForDelete.value) return
  try {
    await axiosInstance.delete(`/patterns/${selectedPatternForDelete.value.id}`)
    await fetchPatterns() // Refresh patterns after deletion
  } catch (error) {
    console.error('Error deleting pattern:', error)
  }
}

// Add this function before the fetchPatterns function
const isPatternMarksValid = (pattern: Pattern) => {
  const totalSectionMarks = pattern.sections.reduce(
    (total, section) => total + section.mandotory_questions * section.marks_per_question,
    0,
  )
  return pattern.total_marks === totalSectionMarks
}

// Fetch patterns from API
const fetchPatterns = async () => {
  try {
    loading.value = true
    const queryParams = new URLSearchParams()

    if (selectedBoard.value?.id) {
      queryParams.append('boardId', selectedBoard.value.id.toString())
    }
    if (selectedStandard.value?.id) {
      queryParams.append('standardId', selectedStandard.value.id.toString())
    }
    if (selectedSubject.value?.id) {
      queryParams.append('subjectId', selectedSubject.value.id.toString())
    }
    if (totalMarks.value) {
      queryParams.append('totalMarks', totalMarks.value)
    }

    const response = await axiosInstance.get(`/patterns?${queryParams.toString()}`)
    patterns.value = response.data.map((pattern: Pattern) => ({
      ...pattern,
      isExpanded: false,
    }))
  } catch (error) {
    console.error('Error fetching patterns:', error)
  } finally {
    loading.value = false
  }
}

// Fetch boards from API
const fetchBoards = async () => {
  try {
    const response = await axiosInstance.get('/boards')
    boards.value = response.data
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

// Computed property for filtered patterns
const filteredPatterns = computed(() => {
  let result = patterns.value

  // Apply search filter locally
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (pattern) =>
        pattern.pattern_name.toLowerCase().includes(query) ||
        pattern.board.name.toLowerCase().includes(query) ||
        pattern.subject.name.toLowerCase().includes(query),
    )
  }

  // Sort patterns - invalid patterns first
  result = [...result].sort((a, b) => {
    const aValid = isPatternMarksValid(a)
    const bValid = isPatternMarksValid(b)
    if (!aValid && bValid) return -1
    if (aValid && !bValid) return 1
    return 0
  })

  return result
})

// Lifecycle hooks
onMounted(() => {
  fetchBoards()
  fetchPatterns()
})
</script>

<style scoped>
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
    z-index: 1000;
  }

  #addButton {
    width: 100% !important;
  }
}

/* Mobile styles for nav link */
@media (max-width: 768px) {
  #navPattern {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.bi {
  cursor: pointer;
  transition: transform 0.2s;
}

.bi-chevron-double-up {
  transform: rotate(180deg);
}

.table th {
  background-color: #212529;
  color: white;
}

/* Transition styles for pattern details */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Smooth transition for chevron icon */
.bi-chevron-double-down {
  transition: transform 0.3s ease, color 0.2s ease;
  color: #6c757d;
}

/* Rotate the chevron when expanded */
.chevron-rotated {
  transform: rotate(180deg);
}

/* Styling for the chevron button */
.chevron-btn {
  background: transparent;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.chevron-btn:hover {
  color: #0d6efd;
  transform: scale(1.1);
}

.chevron-btn:active {
  transform: scale(0.95);
}

.chevron-btn:focus {
  box-shadow: none;
  outline: none;
}

/* Add a subtle box shadow to the pattern card */
.card {
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
