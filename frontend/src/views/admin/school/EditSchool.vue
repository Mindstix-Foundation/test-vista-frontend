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
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
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

  <!-- Board Change Confirmation Modal -->
  <div
    class="modal fade"
    id="boardChangeModal"
    tabindex="-1"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Board Change</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p class="text-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Warning: Changing the board will remove all existing medium and standard mappings.
          </p>
          <p>Are you sure you want to proceed?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmBoardChange">
            Confirm Change
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
import { getApiUrl } from '@/config/api'
import type { SchoolFormData } from '@/models/School'
import * as bootstrap from 'bootstrap'

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

const router = useRouter()
const route = useRoute()
const schoolId = computed(() => route.params.id as string)
const isLoading = ref(false)
const schoolData = ref<SchoolFormData | null>(null)
const operationResults = ref<OperationResult[]>([])

// Add ref for the form component
const schoolFormRef = ref<InstanceType<typeof SchoolFormComponent> | null>(null)

// Add new refs for board change handling
const pendingBoardChange = ref<SchoolFormData | null>(null)
let boardChangeModal: bootstrap.Modal | null = null

// Add cleanup function
const cleanupAndNavigate = () => {
  // Get the modal element
  const modalElement = document.getElementById('operationResultModal')
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement)
    modal?.hide()

    // Remove backdrop manually
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

    // Remove modal-open class and inline styles from body
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
  }

  // Navigate to school list
  router.push('/admin/school')
}

// Add getErrorMessage helper function
const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json()
    return data.message || data.error || 'Unknown error occurred'
  } catch {
    return 'Failed to parse error message'
  }
}

// Initialize board change modal
onMounted(() => {
  const modalElement = document.getElementById('boardChangeModal')
  if (modalElement) {
    boardChangeModal = new bootstrap.Modal(modalElement)
  }
})

// Add board change confirmation functions
const confirmBoardChange = () => {
  if (pendingBoardChange.value) {
    boardChangeModal?.hide()
    handleSchoolUpdate(pendingBoardChange.value)
    pendingBoardChange.value = null
  }
}

// Fetch school data when component mounts
onMounted(async () => {
  try {
    if (!schoolId.value) return

    isLoading.value = true
    const response = await fetch(getApiUrl(`/schools/${schoolId.value}`))
    if (!response.ok) throw new Error('Failed to fetch school data')

    const school = await response.json()
    console.log('Fetched school data:', school)

    // Map the nested data directly
    const mappedBoardMediums = await fetch(
      getApiUrl(`/instruction-mediums/board/${school.board_id}`),
    )
      .then((r) => r.json())
      .then((mediums) =>
        mediums.map((m: { id: number; instruction_medium: string }) => ({
          id: m.id,
          name: m.instruction_medium,
        })),
      )

    const mappedBoardStandards = await fetch(getApiUrl(`/standards/board/${school.board_id}`))
      .then((r) => r.json())
      .then((standards) =>
        standards.map((s: { id: number; name: string }) => ({
          id: s.id,
          name: s.name,
        })),
      )

    // Get the IDs of the school's selected mediums and standards from nested data
    const selectedMediumIds = school.School_Instruction_Medium.map(
      (m: { instruction_medium_id: number }) => m.instruction_medium_id,
    )
    const selectedStandardIds = school.School_Standard.map(
      (s: { standard_id: number }) => s.standard_id,
    )

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
      schoolFormRef.value.boardSearch = school.board.name
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
    // Check if this is a board change that needs confirmation
    if (!pendingBoardChange.value) {
      const currentSchoolResponse = await fetch(getApiUrl(`/schools/${schoolId.value}`))
      const currentSchool = await currentSchoolResponse.json()

      if (currentSchool.board_id !== updatedData.board_id) {
        // Store the update data and show confirmation modal
        pendingBoardChange.value = updatedData
        boardChangeModal?.show()
        return
      }
    }

    isLoading.value = true
    operationResults.value = [] // Reset results
    console.log('Starting school update with data:', updatedData)

    // Compare with existing data to determine what has changed
    const currentSchoolResponse = await fetch(getApiUrl(`/schools/${schoolId.value}`))
    const currentSchool = await currentSchoolResponse.json()
    console.log('Current school data:', currentSchool)

    // Check if board has changed
    const boardChanged = currentSchool.board_id !== updatedData.board_id
    if (boardChanged) {
      console.log('Board has changed, handling board change...')

      // First, delete existing medium and standard mappings
      const [currentMediums, currentStandards] = await Promise.all([
        fetch(getApiUrl(`/school-instruction-mediums/school/${schoolId.value}`)).then((r) =>
          r.json(),
        ),
        fetch(getApiUrl(`/school-standards/school/${schoolId.value}`)).then((r) => r.json()),
      ])

      // Delete all existing medium mappings
      for (const medium of currentMediums) {
        const deleteResponse = await fetch(getApiUrl(`/school-instruction-mediums/${medium.id}`), {
          method: 'DELETE',
        })
        if (!deleteResponse.ok) {
          const errorMessage = await getErrorMessage(deleteResponse)
          console.error('Failed to delete medium mapping:', errorMessage)
          operationResults.value.push({
            operation: `Failed to delete medium mapping for ${medium.instruction_medium?.instruction_medium || ''}`,
            status: 'error',
            message: errorMessage,
          })
          throw new Error('Failed to delete medium mapping')
        }
      }

      // Delete all existing standard mappings
      for (const standard of currentStandards) {
        const deleteResponse = await fetch(getApiUrl(`/school-standards/${standard.id}`), {
          method: 'DELETE',
        })
        if (!deleteResponse.ok) {
          const errorMessage = await getErrorMessage(deleteResponse)
          console.error('Failed to delete standard mapping:', errorMessage)
          operationResults.value.push({
            operation: `Failed to delete standard mapping for ${standard.standard?.name || ''}`,
            status: 'error',
            message: errorMessage,
          })
          throw new Error('Failed to delete standard mapping')
        }
      }

      operationResults.value.push({
        operation: 'Removed existing medium and standard mappings',
        status: 'success',
      })
    }

    // Check if address has changed
    const addressChanged =
      currentSchool.address.street !== updatedData.address.street ||
      currentSchool.address.postal_code !== updatedData.address.postal_code ||
      currentSchool.address.city_id !== updatedData.address.city_id

    if (addressChanged) {
      console.log('Address has changed, updating...')
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
        const errorMessage = await getErrorMessage(addressResponse)
        console.error('Failed to update address:', errorMessage)
        operationResults.value.push({
          operation: 'Failed to update address',
          status: 'error',
          message: errorMessage,
        })
        throw new Error('Failed to update address')
      }

      operationResults.value.push({
        operation: 'Address updated',
        status: 'success',
      })
    }

    // Check if school details have changed
    const schoolDetailsChanged =
      currentSchool.name !== updatedData.name ||
      currentSchool.board_id !== updatedData.board_id ||
      currentSchool.principal_name !== updatedData.principal_name ||
      currentSchool.email !== updatedData.email ||
      currentSchool.contact_number !== updatedData.contact_number ||
      currentSchool.alternate_contact_number !== updatedData.alternate_contact_number

    if (schoolDetailsChanged) {
      console.log('School details have changed, updating...')
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
        const errorMessage = await getErrorMessage(schoolResponse)
        console.error('Failed to update school details:', errorMessage)
        operationResults.value.push({
          operation: 'Failed to update school details',
          status: 'error',
          message: errorMessage,
        })
        throw new Error('Failed to update school')
      }

      operationResults.value.push({
        operation: boardChanged ? 'School details and board updated' : 'School details updated',
        status: 'success',
      })
    }

    // Update school-instruction-medium mappings
    try {
      console.log('Fetching existing instruction mediums...')
      const existingMediumsResponse = await fetch(
        getApiUrl(`/school-instruction-mediums/school/${schoolId.value}`),
      )
      const existingMediums = await existingMediumsResponse.json()
      console.log('Current instruction mediums:', existingMediums)
      console.log('New instruction mediums:', updatedData.mediums)

      // Delete removed mappings
      for (const existingMedium of existingMediums) {
        if (!updatedData.mediums.includes(existingMedium.instruction_medium_id)) {
          console.log('Removing instruction medium:', existingMedium)
          const deleteResponse = await fetch(
            getApiUrl(`/school-instruction-mediums/${existingMedium.id}`),
            {
              method: 'DELETE',
            },
          )
          if (!deleteResponse.ok) {
            const errorMessage = await getErrorMessage(deleteResponse)
            console.error('Failed to remove instruction medium:', errorMessage)
            operationResults.value.push({
              operation: `Failed to remove instruction medium ${existingMedium.instruction_medium?.instruction_medium || ''}`,
              status: 'error',
              message: errorMessage,
            })
          } else {
            operationResults.value.push({
              operation: `Instruction medium ${existingMedium.instruction_medium?.instruction_medium || ''} removed`,
              status: 'success',
            })
          }
        }
      }

      // Add new mappings
      const existingMediumIds = existingMediums.map(
        (m: { instruction_medium_id: number }) => m.instruction_medium_id,
      )
      for (const mediumId of updatedData.mediums) {
        if (!existingMediumIds.includes(mediumId)) {
          console.log('Adding new instruction medium:', mediumId)
          const addResponse = await fetch(getApiUrl('/school-instruction-mediums'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              school_id: parseInt(schoolId.value),
              instruction_medium_id: mediumId,
            }),
          })
          if (!addResponse.ok) {
            const errorMessage = await getErrorMessage(addResponse)
            console.error('Failed to add instruction medium:', errorMessage)
            operationResults.value.push({
              operation: `Failed to add instruction medium`,
              status: 'error',
              message: errorMessage,
            })
          } else {
            operationResults.value.push({
              operation: `New instruction medium added`,
              status: 'success',
            })
          }
        }
      }
    } catch (error) {
      console.error('Error updating instruction mediums:', error)
      operationResults.value.push({
        operation: 'Failed to update instruction mediums',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }

    // Update school-standard mappings
    try {
      console.log('Fetching existing standards...')
      const existingStandardsResponse = await fetch(
        getApiUrl(`/school-standards/school/${schoolId.value}`),
      )
      const existingStandards = await existingStandardsResponse.json()
      console.log('Current standards:', existingStandards)
      console.log('New standards:', updatedData.standards)

      // Delete removed mappings
      for (const existingStandard of existingStandards) {
        if (!updatedData.standards.includes(existingStandard.standard_id)) {
          console.log('Removing standard:', existingStandard)
          const deleteResponse = await fetch(
            getApiUrl(`/school-standards/${existingStandard.id}`),
            {
              method: 'DELETE',
            },
          )
          if (!deleteResponse.ok) {
            const errorMessage = await getErrorMessage(deleteResponse)
            console.error('Failed to remove standard:', errorMessage)
            operationResults.value.push({
              operation: `Failed to remove standard ${existingStandard.standard?.name || ''}`,
              status: 'error',
              message: errorMessage,
            })
          } else {
            operationResults.value.push({
              operation: `Standard ${existingStandard.standard?.name || ''} removed`,
              status: 'success',
            })
          }
        }
      }

      // Add new mappings
      const existingStandardIds = existingStandards.map(
        (s: { standard_id: number }) => s.standard_id,
      )
      for (const standardId of updatedData.standards) {
        if (!existingStandardIds.includes(standardId)) {
          console.log('Adding new standard:', standardId)
          const addResponse = await fetch(getApiUrl('/school-standards'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              school_id: parseInt(schoolId.value),
              standard_id: standardId,
            }),
          })
          if (!addResponse.ok) {
            const errorMessage = await getErrorMessage(addResponse)
            console.error('Failed to add standard:', errorMessage)
            operationResults.value.push({
              operation: `Failed to add standard`,
              status: 'error',
              message: errorMessage,
            })
          } else {
            operationResults.value.push({
              operation: `New standard added`,
              status: 'success',
            })
          }
        }
      }
    } catch (error) {
      console.error('Error updating standards:', error)
      operationResults.value.push({
        operation: 'Failed to update standards',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }

    // Show results modal if there are any changes
    if (operationResults.value.length > 0) {
      const modalElement = document.getElementById('operationResultModal')
      if (modalElement) {
        const resultModal = new bootstrap.Modal(modalElement)
        resultModal.show()
      }
    } else {
      // If no changes were made, just navigate back
      router.push('/admin/school')
    }
  } catch (error) {
    console.error('Error updating school:', error)
    // Show error in modal
    operationResults.value.push({
      operation: 'Error updating school',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    })
    const modalElement = document.getElementById('operationResultModal')
    if (modalElement) {
      const resultModal = new bootstrap.Modal(modalElement)
      resultModal.show()
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}

/* Add to existing styles */
.list-group-item {
  border-left: 4px solid transparent;
}

.list-group-item.text-success {
  border-left-color: #198754;
}

.list-group-item.text-danger {
  border-left-color: #dc3545;
}

.badge {
  min-width: 70px;
}
</style>
