<template>
  <div class="container mt-3">
    <div class="row g-2 justify-content-end">
      <button class="btn btn-close" @click="goBack" aria-label="Close"></button>
    </div>
    <div class="row justify-content-center align-items-center my-4">
      <div class="col col-12 col-sm-10 col-md-8">
        <h4 class="text-left fw-bolder text-uppercase">
          {{ isEditMode ? 'Edit Board' : 'Add New Board' }}
        </h4>
      </div>
    </div>
    <hr />

    <div id="form-container" class="row mt-4 justify-content-center">
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row gx-2 justify-content-center">
          <!-- Board Details Section -->
          <div class="col-12 col-sm-10 col-md-8 mb-2">
            <div class="row g-3">
              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        (!validationStates.name.valid && validationStates.name.touched) ||
                        isDuplicateName,
                      'is-valid': validationStates.name.valid && !isDuplicateName,
                    }"
                    id="boardName"
                    v-model="form.name"
                    @input="(e) => handleInput(e, 'name')"
                    @blur="(e) => handleBlur(e, 'name')"
                    placeholder="Board Name"
                    @keydown="(e) => handleEnterKey(e, 'boardAbbreviation')"
                  />
                  <label for="boardName">Board Name <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">
                    {{
                      isDuplicateName
                        ? 'This board name already exists'
                        : 'Please enter a board name'
                    }}
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        (!validationStates.abbreviation.valid &&
                          validationStates.abbreviation.touched) ||
                        isDuplicateAbbreviation,
                      'is-valid': validationStates.abbreviation.valid && !isDuplicateAbbreviation,
                    }"
                    id="boardAbbreviation"
                    v-model="form.abbreviation"
                    @input="(e) => handleInput(e, 'abbreviation')"
                    @blur="(e) => handleBlur(e, 'abbreviation')"
                    placeholder="Board Abbreviation"
                    @keydown="(e) => handleEnterKey(e, 'country')"
                  />
                  <label for="boardAbbreviation"
                    >Board Abbreviation <span class="text-danger">*</span></label
                  >
                  <div class="invalid-feedback">
                    {{
                      isDuplicateAbbreviation
                        ? 'This board abbreviation already exists'
                        : 'Please enter a board abbreviation'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Section -->
          <fieldset class="border p-3 rounded col col-12 col-sm-10 col-md-8 mb-2">
            <legend class="float-none w-auto px-2">Board Address &nbsp;</legend>
            <div class="row g-3 justify-content-center">
              <!-- Country -->
              <div class="col-12 col-xl-4">
                <SearchableDropdown
                  id="country"
                  label="Country"
                  placeholder="Search Country"
                  :items="countries"
                  v-model="selectedCountry"
                  :required="true"
                  :class="{
                    'is-invalid': !validationStates.country.valid && validationStates.country.touched,
                    'is-valid': validationStates.country.valid,
                  }"
                  nextFieldId="state"
                  @change="handleCountryChange"
                />
                <div class="invalid-feedback">Please select a country</div>
              </div>

              <!-- State -->
              <div class="col-12 col-xl-4">
                <SearchableDropdown
                  id="state"
                  label="State"
                  placeholder="Search State"
                  :items="states"
                  v-model="selectedState"
                  :required="true"
                  :disabled="!form.address.country_id"
                  :class="{
                    'is-invalid': !validationStates.state.valid && validationStates.state.touched,
                    'is-valid': validationStates.state.valid,
                  }"
                  nextFieldId="city"
                  @change="handleStateChange"
                />
                <div class="invalid-feedback">Please select a state</div>
              </div>

              <!-- City -->
              <div class="col-12 col-xl-4">
                <SearchableDropdown
                  id="city"
                  label="City"
                  placeholder="Search City"
                  :items="cities"
                  v-model="selectedCity"
                  :required="true"
                  :disabled="!form.address.state_id"
                  :class="{
                    'is-invalid': !validationStates.city.valid && validationStates.city.touched,
                    'is-valid': validationStates.city.valid,
                  }"
                  nextFieldId="address"
                  @change="handleCityChange"
                />
                <div class="invalid-feedback">Please select a city</div>
              </div>
            </div>

            <!-- Street Address -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="form-floating">
                  <textarea
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.address.valid && validationStates.address.touched,
                      'is-valid': validationStates.address.valid,
                    }"
                    id="address"
                    v-model="form.address.street"
                    placeholder="Address"
                    style="min-height: 100px"
                    @input="
                      (e) => {
                        autoResizeTextarea(e)
                        validationStates.address.touched = true
                        validationStates.address.valid = form.address.street.trim().length > 0
                      }
                    "
                    @keydown="(e) => handleEnterKey(e, 'postalCode')"
                  ></textarea>
                  <label for="address">Address <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please enter an address.</div>
                </div>
              </div>
            </div>

            <!-- Postal Code -->
            <div class="row mt-4">
              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.postalCode.valid && validationStates.postalCode.touched,
                      'is-valid': validationStates.postalCode.valid,
                    }"
                    id="postalCode"
                    placeholder="Postal Code"
                    v-model="form.address.postal_code"
                    @input="
                      (e) => {
                        validationStates.postalCode.touched = true
                        validationStates.postalCode.valid =
                          form.address.postal_code.trim().length > 0
                      }
                    "
                    @keydown="(e) => handleEnterKey(e, 'medium0')"
                  />
                  <label for="postalCode">Postal Code <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please enter a postal code.</div>
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Mediums of Instruction -->
          <fieldset class="border p-2 rounded col col-12 col-sm-10 col-md-8 mb-3">
            <legend class="float-none w-auto">
              Mediums of Instruction <span class="text-danger">*</span>
            </legend>
            <div class="row g-2">
              <div v-for="(medium, index) in form.mediums" :key="index" class="col-12">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-valid':
                        medium.name.trim().length > 0 && !isDuplicateMedium(medium.name, index),
                      'is-invalid':
                        (!validationStates.mediums.valid && validationStates.mediums.touched) ||
                        (medium.name.trim().length > 0 && isDuplicateMedium(medium.name, index)),
                    }"
                    :id="'medium' + index"
                    v-model="medium.name"
                    @keydown="(e) => handleMediumInput(index, e)"
                    @focus="focusedMediumIndex = index"
                    @blur="handleMediumBlur(index)"
                    @input="
                      (e) => {
                        medium.name = capitalizeFirstLetter((e.target as HTMLInputElement).value)
                        handleMediumInput(index)
                        validationStates.mediums.touched = true
                      }
                    "
                    placeholder="Enter Medium"
                  />
                  <label :for="'medium' + index">Medium Name</label>
                  <div class="invalid-feedback">
                    {{
                      isDuplicateMedium(medium.name, index)
                        ? 'This medium already exists'
                        : 'At least one medium is required'
                    }}
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Standards and Subjects Section -->

          <div class="row justify-content-center g-2">
            <!-- Standards Offered -->

            <fieldset class="border p-2 rounded col col-12 col-sm-5 col-md-4 mb-2">
              <legend class="float-none w-auto">
                Standards Offered <span class="text-danger">*</span>
              </legend>
              <div class="row g-2">
                <div
                  v-for="(standard, index) in form.standards"
                  :key="index"
                  class="col-12 standard-item"
                  draggable="true"
                  @dragstart="dragStart($event, index)"
                  @dragover.prevent
                  @dragenter.prevent="dragEnter($event, index)"
                  @dragleave.prevent
                  @drop="drop($event, index)"
                  @dragend="dragEnd"
                >
                  <div class="d-flex align-items-center">
                    <div class="drag-handle me-2" title="Drag to reorder">
                      <i class="bi bi-grip-vertical"></i>
                    </div>
                    <div class="form-floating flex-grow-1">
                      <input
                        type="text"
                        class="form-control"
                        :class="{
                          'is-valid':
                            standard.name.trim().length > 0 &&
                            !isDuplicateStandard(standard.name, index),
                          'is-invalid':
                            (!validationStates.standards.valid &&
                              validationStates.standards.touched) ||
                            (standard.name.trim().length > 0 &&
                              isDuplicateStandard(standard.name, index)),
                        }"
                        :id="'standard' + index"
                        v-model="standard.name"
                        @keydown="(e) => handleStandardInput(index, e)"
                        @focus="focusedStandardIndex = index"
                        @blur="handleStandardBlur(index)"
                        @input="
                          (e) => {
                            standard.name = capitalizeFirstLetter(
                              (e.target as HTMLInputElement).value,
                            )
                            handleStandardInput(index)
                            validationStates.standards.touched = true
                          }
                        "
                        placeholder="Enter Standard"
                      />
                      <label :for="'standard' + index">Standard Name</label>
                      <div class="invalid-feedback">
                        {{
                          isDuplicateStandard(standard.name, index)
                            ? 'This standard already exists'
                            : 'At least one standard is required'
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

            <!-- Subjects Offered -->

            <fieldset class="border p-2 rounded col col-12 col-sm-5 col-md-4 mb-2 ms-2">
              <legend class="float-none w-auto">
                Subjects Offered <span class="text-danger">*</span>
              </legend>
              <div class="row g-2">
                <div v-for="(subject, index) in form.subjects" :key="index" class="col-12">
                  <div class="form-floating">
                    <input
                      type="text"
                      class="form-control"
                      :class="{
                        'is-valid':
                          subject.name.trim().length > 0 &&
                          !isDuplicateSubject(subject.name, index),
                        'is-invalid':
                          (!validationStates.subjects.valid && validationStates.subjects.touched) ||
                          (subject.name.trim().length > 0 &&
                            isDuplicateSubject(subject.name, index)),
                      }"
                      :id="'subject' + index"
                      v-model="subject.name"
                      @keydown="(e) => handleSubjectInput(index, e)"
                      @focus="focusedSubjectIndex = index"
                      @blur="handleSubjectBlur(index)"
                      @input="
                        (e) => {
                          subject.name = capitalizeFirstLetter((e.target as HTMLInputElement).value)
                          handleSubjectInput(index)
                          validationStates.subjects.touched = true
                        }
                      "
                      placeholder="Enter Subject"
                    />
                    <label :for="'subject' + index">Subject Name</label>
                    <div class="invalid-feedback">
                      {{
                        isDuplicateSubject(subject.name, index)
                          ? 'This subject already exists'
                          : 'At least one subject is required'
                      }}
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>

          <!-- Submit Button -->
          <div class="col col-12 col-sm-10 col-md-8 mt-4">
            <div class="text-center">
              <button type="submit" class="btn btn-dark" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                Save
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>

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
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import type { Item } from '@/components/common/SearchableDropdown.vue'
import type {
  CreateBoardDto,
  CreateAddressDto,
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
} from '@/models/Board'

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

// Reference data
const countries = ref<Country[]>([])
const states = ref<State[]>([])
const cities = ref<City[]>([])

// Add new refs for selected items
const selectedCountry = ref<Country | null>(null)
const selectedState = ref<State | null>(null)
const selectedCity = ref<City | null>(null)

// Add these refs to track which field has focus
const focusedMediumIndex = ref(-1)
const focusedStandardIndex = ref(-1)
const focusedSubjectIndex = ref(-1)

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

// Add drag and drop state variables
const draggedItemIndex = ref<number | null>(null)
const dragOverItemIndex = ref<number | null>(null)

// Add drag and drop functions
const dragStart = (event: DragEvent, index: number) => {
  if (event.dataTransfer) {
    draggedItemIndex.value = index
    event.dataTransfer.effectAllowed = 'move'
    // Add some transparency to the dragged item
    const target = event.target as HTMLElement
    setTimeout(() => {
      if (target && target.classList) {
        target.classList.add('dragging')
      }
    }, 0)
  }
}

const dragEnter = (event: DragEvent, index: number) => {
  dragOverItemIndex.value = index
  const target = event.target as HTMLElement
  const standardItem = target.closest('.standard-item')
  if (standardItem) {
    standardItem.classList.add('drag-over')
  }
}

const dragEnd = () => {
  const items = document.querySelectorAll('.standard-item')
  items.forEach(item => {
    item.classList.remove('dragging', 'drag-over')
  })
  draggedItemIndex.value = null
  dragOverItemIndex.value = null
}

const drop = (event: DragEvent, dropIndex: number) => {
  event.preventDefault()

  if (draggedItemIndex.value === null || draggedItemIndex.value === dropIndex) {
    return
  }

  // Get the dragged item
  const draggedItem = { ...form.value.standards[draggedItemIndex.value] }

  // Remove the dragged item from its original position
  form.value.standards.splice(draggedItemIndex.value, 1)

  // Insert the dragged item at the new position
  form.value.standards.splice(dropIndex, 0, draggedItem)

  // Update sequence numbers for all standards
  form.value.standards.forEach((standard, idx) => {
    standard.sequence_number = idx + 1
  })

  // Clear drag state
  dragEnd()
}

const fetchBoardData = async (boardId: number) => {
  try {
    isLoading.value = true
    console.log('Fetching board data for ID:', boardId)

    const { data: boardData } = await axiosInstance.get(`/boards/${boardId}`)
    console.log('Board data received:', boardData)

    // Update form with board data, ensuring proper type conversion
    form.value = {
      name: boardData.name,
      abbreviation: boardData.abbreviation,
      address: {
        street: boardData.address?.street || '',
        postal_code: boardData.address?.postal_code || '',
        city_id: boardData.address?.city_id ? Number(boardData.address.city_id) : 0,
        state_id: 0, // Will be set by updateLocationData
        country_id: 0, // Will be set by updateLocationData
      },
      mediums: boardData.instruction_mediums.map(
        (m: { id: number; instruction_medium: string }) => ({
          id: m.id,
          name: m.instruction_medium,
          board_id: Number(boardId),
        }),
      ),
      // Use standards already sorted by sequence_number from API
      standards: boardData.standards.map((s: { id: number; name: string; sequence_number: number }) => ({
        id: s.id,
        name: s.name,
        board_id: Number(boardId),
        sequence_number: Number(s.sequence_number) // Ensure it's a number
      })).sort((a, b) => Number(a.sequence_number || 0) - Number(b.sequence_number || 0)),
      subjects: boardData.subjects.map((s: { id: number; name: string }) => ({
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
        Math.max(...form.value.standards.map(s => Number(s.sequence_number || 0))) + 1 : 1
    })
    form.value.subjects.push({ name: '', board_id: Number(boardId) })

    // Update location data using the nested location data from the API response
    if (boardData.address?.city) {
      // Set city data
      form.value.address.city_id = boardData.address.city.id
      selectedCity.value = boardData.address.city

      // Set state data
      if (boardData.address.city.state) {
        form.value.address.state_id = boardData.address.city.state.id
        selectedState.value = boardData.address.city.state

        // Load states for this country
        if (boardData.address.city.state.country_id) {
          const statesResponse = await axiosInstance.get(`/states?countryId=${boardData.address.city.state.country_id}`)
          states.value = statesResponse.data
        }

        // Set country data
        if (boardData.address.city.state.country) {
          form.value.address.country_id = boardData.address.city.state.country.id
          selectedCountry.value = boardData.address.city.state.country
        }

        // Load cities for this state
        const citiesResponse = await axiosInstance.get(`/cities?stateId=${boardData.address.city.state.id}`)
        cities.value = citiesResponse.data
      }
    }

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

// Fetch reference data
const fetchCountries = async () => {
  try {
    console.log('Fetching countries...')
    const response = await axiosInstance.get('/countries')
    console.log('Countries response:', response.data)
    countries.value = response.data
    console.log('Countries assigned:', countries.value)
  } catch (error) {
    console.error('Error fetching countries:', error)
    countries.value = []
  }
}

// Update onMounted to fetch initial countries
onMounted(async () => {
  try {
    // Fetch initial data
    await fetchCountries()

    if (props.isEditMode && props.boardId) {
      await fetchBoardData(parseInt(props.boardId))
    }

    // Auto-resize textarea
    nextTick(() => {
      const textarea = document.getElementById('address') as HTMLTextAreaElement
      if (textarea) {
        textarea.style.height = ''
        textarea.style.height = textarea.scrollHeight + 'px'
      }
    })
  } catch (error) {
    console.error('Error in component initialization:', error)
  }
})

// Add type for input field names
type InputField = 'name' | 'abbreviation';

// Add generic input handlers
const handleInput = (e: Event, field: InputField) => {
  const value = (e.target as HTMLInputElement).value
  if (field === 'name') {
    form.value.name = capitalizeFirstLetter(value)
    validationStates.value.name.touched = true
    validationStates.value.name.valid = value.trim().length > 0
    isDuplicateName.value = false // Reset duplicate status while typing
  } else if (field === 'abbreviation') {
    form.value.abbreviation = value.toUpperCase()
    validationStates.value.abbreviation.touched = true
    validationStates.value.abbreviation.valid = value.trim().length > 0
    isDuplicateAbbreviation.value = false // Reset duplicate status while typing
  }
}

const handleBlur = async (e: Event, field: InputField) => {
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
const handleCountryChange = async (value: Item | null) => {
  const country = value as (Country | null)
  try {
    console.log('Handling country change...')
    form.value.address.country_id = country?.id || 0
    form.value.address.state_id = 0
    form.value.address.city_id = 0
    selectedState.value = null
    selectedCity.value = null
    validationStates.value.state.valid = false
    validationStates.value.city.valid = false
    validationStates.value.country.valid = !!country
    validationStates.value.country.touched = true

    if (country?.id) {
      console.log('Fetching states for country:', country.id)
      const response = await axiosInstance.get(`/states?countryId=${country.id}`)
      console.log('States response:', response.data)
      states.value = response.data
    } else {
      states.value = []
    }
  } catch (error) {
    console.error('Error in handleCountryChange:', error)
    states.value = []
  }
}

const handleStateChange = async (value: Item | null) => {
  const state = value as (State | null)
  try {
    console.log('Handling state change...')
    form.value.address.state_id = state?.id || 0
    form.value.address.city_id = 0
    selectedCity.value = null
    validationStates.value.city.valid = false
    validationStates.value.state.valid = !!state
    validationStates.value.state.touched = true

    if (state?.id) {
      console.log('Fetching cities for state:', state.id)
      const response = await axiosInstance.get(`/cities?stateId=${state.id}`)
      console.log('Cities response:', response.data)
      cities.value = response.data
    } else {
      cities.value = []
    }
  } catch (error) {
    console.error('Error in handleStateChange:', error)
    cities.value = []
  }
}

const handleCityChange = (value: Item | null) => {
  const city = value as (City | null)
  form.value.address.city_id = city?.id || 0
  validationStates.value.city.valid = !!city
  validationStates.value.city.touched = true
}

// Add watchers for address fields validation
watch(
  () => form.value.address.street,
  (newValue) => {
    if (validationStates.value.address.touched) {
      validationStates.value.address.valid = newValue.trim().length > 0
    }
  },
)

watch(
  () => form.value.address.postal_code,
  (newValue) => {
    if (validationStates.value.postalCode.touched) {
      validationStates.value.postalCode.valid = newValue.trim().length > 0
    }
  },
)

// Update validation functions
const isDuplicateMedium = (name: string, currentIndex: number) => {
  const trimmedName = name.trim().toLowerCase()
  return form.value.mediums.some(
    (medium, index) => index !== currentIndex && medium.name.trim().toLowerCase() === trimmedName,
  )
}

const isDuplicateStandard = (name: string, currentIndex: number) => {
  const trimmedName = name.trim().toLowerCase()
  return form.value.standards.some(
    (standard, index) =>
      index !== currentIndex && standard.name.trim().toLowerCase() === trimmedName,
  )
}

const isDuplicateSubject = (name: string, currentIndex: number) => {
  const trimmedName = name.trim().toLowerCase()
  return form.value.subjects.some(
    (subject, index) => index !== currentIndex && subject.name.trim().toLowerCase() === trimmedName,
  )
}

const handleMediumInput = (index: number, event?: KeyboardEvent) => {
  const currentMedium = form.value.mediums[index]

  // Add new field if last field is filled
  if (index === form.value.mediums.length - 1 && currentMedium.name.trim() !== '') {
    form.value.mediums.push({ id: undefined, name: '', board_id: 0 })
  }

  // Remove empty field if:
  // 1. It's not the last one AND
  // 2. Either the field is not focused (user moved away) OR user pressed backspace on an already empty field
  if (
    !currentMedium.name.trim() &&
    form.value.mediums.length > 1 &&
    index !== form.value.mediums.length - 1 &&
    (focusedMediumIndex.value !== index || (event?.key === 'Backspace' && currentMedium.name === ''))
  ) {
    form.value.mediums.splice(index, 1)
    // Focus on the previous input if available
    const prevInput = document.getElementById(`medium${index - 1}`)
    if (prevInput) prevInput.focus()
  }

  // Handle Enter key
  if (event?.key === 'Enter') {
    event.preventDefault()
    // If last field is empty, move to standards
    if (!currentMedium.name.trim() && index === form.value.mediums.length - 1) {
      const firstStandardInput = document.getElementById('standard0')
      if (firstStandardInput) firstStandardInput.focus()
      return
    }

    // Move to next field
    const nextInput = document.getElementById(`medium${index + 1}`)
    if (nextInput) nextInput.focus()
  }

  validationStates.value.mediums.touched = true
  validationStates.value.mediums.valid = form.value.mediums.some((m) => m.name.trim())
}

const handleStandardInput = (index: number, event?: KeyboardEvent) => {
  const currentStandard = form.value.standards[index]

  // Add new field if last field is filled
  if (index === form.value.standards.length - 1 && currentStandard.name.trim() !== '') {
    // Add new standard with next sequence number
    form.value.standards.push({
      id: undefined,
      name: '',
      board_id: 0,
      sequence_number: form.value.standards.length + 1
    })
  }

  // Remove empty field if:
  // 1. It's not the last one AND
  // 2. Either the field is not focused (user moved away) OR user pressed backspace on an already empty field
  if (
    !currentStandard.name.trim() &&
    form.value.standards.length > 1 &&
    index !== form.value.standards.length - 1 &&
    (focusedStandardIndex.value !== index || (event?.key === 'Backspace' && currentStandard.name === ''))
  ) {
    form.value.standards.splice(index, 1)

    // Update sequence numbers for all standards after removal
    form.value.standards.forEach((standard, idx) => {
      standard.sequence_number = idx + 1
    })

    // Focus on the previous input if available
    const prevInput = document.getElementById(`standard${index - 1}`)
    if (prevInput) prevInput.focus()
  }

  // Handle Enter key
  if (event?.key === 'Enter') {
    event.preventDefault()
    // If last field is empty, move to subjects
    if (!currentStandard.name.trim() && index === form.value.standards.length - 1) {
      const firstSubjectInput = document.getElementById('subject0')
      if (firstSubjectInput) firstSubjectInput.focus()
      return
    }

    // Move to next field
    const nextInput = document.getElementById(`standard${index + 1}`)
    if (nextInput) nextInput.focus()
  }

  validationStates.value.standards.touched = true
  validationStates.value.standards.valid = form.value.standards.some((s) => s.name.trim())
}

const handleSubjectInput = (index: number, event?: KeyboardEvent) => {
  const currentSubject = form.value.subjects[index]

  // Add new field if last field is filled
  if (index === form.value.subjects.length - 1 && currentSubject.name.trim() !== '') {
    form.value.subjects.push({ id: undefined, name: '', board_id: 0 })
  }

  // Remove empty field if:
  // 1. It's not the last one AND
  // 2. Either the field is not focused (user moved away) OR user pressed backspace on an already empty field
  if (
    !currentSubject.name.trim() &&
    form.value.subjects.length > 1 &&
    index !== form.value.subjects.length - 1 &&
    (focusedSubjectIndex.value !== index || (event?.key === 'Backspace' && currentSubject.name === ''))
  ) {
    form.value.subjects.splice(index, 1)
    // Focus on the previous input if available
    const prevInput = document.getElementById(`subject${index - 1}`)
    if (prevInput) prevInput.focus()
  }

  // Handle Enter key
  if (event?.key === 'Enter') {
    event.preventDefault()
    // If last field is empty, move to save button
    if (!currentSubject.name.trim() && index === form.value.subjects.length - 1) {
      const saveButton = document.querySelector('button[type="submit"]') as HTMLButtonElement | null
      if (saveButton) saveButton.focus()
      return
    }

    // Move to next field
    const nextInput = document.getElementById(`subject${index + 1}`)
    if (nextInput) nextInput.focus()
  }

  validationStates.value.subjects.touched = true
  validationStates.value.subjects.valid = form.value.subjects.some((s) => s.name.trim())
}

// Add methods to handle blur events
const handleMediumBlur = (index: number) => {
  focusedMediumIndex.value = -1
  const currentMedium = form.value.mediums[index]
  if (!currentMedium.name.trim() && form.value.mediums.length > 1 && index !== form.value.mediums.length - 1) {
    form.value.mediums.splice(index, 1)
  }
}

const handleStandardBlur = (index: number) => {
  focusedStandardIndex.value = -1
  const currentStandard = form.value.standards[index]
  if (!currentStandard.name.trim() && form.value.standards.length > 1 && index !== form.value.standards.length - 1) {
    form.value.standards.splice(index, 1)
    // Update sequence numbers for all standards after removal
    form.value.standards.forEach((standard, idx) => {
      standard.sequence_number = idx + 1
    })
  }
}

const handleSubjectBlur = (index: number) => {
  focusedSubjectIndex.value = -1
  const currentSubject = form.value.subjects[index]
  if (!currentSubject.name.trim() && form.value.subjects.length > 1 && index !== form.value.subjects.length - 1) {
    form.value.subjects.splice(index, 1)
  }
}

const autoResizeTextarea = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement
  // Reset height to auto to get the correct scrollHeight
  textarea.style.height = 'auto'
  // Set the height to match the content
  textarea.style.height = `${textarea.scrollHeight}px`
}

// Update the handleEnterKey function to prevent form submission
const handleEnterKey = (event: KeyboardEvent, nextElementId: string) => {
  if (event.key === 'Enter') {
    event.preventDefault() // Prevent form submission
    const nextElement = document.getElementById(nextElementId)
    if (nextElement) {
      nextElement.focus()
    }
  }
}

// Update the capitalize function to handle multiple words
const capitalizeFirstLetter = (str: string) => {
  if (!str) return str
  return str
    .split(' ')
    .map((word) => {
      // Capitalize every word regardless of length
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

// Modify handleSubmit to show confirmation modal only in edit mode
const handleSubmit = async (e: Event) => {
  e.preventDefault()

  // Mark all fields as touched to trigger validation display
  Object.keys(validationStates.value).forEach((key) => {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  })

  // Force a DOM update before checking for invalid fields
  await new Promise((resolve) => setTimeout(resolve, 0))

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

const fetchCurrentBoardData = async (boardId: number) => {
  const [{ data: mediums }, { data: standards }, { data: subjects }] = await Promise.all([
    axiosInstance.get(`/instruction-mediums/board/${boardId}`),
    axiosInstance.get(`/standards/board/${boardId}`),
    axiosInstance.get(`/subjects/board/${boardId}`),
  ])
  return { mediums, standards, subjects }
}

const compareLocationIds = async (
  currentId: number,
  newId: number,
  type: 'city' | 'state' | 'country',
): Promise<string | null> => {
  if (currentId === newId) return null
  if (type !== 'city' && (!currentId || !newId)) return null

  const [oldName, newName] = await Promise.all([
    fetchLocationDetails(currentId, type),
    fetchLocationDetails(newId, type),
  ])

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

  const locationChanges = await Promise.all([
    compareLocationIds(currentAddress.city_id, formAddress.city_id, 'city'),
    compareLocationIds(currentAddress.state_id, formAddress.state_id, 'state'),
    compareLocationIds(currentAddress.country_id, formAddress.country_id, 'country'),
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
        message: `Delete ${entityType}: ${currentItem.instruction_medium || currentItem.name || ''}`,
        entity: entityType,
        data: currentItem,
      })
    }
  })

  // Find modified and added items
  validFormItems.forEach((formItem) => {
    const currentItem = currentItems.find((item) => item.id === formItem.id)
    if (currentItem) {
      const currentName = currentItem.instruction_medium || currentItem.name || ''
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

  // Get current data
  const { mediums, standards, subjects } = await fetchCurrentBoardData(boardId)
  const { data: currentBoard } = await axiosInstance.get(`/boards/${boardId}`)

  // Compare basic board info
  const boardChanges = compareBasicBoardInfo(currentBoard, form.value, boardId)
  changes.value.push(...boardChanges)

  // Compare address if it exists
  if (currentBoard.address_id) {
    const { data: currentAddress } = await axiosInstance.get(
      `/addresses/${currentBoard.address_id}`,
    )
    const addressChanges = await compareAddressChanges(currentAddress, form.value.address)

    if (addressChanges.length > 0) {
      changes.value.push({
        type: 'modify',
        message: 'Board address details modified:\n' + addressChanges.join('\n'),
        entity: 'board',
        data: {
          old: { id: currentBoard.address_id, name: 'Previous Address' },
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

  // Compare related items
  changes.value.push(
    ...compareItems(mediums, form.value.mediums, 'medium'),
    ...compareItems(standards, form.value.standards, 'standard'),
    ...compareItems(subjects, form.value.subjects, 'subject'),
  )
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

    let addressId: number | undefined

    // Only handle address updates in edit mode
    if (props.isEditMode && props.boardId) {
      const { data: boardData } = await axiosInstance.get(`/boards/${props.boardId}`)
      addressId = boardData.address_id

      if (addressId) {
        console.log('Updating address with data:', formattedAddress)
        const { data: updatedAddress } = await axiosInstance.put(
          `/addresses/${addressId}`,
          formattedAddress,
        )
        console.log('Address updated successfully:', updatedAddress)
        addressId = updatedAddress.id
      }
    }

    // Update sequence numbers for all standards based on their current order
    // This ensures the sequence numbers match the order after any drag and drop operations
    form.value.standards.forEach((standard, idx) => {
      if (standard.name.trim()) {
        standard.sequence_number = idx + 1;
      }
    });

    // Emit the form data with properly formatted address
    // In add mode, address_id will be 0 and will be set by AddBoard.vue
    emit('submit', {
      address: formattedAddress,
      board: {
        name: form.value.name.trim(),
        abbreviation: form.value.abbreviation.trim(),
        address_id: addressId || 0,
      },
      mediums: form.value.mediums
        .filter((m) => m.name.trim())
        .map((m) => ({
          name: m.name.trim(),
          board_id: props.boardId ? parseInt(props.boardId) : 0,
        })),
      standards: form.value.standards
        .filter((s) => s.name.trim())
        .map((s, index) => ({
          id: s.id,
          name: s.name.trim(),
          board_id: props.boardId ? parseInt(props.boardId) : 0,
          sequence_number: index + 1, // Ensure sequence numbers match the current order
        })),
      subjects: form.value.subjects
        .filter((s) => s.name.trim())
        .map((s) => ({
          id: s.id,
          name: s.name.trim(),
          board_id: props.boardId ? parseInt(props.boardId) : 0,
        })),
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('An error occurred while saving the board. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Define emits with the correct type
const emit = defineEmits<{
  (
    e: 'submit',
    data: {
      address: CreateAddressDto
      board: CreateBoardDto
      mediums: CreateInstructionMediumDto[]
      standards: CreateStandardDto[]
      subjects: CreateSubjectDto[]
    },
  ): void
}>()

const goBack = () => {
  router.push('/admin/board')
}

// Add missing computed property
const isFormValid = computed(() => {
  return Object.values(validationStates.value).every((state) => state.valid)
})
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

/* Drag and drop styles */
.standard-item {
  position: relative;
  cursor: grab;
  transition: background-color 0.2s, transform 0.2s;
  border-radius: 0.25rem;
  padding: 0.25rem;
}

.standard-item.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.standard-item.drag-over {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.02);
}

.drag-handle {
  cursor: grab;
  color: #6c757d;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.standard-item.dragging .drag-handle {
  cursor: grabbing;
}

/* Rest of your existing styles... */
</style>
