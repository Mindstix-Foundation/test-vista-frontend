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
    console.log('Fetched school data:', school)

    // Get board mediums and standards
    const [
      { data: boardMediums },
      { data: boardStandards },
    ] = await Promise.all([
      axiosInstance.get(`/instruction-mediums/board/${school.board.id}`),
      axiosInstance.get(`/standards/board/${school.board.id}`),
    ])

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
        street: school.address.street,
        postal_code: school.address.postal_code,
        city_id: school.address.city.id,
        state_id: school.address.city.state.id,
        country_id: school.address.city.state.country.id,
      },
      mediums: selectedMediumIds,
      standards: selectedStandardIds,
    }

    // Set the available mediums and standards in the form component
    if (schoolFormRef.value) {
      schoolFormRef.value.availableMediums = mappedBoardMediums
      schoolFormRef.value.availableStandards = mappedBoardStandards
      schoolFormRef.value.boardSearch = school.board.name

      // Set the location data in the form component
      schoolFormRef.value.selectedCountry = {
        id: school.address.city.state.country.id,
        name: school.address.city.state.country.name
      }
      schoolFormRef.value.selectedState = {
        id: school.address.city.state.id,
        name: school.address.city.state.name,
        country_id: school.address.city.state.country.id
      }
      schoolFormRef.value.selectedCity = {
        id: school.address.city.id,
        name: school.address.city.name,
        state_id: school.address.city.state.id
      }

      // Set the search values for location fields
      schoolFormRef.value.countrySearch = school.address.city.state.country.name
      schoolFormRef.value.stateSearch = school.address.city.state.name
      schoolFormRef.value.citySearch = school.address.city.name
    }

    console.log('Constructed initial data:', schoolData.value)
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

const handleSchoolUpdate = async (updatedData: SchoolFormData) => {
  try {
    console.log('Starting school update with data:', updatedData)
    isSubmitting.value = true // Show loading spinner during update
    operationResults.value = []

    // Get current school data to compare changes
    const { data: currentSchool } = await axiosInstance.get(`/schools/${schoolId.value}`)
    console.log('Current school data:', currentSchool)

    // Track what has actually changed
    const hasAddressChanged =
      currentSchool.address.street !== updatedData.address.street ||
      currentSchool.address.postal_code !== updatedData.address.postal_code ||
      currentSchool.address.city.id !== updatedData.address.city_id

    const hasSchoolDetailsChanged =
      currentSchool.name !== updatedData.name ||
      currentSchool.board.id !== updatedData.board_id ||
      currentSchool.principal_name !== updatedData.principal_name ||
      currentSchool.email !== updatedData.email ||
      currentSchool.contact_number !== updatedData.contact_number ||
      currentSchool.alternate_contact_number !== (updatedData.alternate_contact_number || null)

    console.log('Changes detected:', { hasAddressChanged, hasSchoolDetailsChanged })

    // Update address if changed
    if (hasAddressChanged) {
      try {
        console.log('Updating address with:', {
          street: updatedData.address.street,
          postal_code: updatedData.address.postal_code,
          city_id: updatedData.address.city_id,
        })

        await axiosInstance.put(`/addresses/${updatedData.address_id}`, {
          street: updatedData.address.street,
          postal_code: updatedData.address.postal_code,
          city_id: updatedData.address.city_id,
        })

        operationResults.value.push({
          operation: 'Update School Address',
          status: 'success',
        })
      } catch (error) {
        console.error('Error updating address:', error)
        operationResults.value.push({
          operation: 'Update School Address',
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update address',
        })
      }
    }

    // Update school if details changed
    if (hasSchoolDetailsChanged) {
      try {
        console.log('Updating school details with:', {
          name: updatedData.name,
          board_id: updatedData.board_id,
          address_id: updatedData.address_id,
          principal_name: updatedData.principal_name,
          email: updatedData.email,
          contact_number: updatedData.contact_number,
          alternate_contact_number: updatedData.alternate_contact_number || null,
        })

        await axiosInstance.put(`/schools/${schoolId.value}`, {
          name: updatedData.name,
          board_id: updatedData.board_id,
          address_id: updatedData.address_id,
          principal_name: updatedData.principal_name,
          email: updatedData.email,
          contact_number: updatedData.contact_number,
          alternate_contact_number: updatedData.alternate_contact_number || null,
        })

        operationResults.value.push({
          operation: 'Update School Details',
          status: 'success',
        })
      } catch (error) {
        console.error('Error updating school details:', error)
        operationResults.value.push({
          operation: 'Update School Details',
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update school details',
        })
      }
    }

    // Update instruction mediums
    try {
      // Get current medium IDs from the API response
      const currentMediumIds = currentSchool.instruction_mediums.map((m: { id: number }) => m.id)
      console.log('Current medium IDs:', currentMediumIds)
      console.log('Updated medium IDs:', updatedData.mediums)

      // Compare with updated medium IDs
      const mediumsToAdd = updatedData.mediums.filter((id) => !currentMediumIds.includes(id))
      const mediumsToRemove = currentSchool.instruction_mediums.filter(
        (medium: { id: number }) => !updatedData.mediums.includes(medium.id)
      )
      console.log('Mediums to add:', mediumsToAdd)
      console.log('Mediums to remove:', mediumsToRemove)

      // Only proceed if there are changes
      if (mediumsToAdd.length > 0 || mediumsToRemove.length > 0) {
        // First get all school-instruction-medium mappings
        const { data: schoolMediumMappings } = await axiosInstance.get(
          `/school-instruction-mediums/school/${schoolId.value}`
        )
        console.log('School-medium mappings:', schoolMediumMappings)

        // Process removals
        for (const medium of mediumsToRemove) {
          try {
            // Find the mapping for this medium
            const mapping = schoolMediumMappings.find(
              (m: { instruction_medium_id: number }) => m.instruction_medium_id === medium.id
            )

            if (!mapping) {
              throw new Error(`School-medium mapping not found for medium ID ${medium.id}`)
            }

            console.log(`Removing school-medium mapping with ID ${mapping.id} for medium ${medium.instruction_medium}`)
            // Use the correct API endpoint with the mapping ID
            await axiosInstance.delete(`/school-instruction-mediums/${mapping.id}`)

            const mediumInfo = schoolFormRef.value?.availableMediums.find(
              (m) => m.id === medium.id
            )
            operationResults.value.push({
              operation: `Remove Medium: ${mediumInfo?.name || medium.instruction_medium || 'Unknown Medium'}`,
              status: 'success',
            })
          } catch (error) {
            console.error(`Error removing medium ${medium.id}:`, error)
            const mediumInfo = schoolFormRef.value?.availableMediums.find(
              (m) => m.id === medium.id
            )
            operationResults.value.push({
              operation: `Remove Medium: ${mediumInfo?.name || medium.instruction_medium || 'Unknown Medium'}`,
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to remove medium',
            })
          }
        }

        // Process additions
        for (const mediumId of mediumsToAdd) {
          try {
            console.log(`Adding medium ${mediumId}`)
            await axiosInstance.post('/school-instruction-mediums', {
              school_id: parseInt(schoolId.value),
              instruction_medium_id: mediumId,
            })
            const mediumInfo = schoolFormRef.value?.availableMediums.find((m) => m.id === mediumId)
            operationResults.value.push({
              operation: `Add Medium: ${mediumInfo?.name || 'Unknown Medium'}`,
              status: 'success',
            })
          } catch (error) {
            console.error(`Error adding medium ${mediumId}:`, error)
            const mediumInfo = schoolFormRef.value?.availableMediums.find((m) => m.id === mediumId)
            operationResults.value.push({
              operation: `Add Medium: ${mediumInfo?.name || 'Unknown Medium'}`,
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to add medium',
            })
          }
        }
      }
    } catch (error) {
      console.error('Error updating instruction mediums:', error)
      operationResults.value.push({
        operation: 'Update Instruction Mediums',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update instruction mediums',
      })
    }

    // Update standards
    try {
      // Get current standard IDs from the API response
      const currentStandardIds = currentSchool.standards.map((s: { id: number }) => s.id)
      console.log('Current standard IDs:', currentStandardIds)
      console.log('Updated standard IDs:', updatedData.standards)

      // Compare with updated standard IDs
      const standardsToAdd = updatedData.standards.filter((id) => !currentStandardIds.includes(id))
      const standardsToRemove = currentSchool.standards.filter(
        (standard: { id: number }) => !updatedData.standards.includes(standard.id)
      )
      console.log('Standards to add:', standardsToAdd)
      console.log('Standards to remove:', standardsToRemove)

      // Only proceed if there are changes
      if (standardsToAdd.length > 0 || standardsToRemove.length > 0) {
        // First fetch the school-standard mappings to get the mapping IDs
        const { data: schoolStandardMappings } = await axiosInstance.get(`/school-standards/school/${schoolId.value}`)
        console.log('School-standard mappings:', schoolStandardMappings)

        // Process removals
        for (const standard of standardsToRemove) {
          try {
            // Find the mapping for this standard
            const mapping = schoolStandardMappings.find(
              (m: { standard_id: number }) => m.standard_id === standard.id
            )

            if (!mapping) {
              throw new Error(`School-standard mapping not found for standard ID ${standard.id}`)
            }

            console.log(`Removing school-standard mapping with ID ${mapping.id} for standard ${standard.id}`)
            // Use the correct API endpoint with the mapping ID
            await axiosInstance.delete(`/school-standards/${mapping.id}`)

            const standardInfo = schoolFormRef.value?.availableStandards.find(
              (s) => s.id === standard.id
            )
            operationResults.value.push({
              operation: `Remove Standard: ${standardInfo?.name || standard.name || 'Unknown Standard'}`,
              status: 'success',
            })
          } catch (error) {
            console.error(`Error removing standard ${standard.id}:`, error)
            const standardInfo = schoolFormRef.value?.availableStandards.find(
              (s) => s.id === standard.id
            )
            operationResults.value.push({
              operation: `Remove Standard: ${standardInfo?.name || standard.name || 'Unknown Standard'}`,
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to remove standard',
            })
          }
        }

        // Process additions
        for (const standardId of standardsToAdd) {
          try {
            console.log(`Adding standard ${standardId}`)
            await axiosInstance.post('/school-standards', {
              school_id: parseInt(schoolId.value),
              standard_id: standardId,
            })
            const standardInfo = schoolFormRef.value?.availableStandards.find(
              (s) => s.id === standardId
            )
            operationResults.value.push({
              operation: `Add Standard: ${standardInfo?.name || 'Unknown Standard'}`,
              status: 'success',
            })
          } catch (error) {
            console.error(`Error adding standard ${standardId}:`, error)
            const standardInfo = schoolFormRef.value?.availableStandards.find(
              (s) => s.id === standardId
            )
            operationResults.value.push({
              operation: `Add Standard: ${standardInfo?.name || 'Unknown Standard'}`,
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to add standard',
            })
          }
        }
      }
    } catch (error) {
      console.error('Error updating standards:', error)
      operationResults.value.push({
        operation: 'Update Standards',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update standards',
      })
    }

    // Always show the results modal if there were any operations
    if (operationResults.value.length > 0) {
      console.log('Showing operation results modal with:', operationResults.value)
      operationResultModal?.show()
    } else {
      console.log('No changes detected, navigating back')
      // If no changes were made, just navigate back
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
    isSubmitting.value = false // Hide loading spinner
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
