<template>
  <div class="container-fluid">
    <SchoolFormComponent
      ref="schoolFormRef"
      :isEditMode="true"
      :schoolId="schoolId"
      :initialData="schoolData"
      :isLoading="isLoading"
      @submit="handleSchoolUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SchoolFormComponent from '@/components/forms/SchoolFormComponent.vue'
import { getApiUrl } from '@/config/api'
import type { SchoolFormData } from '@/models/School'

interface School {
  id: number
  name: string
  board_id: number
  address_id: number
  principal_name: string
  email: string
  contact_number: string
  alternate_contact_number?: string
  address: {
    street: string
    postal_code: string
    city_id: number
    state_id: number
    country_id: number
  }
}

interface ValidationError {
  field: string
  message: string
}

const router = useRouter()
const route = useRoute()
const schoolId = computed(() => route.params.id as string)
const isLoading = ref(false)
const schoolData = ref<SchoolFormData | null>(null)

// Add ref for the form component
const schoolFormRef = ref<InstanceType<typeof SchoolFormComponent> | null>(null)

const availableMediums = ref<{ id: number; name: string }[]>([])
const availableStandards = ref<{ id: number; name: string }[]>([])

// Fetch school data when component mounts
onMounted(async () => {
  try {
    isLoading.value = true
    console.log('Fetching school data for ID:', schoolId.value)

    // Fetch school details
    const schoolResponse = await fetch(getApiUrl(`/schools/${schoolId.value}`))
    if (!schoolResponse.ok) throw new Error('Failed to fetch school')
    const school: School = await schoolResponse.json()
    console.log('Fetched school:', school)

    // Fetch board details first
    const boardResponse = await fetch(getApiUrl(`/boards/${school.board_id}`))
    if (!boardResponse.ok) throw new Error('Failed to fetch board')
    const board = await boardResponse.json()
    console.log('Fetched board:', board)

    // Fetch board's available mediums and standards
    const [boardMediums, boardStandards] = await Promise.all([
      fetch(getApiUrl(`/instruction-mediums/board/${school.board_id}`)).then((res) => res.json()),
      fetch(getApiUrl(`/standards/board/${school.board_id}`)).then((res) => res.json()),
    ])
    console.log('Board mediums:', boardMediums)
    console.log('Board standards:', boardStandards)

    // Fetch school's selected mediums and standards
    const [schoolMediums, schoolStandards] = await Promise.all([
      fetch(getApiUrl(`/school-instruction-mediums/school/${schoolId.value}`)).then((res) =>
        res.json(),
      ),
      fetch(getApiUrl(`/school-standards/school/${schoolId.value}`)).then((res) => res.json()),
    ])
    console.log('School mediums:', schoolMediums)
    console.log('School standards:', schoolStandards)

    // Map board mediums and standards to the format expected by the form
    const mappedBoardMediums = boardMediums.map(
      (m: { id: number; instruction_medium: string }) => ({
        id: m.id,
        name: m.instruction_medium,
      }),
    )
    const mappedBoardStandards = boardStandards.map((s: { id: number; name: string }) => ({
      id: s.id,
      name: s.name,
    }))

    // Get the IDs of the school's selected mediums and standards
    const selectedMediumIds = schoolMediums.map(
      (m: { instruction_medium_id: number }) => m.instruction_medium_id,
    )
    const selectedStandardIds = schoolStandards.map((s: { standard_id: number }) => s.standard_id)

    // Construct form data
    schoolData.value = {
      name: school.name,
      board_id: school.board_id,
      address_id: school.address_id,
      principal_name: school.principal_name,
      email: school.email,
      contact_number: school.contact_number,
      alternate_contact_number: school.alternate_contact_number || '',
      address: {
        street: school.address.street,
        postal_code: school.address.postal_code,
        city_id: school.address.city_id,
        state_id: school.address.state_id,
        country_id: school.address.country_id,
      },
      mediums: selectedMediumIds,
      standards: selectedStandardIds,
    }

    // Set the available mediums and standards in the form component
    if (schoolFormRef.value) {
      schoolFormRef.value.availableMediums = mappedBoardMediums
      schoolFormRef.value.availableStandards = mappedBoardStandards
      schoolFormRef.value.boardSearch = board.name
    }

    console.log('Constructed initial data:', schoolData.value)
  } catch (error) {
    console.error('Error fetching school data:', error)
    alert('Failed to load school data. Please try again.')
  } finally {
    isLoading.value = false
  }
})

// Add helper function to format error messages
const formatErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'message' in error) {
    // Handle case where message is an array of validation errors
    if (Array.isArray(error.message)) {
      return error.message.map((err: ValidationError) => `${err.field}: ${err.message}`).join('\n')
    }
    // Handle case where message is a string
    if (typeof error.message === 'string') {
      return error.message
    }
  }
  return String(error)
}

const handleSchoolUpdate = async (formData: SchoolFormData) => {
  try {
    isLoading.value = true
    console.log('Updating school with data:', formData)

    // First, update the address
    const addressResponse = await fetch(getApiUrl(`/addresses/${formData.address_id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        street: formData.address.street,
        postal_code: formData.address.postal_code,
        city_id: formData.address.city_id,
        state_id: formData.address.state_id,
        country_id: formData.address.country_id,
      }),
    })

    if (!addressResponse.ok) {
      const errorData = await addressResponse.json().catch(() => null)
      throw new Error(formatErrorMessage(errorData) || 'Failed to update address')
    }

    // Update the school basic info
    const schoolResponse = await fetch(getApiUrl(`/schools/${schoolId.value}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        board_id: formData.board_id,
        address_id: formData.address_id,
        principal_name: formData.principal_name,
        email: formData.email,
        contact_number: formData.contact_number,
        alternate_contact_number: formData.alternate_contact_number || undefined,
      }),
    })

    if (!schoolResponse.ok) {
      const errorData = await schoolResponse.json().catch(() => null)
      throw new Error(formatErrorMessage(errorData) || 'Failed to update school')
    }

    // Get current mediums and standards to compare
    const [currentMediums, currentStandards] = await Promise.all([
      fetch(getApiUrl(`/school-instruction-mediums/school/${schoolId.value}`)).then(async (r) => {
        if (!r.ok) {
          const errorData = await r.json().catch(() => null)
          throw new Error(formatErrorMessage(errorData) || 'Failed to fetch current mediums')
        }
        return r.json()
      }),
      fetch(getApiUrl(`/school-standards/school/${schoolId.value}`)).then(async (r) => {
        if (!r.ok) {
          const errorData = await r.json().catch(() => null)
          throw new Error(formatErrorMessage(errorData) || 'Failed to fetch current standards')
        }
        return r.json()
      }),
    ])

    // Handle mediums
    const mediumPromises = []

    // Delete removed mediums
    for (const medium of currentMediums) {
      if (!formData.mediums.includes(medium.instruction_medium.id)) {
        mediumPromises.push(
          fetch(getApiUrl(`/school-instruction-mediums/${medium.id}`), {
            method: 'DELETE',
          }).then(async (r) => {
            if (!r.ok) {
              const errorData = await r.json().catch(() => null)
              throw new Error(
                formatErrorMessage(errorData) ||
                  `Failed to remove medium: ${medium.instruction_medium.name}`,
              )
            }
          }),
        )
      }
    }

    // Add new mediums
    const existingMediumIds = currentMediums.map(
      (m: { instruction_medium: { id: number } }) => m.instruction_medium.id,
    )
    for (const mediumId of formData.mediums) {
      if (!existingMediumIds.includes(mediumId)) {
        mediumPromises.push(
          fetch(getApiUrl('/school-instruction-mediums'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              school_id: parseInt(schoolId.value),
              instruction_medium_id: mediumId,
            }),
          }).then(async (r) => {
            if (!r.ok) {
              const errorData = await r.json().catch(() => null)
              const medium = availableMediums.value.find((m) => m.id === mediumId)
              throw new Error(
                formatErrorMessage(errorData) ||
                  `Failed to add medium: ${medium?.name || mediumId}`,
              )
            }
          }),
        )
      }
    }

    // Handle standards
    const standardPromises = []

    // Delete removed standards
    for (const standard of currentStandards) {
      if (!formData.standards.includes(standard.standard.id)) {
        standardPromises.push(
          fetch(getApiUrl(`/school-standards/${standard.id}`), {
            method: 'DELETE',
          }).then(async (r) => {
            if (!r.ok) {
              const errorData = await r.json().catch(() => null)
              throw new Error(
                formatErrorMessage(errorData) ||
                  `Failed to remove standard: ${standard.standard.name}`,
              )
            }
          }),
        )
      }
    }

    // Add new standards
    const existingStandardIds = currentStandards.map(
      (s: { standard: { id: number } }) => s.standard.id,
    )
    for (const standardId of formData.standards) {
      if (!existingStandardIds.includes(standardId)) {
        standardPromises.push(
          fetch(getApiUrl('/school-standards'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              school_id: parseInt(schoolId.value),
              standard_id: standardId,
            }),
          }).then(async (r) => {
            if (!r.ok) {
              const errorData = await r.json().catch(() => null)
              const standard = availableStandards.value.find((s) => s.id === standardId)
              throw new Error(
                formatErrorMessage(errorData) ||
                  `Failed to add standard: ${standard?.name || standardId}`,
              )
            }
          }),
        )
      }
    }

    try {
      // Wait for all medium and standard updates to complete
      await Promise.all([...mediumPromises, ...standardPromises])
    } catch (error: unknown) {
      // Re-throw with more specific error message
      if (error instanceof Error) {
        throw new Error(`Failed to update school relationships: ${error.message}`)
      }
      throw error
    }

    // Show success message and redirect
    alert('School updated successfully')
    router.push('/admin/school')
  } catch (error: unknown) {
    console.error('Error in handleSchoolUpdate:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
      alert(error.message) // Show the specific error message from the backend
    } else {
      alert('An unexpected error occurred while updating the school. Please try again.')
    }
  } finally {
    isLoading.value = false
  }
}
</script>
