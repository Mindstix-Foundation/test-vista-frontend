<template>
  <div class="container mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <BoardFormComponent
          :isEditMode="true"
          :boardId="route.params.id as string"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </div>

  <!-- Operation Result Modal -->
  <div
    class="modal fade"
    id="operationResultModal"
    tabindex="-1"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Operation Results</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <ul class="list-group">
            <li
              v-for="(result, index) in operationResults"
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-start"
              :class="{
                'text-success': result.status === 'success',
                'text-danger': result.status === 'error',
              }"
            >
              <div class="ms-2 me-auto">
                <div>{{ result.operation }}</div>
                <div v-if="result.status === 'error'" class="text-danger small">
                  Error: {{ result.message }}
                </div>
              </div>
              <span
                class="badge rounded-pill"
                :class="{
                  'bg-success': result.status === 'success',
                  'bg-danger': result.status === 'error',
                }"
              >
                {{ result.status }}
              </span>
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-dark" @click="cleanupAndNavigate">
            Go to Board List
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import BoardFormComponent from '@/components/forms/BoardFormComponent.vue'
import { getApiUrl } from '@/config/api'
import { onMounted, ref } from 'vue'
import type {
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
  CreateBoardDto,
  CreateAddressDto,
} from '@/models/Board'
import * as bootstrap from 'bootstrap'

interface ExistingItem {
  id: number
  board_id: number
  name?: string
  instruction_medium?: string
}

// Add interfaces for form data with IDs
interface MediumFormData extends CreateInstructionMediumDto {
  id?: number
}

interface StandardFormData extends CreateStandardDto {
  id?: number
}

interface SubjectFormData extends CreateSubjectDto {
  id?: number
}

interface BoardFormSubmitData {
  address: CreateAddressDto
  board: CreateBoardDto
  mediums: MediumFormData[]
  standards: StandardFormData[]
  subjects: SubjectFormData[]
}

interface BoardResponse {
  id: number
  name: string
  abbreviation: string
  address_id: number
}

interface SchoolRelatedItem {
  id: number
  [key: string]: number | string | boolean | null
}

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

const router = useRouter()
const route = useRoute()

const operationResults = ref<OperationResult[]>([])

onMounted(() => {
  console.log('EditBoard mounted with board ID:', route.params.id)
})

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json()
    return data.message || data.error || 'Unknown error occurred'
  } catch {
    return 'Failed to parse error message'
  }
}

const updateBoard = async (formData: BoardFormSubmitData): Promise<BoardResponse> => {
  const response = await fetch(getApiUrl(`/boards/${route.params.id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.board.name,
      abbreviation: formData.board.abbreviation,
    }),
  })

  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new Error(errorMessage)
  }
  return response.json()
}

const fetchExistingItems = async (boardId: number) => {
  console.log('Fetching existing items for board:', boardId)
  return Promise.all([
    fetch(getApiUrl(`/instruction-mediums/board/${boardId}`)).then((r) => r.json()),
    fetch(getApiUrl(`/standards/board/${boardId}`)).then((r) => r.json()),
    fetch(getApiUrl(`/subjects/board/${boardId}`)).then((r) => r.json()),
  ]) as Promise<[ExistingItem[], ExistingItem[], ExistingItem[]]>
}

const deleteRelatedSchoolItems = async (
  endpoint: string,
  itemId: number,
  relationField: string,
): Promise<void> => {
  const response = await fetch(getApiUrl(endpoint))
  if (!response.ok) return

  const allItems = await response.json()
  const relatedItems = allItems.filter((item: SchoolRelatedItem) => item[relationField] === itemId)

  for (const item of relatedItems) {
    const deleteResponse = await fetch(getApiUrl(`${endpoint}/${item.id}`), { method: 'DELETE' })
    if (!deleteResponse.ok) {
      console.error(`Failed to delete related item ${item.id}`)
    }
  }
}

const handleMediumApiError = (operation: string, mediumName: string): never => {
  throw new Error(`Failed to ${operation} medium: ${mediumName}`)
}

const deleteMedium = async (medium: ExistingItem): Promise<void> => {
  console.log('Attempting to delete medium:', medium)
  await deleteRelatedSchoolItems('/school-instruction-mediums', medium.id, 'instruction_medium_id')
  const response = await fetch(getApiUrl(`/instruction-mediums/${medium.id}`), {
    method: 'DELETE',
  })
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new Error(errorMessage)
  }
}

const updateMedium = async (id: number, medium: MediumFormData, boardId: number): Promise<void> => {
  const response = await fetch(getApiUrl(`/instruction-mediums/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: medium.name, board_id: boardId }),
  })
  if (!response.ok) handleMediumApiError('update', medium.name)
}

const createMedium = async (medium: MediumFormData, boardId: number): Promise<void> => {
  const response = await fetch(getApiUrl('/instruction-mediums'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: medium.name, board_id: boardId }),
  })
  if (!response.ok) handleMediumApiError('create', medium.name)
}

const handleMediumChanges = async (
  formMediums: MediumFormData[],
  existingMediums: ExistingItem[],
  boardId: number,
): Promise<void> => {
  console.log('Starting medium changes with:', {
    formMediums: formMediums.map((m) => ({ id: m.id, name: m.name })),
    existingMediums: existingMediums.map((m) => ({ id: m.id, name: m.instruction_medium })),
  })

  const validFormMediums = formMediums.filter((m) => m.name.trim())

  // Create maps for easier comparison
  const formMediumsMap = new Map(
    validFormMediums.map((m) => [m.id, { ...m, name: m.name.toLowerCase().trim() }]),
  )
  const existingMediumsMap = new Map(
    existingMediums.map((m) => [
      m.id,
      { ...m, instruction_medium: m.instruction_medium?.toLowerCase().trim() },
    ]),
  )

  // Determine which mediums need to be deleted, updated, or added
  const toDelete = existingMediums.filter((m) => {
    const formMedium = formMediumsMap.get(m.id)
    // Only delete if the medium is not in the form data at all
    return !formMedium
  })

  const toUpdate = validFormMediums.filter((m) => {
    if (!m.id) return false
    const existingMedium = existingMediumsMap.get(m.id)
    // Only update if the names are different
    return existingMedium && existingMedium.instruction_medium !== m.name.toLowerCase().trim()
  })

  const toAdd = validFormMediums.filter((m) => !m.id)

  // Log the comparison
  console.log('Medium comparison:', {
    toDelete: toDelete.map((m) => m.instruction_medium),
    toUpdate: toUpdate.map((m) => m.name),
    toAdd: toAdd.map((m) => m.name),
  })

  // Handle deletions
  for (const medium of toDelete) {
    try {
      console.log('Deleting medium:', medium.instruction_medium)
      await deleteMedium(medium)
      operationResults.value.push({
        operation: `Deleted medium: ${medium.instruction_medium}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error deleting medium:', medium, error)
      operationResults.value.push({
        operation: `Delete medium: ${medium.instruction_medium}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Handle updates
  for (const medium of toUpdate) {
    try {
      if (!medium.id) continue
      const existingMedium = existingMediumsMap.get(medium.id)
      console.log('Updating medium:', {
        from: existingMedium?.instruction_medium,
        to: medium.name,
      })
      await updateMedium(medium.id, medium, boardId)
      operationResults.value.push({
        operation: `Updated medium: ${existingMedium?.instruction_medium} → ${medium.name}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error updating medium:', medium, error)
      operationResults.value.push({
        operation: `Update medium: ${medium.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Handle additions
  for (const medium of toAdd) {
    try {
      console.log('Adding new medium:', medium.name)
      await createMedium(medium, boardId)
      operationResults.value.push({
        operation: `Added medium: ${medium.name}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error adding medium:', medium, error)
      operationResults.value.push({
        operation: `Add medium: ${medium.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

const handleStandardApiError = (operation: string, standardName: string): never => {
  throw new Error(`Failed to ${operation} standard: ${standardName}`)
}

const deleteStandard = async (standard: ExistingItem): Promise<void> => {
  console.log('Attempting to delete standard:', standard)
  await deleteRelatedSchoolItems('/school-standards', standard.id, 'standard_id')
  const response = await fetch(getApiUrl(`/standards/${standard.id}`), {
    method: 'DELETE',
  })
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new Error(errorMessage)
  }
}

const updateStandard = async (
  id: number,
  standard: StandardFormData,
  boardId: number,
): Promise<void> => {
  const response = await fetch(getApiUrl(`/standards/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: standard.name, board_id: boardId }),
  })
  if (!response.ok) handleStandardApiError('update', standard.name)
}

const createStandard = async (standard: StandardFormData, boardId: number): Promise<void> => {
  const response = await fetch(getApiUrl('/standards'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: standard.name, board_id: boardId }),
  })
  if (!response.ok) handleStandardApiError('create', standard.name)
}

const handleStandardChanges = async (
  formStandards: StandardFormData[],
  existingStandards: ExistingItem[],
  boardId: number,
): Promise<void> => {
  const validFormStandards = formStandards.filter((s) => s.name.trim())
  const formStandardsMap = new Map(validFormStandards.map((s) => [s.id, s]))
  const existingStandardsMap = new Map(existingStandards.map((s) => [s.id, s]))

  // Handle deletions
  for (const standard of existingStandards.filter((s) => !formStandardsMap.has(s.id))) {
    try {
      await deleteStandard(standard)
      operationResults.value.push({
        operation: `Deleted standard: ${standard.name}`,
        status: 'success',
      })
    } catch (error) {
      operationResults.value.push({
        operation: `Delete standard: ${standard.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Handle updates
  for (const [id, standard] of formStandardsMap) {
    if (!id) continue
    const existing = existingStandardsMap.get(id)
    if (existing?.name !== standard.name) {
      try {
        await updateStandard(id, standard, boardId)
        operationResults.value.push({
          operation: `Updated standard: ${existing?.name} → ${standard.name}`,
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: `Update standard: ${standard.name}`,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  // Handle additions
  for (const standard of validFormStandards.filter((s) => !s.id)) {
    try {
      await createStandard(standard, boardId)
      operationResults.value.push({
        operation: `Added standard: ${standard.name}`,
        status: 'success',
      })
    } catch (error) {
      operationResults.value.push({
        operation: `Add standard: ${standard.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

const handleSubjectApiError = (operation: string, subjectName: string): never => {
  throw new Error(`Failed to ${operation} subject: ${subjectName}`)
}

const deleteSubject = async (subject: ExistingItem): Promise<void> => {
  console.log('Attempting to delete subject:', subject)
  const response = await fetch(getApiUrl(`/subjects/${subject.id}`), {
    method: 'DELETE',
  })
  if (!response.ok) {
    const errorMessage = await getErrorMessage(response)
    throw new Error(errorMessage)
  }
}

const updateSubject = async (
  id: number,
  subject: SubjectFormData,
  boardId: number,
): Promise<void> => {
  const response = await fetch(getApiUrl(`/subjects/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: subject.name, board_id: boardId }),
  })
  if (!response.ok) handleSubjectApiError('update', subject.name)
}

const createSubject = async (subject: SubjectFormData, boardId: number): Promise<void> => {
  const response = await fetch(getApiUrl('/subjects'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: subject.name, board_id: boardId }),
  })
  if (!response.ok) handleSubjectApiError('create', subject.name)
}

const handleSubjectChanges = async (
  formSubjects: SubjectFormData[],
  existingSubjects: ExistingItem[],
  boardId: number,
): Promise<void> => {
  const validFormSubjects = formSubjects.filter((s) => s.name.trim())
  const formSubjectsMap = new Map(validFormSubjects.map((s) => [s.id, s]))
  const existingSubjectsMap = new Map(existingSubjects.map((s) => [s.id, s]))

  // Handle deletions
  for (const subject of existingSubjects.filter((s) => !formSubjectsMap.has(s.id))) {
    try {
      await deleteSubject(subject)
      operationResults.value.push({
        operation: `Deleted subject: ${subject.name}`,
        status: 'success',
      })
    } catch (error) {
      operationResults.value.push({
        operation: `Delete subject: ${subject.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Handle updates
  for (const [id, subject] of formSubjectsMap) {
    if (!id) continue
    const existing = existingSubjectsMap.get(id)
    if (existing?.name !== subject.name) {
      try {
        await updateSubject(id, subject, boardId)
        operationResults.value.push({
          operation: `Updated subject: ${existing?.name} → ${subject.name}`,
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: `Update subject: ${subject.name}`,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  // Handle additions
  for (const subject of validFormSubjects.filter((s) => !s.id)) {
    try {
      await createSubject(subject, boardId)
      operationResults.value.push({
        operation: `Added subject: ${subject.name}`,
        status: 'success',
      })
    } catch (error) {
      operationResults.value.push({
        operation: `Add subject: ${subject.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

const handleSubmit = async (formData: BoardFormSubmitData): Promise<void> => {
  try {
    operationResults.value = [] // Reset results

    // Check if board details have changed
    const boardResponse = await fetch(getApiUrl(`/boards/${route.params.id}`))
    const currentBoard = await boardResponse.json()
    const boardChanged =
      currentBoard.name !== formData.board.name ||
      currentBoard.abbreviation !== formData.board.abbreviation

    // Update board only if changed
    let boardId = parseInt(route.params.id as string)
    if (boardChanged) {
      try {
        const board = await updateBoard(formData)
        boardId = board.id
        operationResults.value.push({
          operation: 'Updated board details',
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: 'Update board details',
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update board',
        })
      }
    }

    // Fetch all existing items
    const [existingMediums, existingStandards, existingSubjects] = await fetchExistingItems(boardId)

    // Compare and only process changed items
    const mediumsChanged = (() => {
      const formMediumNames = formData.mediums.map((m) => m.name.toLowerCase().trim()).sort()
      const existingMediumNames = existingMediums
        .map((m) => m.instruction_medium?.toLowerCase().trim())
        .sort()
      return JSON.stringify(formMediumNames) !== JSON.stringify(existingMediumNames)
    })()

    const standardsChanged = (() => {
      const formStandardNames = formData.standards.map((s) => s.name.toLowerCase().trim()).sort()
      const existingStandardNames = existingStandards
        .map((s) => s.name?.toLowerCase().trim())
        .sort()
      return JSON.stringify(formStandardNames) !== JSON.stringify(existingStandardNames)
    })()

    const subjectsChanged = (() => {
      const formSubjectNames = formData.subjects.map((s) => s.name.toLowerCase().trim()).sort()
      const existingSubjectNames = existingSubjects.map((s) => s.name?.toLowerCase().trim()).sort()
      return JSON.stringify(formSubjectNames) !== JSON.stringify(existingSubjectNames)
    })()

    console.log('Changes detected:', {
      boardChanged,
      mediumsChanged,
      standardsChanged,
      subjectsChanged,
    })

    // Only process items that have changed
    const changePromises = []
    if (mediumsChanged) {
      // Map existing mediums to form mediums by name to preserve IDs
      const updatedMediums = formData.mediums.map((formMedium) => {
        const existingMedium = existingMediums.find(
          (em) =>
            em.instruction_medium?.toLowerCase().trim() === formMedium.name.toLowerCase().trim(),
        )
        return existingMedium ? { ...formMedium, id: existingMedium.id } : formMedium
      })
      changePromises.push(handleMediumChanges(updatedMediums, existingMediums, boardId))
    }
    if (standardsChanged)
      changePromises.push(handleStandardChanges(formData.standards, existingStandards, boardId))
    if (subjectsChanged)
      changePromises.push(handleSubjectChanges(formData.subjects, existingSubjects, boardId))

    if (changePromises.length > 0) {
      await Promise.all(changePromises)
    }

    // Show results modal
    const modalElement = document.getElementById('operationResultModal')
    if (modalElement) {
      const resultModal = new bootstrap.Modal(modalElement)
      resultModal.show()
    }
  } catch (error) {
    console.error('Error in handleSubmit:', error)
  }
}

// Add cleanup function
const cleanupAndNavigate = () => {
  // Get the modal element
  const modalElement = document.getElementById('operationResultModal')
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement)
    modal?.hide()

    // Remove backdrop manually
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

    // Remove modal-open class and inline styles from body
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
  }

  // Navigate to board list
  router.push('/admin/board')
}
</script>

<style scoped>
/* Add to existing styles */
.list-group-item {
  border-left: 4px solid transparent;
}

.list-group-item.text-success {
  border-left-color: #198754;
}

.list-group-item.text-danger {
  border-left-color: #dc3545;
}

.badge {
  min-width: 70px;
}
</style>
