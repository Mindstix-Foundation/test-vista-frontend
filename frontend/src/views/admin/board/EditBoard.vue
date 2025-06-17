<template>
  <div class="container mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <BoardFormComponent
          :isEditMode="true"
          :boardId="route.params.id as string"
          @submit="handleSubmit"
          @boardDataLoaded="handleBoardDataLoaded"
        />
      </div>
    </div>
  </div>

  <LoadingSpinner :show="isSubmitting" :showOverlay="true" />
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import BoardFormComponent from '@/components/forms/BoardFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'
import type {
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
  CreateBoardDto,
  CreateAddressDto,
} from '@/models/Board'

// Enhanced interfaces for the board-management endpoint
interface UpdateInstructionMediumWithIdDto extends CreateInstructionMediumDto {
  id?: number
}

interface UpdateStandardWithIdDto extends CreateStandardDto {
  id?: number
  sequence_number?: number
}

interface UpdateSubjectWithIdDto extends CreateSubjectDto {
  id?: number
}

interface UpdateBoardManagementDto {
  board?: CreateBoardDto
  address?: CreateAddressDto
  instructionMediums?: UpdateInstructionMediumWithIdDto[]
  standards?: UpdateStandardWithIdDto[]
  subjects?: UpdateSubjectWithIdDto[]
  deleteInstructionMediumIds?: number[]
  deleteStandardIds?: number[]
  deleteSubjectIds?: number[]
}

interface BoardFormSubmitData {
  address: CreateAddressDto
  board: CreateBoardDto
  mediums: Array<CreateInstructionMediumDto & { id?: number }>
  standards: Array<CreateStandardDto & { id?: number }>
  subjects: Array<CreateSubjectDto & { id?: number }>
}

interface BoardApiResponse {
  id: number
  name: string
  abbreviation: string
  address_id: number
  created_at: string
  updated_at: string
  address: {
    id: number
    postal_code: string
    street: string
    city_id: number
    city: {
      id: number
      name: string
      state_id: number
      state: {
        id: number
        name: string
        country_id: number
        country: {
          id: number
          name: string
        }
      }
    }
  }
  instruction_mediums: Array<{
    id: number
    instruction_medium: string
    created_at: string
    updated_at: string
  }>
  standards: Array<{
    id: number
    name: string
    sequence_number: number
    created_at: string
    updated_at: string
  }>
  subjects: Array<{
  id: number
    name: string
    created_at: string
    updated_at: string
  }>
}

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const isSubmitting = ref(false)

// ✅ Store the current board data received from BoardFormComponent
const currentBoardData = ref<BoardApiResponse | null>(null)

const buildUpdatePayload = (
  formData: BoardFormSubmitData,
  currentBoard: BoardApiResponse
): UpdateBoardManagementDto => {
  const payload: UpdateBoardManagementDto = {}

  // Check if board details changed
  if (
    currentBoard.name !== formData.board.name ||
    currentBoard.abbreviation !== formData.board.abbreviation
  ) {
    payload.board = formData.board
  }

  // Check if address changed
  const currentAddress = currentBoard.address
  if (
    currentAddress.postal_code !== formData.address.postal_code ||
    currentAddress.street !== formData.address.street ||
    currentAddress.city_id !== formData.address.city_id
  ) {
    payload.address = formData.address
  }

  // Process instruction mediums
  const { toUpdate: mediumsToUpdate, toDelete: mediumsToDelete } = processEntityChanges(
    formData.mediums,
    currentBoard.instruction_mediums,
    'instruction_medium'
  )
  if (mediumsToUpdate.length > 0) {
    payload.instructionMediums = mediumsToUpdate.map(medium => ({
      id: medium.id,
      name: medium.name
    }))
  }
  if (mediumsToDelete.length > 0) {
    payload.deleteInstructionMediumIds = mediumsToDelete
  }

  // Process standards
  const { toUpdate: standardsToUpdate, toDelete: standardsToDelete } = processEntityChanges(
    formData.standards,
    currentBoard.standards,
    'name'
  )
  if (standardsToUpdate.length > 0) {
    payload.standards = standardsToUpdate.map((standard, index) => ({
        id: standard.id,
        name: standard.name,
      sequence_number: index + 1 // Ensure proper sequence based on order
    }))
  }
  if (standardsToDelete.length > 0) {
    payload.deleteStandardIds = standardsToDelete
  }

  // Process subjects
  const { toUpdate: subjectsToUpdate, toDelete: subjectsToDelete } = processEntityChanges(
    formData.subjects,
    currentBoard.subjects,
    'name'
  )
  if (subjectsToUpdate.length > 0) {
    payload.subjects = subjectsToUpdate.map(subject => ({
      id: subject.id,
      name: subject.name
    }))
  }
  if (subjectsToDelete.length > 0) {
    payload.deleteSubjectIds = subjectsToDelete
  }

  return payload
}

const processEntityChanges = <T extends { id?: number; name: string }, U extends { id: number; [key: string]: any }>(
  formEntities: T[],
  currentEntities: U[],
  nameField: string
) => {
  const validFormEntities = formEntities.filter(entity => entity.name.trim())
  const toUpdate: T[] = []
  const currentEntityIds = new Set(currentEntities.map(entity => entity.id))
  const formEntityIds = new Set(validFormEntities.filter(entity => entity.id).map(entity => entity.id))

  // Find entities to update (existing entities with changes or new entities)
  validFormEntities.forEach((formEntity, index) => {
    if (formEntity.id) {
      // Existing entity - check if it changed
      const currentEntity = currentEntities.find(entity => entity.id === formEntity.id)
      if (currentEntity) {
        const currentName = currentEntity[nameField]?.toLowerCase().trim()
        const formName = formEntity.name.toLowerCase().trim()
        
        // For standards, also check sequence number based on current position in form
        let sequenceChanged = false
        if ('sequence_number' in currentEntity) {
          const expectedSequence = index + 1
          sequenceChanged = currentEntity.sequence_number !== expectedSequence
        }
        
        if (currentName !== formName || sequenceChanged) {
          toUpdate.push(formEntity)
        }
      }
    } else {
      // New entity
      toUpdate.push(formEntity)
    }
  })

  // Find entities to delete (current entities not in form)
  const toDelete = currentEntities
    .filter(entity => !formEntityIds.has(entity.id))
    .map(entity => entity.id)

  return { toUpdate, toDelete }
}

const handleSubmit = async (formData: BoardFormSubmitData): Promise<void> => {
  try {
    isSubmitting.value = true

    // ✅ Use cached board data instead of making redundant API call
    if (!currentBoardData.value) {
      throw new Error('Board data not available. Please refresh the page.')
    }

    const currentBoard = currentBoardData.value
    
    // Build the update payload
    const updatePayload = buildUpdatePayload(formData, currentBoard)

    // Check if there are any changes
    const hasChanges = Object.keys(updatePayload).length > 0
    
    if (!hasChanges) {
      toastStore.showToast({
        title: 'No Changes',
        message: 'No changes detected. Redirecting to board list.',
        type: 'info'
      })
      router.push('/admin/board')
      return
    }

    // Make the single API call to update everything
    await axiosInstance.put(`/board-management/${route.params.id}`, updatePayload)

    // Show success message
    toastStore.showToast({
      title: 'Success',
      message: 'Board updated successfully!',
      type: 'success'
    })

    // Navigate back to board list
    router.push('/admin/board')

  } catch (error: any) {
    console.error('Error updating board:', error)
    
    // Show error message
    const errorMessage = error.response?.data?.message || 'Failed to update board. Please try again.'
    toastStore.showToast({
      title: 'Error',
      message: errorMessage,
      type: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

// ✅ New function to receive current board data from BoardFormComponent
const handleBoardDataLoaded = (boardData: any) => {
  // Transform the board-management response to match the expected format
  currentBoardData.value = {
    id: boardData.board.id,
    name: boardData.board.name,
    abbreviation: boardData.board.abbreviation,
    address_id: boardData.board.address_id,
    created_at: boardData.board.created_at,
    updated_at: boardData.board.updated_at,
    address: boardData.address,
    instruction_mediums: boardData.instruction_mediums,
    standards: boardData.standards,
    subjects: boardData.subjects,
  }
}
</script>

<style scoped>
/* Simplified styles */
</style>
