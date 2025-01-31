<template>
  <div class="container-fluid">
    <BoardFormComponent :isEditMode="false" @submit="handleBoardSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BoardFormComponent from '@/components/forms/BoardFormComponent.vue'
import { getApiUrl } from '@/config/api'
import type {
  CreateBoardDto,
  CreateAddressDto,
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
} from '@/models/Board'

const router = useRouter()
const isSubmitting = ref(false)

const handleBoardSubmit = async (formData: {
  address: CreateAddressDto
  board: CreateBoardDto
  mediums: CreateInstructionMediumDto[]
  standards: CreateStandardDto[]
  subjects: CreateSubjectDto[]
}) => {
  try {
    isSubmitting.value = true

    // Create address first
    const addressResponse = await fetch(getApiUrl('/addresses'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.address),
    })

    if (!addressResponse.ok) {
      const errorData = await addressResponse.json().catch(() => null)
      throw new Error(
        Array.isArray(errorData?.message)
          ? errorData.message.join(', ')
          : errorData?.message || 'Failed to create address',
      )
    }
    const addressData = await addressResponse.json()

    // Create board with address
    formData.board.address_id = addressData.id
    const boardResponse = await fetch(getApiUrl('/boards'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.board),
    })

    if (!boardResponse.ok) {
      const errorData = await boardResponse.json().catch(() => null)
      throw new Error(
        Array.isArray(errorData?.message)
          ? errorData.message.join(', ')
          : errorData?.message || 'Failed to create board',
      )
    }
    const boardData = await boardResponse.json()

    // Create mediums in sequence
    for (const medium of formData.mediums) {
      medium.board_id = boardData.id
      const mediumResponse = await fetch(getApiUrl('/instruction-mediums'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medium),
      })
      if (!mediumResponse.ok) {
        const errorData = await mediumResponse.json().catch(() => null)
        throw new Error(
          Array.isArray(errorData?.message)
            ? errorData.message.join(', ')
            : errorData?.message || 'Failed to create instruction medium',
        )
      }
    }

    // Create standards in sequence
    for (const standard of formData.standards) {
      standard.board_id = boardData.id
      const standardResponse = await fetch(getApiUrl('/standards'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(standard),
      })
      if (!standardResponse.ok) {
        const errorData = await standardResponse.json().catch(() => null)
        throw new Error(
          Array.isArray(errorData?.message)
            ? errorData.message.join(', ')
            : errorData?.message || 'Failed to create standard',
        )
      }
    }

    // Create subjects in sequence
    for (const subject of formData.subjects) {
      subject.board_id = boardData.id
      const subjectResponse = await fetch(getApiUrl('/subjects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subject),
      })
      if (!subjectResponse.ok) {
        const errorData = await subjectResponse.json().catch(() => null)
        throw new Error(
          Array.isArray(errorData?.message)
            ? errorData.message.join(', ')
            : errorData?.message || 'Failed to create subject',
        )
      }
    }

    // Navigate back to board list on success
    router.push('/admin/board')
  } catch (error) {
    console.error('Error creating board:', error)
    alert(error instanceof Error ? error.message : 'Failed to create board. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
