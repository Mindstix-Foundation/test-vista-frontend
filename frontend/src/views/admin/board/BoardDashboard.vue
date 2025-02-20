<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-start m-0 fw-bolder text-uppercase">BOARD MANAGEMENT</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <button class="btn btn-success" id="addButton" @click="router.push('/admin/board/add')">
            Add Board
          </button>
        </div>
      </div>
      <hr />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger my-3" role="alert">
      {{ error }}
    </div>

    <!-- Content when data is loaded -->
    <template v-else>
      <!-- Search Section -->
      <div class="row p-2 gy-2 justify-content-center">
        <div class="col-12 col-sm-10">
          <div class="input-group">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                id="boardFilter"
                placeholder="Search for Board"
                v-model="searchQuery"
                autocomplete="off"
              />
              <label for="boardFilter">
                <i class="bi bi-search text-secondary"></i> Search for Board
              </label>
            </div>
            <span class="input-group-text clear-icon" @click="clearBoardFilter">
              <i class="bi bi-x-lg"></i>
            </span>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div id="table-container" class="row mt-4 p-2 justify-content-center">
        <div class="col col-12 col-sm-10 col-md-10">
          <div class="table-responsive">
            <table class="table table-sm table-hover table-striped table-bordered">
              <colgroup>
                <col style="width: 10px" />
                <col style="width: 100%" />
                <col style="width: 20px" />
              </colgroup>
              <thead class="table-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Board</th>
                  <th scope="col">Manage</th>
                </tr>
              </thead>
              <tbody class="table-group-divider" id="boardTable">
                <tr v-for="(board, index) in filteredBoards" :key="board.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td v-html="getHighlightedText(board)"></td>
                  <td class="text-center">
                    <i
                      class="bi bi-three-dots"
                      @click="showBoardInfo(board)"
                      data-bs-toggle="modal"
                      data-bs-target="#boardInfoModal"
                    ></i>
                  </td>
                </tr>
                <tr v-if="filteredBoards.length === 0">
                  <td colspan="3" class="text-center">No matching results found.</td>
                </tr>
              </tbody>
            </table>
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
        data-bs-backdrop="static"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title" id="deleteConfirmationModalLabel">Delete Board</h5>
              <button
                type="button"
                class="btn-close"
                @click="cleanupModals"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <template v-if="associatedSchools.length > 0">
                <div class="alert alert-warning">
                  <template v-if="associatedSchools.some((s) => s.id !== -1)">
                    <p class="mb-2">The following schools are associated with this board:</p>
                    <ul class="list-unstyled ms-3">
                      <li
                        v-for="school in associatedSchools.filter((s) => s.id !== -1)"
                        :key="school.id"
                      >
                        - {{ school.name }}
                      </li>
                    </ul>
                  </template>
                  <template v-if="associatedSchools.some((s) => s.id === -1)">
                    <p class="mb-0">{{ associatedSchools.find((s) => s.id === -1)?.name }}</p>
                  </template>
                </div>
              </template>
              <p class="mb-3">
                Are you sure you want to delete this board? This action cannot be undone.
                <span v-if="associatedSchools.length > 0" class="text-danger">
                  All associated schools and data will also be deleted!
                </span>
              </p>
              <div class="form-group">
                <label for="confirmText" class="form-label">Type "sure" to confirm deletion:</label>
                <input
                  type="text"
                  class="form-control"
                  id="confirmText"
                  v-model="confirmationText"
                  placeholder="Type 'sure' here"
                />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="cleanupModals">Cancel</button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteBoard"
                :disabled="confirmationText !== 'sure'"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Board Info Modal -->
      <div
        class="modal fade"
        id="boardInfoModal"
        tabindex="-1"
        :aria-hidden="!showInfoModal"
        role="dialog"
        aria-labelledby="boardInfoModalLabel"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="boardInfoModalLabel">Board Information</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                @click="cleanupModals"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="container">
                <div class="row mt-4">
                  <div class="col-12 p-3">
                    <form autocomplete="on">
                      <div class="row g-3">
                        <div class="row">
                          <label class="col-form-label col-12 col-lg-3 fw-bold" for="boardName">
                            Board Name:
                          </label>
                          <div class="col-12 col-lg-9">
                            <textarea
                              id="boardName"
                              readonly
                              class="form-control-plaintext"
                              style="white-space: pre-wrap"
                              :value="selectedBoard?.name"
                            ></textarea>
                          </div>
                        </div>

                        <div class="row">
                          <label
                            class="col-form-label col-12 col-lg-3 fw-bold"
                            for="boardAbbreviation"
                          >
                            Board Abbreviation:
                          </label>
                          <div class="col-12 col-lg-9">
                            <input
                              type="text"
                              class="form-control-plaintext"
                              id="boardAbbreviation"
                              :value="selectedBoard?.abbreviation"
                              readonly
                            />
                          </div>
                        </div>

                        <!-- Board Address -->
                        <fieldset class="border p-2 rounded col col-12">
                          <legend class="float-none w-auto fs-5">Board Address</legend>
                          <div class="row">
                            <label for="address" class="col-form-label col-12 col-lg-3 fw-bold"
                              >Address:</label
                            >
                            <div class="col-12 col-lg-9">
                              <textarea
                                readonly
                                class="form-control-plaintext"
                                id="address"
                                style="white-space: pre-wrap"
                                :value="selectedBoard?.address?.street"
                              ></textarea>
                            </div>
                          </div>

                          <div class="row">
                            <div class="col-12 col-lg-3">
                              <label for="country" class="col-form-label col-6 col-lg-6 fw-bold"
                                >Country:</label
                              >
                              <div class="col-12">
                                <input
                                  type="text"
                                  readonly
                                  class="form-control-plaintext"
                                  id="country"
                                  :value="selectedBoard?.address?.country?.name"
                                />
                              </div>
                            </div>

                            <div class="col-12 col-lg-3">
                              <label for="state" class="col-form-label col-6 col-lg-6 fw-bold"
                                >State:</label
                              >
                              <div class="col-12">
                                <input
                                  type="text"
                                  readonly
                                  class="form-control-plaintext"
                                  id="state"
                                  :value="selectedBoard?.address?.state?.name"
                                />
                              </div>
                            </div>

                            <div class="col-12 col-lg-3">
                              <label for="city" class="col-form-label col-6 col-lg-6 fw-bold"
                                >City/Town:</label
                              >
                              <div class="col-12">
                                <input
                                  type="text"
                                  readonly
                                  class="form-control-plaintext"
                                  id="city"
                                  :value="selectedBoard?.address?.city?.name"
                                />
                              </div>
                            </div>
                          </div>

                          <div class="row">
                            <label for="postalCode" class="col-form-label col-12 col-lg-3 fw-bold"
                              >Postal Code:</label
                            >
                            <div class="col-12 col-lg-9">
                              <input
                                type="text"
                                readonly
                                class="form-control-plaintext"
                                id="postalCode"
                                :value="selectedBoard?.address?.postal_code"
                              />
                            </div>
                          </div>
                        </fieldset>

                        <!-- Mediums of Instruction -->
                        <div class="col-12">
                          <label class="col-form-label fw-bold" for="mediumOfInstruction">
                            Mediums of Instruction:
                          </label>
                          <ul class="list-group">
                            <li
                              v-for="medium in selectedBoard?.mediums"
                              :key="medium.id"
                              class="list-group-item"
                            >
                              {{ medium.instruction_medium }}
                            </li>
                            <li v-if="!selectedBoard?.mediums?.length" class="list-group-item">
                              No mediums specified
                            </li>
                          </ul>
                        </div>

                        <!-- Standards -->
                        <div class="col-12">
                          <label class="col-form-label fw-bold" for="standards">Standards:</label>
                          <ul id="standardsList" class="list-group">
                            <li
                              v-for="standard in selectedBoard?.standards"
                              :key="standard.id"
                              class="list-group-item"
                            >
                              {{ standard.name }}
                            </li>
                            <li v-if="!selectedBoard?.standards?.length" class="list-group-item">
                              No standards available.
                            </li>
                          </ul>
                        </div>

                        <!-- Subjects -->
                        <div class="col-12">
                          <label class="col-form-label fw-bold" for="subjects">Subjects:</label>
                          <ul class="list-group">
                            <li
                              v-for="subject in selectedBoard?.subjects"
                              :key="subject.id"
                              class="list-group-item"
                            >
                              {{ subject.name }}
                            </li>
                            <li v-if="!selectedBoard?.subjects?.length" class="list-group-item">
                              No subjects specified
                            </li>
                          </ul>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-dark"
                @click="navigateToSchools(selectedBoard?.name)"
              >
                <i class="bi bi-arrow-return-right"></i> Schools
              </button>
              <button
                type="button"
                class="btn btn-dark"
                @click="router.push(`/admin/board/${selectedBoard?.id}/edit`)"
                data-bs-dismiss="modal"
              >
                Edit
              </button>
              <button
                type="button"
                class="btn btn-custom"
                id="deleteSchoolButton"
                data-bs-toggle="modal"
                data-bs-target="#deleteConfirmationModal"
                @click="showDeleteConfirmation"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Board } from '@/models/Board'
import { useRouter, useRoute } from 'vue-router'
import { getApiUrl } from '@/config/api'
import * as bootstrap from 'bootstrap'
import { useToastStore } from '@/store/toast'

interface BoardDetails {
  id: number
  name: string
  abbreviation: string
  address_id?: number
  address?: {
    id: number
    city_id: number
    postal_code: string
    street: string
    created_at: string
    updated_at: string
    city: {
      id: number
      state_id: number
      name: string
    }
    state: {
      id: number
      country_id: number
      name: string
    }
    country: {
      id: number
      name: string
    }
  }
  mediums: Array<{
    id: number
    board_id: number
    instruction_medium: string
    created_at: string
    updated_at: string
  }>
  standards: Array<{
    id: number
    board_id: number
    name: string
    created_at: string
    updated_at: string
  }>
  subjects: Array<{
    id: number
    board_id: number
    name: string
    created_at: string
    updated_at: string
  }>
}

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const boards = ref<Board[]>([])
const selectedBoard = ref<BoardDetails | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const showInfoModal = ref(false)
const associatedSchools = ref<Array<{ id: number; name: string }>>([])
const confirmationText = ref('')

async function fetchLocationData(cityId: number) {
  try {
    // First get the city to get state_id
    const cityResponse = await fetch(getApiUrl(`/cities/${cityId}`))
    const city = await cityResponse.json()

    // Get state data using state_id from city
    const stateResponse = await fetch(getApiUrl(`/states/${city.state_id}`))
    const state = await stateResponse.json()

    // Get country data using country_id from state
    const countryResponse = await fetch(getApiUrl(`/countries/${state.country_id}`))
    const country = await countryResponse.json()

    return {
      city: { id: city.id, state_id: city.state_id, name: city.name },
      state: { id: state.id, country_id: state.country_id, name: state.name },
      country: { id: country.id, name: country.name },
    }
  } catch (error) {
    console.error('Error fetching location data:', error)
    return null
  }
}

const fetchBoardDetails = async (boardId: number): Promise<BoardDetails> => {
  try {
    console.log('Fetching board details for ID:', boardId)
    const response = await fetch(getApiUrl(`/boards/${boardId}`))
    if (!response.ok) throw new Error('Failed to fetch board')

    const boardData = await response.json()
    console.log('Board data received:', boardData)

    // Fetch location data if address exists
    const locationData = boardData.address?.city_id
      ? await fetchLocationData(boardData.address.city_id)
      : null

    // Transform the data to match our interface
    const boardDetails: BoardDetails = {
      id: boardData.id,
      name: boardData.name,
      abbreviation: boardData.abbreviation,
      address_id: boardData.address_id,
      address: {
        ...boardData.address,
        city: locationData?.city || { id: 0, state_id: 0, name: '' },
        state: locationData?.state || { id: 0, country_id: 0, name: '' },
        country: locationData?.country || { id: 0, name: '' },
      },
      mediums: boardData.instruction_mediums,
      standards: boardData.standards,
      subjects: boardData.subjects,
    }

    return boardDetails
  } catch (error) {
    console.error('Error in fetchBoardDetails:', error)
    throw error
  }
}

const fetchBoards = async () => {
  try {
    isLoading.value = true
    const response = await fetch(getApiUrl('/boards'))
    if (!response.ok) throw new Error('Failed to fetch boards')

    const data = await response.json()
    boards.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch boards'
    console.error('Error fetching boards:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredBoards = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return boards.value.filter(
    (board) =>
      board.name.toLowerCase().includes(query) ||
      (board.abbreviation?.toLowerCase() || '').includes(query),
  )
})

const getHighlightedText = (board: Board) => {
  const query = searchQuery.value
  const abbreviation = board.abbreviation || ''
  if (!query) return `${board.name} (${abbreviation})`

  const highlightedName = highlightText(board.name, query)
  const highlightedAbbr = highlightText(abbreviation, query)

  return `${highlightedName} (${highlightedAbbr})`
}

const highlightText = (text: string, query: string): string => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

const showBoardInfo = async (board: Board) => {
  try {
    selectedBoard.value = null // Reset selected board first
    const boardDetails = await fetchBoardDetails(board.id)
    selectedBoard.value = boardDetails
    showInfoModal.value = true
  } catch (error) {
    console.error('Error fetching board details:', error)
  }
}

const checkAssociatedSchools = async (boardId: number) => {
  try {
    let hasSyllabus = false

    // First check for associated schools
    const schoolsResponse = await fetch(getApiUrl(`/schools?boardId=${boardId}`))
    if (!schoolsResponse.ok) {
      throw new Error('Failed to check associated schools')
    }
    const schools = await schoolsResponse.json()

    // Check for syllabus assignments - only need to check mediums
    const mediumsResponse = await fetch(getApiUrl(`/instruction-mediums/board/${boardId}`))
    if (!mediumsResponse.ok) {
      throw new Error('Failed to fetch board mediums')
    }
    const mediums = await mediumsResponse.json()

    // Check if any medium has syllabus data
    for (const medium of mediums) {
      const syllabusResponse = await fetch(
        getApiUrl(`/medium-standard-subjects?instruction_medium_id=${medium.id}`),
      )
      if (syllabusResponse.ok) {
        const syllabusData = await syllabusResponse.json()
        if (syllabusData && syllabusData.length > 0) {
          hasSyllabus = true
          break // Exit loop as soon as we find any syllabus data
        }
      }
    }

    // Set the appropriate message based on conditions
    if (schools.length > 0 && hasSyllabus) {
      associatedSchools.value = [
        ...schools,
        {
          id: -1,
          name: 'This board also has syllabus data assigned to it. Please delete the syllabus first.',
        },
      ]
    } else if (schools.length > 0) {
      associatedSchools.value = schools
    } else if (hasSyllabus) {
      associatedSchools.value = [
        {
          id: -1,
          name: 'This board has syllabus data assigned to it. Please delete the syllabus first.',
        },
      ]
    } else {
      associatedSchools.value = []
    }
  } catch (error) {
    console.error('Error checking associations:', error)
    associatedSchools.value = []
  }
}

const deleteBoard = async () => {
  if (!selectedBoard.value) return

  try {
    // Proceed with board deletion if user has typed "sure"
    if (confirmationText.value !== 'sure') {
      return
    }

    // Proceed with board deletion
    const response = await fetch(getApiUrl(`/boards/${selectedBoard.value.id}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete board')
    }

    // Update the local boards list
    boards.value = boards.value.filter((board) => board.id !== selectedBoard.value?.id)

    // Show success toast
    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'success',
      title: 'Success',
      message: `Board "${selectedBoard.value.name}" has been deleted successfully.`,
    })

    selectedBoard.value = null
    cleanupModals()
  } catch (error) {
    console.error('Error deleting board:', error)
    // Show error toast instead of alert
    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to delete board. Please try again.',
    })
  }
}

const clearBoardFilter = () => {
  searchQuery.value = ''
}

const cleanupModals = () => {
  confirmationText.value = ''
  const deleteModal = bootstrap.Modal.getInstance(
    document.getElementById('deleteConfirmationModal')!,
  )
  deleteModal?.hide()
  const viewModal = bootstrap.Modal.getInstance(document.getElementById('boardInfoModal')!)
  viewModal?.hide()
}

const navigateToSchools = (boardName?: string) => {
  // Close the board info modal first
  cleanupModals()

  // Navigate to schools page with the board name as a query parameter
  router.push({
    path: '/admin/school',
    query: { board: boardName },
  })
}

// Add this function to handle the delete button click
const showDeleteConfirmation = async () => {
  if (selectedBoard.value) {
    await checkAssociatedSchools(selectedBoard.value.id)
  }
}

// Add watcher for route changes
watch(
  () => route.path,
  () => {
    // Refresh board data when returning to dashboard
    if (route.path === '/admin/board') {
      fetchBoards()
    }
  },
)

// Add watcher for showInfoModal to manage focus
watch(showInfoModal, (newValue) => {
  if (!newValue) {
    // When modal is closing, ensure focus is moved to a safe element
    const mainContainer = document.querySelector('.container') as HTMLElement
    if (mainContainer) {
      mainContainer.focus()
    }
  }
})

// Fetch boards when component mounts
onMounted(() => {
  fetchBoards()
})
</script>

<style scoped>
/* Mobile styles */
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

  .btn-custom {
    background-color: #dc3545 !important;
    color: white !important;
  }
}

/* Desktop styles */
@media (min-width: 577px) {
  .dynamic-style {
    position: static;
  }
  .btn-custom {
    border: 1px solid gray !important;
    background-color: #f8f9fa;
    color: black;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
  }

  .btn-custom:hover {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545 !important;
    color: white !important;
  }
}

#navBoard {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navBoard {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.clear-icon {
  cursor: pointer;
}

:deep(.highlight) {
  background-color: #fff3cd;
  padding: 2px;
  border-radius: 2px;
  font-weight: bold;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
