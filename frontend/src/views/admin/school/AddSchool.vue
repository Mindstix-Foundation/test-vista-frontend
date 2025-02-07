<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col">
        <SchoolFormComponent :is-edit-mode="false" @submit="handleSchoolSubmit" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SchoolFormComponent from '@/components/forms/SchoolFormComponent.vue'
import type { SchoolFormData } from '@/models/School'
import { getApiUrl } from '@/config/api'

const router = useRouter()

const handleSchoolSubmit = async (schoolData: SchoolFormData) => {
  try {
    // Step 1: Create the address first
    const addressResponse = await fetch(getApiUrl('/addresses'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        street: schoolData.address.street,
        postal_code: schoolData.address.postal_code,
        city_id: schoolData.address.city_id
      }),
    })

    if (!addressResponse.ok) {
      throw new Error('Failed to create address')
    }

    const createdAddress = await addressResponse.json()
    console.log('Address created successfully:', createdAddress)

    // Step 2: Create the school with the new address ID
    const schoolPayload = {
      name: schoolData.name,
      board_id: schoolData.board_id,
      address_id: createdAddress.id,
      principal_name: schoolData.principal_name,
      email: schoolData.email,
      contact_number: schoolData.contact_number,
      alternate_contact_number: schoolData.alternate_contact_number || null,
    }

    const schoolResponse = await fetch(getApiUrl('/schools'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schoolPayload),
    })

    if (!schoolResponse.ok) {
      // If school creation fails, delete the created address to avoid orphaned addresses
      await fetch(getApiUrl(`/addresses/${createdAddress.id}`), {
        method: 'DELETE',
      })
      throw new Error('Failed to create school')
    }

    const createdSchool = await schoolResponse.json()
    console.log('School created successfully:', createdSchool)

    // Step 3: Create school-instruction-medium mappings
    const mediumPromises = schoolData.mediums.map(async (mediumId) => {
      const mediumDto = {
        school_id: createdSchool.id,
        instruction_medium_id: parseInt(mediumId.toString()),
      }
      const response = await fetch(getApiUrl('/school-instruction-mediums'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mediumDto),
      })
      if (!response.ok) {
        throw new Error('Failed to create school-instruction-medium mapping')
      }
      return response.json()
    })

    // Step 4: Create school-standard mappings
    const standardPromises = schoolData.standards.map(async (standardId) => {
      const standardDto = {
        school_id: createdSchool.id,
        standard_id: parseInt(standardId.toString()),
      }
      const response = await fetch(getApiUrl('/school-standards'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(standardDto),
      })
      if (!response.ok) {
        throw new Error('Failed to create school-standard mapping')
      }
      return response.json()
    })

    // Wait for all mappings to be created
    await Promise.all([...mediumPromises, ...standardPromises])
    console.log('All school relationships created successfully')

    // Navigate back to the schools list after successful creation
    router.push('/admin/school')
  } catch (error) {
    console.error('Error creating school:', error)
    // Show a more descriptive error message to the user
    if (error instanceof Error) {
      alert(error.message)
    } else {
      alert('Failed to create school. Please try again.')
    }
  }
}
</script>

<style scoped>
/* Add any styles here */
</style>
