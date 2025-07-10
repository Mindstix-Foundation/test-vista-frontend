<!--
🛡️ CRITICAL SAFETY NOTICE:
This component handles board updates that can trigger cascade deletions of questions.
Multiple safety measures are in place to prevent accidental data loss:

1. Frontend validation prevents subject deletion in most cases
2. Backend validation blocks deletion of subjects with questions
3. Comprehensive logging helps debug issues

⚠️ RISK: Modifying the processEntityChanges function or buildUpdatePayload 
function could lead to accidental question deletion. Always test thoroughly.
-->
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
interface UpdateInstructionMediumWithIdDto {
  id?: number
  name: string
}

interface UpdateStandardWithIdDto {
  id?: number
  name: string
  sequence_number?: number
}

interface UpdateSubjectWithIdDto {
  id?: number
  name: string
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

  // 🛡️ CONSISTENT LOGIC: Process instruction mediums and use the results
  const { toUpdate: mediumsToUpdate, toDelete: mediumsToDelete } = processEntityChanges(
    formData.mediums,
    currentBoard.instruction_mediums,
    'instruction_medium'
  )
  
  // Only send mediums that have changes (new or updated)
  if (mediumsToUpdate.length > 0) {
    payload.instructionMediums = mediumsToUpdate.map(medium => ({
      id: medium.id,
      name: medium.name
    }))
  }
  
  // Only send delete IDs if there are mediums to delete
  if (mediumsToDelete.length > 0) {
    console.warn('⚠️ WARNING: About to delete instruction mediums!', {
      mediumsToDelete,
      mediumNames: currentBoard.instruction_mediums
        .filter(m => mediumsToDelete.includes(m.id))
        .map(m => m.instruction_medium)
    })
    payload.deleteInstructionMediumIds = mediumsToDelete
  }

  // 🛡️ CONSISTENT LOGIC: Process standards and use the results
  const { toUpdate: standardsToUpdate, toDelete: standardsToDelete } = processEntityChanges(
    formData.standards,
    currentBoard.standards,
    'name'
  )
  
  // Only send standards that have changes (new or updated)
  if (standardsToUpdate.length > 0) {
    payload.standards = standardsToUpdate.map((standard) => {
      const basePayload = {
        id: standard.id,
        name: standard.name
      }
      
      // 🛡️ SIMPLIFIED: Only send sequence_number for existing standards that need reordering
      if (standard.id && typeof standard.id === 'number' && standard.id > 0) {
        // Existing standard - find its position in the form to determine if sequence changed
        const formIndex = formData.standards.findIndex(s => s.id === standard.id)
        if (formIndex >= 0) {
          const desiredSequence = formIndex + 1
          // Only include sequence_number if it's different from current
          const currentStandard = currentBoard.standards.find(s => s.id === standard.id)
          if (currentStandard && currentStandard.sequence_number !== desiredSequence) {
            return {
              ...basePayload,
              sequence_number: desiredSequence
            }
          }
        }
      }
      
      // For new standards or unchanged sequence, don't send sequence_number
      // Backend will auto-assign next available sequence for new standards
      return basePayload
    })
  }
  
  // Only send delete IDs if there are standards to delete
  if (standardsToDelete.length > 0) {
    payload.deleteStandardIds = standardsToDelete
  }

  // 🛡️ CONSISTENT LOGIC: Process subjects and use the results
  const { toUpdate: subjectsToUpdate, toDelete: subjectsToDelete } = processEntityChanges(
    formData.subjects,
    currentBoard.subjects,
    'name'
  )
  
  // Only send subjects that have changes (new or updated)
  if (subjectsToUpdate.length > 0) {
    payload.subjects = subjectsToUpdate.map(subject => ({
      id: subject.id,
      name: subject.name
    }))
  }
  
  // 🛡️ CRITICAL SAFETY CHECK: Prevent accidental subject deletion
  if (subjectsToDelete.length > 0) {
    const subjectsToDeleteNames = currentBoard.subjects
      .filter(s => subjectsToDelete.includes(s.id))
      .map(s => s.name)
    
    console.error('🚨 BLOCKED: Attempted to delete subjects!', {
      subjectsToDelete,
      subjectNames: subjectsToDeleteNames,
      formSubjects: formData.subjects,
      currentSubjects: currentBoard.subjects
    })
    
    throw new Error(
      `Safety check failed: The system tried to delete subjects (${subjectsToDeleteNames.join(', ')}). ` +
      `This would permanently delete all questions for these subjects. ` +
      `Please refresh the page and try again. If the issue persists, contact support.`
    )
  }

  return payload
}

const processEntityChanges = <T extends { id?: number; name: string }, U extends { id: number; [key: string]: any }>(
  formEntities: T[],
  currentEntities: U[],
  nameField: string
) => {
  console.log('🔍 processEntityChanges DEBUG:', {
    formEntities,
    currentEntities,
    nameField
  })
  
  const validFormEntities = formEntities.filter(entity => entity.name.trim())
  const toUpdate: T[] = []
  const currentEntityIds = new Set(currentEntities.map(entity => entity.id))
  
  // 🛡️ SAFETY FIX: Only include entities that actually have valid IDs
  const formEntityIds = new Set(
    validFormEntities
      .filter(entity => entity.id && typeof entity.id === 'number' && entity.id > 0)
      .map(entity => entity.id)
  )
  
  console.log('🔍 ID Sets:', {
    currentEntityIds: Array.from(currentEntityIds),
    formEntityIds: Array.from(formEntityIds)
  })

  // Find entities to update (existing entities with changes or new entities)
  validFormEntities.forEach((formEntity, index) => {
    if (formEntity.id && typeof formEntity.id === 'number' && formEntity.id > 0) {
      // Existing entity - check if it changed
      const currentEntity = currentEntities.find(entity => entity.id === formEntity.id)
      if (currentEntity) {
        // 🛡️ FIX: Handle property name mismatch between form and current entities
        const currentName = currentEntity[nameField]?.toLowerCase().trim()
        const formName = formEntity.name.toLowerCase().trim()
        
        console.log(`🔍 Comparing entity ${formEntity.id}:`, {
          currentName,
          formName,
          nameField,
          currentEntity: currentEntity,
          formEntity: formEntity
        })
        
        // For standards, also check sequence number based on current position in form
        let sequenceChanged = false
        if ('sequence_number' in currentEntity) {
          const expectedSequence = index + 1
          sequenceChanged = currentEntity.sequence_number !== expectedSequence
        }
        
        // Only mark for update if the name actually changed or sequence changed
        if (currentName !== formName || sequenceChanged) {
          console.log(`🔍 Entity ${formEntity.id} marked for update:`, {
            nameChanged: currentName !== formName,
            sequenceChanged,
            currentName,
            formName
          })
          toUpdate.push(formEntity)
        } else {
          console.log(`🔍 Entity ${formEntity.id} unchanged, skipping update`)
        }
      }
    } else {
      // New entity (no ID or invalid ID)
      console.log('🔍 New entity detected:', formEntity)
      toUpdate.push(formEntity)
    }
  })

  // 🛡️ SAFETY FIX: Only mark entities for deletion if we have valid form data
  // and there are actually entities missing from the form
  let toDelete: number[] = []
  
  if (formEntityIds.size > 0) {
    // Only proceed with deletion logic if we have valid form entity IDs
    toDelete = currentEntities
      .filter(entity => !formEntityIds.has(entity.id))
      .map(entity => entity.id)
  } else if (validFormEntities.length === 0) {
    // Only delete all if the form is explicitly empty (user removed all entities)
    toDelete = currentEntities.map(entity => entity.id)
  }
  // If formEntityIds.size === 0 but validFormEntities.length > 0, 
  // it means we only have new entities, so don't delete anything
  
  console.log('🔍 Final result:', {
    entityType: nameField,
    toUpdate: toUpdate.length,
    toDelete: toDelete.length,
    deleteIds: toDelete,
    updateItems: toUpdate.map(item => ({ id: item.id, name: item.name }))
  })
  
  // 🚨 SAFETY CHECK: Warn if we're about to delete subjects
  if (nameField === 'name' && toDelete.length > 0) {
    console.warn('⚠️ WARNING: About to delete subjects! This will cascade delete questions!', {
      subjectsToDelete: toDelete,
      currentEntities: currentEntities.filter(e => toDelete.includes(e.id))
    })
  }
  
  // 🚨 SAFETY CHECK: Warn if we're about to delete mediums unnecessarily
  if (nameField === 'instruction_medium' && toDelete.length > 0) {
    console.warn('⚠️ WARNING: About to delete instruction mediums!', {
      mediumsToDelete: toDelete,
      currentEntities: currentEntities.filter(e => toDelete.includes(e.id))
    })
  }

  return { toUpdate, toDelete }
}

// 🧪 DEBUG HELPER: Add this comprehensive debug function to verify the fix
const debugFormData = (formData: BoardFormSubmitData, currentBoard: BoardApiResponse) => {
  console.log('🧪 COMPREHENSIVE DEBUG - FORM DATA ANALYSIS:')
  
  // Debug mediums
  console.log('📝 Form mediums:', formData.mediums.map(m => ({ 
    id: m.id, 
    name: m.name, 
    hasValidId: !!(m.id && typeof m.id === 'number' && m.id > 0),
    isEmpty: !m.name.trim()
  })))
  console.log('💾 Current mediums:', currentBoard.instruction_mediums.map(m => ({ 
    id: m.id, 
    instruction_medium: m.instruction_medium 
  })))
  
  // Test processEntityChanges for mediums
  const mediumResults = processEntityChanges(
    formData.mediums,
    currentBoard.instruction_mediums,
    'instruction_medium'
  )
  console.log('🔍 Medium changes detected:', {
    toUpdate: mediumResults.toUpdate,
    toDelete: mediumResults.toDelete,
    updateCount: mediumResults.toUpdate.length,
    deleteCount: mediumResults.toDelete.length
  })
  
  // Debug subjects
  console.log('📝 Form subjects:', formData.subjects.map(s => ({ 
    id: s.id, 
    name: s.name, 
    hasValidId: !!(s.id && typeof s.id === 'number' && s.id > 0),
    isEmpty: !s.name.trim()
  })))
  console.log('💾 Current subjects:', currentBoard.subjects.map(s => ({ 
    id: s.id, 
    name: s.name 
  })))
  
  // Test processEntityChanges for subjects
  const subjectResults = processEntityChanges(
    formData.subjects,
    currentBoard.subjects,
    'name'
  )
  console.log('🔍 Subject changes detected:', {
    toUpdate: subjectResults.toUpdate,
    toDelete: subjectResults.toDelete,
    updateCount: subjectResults.toUpdate.length,
    deleteCount: subjectResults.toDelete.length
  })
  
  // Debug standards
  console.log('📝 Form standards:', formData.standards.map(s => ({ 
    id: s.id, 
    name: s.name, 
    hasValidId: !!(s.id && typeof s.id === 'number' && s.id > 0),
    isEmpty: !s.name.trim()
  })))
  console.log('💾 Current standards:', currentBoard.standards.map(s => ({ 
    id: s.id, 
    name: s.name 
  })))
  
  // Test processEntityChanges for standards
  const standardResults = processEntityChanges(
    formData.standards,
    currentBoard.standards,
    'name'
  )
  console.log('🔍 Standard changes detected:', {
    toUpdate: standardResults.toUpdate,
    toDelete: standardResults.toDelete,
    updateCount: standardResults.toUpdate.length,
    deleteCount: standardResults.toDelete.length
  })
}

const handleSubmit = async (formData: BoardFormSubmitData): Promise<void> => {
  try {
    isSubmitting.value = true

    // ✅ Use cached board data instead of making redundant API call
    if (!currentBoardData.value) {
      throw new Error('Board data not available. Please refresh the page.')
    }

    const currentBoard = currentBoardData.value
    
    // 🧪 DEBUG: Log form data structure
    debugFormData(formData, currentBoard)
    
    // Build the update payload
    const updatePayload = buildUpdatePayload(formData, currentBoard)

    console.log('🚀 Final update payload:', updatePayload)

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
