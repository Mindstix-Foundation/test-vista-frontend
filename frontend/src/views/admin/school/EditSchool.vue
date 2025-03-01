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
import axiosInstance from '@/config/axios'
import type { SchoolFormData } from '@/models/School'
import * as bootstrap from 'bootstrap'

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

interface SchoolMedium {
  id: number
  instruction_medium_id: number
}

interface SchoolStandard {
  id: number
  standard_id: number
}

const router = useRouter()
const route = useRoute()
const schoolId = computed(() => route.params.id as string)
const isLoading = ref(false)
const schoolData = ref<SchoolFormData | null>(null)
const operationResults = ref<OperationResult[]>([])
let operationResultModal: bootstrap.Modal | null = null

// Add ref for the form component
const schoolFormRef = ref<InstanceType<typeof SchoolFormComponent> | null>(null)

onMounted(() => {
  operationResultModal = new bootstrap.Modal(document.getElementById('operationResultModal')!)
})

const cleanupAndNavigate = () => {
  operationResultModal?.hide()
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
      { data: schoolMediums },
      { data: schoolStandards },
    ] = await Promise.all([
      axiosInstance.get(`/instruction-mediums/board/${school.board_id}`),
      axiosInstance.get(`/standards/board/${school.board_id}`),
      axiosInstance.get(`/school-instruction-mediums/school/${schoolId.value}`),
      axiosInstance.get(`/school-standards/school/${schoolId.value}`),
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
    operationResults.value = []

    // Get current school data to compare changes
    const { data: currentSchool } = await axiosInstance.get(`/schools/${schoolId.value}`)

    // Track what has actually changed
    const hasAddressChanged =
      currentSchool.address.street !== updatedData.address.street ||
      currentSchool.address.postal_code !== updatedData.address.postal_code ||
      currentSchool.address.city_id !== updatedData.address.city_id

    const hasSchoolDetailsChanged =
      currentSchool.name !== updatedData.name ||
      currentSchool.board_id !== updatedData.board_id ||
      currentSchool.principal_name !== updatedData.principal_name ||
      currentSchool.email !== updatedData.email ||
      currentSchool.contact_number !== updatedData.contact_number ||
      currentSchool.alternate_contact_number !== (updatedData.alternate_contact_number || null)

    // Update address if changed
    if (hasAddressChanged) {
      try {
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
        operationResults.value.push({
          operation: 'Update School Details',
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update school details',
        })
      }
    }

    // Update instruction mediums
    try {
      const { data: existingMediums } = await axiosInstance.get(
        `/school-instruction-mediums/school/${schoolId.value}`,
      )
      const existingMediumIds = existingMediums.map(
        (m: { instruction_medium_id: number }) => m.instruction_medium_id,
      )

      const mediumsToAdd = updatedData.mediums.filter((id) => !existingMediumIds.includes(id))
      const mediumsToRemove = existingMediums.filter(
        (medium: { instruction_medium_id: number }) =>
          !updatedData.mediums.includes(medium.instruction_medium_id),
      )

      // Only proceed if there are changes
      if (mediumsToAdd.length > 0 || mediumsToRemove.length > 0) {
        // Process removals
        for (const medium of mediumsToRemove as SchoolMedium[]) {
          try {
            await axiosInstance.delete(`/school-instruction-mediums/${medium.id}`)
            const mediumInfo = schoolFormRef.value?.availableMediums.find(
              (m) => m.id === medium.instruction_medium_id,
            )
            operationResults.value.push({
              operation: `Remove Medium: ${mediumInfo?.name || 'Unknown Medium'}`,
              status: 'success',
            })
          } catch (error) {
            const mediumInfo = schoolFormRef.value?.availableMediums.find(
              (m) => m.id === medium.instruction_medium_id,
            )
            operationResults.value.push({
              operation: `Remove Medium: ${mediumInfo?.name || 'Unknown Medium'}`,
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to remove medium',
            })
          }
        }

        // Process additions
        for (const mediumId of mediumsToAdd) {
          try {
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
      operationResults.value.push({
        operation: 'Update Instruction Mediums',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update instruction mediums',
      })
    }

    // Update standards
    try {
      const { data: existingStandards } = await axiosInstance.get(
        `/school-standards/school/${schoolId.value}`,
      )
      const existingStandardIds = existingStandards.map(
        (s: { standard_id: number }) => s.standard_id,
      )

      const standardsToAdd = updatedData.standards.filter((id) => !existingStandardIds.includes(id))
      const standardsToRemove = existingStandards.filter(
        (standard: { standard_id: number }) =>
          !updatedData.standards.includes(standard.standard_id),
      )

      // Only proceed if there are changes
      if (standardsToAdd.length > 0 || standardsToRemove.length > 0) {
        // Process removals
        for (const standard of standardsToRemove as SchoolStandard[]) {
          try {
            await axiosInstance.delete(`/school-standards/${standard.id}`)
            const standardInfo = schoolFormRef.value?.availableStandards.find(
              (s) => s.id === standard.standard_id,
            )
            operationResults.value.push({
              operation: `Remove Standard: ${standardInfo?.name || 'Unknown Standard'}`,
              status: 'success',
            })
          } catch (error) {
            const standardInfo = schoolFormRef.value?.availableStandards.find(
              (s) => s.id === standard.standard_id,
            )
            operationResults.value.push({
              operation: `Remove Standard: ${standardInfo?.name || 'Unknown Standard'}`,
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to remove standard',
            })
          }
        }

        // Process additions
        for (const standardId of standardsToAdd) {
          try {
            await axiosInstance.post('/school-standards', {
              school_id: parseInt(schoolId.value),
              standard_id: standardId,
            })
            const standardInfo = schoolFormRef.value?.availableStandards.find(
              (s) => s.id === standardId,
            )
            operationResults.value.push({
              operation: `Add Standard: ${standardInfo?.name || 'Unknown Standard'}`,
              status: 'success',
            })
          } catch (error) {
            const standardInfo = schoolFormRef.value?.availableStandards.find(
              (s) => s.id === standardId,
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
      operationResults.value.push({
        operation: 'Update Standards',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update standards',
      })
    }

    // Always show the results modal if there were any operations
    if (operationResults.value.length > 0) {
      operationResultModal?.show()
    } else {
      // If no changes were made, just navigate back
      router.push('/admin/school')
    }
  } catch (error) {
    console.error('Error updating school:', error)
  } finally {
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
