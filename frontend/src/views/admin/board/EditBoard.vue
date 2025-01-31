<template>
  <div class="container mt-4 mb-5">
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
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import BoardFormComponent from '@/components/forms/BoardFormComponent.vue'
import { getApiUrl } from '@/config/api'
import { onMounted } from 'vue'
import type {
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
  CreateBoardDto,
  CreateAddressDto,
} from '@/models/Board'

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

interface SchoolInstructionMedium {
  id: number
  school_id: number
  instruction_medium_id: number
}

interface SchoolStandard {
  id: number
  school_id: number
  standard_id: number
}

const router = useRouter()
const route = useRoute()

onMounted(() => {
  console.log('EditBoard mounted with board ID:', route.params.id)
})

const handleSubmit = async (formData: BoardFormSubmitData): Promise<void> => {
  try {
    console.log('=== Starting form submission ===')
    console.log('Form data received:', {
      mediums: formData.mediums.map((m) => ({ id: m.id, name: m.name })),
      standards: formData.standards.map((s) => ({ id: s.id, name: s.name })),
      subjects: formData.subjects.map((s) => ({ id: s.id, name: s.name })),
    })

    // Update board
    const updateBoardResponse = await fetch(getApiUrl(`/boards/${route.params.id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.board.name,
        abbreviation: formData.board.abbreviation,
      }),
    })
    if (!updateBoardResponse.ok) throw new Error('Failed to update board')
    const board = (await updateBoardResponse.json()) as BoardResponse
    console.log('Board updated successfully:', board)

    // Fetch existing items using board-specific endpoints
    console.log('Fetching existing items for board:', board.id)
    const [existingMediums, existingStandards, existingSubjects] = (await Promise.all([
      fetch(getApiUrl(`/instruction-mediums/board/${board.id}`)).then((r) => r.json()),
      fetch(getApiUrl(`/standards/board/${board.id}`)).then((r) => r.json()),
      fetch(getApiUrl(`/subjects/board/${board.id}`)).then((r) => r.json()),
    ])) as [ExistingItem[], ExistingItem[], ExistingItem[]]

    console.log('Existing data fetched:', {
      mediums: existingMediums.map((m) => ({ id: m.id, value: m.instruction_medium })),
      standards: existingStandards.map((s) => ({ id: s.id, name: s.name })),
      subjects: existingSubjects.map((s) => ({ id: s.id, name: s.name })),
    })

    // Process mediums changes
    console.log('\n=== Processing mediums changes ===')
    const formMediumsMap = new Map(
      formData.mediums.filter((m) => m.name.trim()).map((m) => [m.id, m]),
    )
    const existingMediumsMap = new Map(existingMediums.map((m) => [m.id, m]))

    // Find new mediums (ones without IDs)
    const newMediums = formData.mediums.filter((m) => !m.id && m.name.trim())

    // Create new mediums
    for (const medium of newMediums) {
      console.log(`Creating new medium: ${medium.name}`)
      const createResponse = await fetch(getApiUrl('/instruction-mediums'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: medium.name,
          board_id: board.id,
        }),
      })
      if (!createResponse.ok) {
        throw new Error(`Failed to create medium: ${medium.name}`)
      }
    }

    // Find modified mediums
    const modifiedMediums = Array.from(formMediumsMap.values()).filter((formMedium) => {
      const existingMedium = existingMediumsMap.get(formMedium.id!)
      return existingMedium && existingMedium.instruction_medium !== formMedium.name
    })

    // Update modified mediums
    for (const medium of modifiedMediums) {
      if (!medium.id) continue // Skip if no id (shouldn't happen but type safety)
      console.log(
        `Updating medium: ${existingMediumsMap.get(medium.id)?.instruction_medium} -> ${medium.name}`,
      )
      const updateResponse = await fetch(getApiUrl(`/instruction-mediums/${medium.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: medium.name,
          board_id: board.id,
        }),
      })
      if (!updateResponse.ok) {
        throw new Error(`Failed to update medium: ${medium.name}`)
      }
    }

    // Find deleted mediums
    const deletedMediums = Array.from(existingMediumsMap.values()).filter(
      (medium) => !formMediumsMap.has(medium.id),
    )

    // Delete removed mediums
    for (const medium of deletedMediums) {
      console.log(`Deleting medium: ${medium.instruction_medium}`)

      try {
        // First get all school-instruction-mediums
        const schoolMediumsResponse = await fetch(getApiUrl('/school-instruction-mediums'))
        if (schoolMediumsResponse.ok) {
          const allSchoolMediums = await schoolMediumsResponse.json()
          // Filter to get only the ones related to this medium
          const relatedSchoolMediums = allSchoolMediums.filter(
            (sm: SchoolInstructionMedium) => sm.instruction_medium_id === medium.id,
          )

          console.log(
            `Deleting ${relatedSchoolMediums.length} school-instruction-mediums for medium ${medium.id}`,
          )

          // Delete each related school-instruction-medium
          for (const sm of relatedSchoolMediums) {
            const deleteSchoolMediumResponse = await fetch(
              getApiUrl(`/school-instruction-mediums/${sm.id}`),
              { method: 'DELETE' },
            )
            if (!deleteSchoolMediumResponse.ok) {
              console.error(`Failed to delete school-instruction-medium ${sm.id}`)
            }
          }
        }

        // Then delete the medium itself
        const deleteResponse = await fetch(getApiUrl(`/instruction-mediums/${medium.id}`), {
          method: 'DELETE',
        })
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.text()
          console.error(`Error deleting medium ${medium.id}:`, errorData)
          throw new Error(`Failed to delete medium: ${medium.instruction_medium}. ${errorData}`)
        }
      } catch (error) {
        console.error(`Error processing deletion for medium ${medium.id}:`, error)
        throw error
      }
    }

    // Process standards changes
    console.log('\n=== Processing standards changes ===')
    const formStandardsMap = new Map(
      formData.standards.filter((s) => s.name.trim()).map((s) => [s.id, s]),
    )
    const existingStandardsMap = new Map(existingStandards.map((s) => [s.id, s]))

    // Delete removed standards
    for (const [id, existingStandard] of existingStandardsMap) {
      if (!formStandardsMap.has(id)) {
        console.log(`Deleting standard: ${existingStandard.name}`)

        try {
          // First get all school-standards
          const schoolStandardsResponse = await fetch(getApiUrl('/school-standards'))
          if (schoolStandardsResponse.ok) {
            const allSchoolStandards = await schoolStandardsResponse.json()
            // Filter to get only the ones related to this standard
            const relatedSchoolStandards = allSchoolStandards.filter(
              (ss: SchoolStandard) => ss.standard_id === id,
            )

            console.log(
              `Deleting ${relatedSchoolStandards.length} school-standards for standard ${id}`,
            )

            // Delete each related school-standard
            for (const ss of relatedSchoolStandards) {
              const deleteSchoolStandardResponse = await fetch(
                getApiUrl(`/school-standards/${ss.id}`),
                { method: 'DELETE' },
              )
              if (!deleteSchoolStandardResponse.ok) {
                console.error(`Failed to delete school-standard ${ss.id}`)
              }
            }
          }

          // Then delete the standard itself
          const deleteResponse = await fetch(getApiUrl(`/standards/${id}`), {
            method: 'DELETE',
          })
          if (!deleteResponse.ok) {
            const errorData = await deleteResponse.text()
            console.error(`Error deleting standard ${id}:`, errorData)
            throw new Error(`Failed to delete standard: ${existingStandard.name}. ${errorData}`)
          }
        } catch (error) {
          console.error(`Error processing deletion for standard ${id}:`, error)
          throw error
        }
      }
    }

    // Update modified standards
    for (const [id, formStandard] of formStandardsMap) {
      if (id) {
        const existingStandard = existingStandardsMap.get(id)
        if (existingStandard && existingStandard.name !== formStandard.name) {
          console.log(`Updating standard: ${existingStandard.name} -> ${formStandard.name}`)
          const updateResponse = await fetch(getApiUrl(`/standards/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formStandard.name,
              board_id: board.id,
            }),
          })
          if (!updateResponse.ok) {
            throw new Error(`Failed to update standard: ${formStandard.name}`)
          }
        }
      }
    }

    // Create new standards
    for (const standard of formData.standards) {
      if (!standard.id && standard.name.trim()) {
        console.log(`Creating new standard: ${standard.name}`)
        const createResponse = await fetch(getApiUrl('/standards'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: standard.name,
            board_id: board.id,
          }),
        })
        if (!createResponse.ok) {
          throw new Error(`Failed to create standard: ${standard.name}`)
        }
      }
    }

    // Process subjects changes
    console.log('\n=== Processing subjects changes ===')
    const formSubjectsMap = new Map(
      formData.subjects.filter((s) => s.name.trim()).map((s) => [s.id, s]),
    )
    const existingSubjectsMap = new Map(existingSubjects.map((s) => [s.id, s]))

    // Delete removed subjects (no need to handle school-subjects as it doesn't exist)
    for (const [id, existingSubject] of existingSubjectsMap) {
      if (!formSubjectsMap.has(id)) {
        console.log(`Deleting subject: ${existingSubject.name}`)
        const deleteResponse = await fetch(getApiUrl(`/subjects/${id}`), {
          method: 'DELETE',
        })
        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete subject: ${existingSubject.name}`)
        }
      }
    }

    // Update modified subjects
    for (const [id, formSubject] of formSubjectsMap) {
      if (id) {
        const existingSubject = existingSubjectsMap.get(id)
        if (existingSubject && existingSubject.name !== formSubject.name) {
          console.log(`Updating subject: ${existingSubject.name} -> ${formSubject.name}`)
          const updateResponse = await fetch(getApiUrl(`/subjects/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formSubject.name,
              board_id: board.id,
            }),
          })
          if (!updateResponse.ok) {
            throw new Error(`Failed to update subject: ${formSubject.name}`)
          }
        }
      }
    }

    // Create new subjects
    for (const subject of formData.subjects) {
      if (!subject.id && subject.name.trim()) {
        console.log(`Creating new subject: ${subject.name}`)
        const createResponse = await fetch(getApiUrl('/subjects'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: subject.name,
            board_id: board.id,
          }),
        })
        if (!createResponse.ok) {
          throw new Error(`Failed to create subject: ${subject.name}`)
        }
      }
    }

    // Navigate back to board list on success
    router.push('/admin/board')
  } catch (error) {
    console.error('Error updating board:', error)
    alert('An error occurred while updating the board. Please try again.')
  }
}
</script>
