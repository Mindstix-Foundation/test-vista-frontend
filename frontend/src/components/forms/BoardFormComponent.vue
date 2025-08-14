<template>
  <BaseFormLayout 
    :title="isEditMode ? 'Edit Board' : 'Add New Board'" 
    :is-submitting="isSubmitting"
    @submit="handleSubmit"
    @close="goBack"
  >
    <!-- Board Details Section -->
    <div class="col-12 col-sm-10 col-md-8 mb-3">
      <div class="row g-3">
        <div class="col-12">
          <FormInput
            id="boardName"
            label="Board Name"
            v-model="form.name"
            placeholder="Board Name"
            :required="true"
            :is-valid="validationStates.name.valid && !isDuplicateName"
            :is-touched="validationStates.name.touched"
            :error-message="isDuplicateName ? 'This board name already exists' : 'Please enter a board name'"
            next-field-id="boardAbbreviation"
            :format-value="capitalizeFirstLetter"
            @input="(e) => handleFormInputChange(e, 'name')"
            @blur="(e) => handleFormInputBlur(e, 'name')"
          />
        </div>
        <div class="col-12">
          <FormInput
            id="boardAbbreviation"
            label="Board Abbreviation"
            v-model="form.abbreviation"
            placeholder="Board Abbreviation"
            :required="true"
            :is-valid="validationStates.abbreviation.valid && !isDuplicateAbbreviation"
            :is-touched="validationStates.abbreviation.touched"
            :error-message="isDuplicateAbbreviation ? 'This board abbreviation already exists' : 'Please enter a board abbreviation'"
            next-field-id="country"
            :format-value="(value) => value.toUpperCase()"
            @input="(e) => handleFormInputChange(e, 'abbreviation')"
            @blur="(e) => handleFormInputBlur(e, 'abbreviation')"
          />
        </div>
      </div>
    </div>

    <!-- Address Section -->
    <AddressFieldset
      title="Board"
      v-model="form.address"
      :validation-states="{
        country: validationStates.country,
        state: validationStates.state,
        city: validationStates.city,
        address: validationStates.address,
        postalCode: validationStates.postalCode
      }"
      @country-change="handleCountryChange"
      @state-change="handleStateChange"
      @city-change="handleCityChange"
      @update:validation-states="updateAddressValidation"
      class="mb-3"
    />

    <!-- Mediums of Instruction -->
    <DynamicList
      title="Mediums of Instruction"
      v-model="form.mediums"
      :validation-state="validationStates.mediums"
      @update:validation-state="updateMediumsValidation"
      item-label-prefix="Medium"
      placeholder="Enter Medium"
      base-id="medium"
      :format-value="capitalizeFirstLetter"
      class="col-12 col-sm-10 col-md-8 mb-3"
    />

    <!-- Standards and Subjects Section -->
    <div class="row justify-content-center g-3 mb-3">
      <!-- Standards Offered -->
      <DynamicList
        title="Standards Offered"
        v-model="form.standards"
        :validation-state="validationStates.standards"
        @update:validation-state="updateStandardsValidation"
        item-label-prefix="Standard"
        placeholder="Enter Standard"
        base-id="standard"
        :format-value="capitalizeFirstLetter"
        :draggable="true"
        class="col-12 col-sm-5 col-md-4"
      />

      <!-- Subjects Offered -->
      <DynamicList
        title="Subjects Offered"
        v-model="form.subjects"
        :validation-state="validationStates.subjects" 
        @update:validation-state="updateSubjectsValidation"
        item-label-prefix="Subject"
        placeholder="Enter Subject"
        base-id="subject"
        :format-value="capitalizeFirstLetter"
        class="col-12 col-sm-5 col-md-4"
      />
    </div>
  </BaseFormLayout>

  <!-- Save Confirmation Modal -->
  <div
    class="modal fade"
    id="saveConfirmationModal"
    tabindex="-1"
    aria-labelledby="saveConfirmationModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="saveConfirmationModalLabel">Confirm Changes</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to save the following changes?</p>

          <div v-if="changes.length === 0" class="text-muted">
            No changes detected. Click Confirm & Save to proceed.
          </div>

          <div v-else>
            <ul class="list-group">
              <li
                v-for="(change, index) in changes"
                :key="index"
                :class="{
                  'list-group-item': change.entity !== 'separator',
                  'list-group-item-danger': change.type === 'delete',
                  'list-group-item-warning': change.type === 'modify',
                  'list-group-item-success': change.type === 'add',
                  'border-0': change.entity === 'separator',
                }"
              >
                <template v-if="change.entity !== 'separator'">
                  <i
                    :class="{
                      'bi bi-trash': change.type === 'delete',
                      'bi bi-pencil': change.type === 'modify',
                      'bi bi-plus-circle': change.type === 'add',
                    }"
                    class="me-2"
                  ></i>
                  {{ change.message }}
                </template>
                <template v-else>
                  <hr class="my-2" />
                </template>
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-dark" @click="confirmAndSubmit">
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'
import BaseFormLayout from '@/components/common/BaseFormLayout.vue'
import AddressFieldset from '@/components/common/AddressFieldset.vue'
import type {
  CreateBoardDto,
  CreateAddressDto,
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
} from '@/models/Board'
import DynamicList from '@/components/common/DynamicList.vue'
import FormInput from '@/components/common/FormInput.vue'

interface Country {
  id: number
  name: string
}

interface State {
  id: number
  name: string
  country_id: number
}

interface City {
  id: number
  name: string
  state_id: number
}

export interface MediumOfInstruction {
  id?: number
  name: string
  board_id?: string
  instruction_medium: string
  created_by: number
  updated_by: number
}

export interface BoardStandard {
  id?: number
  name: string
  board_id?: string
  created_by?: number
  updated_by?: number
}

export interface BoardSubject {
  id?: number
  name: string
  board_id?: string
  created_by?: number
  updated_by?: number
}

interface AddressData {
  street: string
  postal_code: string
  city_id: number
  state_id: number
  country_id: number
}

interface BoardFormData {
  name: string
  abbreviation: string
  address: AddressData
  mediums: { id?: number; name: string; board_id?: number }[]
  standards: { id?: number; name: string; board_id?: number; sequence_number?: number }[]
  subjects: { id?: number; name: string; board_id?: number }[]
}

// Export the interface for use in other components
export type BoardForm = {
  address: AddressData
  board: {
    name: string
    abbreviation: string
    address_id: number
  }
  mediums: { name: string; board_id: number }[]
  standards: { name: string; board_id: number }[]
  subjects: { name: string; board_id: number }[]
}

const props = defineProps<{
  isEditMode: boolean
  boardId?: string
}>()

const router = useRouter()
const isSubmitting = ref(false)

// Form data
const form = ref<BoardFormData>({
  name: '',
  abbreviation: '',
  address: {
    street: '',
    postal_code: '',
    city_id: 0,
    state_id: 0,
    country_id: 0,
  },
  mediums: [{ id: undefined, name: '', board_id: 0 }],
  standards: [{ id: undefined, name: '', board_id: 0, sequence_number: 1 }],
  subjects: [{ id: undefined, name: '', board_id: 0 }],
})

// Add validation state refs
const validationStates = ref({
  name: { valid: false, touched: false },
  abbreviation: { valid: false, touched: false },
  country: { valid: false, touched: false },
  state: { valid: false, touched: false },
  city: { valid: false, touched: false },
  address: { valid: false, touched: false },
  postalCode: { valid: false, touched: false },
  mediums: { valid: false, touched: false },
  standards: { valid: false, touched: false },
  subjects: { valid: false, touched: false },
})

// Add new refs for tracking duplicate status
const isDuplicateName = ref(false)
const isDuplicateAbbreviation = ref(false)

// Add necessary refs and types
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

// Add new interfaces for change tracking
interface Change {
  type: 'delete' | 'modify' | 'add'
  message: string
  entity: 'medium' | 'standard' | 'subject' | 'board' | 'separator'
  data: {
    id?: number
    name?: string
    old?: { id: number; name: string }
    new?: { id?: number; name: string }
  }
}

// Add ref for tracking changes
const changes = ref<Change[]>([])

// Add these interfaces near the top with other interfaces
interface BaseItem {
  id: number
  name?: string
  instruction_medium?: string
}

interface FormItem {
  id?: number
  name: string
}

// Add this function before compareLocationIds
const fetchLocationDetails = async (
  id: number,
  type: 'city' | 'state' | 'country',
): Promise<string> => {
  try {
    const { data } = await axiosInstance.get(`/${type}s/${id}`)
    return data.name || ''
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error)
    return ''
  }
}

const fetchCurrentBoardData = async (boardId: number) => {
  // ✅ Use single board-management endpoint instead of 3 separate API calls
  const { data: boardData } = await axiosInstance.get(`/board-management/${boardId}`)
  
  return {
    mediums: boardData.instruction_mediums,
    standards: boardData.standards,
    subjects: boardData.subjects,
    board: boardData.board,
    address: boardData.address
  }
}

const fetchBoardData = async (boardId: number) => {
  try {
    isLoading.value = true
    console.log('Fetching board data for ID:', boardId)

    // ✅ Use the optimized board-management endpoint instead of /boards/{id}
    const { data: boardData } = await axiosInstance.get(`/board-management/${boardId}`)
    console.log('Board data received:', boardData)

    // ✅ Emit the board data to parent component (EditBoard.vue)
    emit('boardDataLoaded', boardData)

    // ✅ Transform board-management response structure
    const transformedData = {
      id: boardData.board.id,
      name: boardData.board.name,
      abbreviation: boardData.board.abbreviation,
      address_id: boardData.board.address_id,
      address: boardData.address,
      instruction_mediums: boardData.instruction_mediums,
      standards: boardData.standards,
      subjects: boardData.subjects,
    }

    // Update form with board data, ensuring proper type conversion
    form.value = {
      name: transformedData.name,
      abbreviation: transformedData.abbreviation,
      address: {
        street: transformedData.address?.street || '',
        postal_code: transformedData.address?.postal_code || '',
        city_id: transformedData.address?.city_id ? Number(transformedData.address.city_id) : 0,
        state_id: transformedData.address?.city?.state_id ? Number(transformedData.address.city.state_id) : 0,
        country_id: transformedData.address?.city?.state?.country_id ? Number(transformedData.address.city.state.country_id) : 0,
      },
      mediums: transformedData.instruction_mediums.map(
        (m: { id: number; instruction_medium: string }) => ({
          id: m.id,
          name: m.instruction_medium,
          board_id: Number(boardId),
        }),
      ),
      // Use standards already sorted by sequence_number from API
      standards: transformedData.standards.map((s: { id: number; name: string; sequence_number: number }) => ({
        id: s.id,
        name: s.name,
        board_id: Number(boardId),
        sequence_number: Number(s.sequence_number) // Ensure it's a number
      })).sort((a: { sequence_number?: number }, b: { sequence_number?: number }) => Number(a.sequence_number ?? 0) - Number(b.sequence_number ?? 0)),
      subjects: transformedData.subjects.map((s: { id: number; name: string }) => ({
        id: s.id,
        name: s.name,
        board_id: Number(boardId),
      })),
    }

    // Add empty items with proper number types
    form.value.mediums.push({ name: '', board_id: Number(boardId) })
    form.value.standards.push({
      name: '',
      board_id: Number(boardId),
      sequence_number: form.value.standards.length > 0 ?
        Math.max(...form.value.standards.map(s => Number(s.sequence_number ?? 0))) + 1 : 1
    })
    form.value.subjects.push({ name: '', board_id: Number(boardId) })

    // Update validation states
    Object.keys(validationStates.value).forEach((key) => {
      validationStates.value[key as keyof typeof validationStates.value].valid = true
      validationStates.value[key as keyof typeof validationStates.value].touched = true
    })
  } catch (error) {
    console.error('Error fetching board data:', error)
    errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch board data'
  } finally {
    isLoading.value = false
  }
}

// Update onMounted to fetch initial countries
onMounted(async () => {
  try {
    if (props.isEditMode && props.boardId) {
      await fetchBoardData(parseInt(props.boardId))
    }
  } catch (error) {
    console.error('Error in component initialization:', error)
  }
})

// Add type for input field names
type InputField = 'name' | 'abbreviation';

// Add generic input handlers for FormInput component
const handleFormInputChange = (e: Event, field: InputField) => {
  // Update validation state
  validationStates.value[field].touched = true
  validationStates.value[field].valid = (e.target as HTMLInputElement).value.trim().length > 0

  // Reset duplicate status while typing
  if (field === 'name') {
    isDuplicateName.value = false
  } else if (field === 'abbreviation') {
    isDuplicateAbbreviation.value = false
  }
}

const handleFormInputBlur = async (e: Event, field: InputField) => {
  const value = (e.target as HTMLInputElement).value.trim()
  if (!value) return

  try {
    const response = await axiosInstance.get('/boards')
    const boards = response.data.data || []

    if (field === 'name') {
      const isDuplicate = boards.some(
        (board: { id: number; name: string }) =>
          board.name.toLowerCase() === value.toLowerCase() &&
          (!props.boardId || board.id !== parseInt(props.boardId)),
      )
      isDuplicateName.value = isDuplicate
      validationStates.value.name.valid = !isDuplicate
    } else if (field === 'abbreviation') {
      const isDuplicate = boards.some(
        (board: { id: number; abbreviation: string }) =>
          board.abbreviation.toLowerCase() === value.toLowerCase() &&
          (!props.boardId || board.id !== parseInt(props.boardId)),
      )
      isDuplicateAbbreviation.value = isDuplicate
      validationStates.value.abbreviation.valid = !isDuplicate
    }
  } catch (error) {
    console.error(`Error checking duplicate ${field}:`, error)
  }
}

// Update the type definitions for the change handlers
const handleCountryChange = async (country: Country | null) => {
  try {
    console.log('Handling country change from AddressFieldset...')
    validationStates.value.country.valid = !!country
    validationStates.value.country.touched = true
  } catch (error) {
    console.error('Error in handleCountryChange:', error)
  }
}

const handleStateChange = async (state: State | null) => {
  try {
    console.log('Handling state change from AddressFieldset...')
    validationStates.value.state.valid = !!state
    validationStates.value.state.touched = true
  } catch (error) {
    console.error('Error in handleStateChange:', error)
  }
}

const handleCityChange = (city: City | null) => {
  console.log('Handling city change from AddressFieldset...')
  validationStates.value.city.valid = !!city
  validationStates.value.city.touched = true
}

// Add a method to handle validation state updates from AddressFieldset
const updateAddressValidation = (validationState: {
  country: { valid: boolean; touched: boolean }
  state: { valid: boolean; touched: boolean }
  city: { valid: boolean; touched: boolean }
  address: { valid: boolean; touched: boolean }
  postalCode: { valid: boolean; touched: boolean }
}) => {
  validationStates.value.country = validationState.country
  validationStates.value.state = validationState.state
  validationStates.value.city = validationState.city
  validationStates.value.address = validationState.address
  validationStates.value.postalCode = validationState.postalCode
}

// Update the capitalize function to handle multiple words
const capitalizeFirstLetter = (str: string) => {
  if (!str) return str
  return str
    .split(' ')
    .map((word) => {
      // Only capitalize the first letter, leave the rest as is
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

// Modify handleSubmit to show confirmation modal only in edit mode
const handleSubmit = async () => {
  // Mark all fields as touched to trigger validation display
  Object.keys(validationStates.value).forEach((key) => {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  })

  // Force a DOM update before checking for invalid fields
  await nextTick()

  // Check if form is valid
  if (!isFormValid.value) {
    const firstInvalidField = document.querySelector('.is-invalid') as HTMLElement
    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstInvalidField.focus()
    }
    return
  }

  if (props.isEditMode) {
    // Calculate changes and show confirmation modal only in edit mode
    await calculateChanges()
    const modal = new Modal(document.getElementById('saveConfirmationModal') as HTMLElement)
    modal.show()
  } else {
    // In add mode, directly submit the form
    await confirmAndSubmit()
  }
}

const compareLocationIds = async (
  currentId: number,
  newId: number,
  type: 'city' | 'state' | 'country',
  locationData?: any // ✅ Pass location data from board-management response
): Promise<string | null> => {
  if (currentId === newId) return null
  if (type !== 'city' && (!currentId || !newId)) return null

  // ✅ Use location data from board-management response when available
  let oldName = ''
  let newName = ''
  
  if (locationData) {
    // Extract names from nested location data
    if (type === 'city') {
      oldName = locationData.city?.name || ''
    } else if (type === 'state') {
      oldName = locationData.city?.state?.name || ''
    } else if (type === 'country') {
      oldName = locationData.city?.state?.country?.name || ''
    }
  }
  
  // If we don't have the old name from location data, fetch it
  if (!oldName) {
    oldName = await fetchLocationDetails(currentId, type)
  }
  
  // Always fetch new name since user is changing it
  newName = await fetchLocationDetails(newId, type)

  return `${type.charAt(0).toUpperCase() + type.slice(1)}: ${oldName} → ${newName}`
}

const compareAddressChanges = async (
  currentAddress: AddressData,
  formAddress: typeof form.value.address,
): Promise<string[]> => {
  const changes: string[] = []

  if (currentAddress.street !== formAddress.street) {
    changes.push(`Street: ${currentAddress.street} → ${formAddress.street}`)
  }
  if (currentAddress.postal_code !== formAddress.postal_code) {
    changes.push(`Postal Code: ${currentAddress.postal_code} → ${formAddress.postal_code}`)
  }

  // ✅ Pass currentAddress as location data to reduce API calls
  const locationChanges = await Promise.all([
    compareLocationIds(currentAddress.city_id, formAddress.city_id, 'city', currentAddress),
    compareLocationIds(currentAddress.state_id, formAddress.state_id, 'state', currentAddress),
    compareLocationIds(currentAddress.country_id, formAddress.country_id, 'country', currentAddress),
  ])

  return [...changes, ...locationChanges.filter((change): change is string => change !== null)]
}

const compareBasicBoardInfo = (
  currentBoard: { name?: string; abbreviation?: string },
  formData: typeof form.value,
  boardId: number,
): Change[] => {
  const changes: Change[] = []

  // Compare name
  if (currentBoard.name && formData.name.trim() !== currentBoard.name.trim()) {
    changes.push({
      type: 'modify',
      message: `Modify board name: ${currentBoard.name} → ${formData.name}`,
      entity: 'board',
      data: { old: { id: boardId, name: currentBoard.name }, new: { name: formData.name } },
    })
  }

  // Compare abbreviation
  if (
    currentBoard.abbreviation &&
    formData.abbreviation.trim() !== currentBoard.abbreviation.trim()
  ) {
    changes.push({
      type: 'modify',
      message: `Modify board abbreviation: ${currentBoard.abbreviation} → ${formData.abbreviation}`,
      entity: 'board',
      data: {
        old: { id: boardId, name: currentBoard.abbreviation },
        new: { name: formData.abbreviation },
      },
    })
  }

  return changes
}

const compareItems = <T extends BaseItem>(
  currentItems: T[],
  formItems: FormItem[],
  entityType: 'medium' | 'standard' | 'subject',
): Change[] => {
  const changes: Change[] = []
  const validFormItems = formItems.filter((item) => item.name.trim())

  // Find deleted items
  currentItems.forEach((currentItem) => {
    const formItem = validFormItems.find((item) => item.id === currentItem.id)
    if (!formItem) {
      changes.push({
        type: 'delete',
        message: `Delete ${entityType}: ${currentItem.instruction_medium ?? currentItem.name ?? ''}`,
        entity: entityType,
        data: currentItem,
      })
    }
  })

  // Find modified and added items
  validFormItems.forEach((formItem) => {
    const currentItem = currentItems.find((item) => item.id === formItem.id)
    if (currentItem) {
      const currentName = currentItem.instruction_medium ?? currentItem.name ?? ''
      if (currentName !== formItem.name) {
        changes.push({
          type: 'modify',
          message: `Modify ${entityType}: ${currentName} → ${formItem.name}`,
          entity: entityType,
          data: {
            old: { id: currentItem.id, name: currentName },
            new: { id: formItem.id, name: formItem.name },
          },
        })
      }
    } else {
      changes.push({
        type: 'add',
        message: `Add ${entityType}: ${formItem.name}`,
        entity: entityType,
        data: formItem,
      })
    }
  })

  return changes
}

// Helper function to check if two arrays have the same order
const arraysHaveSameOrder = <T>(arr1: T[], arr2: T[]): boolean => {
  if (arr1.length !== arr2.length) return false

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }

  return true
}

const calculateChanges = async () => {
  changes.value = []

  if (!props.isEditMode || !props.boardId) return

  const boardId = parseInt(props.boardId)

  // ✅ Get all current data with single API call instead of multiple calls
  const { mediums, standards, subjects, board: currentBoard, address: currentAddress } = await fetchCurrentBoardData(boardId)

  // Compare basic board info
  const boardChanges = compareBasicBoardInfo(currentBoard, form.value, boardId)
  changes.value.push(...boardChanges)

  // ✅ Compare address using data from single API call (no separate /addresses call needed)
  if (currentAddress) {
    const addressChanges = await compareAddressChanges(currentAddress, form.value.address)

    if (addressChanges.length > 0) {
      changes.value.push({
        type: 'modify',
        message: 'Board address details modified:\n' + addressChanges.join('\n'),
        entity: 'board',
        data: {
          old: { id: currentAddress.id, name: 'Previous Address' },
          new: { name: 'New Address' },
        },
      })
    }
  }

  // Check for standards reordering
  if (standards.length > 1) {
    const validFormStandards = form.value.standards.filter(s => s.name.trim() && s.id)

    // Type the standards array properly
    const typedStandards = standards as Array<{ id: number; name: string }>

    // Get only standards that exist in both current and form
    const commonStandardIds = typedStandards
      .filter(current => validFormStandards.some(form => form.id === current.id))
      .map(item => item.id)

    if (commonStandardIds.length > 1) {
      // Get the order of these standards in the form
      const formOrder = validFormStandards
        .filter(item => commonStandardIds.includes(item.id as number))
        .map(item => item.id)

      // Get the order of these standards in the current data
      const currentOrder = typedStandards
        .filter(item => commonStandardIds.includes(item.id))
        .map(item => item.id)

      // Check if the order has changed
      const orderChanged = !arraysHaveSameOrder(currentOrder, formOrder)

      if (orderChanged) {
        changes.value.push({
          type: 'modify',
          message: 'Standards reordered',
          entity: 'standard',
          data: {},
        })
      }
    }
  }

  // Add separator if there are changes
  if (changes.value.length > 0) {
    changes.value.push({
      type: 'modify',
      message: '---',
      entity: 'separator',
      data: {},
    })
  }

  // ✅ Compare related items using data from single API call
  changes.value.push(
    ...compareItems(mediums, form.value.mediums, 'medium'),
    ...compareItems(standards, form.value.standards, 'standard'),
    ...compareItems(subjects, form.value.subjects, 'subject'),
  )
}

// Helper function to handle address updates in edit mode
const handleAddressUpdate = async (formattedAddress: {
  street: string;
  postal_code: string;
  city_id: number;
}): Promise<number> => {
  if (!props.isEditMode || !props.boardId) return 0;
  
  // ✅ Use board-management endpoint instead of /boards/{id}
  const { data: boardData } = await axiosInstance.get(`/board-management/${props.boardId}`);
  const addressId = boardData.board.address_id;
  
  if (!addressId) return 0;
  
  // ✅ NO LONGER MAKING SEPARATE ADDRESS API CALL
  // The board-management endpoint will handle the address update
  console.log('Address will be updated via board-management endpoint:', formattedAddress);
  return addressId; // Return existing address ID
}

// Helper function to prepare form data for submission
const prepareFormData = (addressId: number, formattedAddress: {
  street: string;
  postal_code: string;
  city_id: number;
}) => {
  const boardId = props.boardId ? parseInt(props.boardId) : 0;
  
  // Update sequence numbers for standards
  form.value.standards.forEach((standard, idx) => {
    if (standard.name.trim()) {
      standard.sequence_number = idx + 1;
    }
  });
  
  return {
    address: formattedAddress,
    board: {
      name: form.value.name.trim(),
      abbreviation: form.value.abbreviation.trim(),
      address_id: addressId ?? 0,
    },
    // 🛡️ FIX: Include IDs for mediums when they exist
    mediums: form.value.mediums
      .filter((m) => m.name.trim())
      .map((m) => ({
        id: m.id, // ✅ Include ID for existing mediums
        name: m.name.trim(),
        board_id: boardId,
      })),
    // 🛡️ FIX: Include IDs for standards when they exist
    standards: form.value.standards
      .filter((s) => s.name.trim())
      .map((s, index) => ({
        id: s.id, // ✅ Include ID for existing standards
        name: s.name.trim(),
        board_id: boardId,
        sequence_number: index + 1,
      })),
    // 🛡️ FIX: Include IDs for subjects when they exist
    subjects: form.value.subjects
      .filter((s) => s.name.trim())
      .map((s) => ({
        id: s.id, // ✅ Include ID for existing subjects
        name: s.name.trim(),
        board_id: boardId,
      })),
  };
}

// Update confirmAndSubmit to handle both add and edit modes
const confirmAndSubmit = async () => {
  try {
    isSubmitting.value = true

    if (props.isEditMode) {
      const modal = Modal.getInstance(
        document.getElementById('saveConfirmationModal') as HTMLElement,
      )
      modal?.hide()
    }

    const formattedAddress = {
      street: form.value.address.street?.trim() || '',
      postal_code: form.value.address.postal_code?.trim() || '',
      city_id: parseInt(String(form.value.address.city_id)),
    }

    // Get the existing address ID (no separate update needed)
    const addressId = await handleAddressUpdate(formattedAddress);
    
    // Prepare and emit form data - the board-management endpoint will handle all updates
    emit('submit', prepareFormData(addressId, formattedAddress));
  } 
  catch (error) {
    console.error('Error submitting form:', error)
    alert('An error occurred while saving the board. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Define emits with the correct type
const emit = defineEmits<{
  (e: 'submit', data: {
    address: CreateAddressDto
    board: CreateBoardDto
    mediums: CreateInstructionMediumDto[]
    standards: CreateStandardDto[]
    subjects: CreateSubjectDto[]
  }): void
  (e: 'boardDataLoaded', data: any): void // ✅ New emit for board data
}>()

const goBack = () => {
  router.push('/admin/board')
}

// Add missing computed property
const isFormValid = computed(() => {
  return Object.values(validationStates.value).every((state) => state.valid)
})

// Add validation methods for DynamicList components
const updateMediumsValidation = (validationState: { valid: boolean; touched: boolean }) => {
  validationStates.value.mediums = validationState
}

const updateStandardsValidation = (validationState: { valid: boolean; touched: boolean }) => {
  validationStates.value.standards = validationState
}

const updateSubjectsValidation = (validationState: { valid: boolean; touched: boolean }) => {
  validationStates.value.subjects = validationState
}
</script>

<style scoped>
/* Main container styles */
.container-fluid {
  min-height: 100%;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  padding: 1rem;
}

/* Form styles */
form {
  min-height: min-content;
  height: auto;
}

/* Ensure content is properly spaced */
.row {
  margin-bottom: 1rem;
}

/* Ensure dropdowns don't cause horizontal scrolling */
.dropdown-menu {
  display: none;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  width: 100%;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.dropdown-menu.show {
  display: block !important;
}

.dropdown-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  display: block;
  color: #212529;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.active {
  background-color: #212529;
  color: white;
}

.form-floating .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
}

/* Remove scrollbar from textarea while keeping functionality */
textarea {
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
