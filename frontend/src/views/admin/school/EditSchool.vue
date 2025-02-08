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

const router = useRouter()
const route = useRoute()
const schoolId = computed(() => route.params.id as string)
const isLoading = ref(false)
const schoolData = ref<SchoolFormData | null>(null)

// Add ref for the form component
const schoolFormRef = ref<InstanceType<typeof SchoolFormComponent> | null>(null)

// Fetch school data when component mounts
onMounted(async () => {
  try {
    if (!schoolId.value) return

    isLoading.value = true
    const response = await fetch(getApiUrl(`/schools/${schoolId.value}`))
    if (!response.ok) throw new Error('Failed to fetch school data')

    const school = await response.json()
    console.log('Fetched school data:', school)

    // Get board mediums and standards
    const [boardMediums, boardStandards, schoolMediums, schoolStandards] = await Promise.all([
      fetch(getApiUrl(`/instruction-mediums/board/${school.board_id}`)).then((r) => r.json()),
      fetch(getApiUrl(`/standards/board/${school.board_id}`)).then((r) => r.json()),
      fetch(getApiUrl(`/school-instruction-mediums/school/${schoolId.value}`)).then((r) =>
        r.json(),
      ),
      fetch(getApiUrl(`/school-standards/school/${schoolId.value}`)).then((r) => r.json()),
    ])

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
      schoolFormRef.value.boardSearch = school.name
    }

    console.log('Constructed initial data:', schoolData.value)
  } catch (error) {
    console.error('Error fetching school data:', error)
    alert('Failed to load school data. Please try again.')
  } finally {
    isLoading.value = false
  }
})

const handleSchoolUpdate = async (updatedData: SchoolFormData) => {
  try {
    isLoading.value = true

    // First update the address
    const addressResponse = await fetch(getApiUrl(`/addresses/${updatedData.address_id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        street: updatedData.address.street,
        postal_code: updatedData.address.postal_code,
        city_id: updatedData.address.city_id,
      }),
    })

    if (!addressResponse.ok) {
      throw new Error('Failed to update address')
    }

    // Then update the school with only the allowed properties
    const schoolResponse = await fetch(getApiUrl(`/schools/${schoolId.value}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updatedData.name,
        board_id: updatedData.board_id,
        address_id: updatedData.address_id,
        principal_name: updatedData.principal_name,
        email: updatedData.email,
        contact_number: updatedData.contact_number,
        alternate_contact_number: updatedData.alternate_contact_number || null,
      }),
    })

    if (!schoolResponse.ok) {
      throw new Error('Failed to update school')
    }

    // Update school-instruction-medium mappings
    // First, get existing mappings
    const existingMediumsResponse = await fetch(
      getApiUrl(`/school-instruction-mediums/school/${schoolId.value}`),
    )
    const existingMediums = await existingMediumsResponse.json()

    // Delete removed mappings
    for (const existingMedium of existingMediums) {
      if (!updatedData.mediums.includes(existingMedium.instruction_medium_id)) {
        await fetch(getApiUrl(`/school-instruction-mediums/${existingMedium.id}`), {
          method: 'DELETE',
        })
      }
    }

    // Add new mappings
    const existingMediumIds = existingMediums.map(
      (m: { instruction_medium_id: number }) => m.instruction_medium_id,
    )
    for (const mediumId of updatedData.mediums) {
      if (!existingMediumIds.includes(mediumId)) {
        await fetch(getApiUrl('/school-instruction-mediums'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            school_id: parseInt(schoolId.value),
            instruction_medium_id: mediumId,
          }),
        })
      }
    }

    // Update school-standard mappings
    // First, get existing mappings
    const existingStandardsResponse = await fetch(
      getApiUrl(`/school-standards/school/${schoolId.value}`),
    )
    const existingStandards = await existingStandardsResponse.json()

    // Delete removed mappings
    for (const existingStandard of existingStandards) {
      if (!updatedData.standards.includes(existingStandard.standard_id)) {
        await fetch(getApiUrl(`/school-standards/${existingStandard.id}`), {
          method: 'DELETE',
        })
      }
    }

    // Add new mappings
    const existingStandardIds = existingStandards.map((s: { standard_id: number }) => s.standard_id)
    for (const standardId of updatedData.standards) {
      if (!existingStandardIds.includes(standardId)) {
        await fetch(getApiUrl('/school-standards'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            school_id: parseInt(schoolId.value),
            standard_id: standardId,
          }),
        })
      }
    }

    // School updated successfully, navigate back to school list
    router.push('/admin/school')
  } catch (error) {
    console.error('Error updating school:', error)
  } finally {
    isLoading.value = false
  }
}
</script>
