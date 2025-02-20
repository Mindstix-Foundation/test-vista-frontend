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
import { useToastStore } from '@/store/toast'

const router = useRouter()
const toastStore = useToastStore()

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
        city_id: schoolData.address.city_id,
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
    toastStore.showToast({
      title: 'Success',
      message: `School "${schoolData.name}" has been created successfully.`,
      type: 'success',
    })
    router.push('/admin/school')
  } catch (error) {
    console.error('Error creating school:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to create school. Please try again.',
      type: 'error',
    })
  }
}
</script>

<style scoped>
/* Add any styles here */
</style>
