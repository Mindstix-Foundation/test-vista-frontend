<template>
  <div class="container-fluid">
    <BoardFormComponent :isEditMode="false" @submit="handleBoardSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BoardFormComponent from '@/components/forms/BoardFormComponent.vue'
import { useToastStore } from '@/store/toast'
import { getApiUrl } from '@/config/api'
import type {
  CreateBoardDto,
  CreateAddressDto,
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
} from '@/models/Board'

const router = useRouter()
const toastStore = useToastStore()
const isSubmitting = ref(false)

interface ApiErrorResponse {
  message?: string | string[]
}

interface ApiResponse {
  id: number
  [key: string]: number | string | boolean | null
}

const handleApiError = (errorData: ApiErrorResponse | null, defaultMessage: string): string => {
  return Array.isArray(errorData?.message)
    ? errorData.message.join(', ')
    : errorData?.message || defaultMessage
}

const createEntity = async <T,>(
  endpoint: string,
  data: T,
  errorMessage: string,
): Promise<ApiResponse> => {
  const response = await fetch(getApiUrl(endpoint), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(handleApiError(errorData, errorMessage))
  }

  return response.json()
}

const createRelatedEntities = async <T extends { board_id?: number }>(
  entities: T[],
  endpoint: string,
  boardId: number,
  entityName: string,
): Promise<void> => {
  for (const entity of entities) {
    entity.board_id = boardId
    await createEntity(endpoint, entity, `Failed to create ${entityName}`)
  }
}

const handleBoardSubmit = async (formData: {
  address: CreateAddressDto
  board: CreateBoardDto
  mediums: CreateInstructionMediumDto[]
  standards: CreateStandardDto[]
  subjects: CreateSubjectDto[]
}) => {
  try {
    isSubmitting.value = true

    // Create address and get its ID
    const addressData = await createEntity<CreateAddressDto>(
      '/addresses',
      formData.address,
      'Failed to create address',
    )

    // Create board with address
    formData.board.address_id = addressData.id
    const boardData = await createEntity<CreateBoardDto>(
      '/boards',
      formData.board,
      'Failed to create board',
    )

    // Create related entities in sequence
    await Promise.all([
      createRelatedEntities<CreateInstructionMediumDto>(
        formData.mediums,
        '/instruction-mediums',
        boardData.id,
        'instruction medium',
      ),
      createRelatedEntities<CreateStandardDto>(
        formData.standards,
        '/standards',
        boardData.id,
        'standard',
      ),
      createRelatedEntities<CreateSubjectDto>(
        formData.subjects,
        '/subjects',
        boardData.id,
        'subject',
      ),
    ])

    // Navigate immediately
    await router.push('/admin/board')

    // Show success toast after navigation
    toastStore.showToast({
      title: 'Success',
      message: 'Board created successfully!',
      type: 'success',
    })
  } catch (error) {
    console.error('Error creating board:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create board. Please try again.'
    toastStore.showToast({
      title: 'Error',
      message: errorMessage,
      type: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>
