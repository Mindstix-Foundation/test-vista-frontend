<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center g-2 align-items-center mb-4">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">TEACHER MANAGEMENT</h5>
        </div>
        <div class="col-12 col-sm-5 dynamic-style text-end">
          <router-link to="/admin/teacher/add" class="btn btn-success" id="addButton"
            >Add Teacher</router-link
          >
        </div>
      </div>
      <hr />
    </div>

    <!-- Search Section -->
    <div class="row p-2 gy-2 justify-content-center">
      <!-- Search Teacher -->
      <div class="col-12 col-sm-5">
        <div class="input-group">
          <div class="form-floating">
            <input
              type="text"
              class="form-control"
              id="searchTeacherInput"
              placeholder="Search for Teacher"
              v-model="teacherSearch"
              @input="filterTeachers"
            />
            <label for="searchTeacherInput">
              <i class="bi bi-search text-secondary"></i> Search for Teacher
            </label>
          </div>
          <span
            class="input-group-text clear-icon"
            @click="clearSearch('teacher')"
            style="cursor: pointer"
          >
            <i class="bi bi-x-lg"></i>
          </span>
        </div>
      </div>

      <!-- Search School -->
      <div class="col-12 col-sm-5">
        <div class="input-group">
          <div class="form-floating">
            <input
              type="text"
              class="form-control"
              id="searchSchoolInput"
              placeholder="Search for School"
              v-model="schoolSearch"
              @input="filterTeachers"
            />
            <label for="searchSchoolInput">
              <i class="bi bi-search text-secondary"></i> Search for School
            </label>
          </div>
          <span
            class="input-group-text clear-icon"
            @click="clearSearch('school')"
            style="cursor: pointer"
          >
            <i class="bi bi-x-lg"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div id="table-container" class="row p-2 mt-4 justify-content-center">
      <div class="col-12 col-sm-10 col-md-10">
        <div class="table-responsive">
          <table
            class="table table-sm table-striped table-hover table-bordered"
            style="width: 100%"
          >
            <colgroup>
              <col style="width: 10px" />
              <col style="width: 35%" />
              <col style="width: 55%" />
              <col style="width: 10%" />
              <col style="width: 20px" />
            </colgroup>
            <thead class="table-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Teacher</th>
                <th scope="col">School</th>
                <th scope="col" class="text-nowrap justify-content-center">
                  <span @click="toggleFilter">
                    Access &nbsp;<i class="bi bi-funnel text-white"></i>
                  </span>
                  <div v-show="showFilter" class="mt-2">
                    <div class="btn-group">
                      <button
                        v-for="status in ['All', 'Grant', 'Revoke']"
                        :key="status"
                        class="btn btn-sm"
                        :class="{
                          'btn-light': selectedStatus === status,
                          'btn-outline-light': selectedStatus !== status,
                        }"
                        @click="filterByStatus(status)"
                      >
                        {{ status }}
                      </button>
                    </div>
                  </div>
                </th>
                <th scope="col" class="text-end">Manage</th>
              </tr>
            </thead>
            <tbody class="table-group-divider">
              <tr v-if="loading">
                <td colspan="5" class="text-center">
                  <output class="spinner-border">
                    <span class="visually-hidden">Loading...</span>
                  </output>
                </td>
              </tr>
              <template v-else>
                <tr v-for="(teacher, index) in filteredTeachers" :key="teacher.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>{{ teacher.name }}</td>
                  <td>{{ teacher.school.name }}</td>
                  <td>{{ teacher.status ? 'Granted' : 'Revoked' }}</td>
                  <td class="text-center">
                    <i
                      class="bi bi-three-dots"
                      @click="openViewModal(teacher)"
                      style="cursor: pointer"
                    ></i>
                  </td>
                </tr>
                <tr v-if="filteredTeachers.length === 0">
                  <td colspan="5" class="text-center">No matching results found.</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View Teacher Modal -->
    <div
      class="modal fade"
      id="viewTeacherModal"
      tabindex="-1"
      aria-labelledby="viewTeacherModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" v-if="selectedTeacher">
          <div class="modal-header">
            <h3 class="modal-title">Teacher Information</h3>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="container">
              <div class="row mt-4">
                <div class="col-12">
                  <form>
                    <div class="row g-3">
                      <div class="row">
                        <label class="col-12 col-lg-3 col-form-label fw-bold" for="teacherName">
                          Teacher Name:
                        </label>
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            id="teacherName"
                            readonly
                            class="form-control-plaintext"
                            :value="selectedTeacher.name"
                          />
                        </div>
                      </div>
                      <div class="row">
                        <label class="col-12 col-lg-3 col-form-label fw-bold" for="schoolName">
                          School Name:
                        </label>
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            id="schoolName"
                            readonly
                            class="form-control-plaintext"
                            :value="selectedTeacher.school?.name"
                          />
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-12 col-lg-6">
                          <div class="row">
                            <label
                              class="col-12 col-lg-6 col-form-label fw-bold"
                              for="contactNumber"
                            >
                              Contact Number:
                            </label>
                            <div class="col-12 col-lg-6">
                              <input
                                type="text"
                                id="contactNumber"
                                readonly
                                class="form-control-plaintext"
                                :value="selectedTeacher.contactNumber"
                              />
                            </div>
                          </div>
                        </div>
                        <div class="col-12 col-lg-6">
                          <div class="row">
                            <label
                              class="col-12 col-lg-6 col-form-label fw-bold"
                              for="alternateContactNumber"
                            >
                              Alternate Number:
                            </label>
                            <div class="col-12 col-lg-6">
                              <input
                                type="text"
                                id="alternateContactNumber"
                                readonly
                                class="form-control-plaintext"
                                :value="selectedTeacher.alternateContactNumber"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="row">
                        <label class="col-12 col-lg-3 col-form-label fw-bold" for="emailId">
                          Email Id:
                        </label>
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            id="emailId"
                            readonly
                            class="form-control-plaintext"
                            :value="selectedTeacher.emailId"
                          />
                        </div>
                      </div>
                      <div class="row">
                        <label
                          class="col-12 col-lg-3 col-form-label fw-bold"
                          for="highestQualification"
                        >
                          Highest Qualification:
                        </label>
                        <div class="col-12 col-lg-9">
                          <input
                            type="text"
                            id="highestQualification"
                            readonly
                            class="form-control-plaintext"
                            :value="selectedTeacher.highestQualification"
                          />
                        </div>
                      </div>

                      <div id="classSubjectList" v-if="selectedTeacher.teacherSubjects.length > 0">
                        <h5>Standards & Subjects</h5>
                        <ul class="list-group">
                          <li
                            v-for="(standardGroup, standardName) in groupedTeacherSubjects"
                            :key="standardName"
                            class="mb-2"
                          >
                            <div class="list-group-item">
                              <div class="fw-bold">Standard {{ standardName }}</div>
                              <div class="ps-3">
                                {{
                                  standardGroup
                                    .map((subject) => subject.mediumStandardSubject.subject.name)
                                    .join(', ')
                                }}
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div v-else class="text-center text-muted">No subjects assigned</div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn btn-light"
              style="border: 1px solid gray"
              @click="toggleTeacherStatus"
            >
              <span
                class="status-indicator"
                :style="{ backgroundColor: selectedTeacher.status ? '#28a745' : '#dc3545' }"
              ></span>
              <span class="status-text">{{ selectedTeacher.status ? 'Granted' : 'Revoked' }}</span>
            </button>
            <router-link
              :to="{ name: 'editTeacher', params: { id: selectedTeacher.id } }"
              class="btn btn-dark"
              @click="closeViewModal"
            >
              Edit
            </router-link>
            <button type="button" class="btn btn-custom" @click="showDeleteConfirmation">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteConfirmationModal"
      tabindex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Remove Teacher</h5>
            <button
              type="button"
              class="btn-close"
              @click="handleCancelDelete"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">Are you sure you want to delete this Teacher from system?</div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              style="border: 1px solid gray"
              @click="handleCancelDelete"
            >
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="deleteTeacher">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Access Status Confirmation Modals -->
    <div
      class="modal fade"
      id="accessConfirmationModal"
      tabindex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" :class="confirmationModalStyle">
            <h5 class="modal-title text-white">{{ confirmationModalTitle }}</h5>
          </div>
          <div class="modal-body">
            {{ confirmationModalMessage }}
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-light"
              style="border: 1px solid gray"
              @click="handleAccessCancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn"
              :class="confirmationModalStyle"
              @click="updateTeacherStatus"
            >
              {{ selectedTeacher?.status ? 'Revoke' : 'Grant' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Modal } from 'bootstrap'
import type { Teacher } from '@/models/Teacher'
import { getApiUrl } from '@/config/api'

interface SubjectResponse {
  id: number
  school_standard_id: number
  medium_standard_subject_id: number
  medium_standard_subject: {
    id: number
    instruction_medium: {
      id: number
      instruction_medium: string
    }
    subject: {
      id: number
      name: string
    }
  }
  school_standard: {
    id: number
    standard: {
      id: number
      name: string
    }
  }
}

interface UserResponse {
  id: number
  name: string
  email_id: string
  contact_number: string
  alternate_contact_number?: string
  highest_qualification: string
  status: boolean
  created_at: string
  updated_at: string
}

const route = useRoute()
const teachers = ref<Teacher[]>([])
const loading = ref(true)
const teacherSearch = ref('')
const schoolSearch = ref('')
const selectedTeacher = ref<Teacher | null>(null)
const showFilter = ref(false)
const selectedStatus = ref('All')

// Initialize from route query if present
onMounted(async () => {
  const schoolName = route.query.school as string
  if (schoolName) {
    schoolSearch.value = schoolName
  }
  await fetchTeachers()
})

const fetchTeachers = async () => {
  try {
    loading.value = true
    console.log('Starting teacher data fetch process...')

    // Step 1: Get all roles to find TEACHER role ID
    console.log('Step 1: Fetching roles...')
    const rolesResponse = await fetch(getApiUrl('/roles'))
    if (!rolesResponse.ok) {
      console.error('Failed to fetch roles:', rolesResponse.status, rolesResponse.statusText)
      throw new Error(`Failed to fetch roles: ${rolesResponse.status}`)
    }
    const roles = await rolesResponse.json()
    console.log('Fetched roles:', roles)

    const teacherRole = roles.find((role: { role_name: string }) => role.role_name === 'TEACHER')
    if (!teacherRole) {
      console.error('Teacher role not found in roles:', roles)
      throw new Error('Teacher role configuration not found')
    }
    console.log('Found teacher role:', teacherRole)

    // Step 2: Get all user-roles to find users with TEACHER role
    console.log('Step 2: Fetching user roles...')
    const userRolesResponse = await fetch(getApiUrl('/user-roles'))
    if (!userRolesResponse.ok) {
      console.error(
        'Failed to fetch user roles:',
        userRolesResponse.status,
        userRolesResponse.statusText,
      )
      throw new Error(`Failed to fetch user roles: ${userRolesResponse.status}`)
    }
    const userRoles = await userRolesResponse.json()
    console.log('Fetched user roles:', userRoles)

    // Filter user IDs that have the TEACHER role
    const teacherUserIds = userRoles
      .filter((userRole: { role: { id: number } }) => userRole.role.id === teacherRole.id)
      .map((userRole: { user: { id: number } }) => userRole.user.id)
    console.log('Filtered teacher user IDs:', teacherUserIds)

    if (teacherUserIds.length === 0) {
      console.log('No teachers found in the system')
      teachers.value = []
      return
    }

    // Step 3: Get user details for all teacher IDs
    console.log('Step 3: Fetching user details...')
    const usersResponse = await fetch(getApiUrl('/users'))
    if (!usersResponse.ok) {
      console.error('Failed to fetch users:', usersResponse.status, usersResponse.statusText)
      throw new Error(`Failed to fetch users: ${usersResponse.status}`)
    }
    const allUsers = await usersResponse.json()
    console.log('Fetched all users:', allUsers)

    // Filter only teacher users
    const teacherUsers = allUsers.filter((user: { id: number }) => teacherUserIds.includes(user.id))
    console.log('Filtered teacher users:', teacherUsers)

    // Step 4: Get school assignments for each teacher
    console.log('Step 4: Fetching school assignments...')
    const schoolAssignments = await Promise.all(
      teacherUsers.map(async (user: { id: number }) => {
        console.log(`Fetching school assignment for user ${user.id}...`)
        const response = await fetch(getApiUrl(`/user-schools/user/${user.id}`))
        if (!response.ok) {
          console.warn(`Failed to fetch school for user ${user.id}:`, response.status)
          return { id: 0, name: '' }
        }

        const schools = await response.json()
        console.log(`Schools for user ${user.id}:`, schools)

        // Get the active school assignment (one without end_date)
        const activeSchool = schools.find((s: { end_date: string | null }) => !s.end_date)
        console.log(`Active school for user ${user.id}:`, activeSchool)

        if (activeSchool && activeSchool.school) {
          return {
            id: activeSchool.school.id,
            name: activeSchool.school.name,
          }
        }
        return { id: 0, name: '' }
      }),
    )
    console.log('Completed school assignments:', schoolAssignments)

    // Combine all data
    console.log('Combining all data...')
    teachers.value = teacherUsers.map((user: UserResponse, index: number) => ({
      id: user.id,
      name: user.name,
      emailId: user.email_id,
      contactNumber: user.contact_number,
      alternateContactNumber: user.alternate_contact_number,
      highestQualification: user.highest_qualification,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      school: schoolAssignments[index],
      teacherSubjects: [],
    }))
    console.log('Final teachers data:', teachers.value)
  } catch (error) {
    console.error('Error in fetchTeachers:', error)
    teachers.value = []
  } finally {
    loading.value = false
  }
}

// Computed property for filtered teachers
const filteredTeachers = computed(() => {
  return teachers.value.filter((teacher) => {
    const matchesTeacher = teacher.name.toLowerCase().includes(teacherSearch.value.toLowerCase())
    const matchesSchool = teacher.school.name
      .toLowerCase()
      .includes(schoolSearch.value.toLowerCase())
    const matchesStatus =
      selectedStatus.value === 'All' ||
      (selectedStatus.value === 'Grant' && teacher.status) ||
      (selectedStatus.value === 'Revoke' && !teacher.status)
    return matchesTeacher && matchesSchool && matchesStatus
  })
})

// Clear search inputs
function clearSearch(type: 'teacher' | 'school') {
  if (type === 'teacher') {
    teacherSearch.value = ''
  } else {
    schoolSearch.value = ''
  }
}

// Toggle filter visibility
function toggleFilter() {
  showFilter.value = !showFilter.value
}

// Filter by status
function filterByStatus(status: string) {
  selectedStatus.value = status
  showFilter.value = false
}

// View modal functions
async function openViewModal(teacher: Teacher) {
  try {
    loading.value = true
    console.log('Fetching subjects for teacher:', teacher.id)

    // Set initial teacher data first so modal can open
    selectedTeacher.value = {
      ...teacher,
      teacherSubjects: [],
    }

    // Show the modal first
    const modal = new Modal(document.getElementById('viewTeacherModal') as HTMLElement)
    modal.show()

    // Then fetch teacher subjects
    const response = await fetch(getApiUrl(`/teacher-subjects?userId=${teacher.id}`))
    if (!response.ok) {
      console.error('Failed to fetch teacher subjects:', response.status)
      throw new Error('Failed to fetch teacher subjects')
    }

    const subjects = await response.json()
    console.log('Fetched teacher subjects:', subjects)

    // Update the teacher data with fetched subjects
    selectedTeacher.value = {
      ...teacher,
      teacherSubjects: subjects.map((subject: SubjectResponse) => ({
        id: subject.id,
        schoolStandardId: subject.school_standard_id,
        mediumStandardSubjectId: subject.medium_standard_subject_id,
        mediumStandardSubject: {
          id: subject.medium_standard_subject.id,
          instructionMedium: {
            id: subject.medium_standard_subject.instruction_medium.id,
            instruction_medium:
              subject.medium_standard_subject.instruction_medium.instruction_medium,
          },
          standard: {
            id: subject.school_standard.standard.id,
            name: subject.school_standard.standard.name,
          },
          subject: {
            id: subject.medium_standard_subject.subject.id,
            name: subject.medium_standard_subject.subject.name,
          },
        },
      })),
    }
  } catch (error) {
    console.error('Error in openViewModal:', error)
  } finally {
    loading.value = false
  }
}

// Toggle teacher status
function toggleTeacherStatus() {
  if (!selectedTeacher.value) return

  // Close the view modal first
  const viewModal = Modal.getInstance(document.getElementById('viewTeacherModal') as HTMLElement)
  viewModal?.hide()

  // Show the confirmation modal
  const confirmModal = new Modal(document.getElementById('accessConfirmationModal') as HTMLElement)
  confirmModal.show()
}

// Update teacher status
async function updateTeacherStatus() {
  if (!selectedTeacher.value) return

  try {
    const newStatus = !selectedTeacher.value.status
    const response = await fetch(getApiUrl(`/users/${selectedTeacher.value.id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    })

    if (!response.ok) throw new Error('Failed to update status')

    selectedTeacher.value.status = newStatus
    await fetchTeachers()

    // Hide confirmation modal
    const confirmModal = Modal.getInstance(
      document.getElementById('accessConfirmationModal') as HTMLElement,
    )
    confirmModal?.hide()

    // Reopen the view modal
    const viewModal = new Modal(document.getElementById('viewTeacherModal') as HTMLElement)
    viewModal.show()
  } catch (error) {
    console.error('Error updating teacher status:', error)
  }
}

// Add function to handle cancel button in confirmation modal
function handleAccessCancel() {
  // Hide confirmation modal
  const confirmModal = Modal.getInstance(
    document.getElementById('accessConfirmationModal') as HTMLElement,
  )
  confirmModal?.hide()

  // Reopen the view modal
  const viewModal = new Modal(document.getElementById('viewTeacherModal') as HTMLElement)
  viewModal.show()
}

// Show delete confirmation
function showDeleteConfirmation() {
  // Close the view modal first
  const viewModal = Modal.getInstance(document.getElementById('viewTeacherModal') as HTMLElement)
  viewModal?.hide()

  // Show the confirmation modal
  const modal = new Modal(document.getElementById('deleteConfirmationModal') as HTMLElement)
  modal.show()
}

// Delete teacher
async function deleteTeacher() {
  if (!selectedTeacher.value) return

  try {
    const response = await fetch(getApiUrl(`/users/${selectedTeacher.value.id}`), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Teacher not found')
      }
      throw new Error('Failed to delete teacher')
    }

    // Refresh the teachers list
    await fetchTeachers()

    // Close the delete confirmation modal
    const deleteModal = Modal.getInstance(
      document.getElementById('deleteConfirmationModal') as HTMLElement,
    )
    deleteModal?.hide()

    // Remove backdrop manually
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

    // Remove modal-open class and inline styles from body
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
  } catch (error) {
    console.error('Error deleting teacher:', error)
    alert('Failed to delete teacher. Please try again.')
  }
}

// Add function to handle cancel button in delete confirmation modal
function handleCancelDelete() {
  // Hide delete confirmation modal
  const deleteModal = Modal.getInstance(
    document.getElementById('deleteConfirmationModal') as HTMLElement,
  )
  deleteModal?.hide()

  // Reopen the view modal
  const viewModal = new Modal(document.getElementById('viewTeacherModal') as HTMLElement)
  viewModal.show()
}

// Computed properties for confirmation modal
const confirmationModalStyle = computed(() => {
  return {
    'bg-danger': selectedTeacher.value?.status,
    'bg-success': !selectedTeacher.value?.status,
  }
})

const confirmationModalTitle = computed(() => {
  return selectedTeacher.value?.status ? 'Revoke Teacher Access' : 'Grant Teacher Access'
})

const confirmationModalMessage = computed(() => {
  return selectedTeacher.value?.status
    ? "Are you sure you want to revoke this teacher's access?"
    : 'Are you sure you want to grant access to this teacher?'
})

// Filter teachers (used by input event handlers)
function filterTeachers() {
  // The actual filtering is handled by the filteredTeachers computed property
  // This function exists just to satisfy the template event handlers
}

// Add this new function to handle modal cleanup
function closeViewModal() {
  const modal = Modal.getInstance(document.getElementById('viewTeacherModal') as HTMLElement)
  modal?.hide()
  // Remove backdrop manually
  const backdrop = document.querySelector('.modal-backdrop')
  backdrop?.remove()
  // Remove modal-open class from body
  document.body.classList.remove('modal-open')
  document.body.style.removeProperty('padding-right')
}

// Add this computed property in the script section
const groupedTeacherSubjects = computed(() => {
  if (!selectedTeacher.value?.teacherSubjects) return {}

  interface TeacherSubjectGroup {
    id: number
    schoolStandardId: number
    mediumStandardSubjectId: number
    mediumStandardSubject: {
      id: number
      instructionMedium: {
        id: number
        instruction_medium: string
      }
      standard: {
        id: number
        name: string
      }
      subject: {
        id: number
        name: string
      }
    }
  }

  return selectedTeacher.value.teacherSubjects.reduce(
    (groups: { [key: string]: TeacherSubjectGroup[] }, subject) => {
      const standardName = subject.mediumStandardSubject.standard.name
      if (!groups[standardName]) {
        groups[standardName] = []
      }
      groups[standardName].push(subject)
      return groups
    },
    {},
  )
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

#navTeacher {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navTeacher {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.clear-icon {
  cursor: pointer;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Toggle Button Styling */
.btn-toggle {
  display: grid !important;
  align-items: center;
  justify-content: center;
  width: 100px;
  border-radius: 30px;
  background-color: #f5f5f5;
  color: #333;
  font-size: 16px;
  font-weight: 600;
  border: 1px solid gray !important;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.btn-toggle .status-indicator {
  position: absolute;
  align-self: center;
  left: 10px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #28a745;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.btn-toggle[data-status='revoke'] {
  background-color: #ffe6e6;
  color: #b22222;
}

.btn-toggle[data-status='revoke'] .status-indicator {
  background-color: #dc3545;
}

.btn-toggle .status-text {
  margin-left: 20px;
  transition: color 0.3s ease;
}

/* Status Indicator Styling */
.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-text {
  font-weight: 500;
}

/* Remove the old toggle button styles */
</style>
