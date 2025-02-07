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
            <div class="modal-header">
              <h5 class="modal-title" id="deleteConfirmationModalLabel">Confirm Delete</h5>
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
                  <strong>Cannot delete this board!</strong>
                  <p class="mb-2">The following schools are associated with this board:</p>
                  <ul class="list-unstyled ms-3">
                    <li v-for="school in associatedSchools" :key="school.id">
                      - {{ school.name }}
                    </li>
                  </ul>
                  <p class="mb-0">Please delete these schools first before deleting the board.</p>
                </div>
              </template>
              <template v-else> Are you sure you want to delete this board? </template>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="cleanupModals">Cancel</button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteBoard"
                :disabled="associatedSchools.length > 0"
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
                ref="closeModalButton"
              ></button>
            </div>
            <div class="modal-body">
              <div class="container">
                <div class="row mt-4">
                  <div class="col-12 p-3">
                    <form autocomplete="on">
                      <div class="row g-3">
                        <div class="row">
                          <label class="col-form-label col-12 col-lg-3 fw-bold">Board Name:</label>
                          <div class="col-12 col-lg-9">
                            <textarea
                              readonly
                              class="form-control-plaintext"
                              style="white-space: pre-wrap"
                              :value="selectedBoard?.name"
                            ></textarea>
                          </div>
                        </div>

                        <div class="row">
                          <label class="col-form-label col-12 col-lg-3 fw-bold"
                            >Board Abbreviation:</label
                          >
                          <div class="col-12 col-lg-9">
                            <input
                              type="text"
                              class="form-control-plaintext"
                              :value="selectedBoard?.abbreviation"
                              readonly
                            />
                          </div>
                        </div>

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

                        <div class="row">
                          <div class="col-12 col-lg-4">
                            <label for="country" class="col-form-label fw-bold">Country:</label>
                            <input
                              type="text"
                              readonly
                              class="form-control-plaintext"
                              id="country"
                              :value="selectedBoard?.address?.country?.name || ''"
                            />
                          </div>

                          <div class="col-12 col-lg-4">
                            <label for="state" class="col-form-label fw-bold">State:</label>
                            <input
                              type="text"
                              readonly
                              class="form-control-plaintext"
                              id="state"
                              :value="selectedBoard?.address?.state?.name || ''"
                            />
                          </div>

                          <div class="col-12 col-lg-4">
                            <label for="city" class="col-form-label fw-bold">City:</label>
                            <input
                              type="text"
                              readonly
                              class="form-control-plaintext"
                              id="city"
                              :value="selectedBoard?.address?.city?.name || ''"
                            />
                          </div>
                        </div>

                        <!-- Mediums of Instruction -->
                        <div class="col-12">
                          <label class="col-form-label fw-bold">Mediums of Instruction:</label>
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
                          <label class="col-form-label fw-bold">Standards:</label>
                          <ul class="list-group">
                            <li
                              v-for="standard in selectedBoard?.standards"
                              :key="standard.id"
                              class="list-group-item"
                            >
                              {{ standard.name }}
                            </li>
                            <li v-if="!selectedBoard?.standards?.length" class="list-group-item">
                              No standards specified
                            </li>
                          </ul>
                        </div>

                        <!-- Subjects -->
                        <div class="col-12">
                          <label class="col-form-label fw-bold">Subjects:</label>
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

interface Address {
  id: number
  street: string
  postal_code: string
  city_id: number
  city?: City
  state?: State
  country?: Country
}

interface City {
  id: number
  name: string
  state_id: number
}

interface State {
  id: number
  name: string
  country_id: number
}

interface Country {
  id: number
  name: string
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

interface BoardDetails {
  id: number
  name: string
  abbreviation: string
  address_id?: number
  address?: Address
  mediums: Medium[]
  standards: Standard[]
  subjects: Subject[]
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

const fetchBoardDetails = async (boardId: number): Promise<BoardDetails> => {
  try {
    console.log('Fetching board details for ID:', boardId)

    // Fetch board data
    const boardResponse = await fetch(getApiUrl(`/boards/${boardId}`))
    if (!boardResponse.ok) throw new Error('Failed to fetch board')
    const boardData = await boardResponse.json()
    console.log('Board data received:', boardData)

    // Fetch address details and related location data
    let address: Address | undefined
    let city: City | undefined
    let state: State | undefined
    let country: Country | undefined

    if (boardData.address_id) {
      // Fetch address
      const addressResponse = await fetch(getApiUrl(`/addresses/${boardData.address_id}`))
      if (addressResponse.ok) {
        address = await addressResponse.json()

        // Fetch city
        if (address?.city_id) {
          const cityResponse = await fetch(getApiUrl(`/cities/${address.city_id}`))
          if (cityResponse.ok) {
            city = await cityResponse.json()

            // Fetch state
            if (city?.state_id) {
              const stateResponse = await fetch(getApiUrl(`/states/${city.state_id}`))
              if (stateResponse.ok) {
                state = await stateResponse.json()

                // Fetch country
                if (state?.country_id) {
                  const countryResponse = await fetch(getApiUrl(`/countries/${state.country_id}`))
                  if (countryResponse.ok) {
                    country = await countryResponse.json()
                  }
                }
              }
            }
          }
        }
      }
    }

    // Fetch mediums, standards, and subjects using board-specific endpoints
    const [mediums, standards, subjects] = await Promise.all([
      fetch(getApiUrl(`/instruction-mediums/board/${boardId}`)).then((r) => r.json()),
      fetch(getApiUrl(`/standards/board/${boardId}`)).then((r) => r.json()),
      fetch(getApiUrl(`/subjects/board/${boardId}`)).then((r) => r.json()),
    ])

    console.log('Related data received:', {
      mediums,
      standards,
      subjects,
    })

    // Log the final combined data
    const finalData: BoardDetails = {
      ...boardData,
      address: address
        ? {
            ...address,
            city,
            state,
            country,
          }
        : undefined,
      mediums,
      standards,
      subjects,
    }
    console.log('Final board info data:', finalData)

    return finalData
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
    const schoolsResponse = await fetch(getApiUrl(`/schools?boardId=${boardId}`))
    if (!schoolsResponse.ok) {
      throw new Error('Failed to check associated schools')
    }
    associatedSchools.value = await schoolsResponse.json()
  } catch (error) {
    console.error('Error checking associated schools:', error)
    associatedSchools.value = []
  }
}

const deleteBoard = async () => {
  if (!selectedBoard.value) return

  try {
    // If there are associated schools, the delete button will be disabled
    // but we'll check again just to be safe
    if (associatedSchools.value.length > 0) {
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
    selectedBoard.value = null

    cleanupModals()
  } catch (error) {
    console.error('Error deleting board:', error)
    alert('Failed to delete board. Please try again.')
  }
}

const clearBoardFilter = () => {
  searchQuery.value = ''
}

const cleanupModals = () => {
  // First move focus out of the modal
  const mainContainer = document.querySelector('.container') as HTMLElement
  if (mainContainer) {
    mainContainer.focus()
  }

  // Then hide the delete confirmation modal
  const deleteModal = document.getElementById('deleteConfirmationModal')
  if (deleteModal) {
    const deleteModalInstance = bootstrap.Modal.getInstance(deleteModal)
    if (deleteModalInstance) {
      deleteModalInstance.hide()
    }
  }

  // Then hide the board info modal
  const boardInfoModal = document.getElementById('boardInfoModal')
  if (boardInfoModal) {
    const boardInfoModalInstance = bootstrap.Modal.getInstance(boardInfoModal)
    if (boardInfoModalInstance) {
      boardInfoModalInstance.hide()
    }
  }

  showInfoModal.value = false

  // Force cleanup of all modal-related elements
  const cleanup = () => {
    // Remove all modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.remove()
    })

    // Reset body styles
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
    document.body.style.overflow = ''
  }

  // Run cleanup after modal animation
  setTimeout(cleanup, 300)
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
