<template>
  <div class="container-fluid board-form-container">
    <BoardFormComponent :isEditMode="false" @submit="handleBoardSubmit" />
    <LoadingSpinner :show="isSubmitting" :showOverlay="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BoardFormComponent from '@/components/forms/BoardFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { useToastStore } from '@/store/toast'
import axiosInstance from '@/config/axios'
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

const logDimensions = () => {
  const container = document.querySelector('.board-form-container')
  console.log('AddBoard - Window dimensions:', {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollHeight: document.documentElement.scrollHeight,
    clientHeight: document.documentElement.clientHeight,
    bodyHeight: document.body.scrollHeight,
    containerHeight: container?.scrollHeight,
    hasVerticalScroll: document.documentElement.scrollHeight > window.innerHeight,
    overflowY: window.getComputedStyle(container as Element).overflowY,
  })
}

onMounted(() => {
  logDimensions()
  window.addEventListener('resize', logDimensions)
})

onUnmounted(() => {
  window.removeEventListener('resize', logDimensions)
})

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
  try {
    const { data: responseData } = await axiosInstance.post(endpoint, data)
    return responseData
  } catch (error) {
    const errorData =
      error instanceof Error
        ? null
        : ((error as { response?: { data: ApiErrorResponse } })?.response?.data ?? null)
    throw new Error(handleApiError(errorData, errorMessage))
  }
}

const createRelatedEntities = async <T extends { board_id?: number; sequence_number?: number }>(
  entities: T[],
  endpoint: string,
  boardId: number,
  entityName: string,
): Promise<void> => {
  // For standards, ensure sequence numbers are set based on their order in the list
  if (endpoint === '/standards') {
    // Assign sequence numbers based on the order in the array
    entities.forEach((entity, index) => {
      entity.board_id = boardId;
      entity.sequence_number = index + 1; // 1-based sequence numbers
    });

    // Create standards in sequence to maintain order
    for (const entity of entities) {
      await createEntity(endpoint, entity, `Failed to create ${entityName}`);
    }
  } else {
    // For other entities, use the original implementation
    for (const entity of entities) {
      entity.board_id = boardId;
      await createEntity(endpoint, entity, `Failed to create ${entityName}`);
    }
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

    // Create related entities
    // Process standards separately to ensure sequence
    await createRelatedEntities<CreateStandardDto>(
      formData.standards,
      '/standards',
      boardData.id,
      'standard',
    );

    // Process other entities in parallel
    await Promise.all([
      createRelatedEntities<CreateInstructionMediumDto>(
        formData.mediums,
        '/instruction-mediums',
        boardData.id,
        'instruction medium',
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

<style scoped>
.board-form-container {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding-bottom: 2rem;
  -webkit-overflow-scrolling: touch;
}

/* Add styles for mobile devices */
@media screen and (max-width: 768px) {
  .board-form-container {
    height: 100%;
    overflow-y: scroll !important;
    position: relative;
    padding-bottom: 4rem; /* Increased padding for mobile */
  }
}
</style>
