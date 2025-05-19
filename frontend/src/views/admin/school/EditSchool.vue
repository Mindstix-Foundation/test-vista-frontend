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

  <LoadingSpinner :show="isSubmitting" :showOverlay="true" />

  <!-- Operation Result Modal -->
  <div
    class="modal fade"
    id="operationResultModal"
    tabindex="-1"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Operation Results</h5>
        </div>
        <div class="modal-body">
          <ul class="list-group">
            <li
              v-for="(result, index) in operationResults"
              :key="index"
              class="list-group-item d-flex justify-content-between align-items-start"
              :class="{
                'text-success': result.status === 'success',
                'text-danger': result.status === 'error',
              }"
            >
              <div class="ms-2 me-auto">
                <div>{{ result.operation }}</div>
                <div v-if="result.status === 'error'" class="text-danger small">
                  Error: {{ result.message }}
                </div>
              </div>
              <span
                class="badge rounded-pill"
                :class="{
                  'bg-success': result.status === 'success',
                  'bg-danger': result.status === 'error',
                }"
              >
                {{ result.status }}
              </span>
            </li>
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-dark" @click="cleanupAndNavigate">
            Go to School List
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SchoolFormComponent from '@/components/forms/SchoolFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import axiosInstance from '@/config/axios'
import type { SchoolFormData } from '@/models/School'
import { useToastStore } from '@/store/toast'
import * as bootstrap from 'bootstrap'

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

// Define the type for the form component instance
type SchoolFormComponentType = InstanceType<typeof SchoolFormComponent> & {
  availableMediums: { id: number; name: string }[]
  availableStandards: { id: number; name: string }[]
  boardSearch: string
  countrySearch: string
  stateSearch: string
  citySearch: string
  selectedCountry: { id: number; name: string } | null
  selectedState: { id: number; name: string; country_id: number } | null
  selectedCity: { id: number; name: string; state_id: number } | null
}

const router = useRouter()
const route = useRoute()
const schoolId = computed(() => route.params.id as string)
const isLoading = ref(false)
const isSubmitting = ref(false)
const schoolData = ref<SchoolFormData | null>(null)
const operationResults = ref<OperationResult[]>([])
let operationResultModal: bootstrap.Modal | null = null

// Update the ref type to use our custom type
const schoolFormRef = ref<SchoolFormComponentType | null>(null)

onMounted(() => {
  operationResultModal = new bootstrap.Modal(document.getElementById('operationResultModal')!)
})

const cleanupAndNavigate = () => {
  // Properly clean up the modal
  const modalElement = document.getElementById('operationResultModal')
  if (modalElement) {
    operationResultModal?.hide()

    // Remove backdrop manually
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

    // Remove modal-open class and inline styles from body
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
  }

  router.push('/admin/school')
}

// Fetch school data when component mounts
onMounted(async () => {
  try {
    if (!schoolId.value) return

    isLoading.value = true
    const { data: school } = await axiosInstance.get(`/schools/${schoolId.value}`)

    // Make sure we're extracting the correct IDs from the nested response
    const cityId = school.address?.city?.id
    const stateId = school.address?.city?.state?.id
    const countryId = school.address?.city?.state?.country?.id

    // Get board mediums and standards
    const [
      { data: boardMediums },
      { data: boardStandards },
    ] = await Promise.all([
      axiosInstance.get(`/instruction-mediums/board/${school.board.id}`),
      axiosInstance.get(`/standards/board/${school.board.id}`),
    ])

    console.log("Fetched board mediums:", boardMediums);
    console.log("Fetched board standards:", boardStandards);

    // Map board mediums and standards to the format expected by the form
    const mappedBoardMediums = boardMediums.map(
      (m: { id: number; instruction_medium: string }) => ({
        id: m.id,
        name: m.instruction_medium,
      }),
    )
    const mappedBoardStandards = boardStandards.map((s: { id: number; name: string; sequence_number: number }) => ({
      id: s.id,
      name: s.name,
      sequence_number: s.sequence_number
    })).sort((a: { sequence_number: number }, b: { sequence_number: number }) => a.sequence_number - b.sequence_number)

    // Get the IDs of the school's selected mediums and standards
    const selectedMediumIds = school.instruction_mediums.map((m: { id: number }) => m.id)
    const selectedStandardIds = school.standards.map((s: { id: number }) => s.id)

    // Construct form data using the new API response format
    schoolData.value = {
      name: school.name,
      board_id: school.board.id,
      address_id: school.address.id,
      principal_name: school.principal_name,
      email: school.email,
      contact_number: school.contact_number,
      alternate_contact_number: school.alternate_contact_number || '',
      address: {
        street: school.address.street || '',
        postal_code: school.address.postal_code || '',
        city_id: cityId || 0,
        state_id: stateId || 0,
        country_id: countryId || 0,
      },
      mediums: selectedMediumIds,
      standards: selectedStandardIds,
    }

    // Set the available mediums and standards in the form component after a short delay
    // to ensure the form component has fully mounted and processed the initialData
    setTimeout(() => {
      if (schoolFormRef.value) {
        schoolFormRef.value.availableMediums = mappedBoardMediums
        schoolFormRef.value.availableStandards = mappedBoardStandards
        schoolFormRef.value.boardSearch = school.board.name
        console.log("Set form mediums and standards:", mappedBoardMediums, mappedBoardStandards);
      }
    }, 100);
  } catch (error) {
    console.error('Error fetching school data:', error)
    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to load school data. Please try again.',
    })
  } finally {
    isLoading.value = false
  }
})

// Helper functions for school update
const addOperationResult = (operation: string, status: 'success' | 'error', message?: string) => {
  operationResults.value.push({
    operation,
    status,
    ...(message && { message }),
  })
}

const formatErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error occurred'
}

const updateSchoolAddress = async (addressData: any, addressId: number) => {
  try {
    console.log('Updating address with:', {
      street: addressData.street,
      postal_code: addressData.postal_code,
      city_id: addressData.city_id,
    })

    await axiosInstance.put(`/addresses/${addressId}`, {
      street: addressData.street,
      postal_code: addressData.postal_code,
      city_id: addressData.city_id,
    })

    addOperationResult('Update School Address', 'success')
  } catch (error) {
    console.error('Error updating address:', error)
    addOperationResult('Update School Address', 'error', formatErrorMessage(error))
  }
}

const updateSchoolDetails = async (schoolData: any, id: string) => {
  try {
    console.log('Updating school details with:', schoolData)

    await axiosInstance.put(`/schools/${id}`, {
      name: schoolData.name,
      board_id: schoolData.board_id,
      address_id: schoolData.address_id,
      principal_name: schoolData.principal_name,
      email: schoolData.email,
      contact_number: schoolData.contact_number,
      alternate_contact_number: schoolData.alternate_contact_number || null,
    })

    addOperationResult('Update School Details', 'success')
  } catch (error) {
    console.error('Error updating school details:', error)
    addOperationResult('Update School Details', 'error', formatErrorMessage(error))
  }
}

const processMediumAddition = async (mediumId: number, schoolId: string) => {
  try {
    console.log(`Adding medium ${mediumId}`)
    await axiosInstance.post('/school-instruction-mediums', {
      school_id: parseInt(schoolId),
      instruction_medium_id: mediumId,
    })
    
    const mediumInfo = schoolFormRef.value?.availableMediums.find(m => m.id === mediumId)
    addOperationResult(`Add Medium: ${mediumInfo?.name || 'Unknown Medium'}`, 'success')
  } catch (error) {
    console.error(`Error adding medium ${mediumId}:`, error)
    const mediumInfo = schoolFormRef.value?.availableMediums.find(m => m.id === mediumId)
    addOperationResult(`Add Medium: ${mediumInfo?.name || 'Unknown Medium'}`, 'error', formatErrorMessage(error))
  }
}

const processMediumRemoval = async (medium: any, mappings: any[]) => {
  try {
    const mapping = mappings.find(
      (m: { instruction_medium: { id: number } }) => m.instruction_medium.id === medium.id
    )

    if (!mapping) {
      throw new Error(`School-medium mapping not found for medium ID ${medium.id}`)
    }

    console.log(`Removing school-medium mapping with ID ${mapping.id}`)
    await axiosInstance.delete(`/school-instruction-mediums/${mapping.id}`)
    
    const mediumInfo = schoolFormRef.value?.availableMediums.find(m => m.id === medium.id)
    const mediumName = mediumInfo?.name || medium.instruction_medium || 'Unknown Medium'
    addOperationResult(`Remove Medium: ${mediumName}`, 'success')
  } catch (error) {
    console.error(`Error removing medium ${medium.id}:`, error)
    const mediumInfo = schoolFormRef.value?.availableMediums.find(m => m.id === medium.id)
    const mediumName = mediumInfo?.name || medium.instruction_medium || 'Unknown Medium'
    addOperationResult(`Remove Medium: ${mediumName}`, 'error', formatErrorMessage(error))
  }
}

const updateMediums = async (currentSchool: any, updatedMediums: number[], schoolId: string) => {
  try {
    const currentMediumIds = currentSchool.instruction_mediums.map((m: { id: number }) => m.id)
    console.log('Current medium IDs:', currentMediumIds)
    console.log('Updated medium IDs:', updatedMediums)

    const mediumsToAdd = updatedMediums.filter(id => !currentMediumIds.includes(id))
    const mediumsToRemove = currentSchool.instruction_mediums.filter(
      (medium: { id: number }) => !updatedMediums.includes(medium.id)
    )
    
    if (mediumsToAdd.length === 0 && mediumsToRemove.length === 0) return

    const { data: schoolMediumMappings } = await axiosInstance.get(
      `/school-instruction-mediums/school/${schoolId}`
    )

    // Process removals
    for (const medium of mediumsToRemove) {
      await processMediumRemoval(medium, schoolMediumMappings)
    }

    // Process additions
    for (const mediumId of mediumsToAdd) {
      await processMediumAddition(mediumId, schoolId)
    }
  } catch (error) {
    console.error('Error updating instruction mediums:', error)
    addOperationResult('Update Instruction Mediums', 'error', formatErrorMessage(error))
  }
}

const processStandardAddition = async (standardId: number, schoolId: string) => {
  try {
    console.log(`Adding standard ${standardId}`)
    await axiosInstance.post('/school-standards', {
      school_id: parseInt(schoolId),
      standard_id: standardId,
    })
    
    const standardInfo = schoolFormRef.value?.availableStandards.find(s => s.id === standardId)
    addOperationResult(`Add Standard: ${standardInfo?.name || 'Unknown Standard'}`, 'success')
  } catch (error) {
    console.error(`Error adding standard ${standardId}:`, error)
    const standardInfo = schoolFormRef.value?.availableStandards.find(s => s.id === standardId)
    addOperationResult(`Add Standard: ${standardInfo?.name || 'Unknown Standard'}`, 'error', formatErrorMessage(error))
  }
}

const processStandardRemoval = async (standard: any, mappings: any[]) => {
  try {
    const mapping = mappings.find(
      (m: { standard: { id: number } }) => m.standard.id === standard.id
    )

    if (!mapping) {
      throw new Error(`School-standard mapping not found for standard ID ${standard.id}`)
    }

    console.log(`Removing school-standard mapping with ID ${mapping.id}`)
    await axiosInstance.delete(`/school-standards/${mapping.id}`)
    
    const standardInfo = schoolFormRef.value?.availableStandards.find(s => s.id === standard.id)
    const standardName = standardInfo?.name || standard.name || 'Unknown Standard'
    addOperationResult(`Remove Standard: ${standardName}`, 'success')
  } catch (error) {
    console.error(`Error removing standard ${standard.id}:`, error)
    const standardInfo = schoolFormRef.value?.availableStandards.find(s => s.id === standard.id)
    const standardName = standardInfo?.name || standard.name || 'Unknown Standard'
    addOperationResult(`Remove Standard: ${standardName}`, 'error', formatErrorMessage(error))
  }
}

const updateStandards = async (currentSchool: any, updatedStandards: number[], schoolId: string) => {
  try {
    const currentStandardIds = currentSchool.standards.map((s: { id: number }) => s.id)
    console.log('Current standard IDs:', currentStandardIds)
    console.log('Updated standard IDs:', updatedStandards)

    const standardsToAdd = updatedStandards.filter(id => !currentStandardIds.includes(id))
    const standardsToRemove = currentSchool.standards.filter(
      (standard: { id: number }) => !updatedStandards.includes(standard.id)
    )
    
    if (standardsToAdd.length === 0 && standardsToRemove.length === 0) return

    const { data: schoolStandardMappings } = await axiosInstance.get(
      `/school-standards/school/${schoolId}`
    )

    // Process removals
    for (const standard of standardsToRemove) {
      await processStandardRemoval(standard, schoolStandardMappings)
    }

    // Process additions
    for (const standardId of standardsToAdd) {
      await processStandardAddition(standardId, schoolId)
    }
  } catch (error) {
    console.error('Error updating standards:', error)
    addOperationResult('Update Standards', 'error', formatErrorMessage(error))
  }
}

const checkChanges = (currentSchool: any, updatedData: any) => {
  // Check address changes
  const hasAddressChanged =
    currentSchool.address.street !== updatedData.address.street ||
    currentSchool.address.postal_code !== updatedData.address.postal_code ||
    currentSchool.address.city.id !== updatedData.address.city_id

  // Check school details changes
  const hasSchoolDetailsChanged =
    currentSchool.name !== updatedData.name ||
    currentSchool.board.id !== updatedData.board_id ||
    currentSchool.principal_name !== updatedData.principal_name ||
    currentSchool.email !== updatedData.email ||
    currentSchool.contact_number !== updatedData.contact_number ||
    currentSchool.alternate_contact_number !== (updatedData.alternate_contact_number || null)

  return { hasAddressChanged, hasSchoolDetailsChanged }
}

const handleSchoolUpdate = async (updatedData: SchoolFormData) => {
  try {
    console.log('Starting school update with data:', updatedData)
    isSubmitting.value = true
    operationResults.value = []

    // Get current school data to compare changes
    const { data: currentSchool } = await axiosInstance.get(`/schools/${schoolId.value}`)
    
    // Check what has changed
    const { hasAddressChanged, hasSchoolDetailsChanged } = checkChanges(currentSchool, updatedData)
    console.log('Changes detected:', { hasAddressChanged, hasSchoolDetailsChanged })

    // Update each component if changed
    if (hasAddressChanged) {
      await updateSchoolAddress(updatedData.address, updatedData.address_id)
    }

    if (hasSchoolDetailsChanged) {
      await updateSchoolDetails(updatedData, schoolId.value)
    }

    // Update mediums and standards in parallel
    await Promise.all([
      updateMediums(currentSchool, updatedData.mediums, schoolId.value),
      updateStandards(currentSchool, updatedData.standards, schoolId.value)
    ])

    // Show results or navigate back
    if (operationResults.value.length > 0) {
      console.log('Showing operation results modal with:', operationResults.value)
      operationResultModal?.show()
    } else {
      console.log('No changes detected, navigating back')
      router.push('/admin/school')
    }
  } catch (error) {
    console.error('Error updating school:', error)
    const toastStore = useToastStore()
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to update school. Please try again.',
    })
  } finally {
    isSubmitting.value = false
    isLoading.value = false
  }
}
</script>

<style scoped>
.list-group-item {
  transition: all 0.2s ease-in-out;
  border-left-width: 4px;
}

.list-group-item.text-success {
  border-left-color: #198754;
  color: #198754 !important;
}

.list-group-item.text-danger {
  border-left-color: #dc3545;
  color: #dc3545 !important;
}

.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}
</style>
