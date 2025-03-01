<template>
  <div class="container-fluid school-form-container">
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
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'
import { onMounted, onUnmounted } from 'vue'

const router = useRouter()
const toastStore = useToastStore()

const logDimensions = () => {
  const container = document.querySelector('.school-form-container')
  console.log('AddSchool - Window dimensions:', {
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

const handleSchoolSubmit = async (schoolData: SchoolFormData) => {
  try {
    // Step 1: Create the address first
    const { data: createdAddress } = await axiosInstance.post('/addresses', {
      street: schoolData.address.street,
      postal_code: schoolData.address.postal_code,
      city_id: schoolData.address.city_id,
    })

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

    try {
      const { data: createdSchool } = await axiosInstance.post('/schools', schoolPayload)
      console.log('School created successfully:', createdSchool)

      // Step 3: Create school-instruction-medium mappings
      const mediumPromises = schoolData.mediums.map(async (mediumId) => {
        const response = await axiosInstance.post('/school-instruction-mediums', {
          school_id: createdSchool.id,
          instruction_medium_id: mediumId,
        })
        return response.data
      })

      // Step 4: Create school-standard mappings
      const standardPromises = schoolData.standards.map(async (standardId) => {
        const response = await axiosInstance.post('/school-standards', {
          school_id: createdSchool.id,
          standard_id: standardId,
        })
        return response.data
      })

      // Wait for all mappings to be created
      await Promise.all([...mediumPromises, ...standardPromises])
      console.log('School mappings created successfully')

      toastStore.showToast({
        title: 'Success',
        message: `School "${schoolData.name}" has been created successfully.`,
        type: 'success',
      })
      router.push('/admin/school')
    } catch (error) {
      // If school creation fails, delete the created address to avoid orphaned addresses
      await axiosInstance.delete(`/addresses/${createdAddress.id}`)
      throw error
    }
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
.school-form-container {
  min-height: 100vh;
  height: 100%;
  overflow-y: scroll;
  padding-bottom: 2rem; /* Add padding at bottom */
  -webkit-overflow-scrolling: touch;
}

/* Add styles for mobile devices */
@media screen and (max-width: 768px) {
  .school-form-container {
    position: relative;
    overflow-y: scroll !important;
  }
}
</style>
