<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">SCHOOL MANAGEMENT</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <button class="btn btn-success stick-bottom" id="addButton" @click="navigateToAddSchool">
            Add School
          </button>
        </div>
      </div>
      <hr />
    </div>

    <!-- Search Section -->
    <div class="row p-2 gy-2 justify-content-center">
      <!-- School Search -->
      <div class="col-12 col-sm-5">
        <div class="input-group">
          <div class="form-floating">
            <input
              type="text"
              class="form-control"
              id="schoolFilter"
              placeholder="Search for School"
              v-model="schoolSearch"
              autocomplete="off"
            />
            <label for="schoolFilter">
              <i class="bi bi-search text-secondary"></i> Search for School
            </label>
          </div>
          <span
            class="input-group-text clear-icon"
            @click="clearInput('school')"
            style="cursor: pointer"
          >
            <i class="bi bi-x-lg"></i>
          </span>
        </div>
      </div>

      <!-- Board Search -->
      <div class="col-12 col-sm-5">
        <div class="input-group">
          <div class="form-floating">
            <input
              type="text"
              class="form-control"
              id="boardFilter"
              placeholder="Search for Board"
              v-model="boardSearch"
              autocomplete="off"
            />
            <label for="boardFilter">
              <i class="bi bi-search text-secondary"></i> Search for Board
            </label>
          </div>
          <span
            class="input-group-text clear-icon"
            @click="clearInput('board')"
            style="cursor: pointer"
          >
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
              <col style="width: 35%" />
              <col style="width: 65%" />
              <col style="width: 20px" />
            </colgroup>
            <thead class="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">School</th>
                <th scope="col">Board</th>
                <th scope="col">Manage</th>
              </tr>
            </thead>
            <tbody class="table-group-divider" id="schoolTable">
              <tr
                v-for="(school, index) in filteredAndHighlightedSchools"
                :key="school.id"
                :data-board="school.board.abbreviation"
              >
                <th scope="row">{{ index + 1 }}</th>
                <td v-html="school.highlightedName"></td>
                <td v-html="school.highlightedBoardName"></td>
                <td class="text-center">
                  <i
                    class="bi bi-three-dots"
                    @click="openViewModal(school)"
                    style="cursor: pointer"
                  ></i>
                </td>
              </tr>
              <tr v-if="filteredAndHighlightedSchools.length === 0">
                <td colspan="4" class="text-center">No matching results found.</td>
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
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Remove School</h5>
          </div>
          <div class="modal-body">Are you sure you want to delete this School from system?</div>
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
              @click="deleteSchool"
              data-bs-dismiss="modal"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- View School Modal -->
    <div
      class="modal fade"
      id="viewSchoolModal"
      tabindex="-1"
      aria-labelledby="viewSchoolModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="viewSchoolModalLabel">School Information</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="container">
              <div id="form-container" class="row mt-4">
                <div class="col-12 p-3">
                  <form v-if="selectedSchool">
                    <div class="row g-3">
                      <div class="row">
                        <label for="schoolName" class="col-form-label col-12 col-lg-3 fw-bold"
                          >School Name:</label
                        >
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            readonly
                            class="form-control-plaintext"
                            id="schoolName"
                            :value="selectedSchool.name"
                          />
                        </div>
                      </div>

                      <div class="row">
                        <label for="boardName" class="col-form-label col-12 col-lg-3 fw-bold"
                          >Board:</label
                        >
                        <div class="col-12 col-lg-9">
                          <textarea
                            readonly
                            class="form-control-plaintext"
                            id="boardName"
                            style="white-space: pre-wrap"
                            v-model="selectedSchool.board.name"
                          ></textarea>
                        </div>
                      </div>

                      <!-- School Address -->
                      <fieldset class="border p-2 rounded col col-12">
                        <legend class="float-none w-auto fs-5">School Address</legend>
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
                              :value="selectedSchool?.address.street"
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
                              :value="selectedSchool?.address.postal_code"
                            />
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
                                :value="selectedSchool?.address.country?.name"
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
                                :value="selectedSchool?.address.state?.name"
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
                                :value="selectedSchool?.address.city?.name"
                              />
                            </div>
                          </div>
                        </div>
                      </fieldset>

                      <!-- Principal's Information -->
                      <fieldset class="border p-2 rounded col col-12">
                        <legend class="float-none w-auto fs-5">Principal's Information</legend>
                        <div class="row">
                          <label for="principalName" class="col-form-label col-12 col-lg-3 fw-bold"
                            >Principal:</label
                          >
                          <div class="col-12 col-lg-9">
                            <input
                              type="text"
                              readonly
                              class="form-control-plaintext"
                              id="principalName"
                              :value="selectedSchool.principal_name"
                            />
                          </div>
                        </div>

                        <div class="row">
                          <div class="col-12 col-lg-6">
                            <div class="row">
                              <label
                                for="contactNumber"
                                class="col-12 col-lg-6 col-form-label fw-bold"
                                >Contact Number:</label
                              >
                              <div class="col-12 col-lg-6">
                                <input
                                  type="text"
                                  readonly
                                  class="form-control-plaintext"
                                  id="contactNumber"
                                  :value="selectedSchool.contact_number"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6">
                            <div class="row">
                              <label
                                for="alternateContactNumber"
                                class="col-12 col-lg-6 col-form-label fw-bold"
                                >Alternate Number:</label
                              >
                              <div class="col-12 col-lg-6">
                                <input
                                  type="text"
                                  readonly
                                  class="form-control-plaintext"
                                  id="alternateContactNumber"
                                  :value="selectedSchool.alternate_contact_number"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="row">
                          <label for="emailId" class="col-12 col-lg-3 col-form-label fw-bold"
                            >Email Id:</label
                          >
                          <div class="col-12 col-lg-9">
                            <input
                              type="text"
                              readonly
                              class="form-control-plaintext"
                              id="emailId"
                              :value="selectedSchool.email"
                            />
                          </div>
                        </div>
                      </fieldset>

                      <!-- Mediums and Standards -->
                      <div class="col col-12 text-center">
                        <div class="row justify-content-between">
                          <div class="col-12 col-lg-6 pe-sm-3">
                            <div class="row">
                              <label for="medium" class="col-form-label fw-bold"
                                >Mediums of Instruction:</label
                              >
                              <ul class="list-group p-1" id="medium">
                                <li
                                  v-for="medium in selectedSchool.mediums"
                                  :key="medium.id"
                                  class="list-group-item"
                                >
                                  {{ medium.name }}
                                </li>
                              </ul>
                            </div>
                          </div>
                          <div class="col-12 col-lg-6 ps-sm-3">
                            <div class="row">
                              <label for="standard" class="col-form-label fw-bold"
                                >Standards Offered:</label
                              >
                              <ul class="list-group p-1" id="standard">
                                <li
                                  v-for="standard in selectedSchool.standards"
                                  :key="standard.id"
                                  class="list-group-item"
                                >
                                  {{ standard.name }}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
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
              disabled
              title="Coming soon"
              id="viewTeachers"
            >
              <i class="bi bi-arrow-return-right"></i> Teachers
            </button>
            <button
              type="button"
              class="btn btn-dark"
              id="editSchoolButton"
              @click="navigateToEdit(selectedSchool?.id)"
            >
              Edit
            </button>
            <button
              type="button"
              class="btn btn-custom"
              id="deleteTeacherButton"
              data-bs-toggle="modal"
              data-bs-target="#deleteConfirmationModal"
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import { getApiUrl } from '@/config/api'

// Types
interface Country {
  id: number
  name: string
}

interface State {
  id: number
  country_id: number
  name: string
}

interface City {
  id: number
  state_id: number
  name: string
}

interface Address {
  id: number
  city_id: number
  postal_code: string
  street: string
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  city?: City
  state?: State
  country?: Country
}

interface Board {
  id: number
  name: string
  abbreviation: string
  address_id: number
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
}

interface School {
  id: number
  board_id: number
  name: string
  address_id: number
  principal_name: string
  email: string
  contact_number: string
  alternate_contact_number?: string
  created_by: number
  created_at: string
  updated_by: number
  updated_at: string
  board?: Board
  address?: Address
  mediums?: { id: number; name: string }[]
  standards?: { id: number; name: string }[]
}

interface DisplaySchool extends School {
  board: Board
  address: Address & {
    city: City
    state: State
    country: Country
  }
  mediums: Array<{ id: number; name: string }>
  standards: Array<{ id: number; name: string }>
}

const route = useRoute()
const router = useRouter()

const schools = ref<DisplaySchool[]>([])
const boards = ref<Board[]>([])
const selectedSchool = ref<DisplaySchool | null>(null)
const schoolSearch = ref('')
const boardSearch = ref('')
const isLoading = ref(false)

// Initialize from route query if present
onMounted(() => {
  const boardName = route.query.board as string
  if (boardName) {
    boardSearch.value = boardName
  }
  fetchSchools()
  fetchBoards()
})

const filteredAndHighlightedSchools = computed(() => {
  return schools.value
    .filter((school) => {
      const matchesSchool = school.name.toLowerCase().includes(schoolSearch.value.toLowerCase())
      const matchesBoard = school.board.name.toLowerCase().includes(boardSearch.value.toLowerCase())
      return matchesSchool && matchesBoard
    })
    .map((school) => {
      const highlightedName = highlightText(school.name, schoolSearch.value)
      const highlightedBoardName = highlightText(school.board.name, boardSearch.value)
      return {
        ...school,
        highlightedName,
        highlightedBoardName,
      }
    })
})

function highlightText(text: string, search: string): string {
  if (!search) return text
  const regex = new RegExp(`(${search})`, 'gi')
  return text.replace(regex, '<span class="highlight">$1</span>')
}

async function fetchSchools() {
  try {
    console.log('Starting fetchSchools...')

    // Fetch schools with all related data in a single request
    const schoolsResponse = await fetch(getApiUrl('/schools'))
    const schoolsData = (await schoolsResponse.json()) as School[]
    console.log('Initial schools data:', schoolsData)

    // For each school, fetch its complete details
    const schoolsWithDetails = await Promise.all(
      schoolsData.map(async (school: School) => {
        console.log(`\nProcessing school ID ${school.id}:`, school)

        // Fetch board details
        const boardResponse = await fetch(getApiUrl(`/boards/${school.board_id}`))
        const board = await boardResponse.json()
        console.log('Board details:', board)

        // Fetch complete address details with city, state, and country
        console.log(`Fetching address details for address_id: ${school.address_id}`)
        const addressResponse = await fetch(getApiUrl(`/addresses/${school.address_id}`))
        const address = await addressResponse.json()
        console.log('Address details:', address)

        // Fetch city details
        console.log(`Fetching city details for city_id: ${address.city_id}`)
        const cityResponse = await fetch(getApiUrl(`/cities/${address.city_id}`))
        const city = await cityResponse.json()
        console.log('City details:', city)

        // Fetch state details
        console.log(`Fetching state details for state_id: ${city.state_id}`)
        const stateResponse = await fetch(getApiUrl(`/states/${city.state_id}`))
        const state = await stateResponse.json()
        console.log('State details:', state)

        // Fetch country details
        console.log(`Fetching country details for country_id: ${state.country_id}`)
        const countryResponse = await fetch(getApiUrl(`/countries/${state.country_id}`))
        const country = await countryResponse.json()
        console.log('Country details:', country)

        // Fetch school's mediums with their details
        console.log(`Fetching mediums for school ID: ${school.id}`)
        const schoolMediumsResponse = await fetch(
          getApiUrl(`/school-instruction-mediums/school/${school.id}`),
        )
        const schoolMediums = await schoolMediumsResponse.json()
        console.log('School mediums:', schoolMediums)

        // Get medium details for each medium
        const mediums = await Promise.all(
          schoolMediums.map(async (sm: { instruction_medium_id: number }) => {
            const mediumResponse = await fetch(
              getApiUrl(`/instruction-mediums/${sm.instruction_medium_id}`),
            )
            const medium = await mediumResponse.json()
            return { id: medium.id, name: medium.instruction_medium }
          }),
        )
        console.log('Processed mediums:', mediums)

        // Fetch school's standards with their details
        console.log(`Fetching standards for school ID: ${school.id}`)
        const schoolStandardsResponse = await fetch(
          getApiUrl(`/school-standards/school/${school.id}`),
        )
        const schoolStandards = await schoolStandardsResponse.json()
        console.log('School standards:', schoolStandards)

        // Get standard details for each standard
        const standards = await Promise.all(
          schoolStandards.map(async (ss: { standard_id: number }) => {
            const standardResponse = await fetch(getApiUrl(`/standards/${ss.standard_id}`))
            const standard = await standardResponse.json()
            return { id: standard.id, name: standard.name }
          }),
        )
        console.log('Processed standards:', standards)

        // Construct the complete school object with all details
        const completeSchool = {
          ...school,
          board,
          address: {
            ...address,
            city,
            state,
            country,
          },
          mediums,
          standards,
        } as DisplaySchool

        console.log('Complete school object:', completeSchool)
        console.log('Address structure:', completeSchool.address)
        return completeSchool
      }),
    )

    // Sort schools by created_at timestamp before assigning to schools.value
    schools.value = schoolsWithDetails.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateA - dateB
    })

    console.log('\nFinal schools array:', schools.value)
    console.log('Sample school address data:', schools.value[0]?.address)
  } catch (error) {
    console.error('Error in fetchSchools:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
  }
}

async function fetchBoards() {
  try {
    const response = await fetch(getApiUrl('/boards'))
    const data = await response.json()
    boards.value = data
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

function clearInput(type: 'school' | 'board') {
  if (type === 'school') {
    schoolSearch.value = ''
  } else {
    boardSearch.value = ''
  }
}

function openViewModal(school: DisplaySchool) {
  console.log('Opening modal for school:', school)
  console.log('School address data:', school.address)
  console.log('Address structure:', {
    street: school.address.street,
    postal_code: school.address.postal_code,
    city: school.address.city,
    state: school.address.state,
    country: school.address.country,
  })

  selectedSchool.value = school
  const modal = new Modal(document.getElementById('viewSchoolModal') as HTMLElement)
  modal.show()
}

async function deleteSchool() {
  if (!selectedSchool.value) return

  try {
    // Delete school-instruction-mediums
    await fetch(getApiUrl(`/school-instruction-mediums/school/${selectedSchool.value.id}`), {
      method: 'DELETE',
    })

    // Delete school-standards
    await fetch(getApiUrl(`/school-standards/school/${selectedSchool.value.id}`), {
      method: 'DELETE',
    })

    // Delete school
    const response = await fetch(getApiUrl(`/schools/${selectedSchool.value.id}`), {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete school')

    // Delete address
    await fetch(getApiUrl(`/addresses/${selectedSchool.value.address_id}`), {
      method: 'DELETE',
    })

    // Refresh the schools list
    fetchSchools()

    // Close the view modal
    const viewModal = Modal.getInstance(document.getElementById('viewSchoolModal') as HTMLElement)
    viewModal?.hide()
  } catch (error) {
    console.error('Error deleting school:', error)
    alert('Failed to delete school. Please try again.')
  }
}

function navigateToAddSchool() {
  router.push('/admin/school/add')
}

function navigateToEdit(schoolId?: number) {
  if (!schoolId) return

  // Close the view modal first
  const viewModal = Modal.getInstance(document.getElementById('viewSchoolModal') as HTMLElement)
  viewModal?.hide()

  router.push({
    name: 'editSchool',
    params: { id: schoolId.toString() },
  })
}

// Update the function to fetch school details more efficiently
const fetchSchoolDetails = async (school: School): Promise<DisplaySchool | null> => {
  try {
    console.log('\nProcessing school ID', school.id, ':', school)

    // Fetch board details
    const boardResponse = await fetch(getApiUrl(`/boards/${school.board_id}`))
    const board = await boardResponse.json()
    console.log('Board details:', board)

    // Fetch address details
    console.log('Fetching address details for address_id:', school.address_id)
    const addressResponse = await fetch(getApiUrl(`/addresses/${school.address_id}`))
    const address = await addressResponse.json()
    console.log('Address details:', address)

    // Fetch city details
    console.log('Fetching city details for city_id:', address.city_id)
    const cityResponse = await fetch(getApiUrl(`/cities/${address.city_id}`))
    const city = await cityResponse.json()
    console.log('City details:', city)

    // Fetch state details
    console.log('Fetching state details for state_id:', city.state_id)
    const stateResponse = await fetch(getApiUrl(`/states/${city.state_id}`))
    const state = await stateResponse.json()
    console.log('State details:', state)

    // Fetch country details
    console.log('Fetching country details for country_id:', state.country_id)
    const countryResponse = await fetch(getApiUrl(`/countries/${state.country_id}`))
    const country = await countryResponse.json()
    console.log('Country details:', country)

    // Return school with details
    return {
      ...school,
      board,
      mediums: [],
      standards: [],
      address: {
        ...address,
        city: {
          ...city,
          state: {
            ...state,
            country,
          },
        },
      },
    }
  } catch (error) {
    console.error('Error fetching school details:', error)
    return null
  }
}

// Add new function to fetch school mediums and standards when needed
const fetchSchoolMediumsAndStandards = async (schoolId: number) => {
  try {
    // Fetch school's mediums with their details
    const schoolMediumsResponse = await fetch(
      getApiUrl(`/school-instruction-mediums/school/${schoolId}`),
    )
    const schoolMediums = await schoolMediumsResponse.json()

    // Get medium details for each medium
    const mediums = await Promise.all(
      schoolMediums.map(async (sm: { instruction_medium_id: number }) => {
        const mediumResponse = await fetch(
          getApiUrl(`/instruction-mediums/${sm.instruction_medium_id}`),
        )
        return mediumResponse.json()
      }),
    )

    // Fetch school's standards with their details
    const schoolStandardsResponse = await fetch(getApiUrl(`/school-standards/school/${schoolId}`))
    const schoolStandards = await schoolStandardsResponse.json()

    // Get standard details for each standard
    const standards = await Promise.all(
      schoolStandards.map(async (ss: { standard_id: number }) => {
        const standardResponse = await fetch(getApiUrl(`/standards/${ss.standard_id}`))
        return standardResponse.json()
      }),
    )

    return {
      mediums: mediums.map((m) => ({ id: m.id, name: m.instruction_medium })),
      standards: standards.map((s) => ({ id: s.id, name: s.name })),
    }
  } catch (error) {
    console.error('Error fetching school mediums and standards:', error)
    return { mediums: [], standards: [] }
  }
}

// Update the showSchoolDetails function to use the new approach
const showSchoolDetails = async (school: School) => {
  try {
    selectedSchool.value = null
    isLoading.value = true

    // First fetch basic school details
    const schoolWithDetails = await fetchSchoolDetails(school)
    if (!schoolWithDetails) {
      throw new Error('Failed to fetch school details')
    }

    // Then fetch mediums and standards
    const { mediums, standards } = await fetchSchoolMediumsAndStandards(school.id)

    // Update the selected school with all details
    selectedSchool.value = {
      ...schoolWithDetails,
      mediums,
      standards,
    }

    // Show the details modal
    const modal = new Modal(document.getElementById('schoolDetailsModal') as HTMLElement)
    modal.show()
  } catch (error) {
    console.error('Error showing school details:', error)
  } finally {
    isLoading.value = false
  }
}

// Add function to handle school actions
const handleSchoolAction = async (action: string, school: School) => {
  switch (action) {
    case 'view':
      await showSchoolDetails(school)
      break
    // Add other cases as needed
    default:
      console.warn('Unknown action:', action)
  }
}
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

#navSchool {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navSchool {
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
