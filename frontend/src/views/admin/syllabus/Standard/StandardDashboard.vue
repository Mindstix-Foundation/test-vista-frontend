<template>
  <div class="container my-4">
    <div class="container mb-3">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/syllabus" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-1">
        <div class="col col-12 col-sm-5">
          <p class="text-muted text-start fs-5 m-0">
            <span class="col-12 col-md-auto">{{ selectedBoard?.name }} |</span>
            <span class="col-12 col-md-auto"> {{ selectedMedium?.instruction_medium }}</span>
          </p>
          <h3 class="fw-bolder text-start text-dark m-0">Standard {{ selectedStandard?.name }}</h3>
        </div>
        <div class="col col-12 col-sm-5 dynamic-style text-end align-self-end">
          <div class="row justify-content-end g-2">
            <div class="col col-12 col-sm-auto text-end">
              <button
                id="addSubjectButton"
                class="btn btn-success fw-bold stick-bottom"
                @click="navigateToAddSubject"
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>
      </div>
      <hr />
    </div>

    <div class="container mt-2 pt-3 mb-5 pb-3">
      <!-- Search Section -->
      <div class="row p-2 gy-2 justify-content-center">
        <div class="col-12 col-sm-10">
          <div class="input-group">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                id="subjectFilter"
                placeholder="Search for Subject"
                v-model="searchQuery"
                autocomplete="off"
              />
              <label for="subjectFilter">
                <i class="bi bi-search text-secondary"></i> Search for Subject
              </label>
            </div>
            <span class="input-group-text clear-icon" @click="clearSearch">
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
                  <th scope="col">Subject</th>
                  <th scope="col">Manage</th>
                </tr>
              </thead>
              <tbody class="table-group-divider" id="subjectTable">
                <tr v-for="(subject, index) in filteredSubjects" :key="subject.id">
                  <th scope="row">{{ index + 1 }}</th>
                  <td>
                    {{ subject.name }}
                    <span v-if="subject.isNew" class="badge rounded-pill bg-dark">New</span>
                  </td>
                  <td class="text-center">
                    <i
                      class="bi bi-three-dots"
                      style="cursor: pointer"
                      @click="navigateToSubject(subject)"
                    ></i>
                  </td>
                </tr>
                <tr v-if="filteredSubjects.length === 0">
                  <td colspan="3" class="text-center">No subjects found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Subject Modal -->
    <div
      class="modal fade"
      id="addSubjectModal"
      tabindex="-1"
      aria-labelledby="addSubjectModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addSubjectModalLabel">Add Subjects</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="container">
              <div class="row">
                <div class="col-12">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover table-striped table-bordered">
                      <thead>
                        <tr>
                          <th scope="col" style="width: 50px"></th>
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="availableSubjects.length === 0">
                          <td colspan="2" class="text-center">No subjects available</td>
                        </tr>
                        <tr v-else v-for="subject in filteredAvailableSubjects" :key="subject.id">
                          <td>
                            <div class="form-check d-flex justify-content-center">
                              <input
                                type="checkbox"
                                class="form-check-input"
                                :value="subject.id"
                                v-model="selectedSubjectIds"
                              />
                            </div>
                          </td>
                          <td>{{ subject.name }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="container-fluid px-0">
              <div class="row align-items-center">
                <div class="col">
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search subjects..."
                      v-model="modalSearchQuery"
                    />
                  </div>
                </div>
                <div class="col-auto">
                  <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="btn btn-success"
                    @click="addSelectedSubjects"
                    :disabled="selectedSubjectIds.length === 0"
                  >
                    Add Selected ({{ selectedSubjectIds.length }})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApiUrl } from '@/config/api'
import { Modal } from 'bootstrap'
import { useToastStore } from '@/store/toast'

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

interface Subject {
  id: number
  name: string
  isNew?: boolean
}

interface BoardSubject {
  id: number
  name: string
  board_id: number
}

interface MediumStandardSubject {
  id: number
  instruction_medium_id: number
  standard_id: number
  subject: {
    id: number
    name: string
  }
}

interface AvailableSubject {
  id: number
  name: string
}

interface MappedSubject {
  id: number // mapping id
  subject_id: number
  name: string
}

const route = useRoute()
const router = useRouter()

const selectedBoard = ref<Board | null>(null)
const selectedMedium = ref<InstructionMedium | null>(null)
const selectedStandard = ref<Standard | null>(null)
const subjects = ref<Subject[]>([])
const searchQuery = ref('')
const modalSearchQuery = ref('')
const selectedSubjectIds = ref<number[]>([])
const availableSubjects = ref<AvailableSubject[]>([])
const toastStore = useToastStore()
const mappedSubjects = ref<MappedSubject[]>([])

// Fetch board, medium, and standard details
onMounted(async () => {
  const boardId = route.query.board
  const mediumId = route.query.medium
  const standardId = route.query.standard

  if (!boardId || !mediumId || !standardId) {
    router.push('/admin/syllabus')
    return
  }

  try {
    // Fetch board details
    const boardResponse = await fetch(getApiUrl(`/boards/${boardId}`))
    if (!boardResponse.ok) throw new Error('Failed to fetch board details')
    const boardData = await boardResponse.json()
    selectedBoard.value = boardData

    // Find selected medium
    selectedMedium.value = boardData.instruction_mediums.find(
      (medium: InstructionMedium) => medium.id === Number(mediumId),
    )

    // Find selected standard
    selectedStandard.value = boardData.standards.find(
      (standard: Standard) => standard.id === Number(standardId),
    )

    // Fetch subjects for this combination
    await fetchSubjects()
  } catch (error) {
    console.error('Error fetching details:', error)
  }
})

const fetchSubjects = async () => {
  try {
    const response = await fetch(
      getApiUrl(
        `/medium-standard-subjects/medium/${selectedMedium.value?.id}/standard/${selectedStandard.value?.id}?board_id=${selectedBoard.value?.id}`,
      ),
    )
    if (!response.ok) throw new Error('Failed to fetch subjects')
    const data = await response.json()

    // Store mapped subjects with their mapping IDs
    mappedSubjects.value = data.map((item: MediumStandardSubject) => ({
      id: item.id, // mapping id
      subject_id: item.subject.id,
      name: item.subject.name,
    }))

    // Update subjects list
    subjects.value = mappedSubjects.value.map((item) => ({
      id: item.subject_id,
      name: item.name,
      isNew: false,
    }))
  } catch (error) {
    console.error('Error fetching subjects:', error)
    subjects.value = []
    mappedSubjects.value = []
  }
}

const filteredSubjects = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return subjects.value.filter((subject) => subject.name.toLowerCase().includes(query))
})

const clearSearch = () => {
  searchQuery.value = ''
}

const navigateToAddSubject = async () => {
  try {
    modalSearchQuery.value = ''

    // Fetch all subjects from the board
    const response = await fetch(getApiUrl(`/subjects/board/${selectedBoard.value?.id}`))
    if (!response.ok) throw new Error('Failed to fetch board subjects')
    const boardSubjects = await response.json()

    // Set available subjects and pre-select mapped ones
    availableSubjects.value = boardSubjects.map((subject: BoardSubject) => ({
      id: subject.id,
      name: subject.name,
    }))

    // Set initially selected subjects
    selectedSubjectIds.value = mappedSubjects.value.map((subject) => subject.subject_id)

    // Show modal
    const modal = new Modal(document.getElementById('addSubjectModal') as HTMLElement)
    modal.show()
  } catch (error) {
    console.error('Error fetching board subjects:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to load board subjects. Please try again.',
      type: 'error',
    })
  }
}

const navigateToSubject = (subject: Subject) => {
  router.push({
    name: subject.isNew ? 'newSubject' : 'subjectSyllabus',
    params: { id: subject.id.toString() },
    query: {
      board: selectedBoard.value?.id,
      medium: selectedMedium.value?.id,
      standard: selectedStandard.value?.id,
    },
  })
}

const filteredAvailableSubjects = computed(() => {
  const query = modalSearchQuery.value.toLowerCase()
  return availableSubjects.value.filter((subject) => subject.name.toLowerCase().includes(query))
})

const addSelectedSubjects = async () => {
  try {
    // Find subjects to add and remove
    const currentMappedIds = mappedSubjects.value.map((m) => m.subject_id)
    const subjectsToAdd = selectedSubjectIds.value.filter((id) => !currentMappedIds.includes(id))
    const subjectsToRemove = mappedSubjects.value.filter(
      (m) => !selectedSubjectIds.value.includes(m.subject_id),
    )

    // Handle deletions
    for (const mapping of subjectsToRemove) {
      const response = await fetch(getApiUrl(`/medium-standard-subjects/${mapping.id}`), {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 409) {
          toastStore.showToast({
            title: 'Error',
            message: `Cannot remove subject "${mapping.name}" as it has existing relationships.`,
            type: 'error',
          })
          // Keep the subject selected as deletion failed
          selectedSubjectIds.value.push(mapping.subject_id)
          continue
        }
        throw new Error(`Failed to delete subject mapping for "${mapping.name}"`)
      }
    }

    // Handle additions
    for (const subjectId of subjectsToAdd) {
      const response = await fetch(getApiUrl('/medium-standard-subjects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction_medium_id: selectedMedium.value?.id,
          standard_id: selectedStandard.value?.id,
          subject_id: subjectId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add subject mapping`)
      }
    }

    // Refresh subjects list
    await fetchSubjects()

    // Hide modal
    const modal = Modal.getInstance(document.getElementById('addSubjectModal') as HTMLElement)
    modal?.hide()

    // Show success toast
    toastStore.showToast({
      title: 'Success',
      message: 'Subject mappings updated successfully',
      type: 'success',
    })
  } catch (error) {
    console.error('Error updating subject mappings:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to update subject mappings. Please try again.',
      type: 'error',
    })
  }
}
</script>

<style scoped>
/* Mobile styles for nav link */
@media (max-width: 768px) {
  #navSyllabus {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
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
    z-index: 1000;
  }

  #addSubjectButton {
    width: 100%;
  }
}

.clear-icon {
  cursor: pointer;
}

.bi-three-dots:hover {
  color: #0d6efd !important;
}

/* Modal styles */
.list-group-item {
  cursor: pointer;
  user-select: none;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.form-check-input {
  cursor: pointer;
}

.modal-dialog {
  max-width: 800px !important;
}

.modal-body {
  padding: 1rem;
  height: 400px;
  overflow-y: auto;
}

.table-responsive {
  height: 100%;
  overflow-y: auto;
}

.table thead {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.table th {
  background-color: white;
  border-bottom: 2px solid #dee2e6;
}

/* Remove dark theme from table header */
.table-dark {
  --bs-table-bg: white;
  --bs-table-color: #212529;
}

/* Ensure checkbox column width is consistent */
.table th:first-child,
.table td:first-child {
  width: 50px;
  text-align: center;
}

/* Style for the search input in modal footer */
.modal-footer .input-group {
  width: 300px;
}

@media (max-width: 768px) {
  .modal-footer .row {
    flex-direction: column-reverse;
    gap: 1rem;
  }

  .modal-footer .input-group {
    width: 100%;
  }

  .modal-footer .col-auto {
    width: 100%;
    display: flex;
    gap: 0.5rem;
  }

  .modal-footer .col-auto button {
    flex: 1;
  }
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table-dark {
  --bs-table-bg: #212529;
  --bs-table-color: #fff;
}

.table-dark th {
  background-color: #212529 !important;
  color: #fff !important;
  font-weight: bold !important;
  border-bottom: none !important;
}

.table > :not(caption) > * > * {
  padding: 0.3rem 0.75rem;
}

.table tbody tr td,
.table tbody tr th {
  vertical-align: middle;
  padding: 0.3rem 0.75rem;
  line-height: 1.2;
}

/* Loading State */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Search Input Styling */
.form-floating > .form-control {
  height: calc(3.5rem + 2px);
  line-height: 1.25;
}

.form-floating > label {
  padding: 1rem 0.75rem;
}

/* Modal Table Styles */
.modal .table thead {
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal .table th {
  background-color: white;
  border-bottom: 2px solid #dee2e6;
}

.modal .table-dark {
  --bs-table-bg: white;
  --bs-table-color: #212529;
}

/* Ensure consistent spacing */
.container {
  max-width: 1200px;
}

.table-responsive {
  border-radius: 0.25rem;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.05);
}

/* Highlight text styling */
:deep(.highlight) {
  background-color: #fff3cd;
  padding: 2px;
  border-radius: 2px;
  font-weight: bold;
}

/* Update modal table cell padding as well */
.modal .table > :not(caption) > * > * {
  padding: 0.3rem 0.75rem;
}

.modal .table tbody tr td,
.modal .table tbody tr th {
  vertical-align: middle;
  padding: 0.3rem 0.75rem;
  line-height: 1.2;
}

.modal .table thead th {
  font-weight: bold !important;
}
</style>
