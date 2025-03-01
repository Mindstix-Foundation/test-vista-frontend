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
    <div class="row p-2 gy-2 g-3 justify-content-center">
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
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Delete School</h5>
            <button
              type="button"
              class="btn-close"
              @click="handleCancelDelete"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="associatedTeachers.length > 0">
              <div class="alert alert-warning">
                <p class="mb-2">This school has the following associated teachers:</p>
                <ul class="list-unstyled ms-3">
                  <li v-for="teacher in associatedTeachers" :key="teacher.id">
                    - {{ teacher.name }}
                  </li>
                </ul>
              </div>
              <p class="mb-3">
                Deleting this school will also delete all associated teachers and other connected
                data.
              </p>
            </div>
            <p class="mb-3">
              Are you sure you want to delete this school? This action cannot be undone.
              <span v-if="associatedTeachers.length > 0" class="text-danger">
                All associated teachers and data will also be deleted!
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
            <button type="button" class="btn btn-secondary" @click="handleCancelDelete">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteSchool"
              :disabled="confirmationText !== 'sure'"
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
              id="viewTeachers"
              @click="navigateToTeachers(selectedSchool?.name)"
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
              id="deleteSchoolButton"
              @click="showDeleteConfirmation"
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
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'

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

interface Teacher {
  id: number
  name: string
  email_id: string
  contact_number: string
  alternate_contact_number?: string
  highest_qualification: string
  status: boolean
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
  School_Instruction_Medium?: Array<{
    instruction_medium: {
      id: number
      instruction_medium: string
    }
  }>
  School_Standard?: Array<{
    standard: {
      id: number
      name: string
    }
  }>
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
const toastStore = useToastStore()

const schools = ref<DisplaySchool[]>([])
const boards = ref<Board[]>([])
const selectedSchool = ref<DisplaySchool | null>(null)
const schoolSearch = ref('')
const boardSearch = ref('')
const associatedTeachers = ref<Teacher[]>([])
const confirmationText = ref('')

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

// Add these helper functions before fetchSchools
async function fetchStateAndCountry(cityId: number) {
  try {
    // First get the city to get state_id
    const { data: city } = await axiosInstance.get(`/cities/${cityId}`)

    // Get state data using state_id from city
    const { data: state } = await axiosInstance.get(`/states/${city.state_id}`)

    // Get country data using country_id from state
    const { data: country } = await axiosInstance.get(`/countries/${state.country_id}`)

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

async function fetchSchools() {
  try {
    console.log('Starting fetchSchools...')

    const { data: schoolsData } = await axiosInstance.get<School[]>('/schools')
    console.log('Schools data:', schoolsData)

    // Process schools with location data
    const processedSchools = await Promise.all(
      schoolsData.map(async (school: School): Promise<DisplaySchool> => {
        // Fetch complete location data for each school
        const locationData = school.address?.city_id
          ? await fetchStateAndCountry(school.address.city_id)
          : null

        return {
          ...school,
          board: {
            id: school.board_id,
            name: school.board?.name || '',
            abbreviation: school.board?.abbreviation || '',
            address_id: school.board?.address_id || 0,
            created_by: school.board?.created_by || 0,
            created_at: school.board?.created_at || '',
            updated_by: school.board?.updated_by || 0,
            updated_at: school.board?.updated_at || '',
          },
          address: {
            ...school.address!,
            city: locationData?.city || { id: 0, state_id: 0, name: '' },
            state: locationData?.state || { id: 0, country_id: 0, name: '' },
            country: locationData?.country || { id: 0, name: '' },
          },
          mediums:
            school.School_Instruction_Medium?.map(
              (medium: { instruction_medium: { id: number; instruction_medium: string } }) => ({
                id: medium.instruction_medium.id,
                name: medium.instruction_medium.instruction_medium,
              }),
            ) || [],
          standards:
            school.School_Standard?.map((standard: { standard: { id: number; name: string } }) => ({
              id: standard.standard.id,
              name: standard.standard.name,
            })) || [],
        }
      }),
    )

    schools.value = processedSchools.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return dateA - dateB
    })

    console.log('Processed schools:', schools.value)
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
    const { data } = await axiosInstance.get('/boards')
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

const deleteSchool = async () => {
  if (!selectedSchool.value) return

  try {
    // Check for confirmation text
    if (confirmationText.value !== 'sure') {
      return
    }

    // Delete school
    await axiosInstance.delete(`/schools/${selectedSchool.value.id}`)

    // Refresh the schools list
    fetchSchools()

    // Close the view modal
    const viewModal = Modal.getInstance(document.getElementById('viewSchoolModal') as HTMLElement)
    viewModal?.hide()

    // Show success toast
    toastStore.showToast({
      title: 'Success',
      message: 'School deleted successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error deleting school:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to delete school. Please try again.',
      type: 'error',
    })
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

async function showDeleteConfirmation() {
  if (!selectedSchool.value) return

  try {
    // Close the view modal first
    const viewModal = Modal.getInstance(document.getElementById('viewSchoolModal') as HTMLElement)
    viewModal?.hide()

    // Fetch associated teachers
    const { data: teachers } = await axiosInstance.get(`/users?schoolId=${selectedSchool.value.id}`)
    associatedTeachers.value = teachers

    // Show the confirmation modal
    const modal = new Modal(document.getElementById('deleteConfirmationModal') as HTMLElement)
    modal.show()
  } catch (error) {
    console.error('Error fetching associated teachers:', error)
    alert('Failed to check associated teachers. Please try again.')
  }
}

const handleCancelDelete = () => {
  confirmationText.value = ''
  const modal = Modal.getInstance(document.getElementById('deleteConfirmationModal')!)
  modal?.hide()
}

function navigateToTeachers(schoolName?: string) {
  // Close the view modal first
  cleanupModals()

  // Navigate to teachers page with the school name as a query parameter
  router.push({
    name: 'TeacherDashboard',
    query: { school: schoolName },
  })
}

function cleanupModals() {
  const viewModal = Modal.getInstance(document.getElementById('viewSchoolModal') as HTMLElement)
  viewModal?.hide()
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
