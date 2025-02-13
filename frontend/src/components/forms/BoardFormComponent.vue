<template>
  <div class="container mt-3">
    <div class="row g-2 justify-content-end">
      <button class="btn btn-close" @click="goBack" aria-label="Close"></button>
    </div>
    <div class="row justify-content-center align-items-center my-4">
      <div class="col col-12 col-sm-10 col-md-8">
        <h4 class="text-left fw-bolder text-uppercase mb-3">
          {{ isEditMode ? 'Edit Board' : 'Add New Board' }}
        </h4>
      </div>
    </div>
    <hr />

    <div id="form-container" class="row mt-4 justify-content-center">
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="row g-4 justify-content-center">
          <!-- Board Details Section -->
          <div class="col-12 col-sm-10 col-md-8 mb-4">
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
                    @input="handleNameInput"
                    @blur="handleNameBlur"
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
                    @input="handleAbbreviationInput"
                    @blur="handleAbbreviationBlur"
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
          <fieldset class="border p-3 rounded col col-12 col-sm-10 col-md-8 mb-4">
            <legend class="float-none w-auto px-2">Board Address &nbsp;</legend>
            <div class="row g-3 justify-content-center">
              <!-- Country -->
              <div class="col-12 col-xl-4">
                <div class="form-floating dropdown">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.country.valid && validationStates.country.touched,
                      'is-valid': validationStates.country.valid,
                    }"
                    id="country"
                    v-model="countrySearch"
                    @input="filterCountries"
                    @focus="showCountryDropdown = true"
                    @click="showCountryDropdown = true"
                    placeholder="Search Country"
                    autocomplete="new-password"
                    @keydown="handleCountryKeydown"
                  />
                  <div
                    class="dropdown-menu"
                    :class="{ show: showCountryDropdown && filteredCountries.length > 0 }"
                    style="position: absolute; width: 100%; z-index: 1000"
                  >
                    <button
                      type="button"
                      v-for="(country, index) in filteredCountries"
                      :key="country.id"
                      class="dropdown-item"
                      :class="{ active: index === selectedCountryIndex }"
                      @click="selectCountry(country)"
                    >
                      {{ country.name }}
                    </button>
                  </div>
                  <label for="country">Country <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please select a country</div>
                </div>
              </div>

              <!-- State -->
              <div class="col-12 col-xl-4">
                <div class="form-floating dropdown">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.state.valid && validationStates.state.touched,
                      'is-valid': validationStates.state.valid,
                    }"
                    id="state"
                    v-model="stateSearch"
                    @input="filterStates"
                    @focus="handleStateFocus"
                    @click="handleStateFocus"
                    placeholder="Search State"
                    :disabled="!form.address.country_id"
                    autocomplete="new-password"
                    @keydown="handleStateKeydown"
                  />
                  <div
                    class="dropdown-menu"
                    :class="{ show: showStateDropdown && filteredStates.length > 0 }"
                    style="position: absolute; width: 100%; z-index: 1000"
                  >
                    <button
                      type="button"
                      v-for="(state, index) in filteredStates"
                      :key="state.id"
                      class="dropdown-item"
                      :class="{ active: index === selectedStateIndex }"
                      @click="selectState(state)"
                    >
                      {{ state.name }}
                    </button>
                  </div>
                  <label for="state">State <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please select a state</div>
                </div>
              </div>

              <!-- City -->
              <div class="col-12 col-xl-4">
                <div class="form-floating dropdown">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.city.valid && validationStates.city.touched,
                      'is-valid': validationStates.city.valid,
                    }"
                    id="city"
                    v-model="citySearch"
                    @input="filterCities"
                    @focus="handleCityFocus"
                    @click="handleCityFocus"
                    placeholder="Search City"
                    :disabled="!form.address.state_id"
                    autocomplete="new-password"
                    @keydown="handleCityKeydown"
                  />
                  <div
                    class="dropdown-menu"
                    :class="{ show: showCityDropdown && filteredCities.length > 0 }"
                    style="position: absolute; width: 100%; z-index: 1000"
                  >
                    <button
                      type="button"
                      v-for="(city, index) in filteredCities"
                      :key="city.id"
                      class="dropdown-item"
                      :class="{ active: index === selectedCityIndex }"
                      @click="selectCity(city)"
                    >
                      {{ city.name }}
                    </button>
                  </div>
                  <label for="city">City <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please select a city</div>
                </div>
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
                    style="min-height: 100px; overflow-y: hidden"
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
                <div v-for="(standard, index) in form.standards" :key="index" class="col-12">
                  <div class="form-floating">
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
import { getApiUrl } from '@/config/api'
import type {
  CreateBoardDto,
  CreateAddressDto,
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
} from '@/models/Board'
import { Modal } from 'bootstrap'

interface Country {
  id: string
  name: string
}

interface State {
  id: string
  name: string
  country_id: string
}

interface City {
  id: string
  name: string
  state_id: string
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
  standards: { id?: number; name: string; board_id?: number }[]
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
  standards: [{ id: undefined, name: '', board_id: 0 }],
  subjects: [{ id: undefined, name: '', board_id: 0 }],
})

// Reference data
const countries = ref<Country[]>([])
const states = ref<State[]>([])
const cities = ref<City[]>([])

// Move these declarations up, before the watch statements
const countrySearch = ref('')
const stateSearch = ref('')
const citySearch = ref('')
const showCountryDropdown = ref(false)
const showStateDropdown = ref(false)
const showCityDropdown = ref(false)

// Add these refs for tracking selected indices
const selectedCountryIndex = ref(-1)
const selectedStateIndex = ref(-1)
const selectedCityIndex = ref(-1)

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
    const response = await fetch(getApiUrl(`/${type}s/${id}`))
    const data = await response.json()
    return data.name || ''
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error)
    return ''
  }
}

// Update updateLocationData function to use proper typing
const updateLocationData = async (addressData: { city_id: string | number }) => {
  const cityResponse = await fetch(getApiUrl(`/cities/${addressData.city_id}`))
  if (cityResponse.ok) {
    const cityData = await cityResponse.json()
    form.value.address.city_id = cityData.id
    citySearch.value = cityData.name

    if (cityData.state_id) {
      const stateResponse = await fetch(getApiUrl(`/states/${cityData.state_id}`))
      if (stateResponse.ok) {
        const stateData = await stateResponse.json()
        form.value.address.state_id = stateData.id
        stateSearch.value = stateData.name

        if (stateData.country_id) {
          const countryResponse = await fetch(getApiUrl(`/countries/${stateData.country_id}`))
          if (countryResponse.ok) {
            const countryData = await countryResponse.json()
            form.value.address.country_id = countryData.id
            countrySearch.value = countryData.name
          }
        }
      }
    }
  }
}

interface BoardApiResponse {
  id: number
  name: string
  abbreviation: string
  address?: {
    id: number
    city_id: number
    postal_code: string
    street: string
  }
  instruction_mediums: Array<{
    id: number
    instruction_medium: string
    board_id: number
  }>
  standards: Array<{
    id: number
    name: string
    board_id: number
  }>
  subjects: Array<{
    id: number
    name: string
    board_id: number
  }>
}

const fetchBoardData = async (boardId: number) => {
  try {
    isLoading.value = true
    console.log('Fetching board data for ID:', boardId)

    const boardResponse = await fetch(getApiUrl(`/boards/${boardId}`))
    if (!boardResponse.ok) throw new Error('Failed to fetch board')
    const boardData: BoardApiResponse = await boardResponse.json()
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
      mediums: boardData.instruction_mediums.map((m) => ({
        id: m.id,
        name: m.instruction_medium,
        board_id: Number(boardId),
      })),
      standards: boardData.standards.map((s) => ({
        id: s.id,
        name: s.name,
        board_id: Number(boardId),
      })),
      subjects: boardData.subjects.map((s) => ({
        id: s.id,
        name: s.name,
        board_id: Number(boardId),
      })),
    }

    // Add empty items with proper number types
    form.value.mediums.push({ name: '', board_id: Number(boardId) })
    form.value.standards.push({ name: '', board_id: Number(boardId) })
    form.value.subjects.push({ name: '', board_id: Number(boardId) })

    // Update location data with proper type conversion
    if (boardData.address?.city_id) {
      await updateLocationData({ city_id: Number(boardData.address.city_id) })
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

// Update onMounted to use the new fetchBoardData function
onMounted(async () => {
  if (props.isEditMode && props.boardId) {
    await fetchBoardData(parseInt(props.boardId))
  }
})

// Update handleCountryChange to ensure number types
const handleCountryChange = async () => {
  form.value.address.state_id = 0
  form.value.address.city_id = 0
  stateSearch.value = ''
  citySearch.value = ''
  validationStates.value.state.valid = false
  validationStates.value.city.valid = false

  if (form.value.address.country_id) {
    try {
      const response = await fetch(getApiUrl(`/states?countryId=${form.value.address.country_id}`))
      if (!response.ok) throw new Error('Failed to fetch states')
      states.value = await response.json()
    } catch (error) {
      console.error('Error fetching states:', error)
      states.value = []
    }
  } else {
    states.value = []
  }
}

// Update handleStateChange function
const handleStateChange = async () => {
  // Reset city
  form.value.address.city_id = 0
  citySearch.value = ''
  validationStates.value.city.valid = false

  // Fetch cities for selected state using query parameter
  if (form.value.address.state_id) {
    try {
      const response = await fetch(getApiUrl(`/cities?stateId=${form.value.address.state_id}`))
      if (!response.ok) throw new Error('Failed to fetch cities')
      cities.value = await response.json()
    } catch (error) {
      console.error('Error fetching cities:', error)
      cities.value = []
    }
  } else {
    cities.value = []
  }
}

// Update computed properties for filtered states and cities
const filteredStates = computed(() => {
  if (!stateSearch.value) return states.value
  const search = stateSearch.value.toLowerCase()
  return states.value.filter((state) => state.name.toLowerCase().includes(search))
})

const filteredCities = computed(() => {
  if (!citySearch.value) return cities.value
  const search = citySearch.value.toLowerCase()
  return cities.value.filter((city) => city.name.toLowerCase().includes(search))
})

// Update onMounted to fetch initial countries
onMounted(async () => {
  // Fetch initial data
  await fetchCountries()
  if (props.isEditMode && props.boardId) {
    await fetchBoardData(parseInt(props.boardId))
  }

  // Add click outside handlers
  document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('#country')) {
      showCountryDropdown.value = false
    }
    if (!target.closest('#state')) {
      showStateDropdown.value = false
    }
    if (!target.closest('#city')) {
      showCityDropdown.value = false
    }
  })

  // Auto-resize textarea
  nextTick(() => {
    const textarea = document.getElementById('address') as HTMLTextAreaElement
    if (textarea) {
      textarea.style.height = ''
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  })
})

const filteredCountries = computed(() => {
  if (!countrySearch.value) return countries.value
  const search = countrySearch.value.toLowerCase()
  return countries.value.filter((country) => country.name.toLowerCase().includes(search))
})

const selectCountry = (country: Country) => {
  countrySearch.value = country.name
  form.value.address.country_id = Number(country.id)
  showCountryDropdown.value = false
  validationStates.value.country.valid = true
  validationStates.value.country.touched = true

  // Reset dependent fields
  stateSearch.value = ''
  citySearch.value = ''
  form.value.address.state_id = 0
  form.value.address.city_id = 0
  validationStates.value.state.valid = false
  validationStates.value.city.valid = false

  handleCountryChange().then(() => {
    const stateInput = document.getElementById('state')
    if (stateInput) stateInput.focus()
  })
}

const filterCountries = () => {
  showCountryDropdown.value = true
  selectedCountryIndex.value = -1
  validationStates.value.country.touched = true
  if (!countrySearch.value) {
    form.value.address.country_id = 0
    validationStates.value.country.valid = false
  }
}

const selectState = (state: State) => {
  stateSearch.value = state.name
  form.value.address.state_id = Number(state.id)
  showStateDropdown.value = false
  validationStates.value.state.valid = true
  validationStates.value.state.touched = true

  // Reset dependent field
  citySearch.value = ''
  form.value.address.city_id = 0
  validationStates.value.city.valid = false

  handleStateChange().then(() => {
    const cityInput = document.getElementById('city')
    if (cityInput) cityInput.focus()
  })
}

const selectCity = (city: City) => {
  citySearch.value = city.name
  form.value.address.city_id = Number(city.id)
  showCityDropdown.value = false
  validationStates.value.city.valid = true
  validationStates.value.city.touched = true

  // Move focus to address field
  const addressInput = document.getElementById('address')
  if (addressInput) addressInput.focus()
}

const filterStates = () => {
  showStateDropdown.value = true
  selectedStateIndex.value = -1
  validationStates.value.state.touched = true
  if (!stateSearch.value) {
    form.value.address.state_id = 0
    validationStates.value.state.valid = false
  }
}

const filterCities = () => {
  showCityDropdown.value = true
  selectedCityIndex.value = -1
  validationStates.value.city.touched = true
  if (!citySearch.value) {
    form.value.address.city_id = 0
    validationStates.value.city.valid = false
  }
}

// Add new functions to handle focus events
const handleStateFocus = async () => {
  if (form.value.address.country_id) {
    showStateDropdown.value = true
    // Fetch states if not already loaded
    if (states.value.length === 0) {
      try {
        const response = await fetch(
          getApiUrl(`/states?countryId=${form.value.address.country_id}`),
        )
        if (!response.ok) throw new Error('Failed to fetch states')
        states.value = await response.json()
      } catch (error) {
        console.error('Error fetching states:', error)
        states.value = []
      }
    }
  }
}

const handleCityFocus = async () => {
  if (form.value.address.state_id) {
    showCityDropdown.value = true
    // Fetch cities if not already loaded
    if (cities.value.length === 0) {
      try {
        const response = await fetch(getApiUrl(`/cities?stateId=${form.value.address.state_id}`))
        if (!response.ok) throw new Error('Failed to fetch cities')
        cities.value = await response.json()
      } catch (error) {
        console.error('Error fetching cities:', error)
        cities.value = []
      }
    }
  }
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

watch(
  () => countrySearch.value,
  (newValue) => {
    if (!newValue.trim()) {
      validationStates.value.country.valid = false
      form.value.address.country_id = 0
    }
    validationStates.value.country.touched = true
  },
)

watch(
  () => stateSearch.value,
  (newValue) => {
    if (!newValue.trim()) {
      validationStates.value.state.valid = false
      form.value.address.state_id = 0
    }
    validationStates.value.state.touched = true
  },
)

watch(
  () => citySearch.value,
  (newValue) => {
    if (!newValue.trim()) {
      validationStates.value.city.valid = false
      form.value.address.city_id = 0
    }
    validationStates.value.city.touched = true
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

  // Remove empty field if it's not the last one
  if (
    !currentMedium.name.trim() &&
    form.value.mediums.length > 1 &&
    index !== form.value.mediums.length - 1
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
    form.value.standards.push({ id: undefined, name: '', board_id: 0 })
  }

  // Remove empty field if it's not the last one
  if (
    !currentStandard.name.trim() &&
    form.value.standards.length > 1 &&
    index !== form.value.standards.length - 1
  ) {
    form.value.standards.splice(index, 1)
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

  // Remove empty field if it's not the last one
  if (
    !currentSubject.name.trim() &&
    form.value.subjects.length > 1 &&
    index !== form.value.subjects.length - 1
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

// Update handleCountryKeydown to handle validation
const handleCountryKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (
      showCountryDropdown.value &&
      filteredCountries.value.length &&
      selectedCountryIndex.value >= 0
    ) {
      const selectedCountry = filteredCountries.value[selectedCountryIndex.value]
      selectCountry(selectedCountry)
    }
    return
  }

  if (!showCountryDropdown.value || !filteredCountries.value.length) return

  const dropdownMenu = document.querySelector('#country + .dropdown-menu') as HTMLElement
  if (!dropdownMenu) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedCountryIndex.value = Math.min(
      selectedCountryIndex.value + 1,
      filteredCountries.value.length - 1,
    )
    const selectedItem = dropdownMenu.children[selectedCountryIndex.value] as HTMLElement
    if (selectedItem) ensureVisible(selectedItem, dropdownMenu)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedCountryIndex.value = Math.max(selectedCountryIndex.value - 1, 0)
    const selectedItem = dropdownMenu.children[selectedCountryIndex.value] as HTMLElement
    if (selectedItem) ensureVisible(selectedItem, dropdownMenu)
  }
}

// Update handleStateKeydown to handle validation
const handleStateKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (showStateDropdown.value && filteredStates.value.length && selectedStateIndex.value >= 0) {
      const selectedState = filteredStates.value[selectedStateIndex.value]
      selectState(selectedState)
    }
    return
  }

  if (!showStateDropdown.value || !filteredStates.value.length) return

  const dropdownMenu = document.querySelector('#state + .dropdown-menu') as HTMLElement
  if (!dropdownMenu) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedStateIndex.value = Math.min(
      selectedStateIndex.value + 1,
      filteredStates.value.length - 1,
    )
    const selectedItem = dropdownMenu.children[selectedStateIndex.value] as HTMLElement
    if (selectedItem) ensureVisible(selectedItem, dropdownMenu)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedStateIndex.value = Math.max(selectedStateIndex.value - 1, 0)
    const selectedItem = dropdownMenu.children[selectedStateIndex.value] as HTMLElement
    if (selectedItem) ensureVisible(selectedItem, dropdownMenu)
  }
}

// Update handleCityKeydown to handle validation
const handleCityKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (showCityDropdown.value && filteredCities.value.length && selectedCityIndex.value >= 0) {
      const selectedCity = filteredCities.value[selectedCityIndex.value]
      selectCity(selectedCity)
    }
    return
  }

  if (!showCityDropdown.value || !filteredCities.value.length) return

  const dropdownMenu = document.querySelector('#city + .dropdown-menu') as HTMLElement
  if (!dropdownMenu) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedCityIndex.value = Math.min(selectedCityIndex.value + 1, filteredCities.value.length - 1)
    const selectedItem = dropdownMenu.children[selectedCityIndex.value] as HTMLElement
    if (selectedItem) ensureVisible(selectedItem, dropdownMenu)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedCityIndex.value = Math.max(selectedCityIndex.value - 1, 0)
    const selectedItem = dropdownMenu.children[selectedCityIndex.value] as HTMLElement
    if (selectedItem) ensureVisible(selectedItem, dropdownMenu)
  }
}

// Add back the input handlers after the interfaces
const handleNameInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  form.value.name = capitalizeFirstLetter(value)
  validationStates.value.name.touched = true
  validationStates.value.name.valid = value.trim().length > 0
  isDuplicateName.value = false // Reset duplicate status while typing
}

const handleNameBlur = () => {
  if (form.value.name.trim()) {
    checkDuplicateName(form.value.name)
  }
}

const handleAbbreviationInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  form.value.abbreviation = value.toUpperCase()
  validationStates.value.abbreviation.touched = true
  validationStates.value.abbreviation.valid = value.trim().length > 0
  isDuplicateAbbreviation.value = false // Reset duplicate status while typing
}

const handleAbbreviationBlur = () => {
  if (form.value.abbreviation.trim()) {
    checkDuplicateAbbreviation(form.value.abbreviation)
  }
}

// Fetch reference data
const fetchCountries = async () => {
  try {
    const response = await fetch(getApiUrl('/countries'))
    if (!response.ok) throw new Error('Failed to fetch countries')
    countries.value = await response.json()
  } catch (error) {
    console.error('Error fetching countries:', error)
  }
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
  const [mediums, standards, subjects] = await Promise.all([
    fetch(getApiUrl(`/instruction-mediums/board/${boardId}`)).then((r) => r.json()),
    fetch(getApiUrl(`/standards/board/${boardId}`)).then((r) => r.json()),
    fetch(getApiUrl(`/subjects/board/${boardId}`)).then((r) => r.json()),
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

const calculateChanges = async () => {
  changes.value = []

  if (!props.isEditMode || !props.boardId) return

  const boardId = parseInt(props.boardId)

  // Get current data
  const { mediums, standards, subjects } = await fetchCurrentBoardData(boardId)
  const boardResponse = await fetch(getApiUrl(`/boards/${boardId}`))

  if (!boardResponse.ok) return

  const currentBoard = await boardResponse.json()

  // Compare basic board info
  const boardChanges = compareBasicBoardInfo(currentBoard, form.value, boardId)
  changes.value.push(...boardChanges)

  // Compare address if it exists
  if (currentBoard.address_id) {
    const addressResponse = await fetch(getApiUrl(`/addresses/${currentBoard.address_id}`))
    if (addressResponse.ok) {
      const currentAddress = await addressResponse.json()
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

    // Format the address data
    const formattedAddress = {
      street: form.value.address.street?.trim() || '',
      postal_code: form.value.address.postal_code?.trim() || '',
      city_id: parseInt(String(form.value.address.city_id)),
    }

    let addressId: number | undefined

    if (props.isEditMode && props.boardId) {
      // Get current board data to get the address_id
      const boardResponse = await fetch(getApiUrl(`/boards/${props.boardId}`))
      if (!boardResponse.ok) {
        throw new Error('Failed to fetch board data')
      }
      const boardData = await boardResponse.json()
      addressId = boardData.address_id
    }

    // Update or create address
    if (props.isEditMode && addressId) {
      // Update existing address
      console.log('Updating address with data:', formattedAddress)

      const addressResponse = await fetch(getApiUrl(`/addresses/${addressId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedAddress),
      })

      if (!addressResponse.ok) {
        const errorData = await addressResponse.text()
        console.error('Failed to update address:', errorData)
        throw new Error(`Failed to update address: ${errorData}`)
      }

      const updatedAddress = await addressResponse.json()
      console.log('Address updated successfully:', updatedAddress)
      addressId = updatedAddress.id
    } else {
      // Create new address
      const addressResponse = await fetch(getApiUrl('/addresses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedAddress),
      })

      if (!addressResponse.ok) {
        throw new Error('Failed to create address')
      }

      const newAddress = await addressResponse.json()
      addressId = newAddress.id
      console.log('New address created:', addressId)
    }

    // Emit the form data with properly formatted address and updated address_id
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
        .map((s) => ({
          id: s.id,
          name: s.name.trim(),
          board_id: props.boardId ? parseInt(props.boardId) : 0,
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

// Add missing functions for duplicate checks
const checkDuplicateName = async (name: string) => {
  try {
    // Fetch all boards and check manually since we don't have a dedicated endpoint
    const response = await fetch(getApiUrl('/boards'))
    if (response.ok) {
      const boards = await response.json()
      const isDuplicate = boards.some(
        (board: { id: number; name: string }) =>
          board.name.toLowerCase() === name.toLowerCase() &&
          (!props.boardId || board.id !== parseInt(props.boardId)),
      )
      isDuplicateName.value = isDuplicate
      validationStates.value.name.valid = !isDuplicate
    }
  } catch (error) {
    console.error('Error checking duplicate name:', error)
  }
}

const checkDuplicateAbbreviation = async (abbreviation: string) => {
  try {
    // Fetch all boards and check manually since we don't have a dedicated endpoint
    const response = await fetch(getApiUrl('/boards'))
    if (response.ok) {
      const boards = await response.json()
      const isDuplicate = boards.some(
        (board: { id: number; abbreviation: string }) =>
          board.abbreviation.toLowerCase() === abbreviation.toLowerCase() &&
          (!props.boardId || board.id !== parseInt(props.boardId)),
      )
      isDuplicateAbbreviation.value = isDuplicate
      validationStates.value.abbreviation.valid = !isDuplicate
    }
  } catch (error) {
    console.error('Error checking duplicate abbreviation:', error)
  }
}

const ensureVisible = (element: HTMLElement, container: HTMLElement) => {
  const containerRect = container.getBoundingClientRect()
  const elementRect = element.getBoundingClientRect()

  if (elementRect.bottom > containerRect.bottom) {
    container.scrollTop += elementRect.bottom - containerRect.bottom
  } else if (elementRect.top < containerRect.top) {
    container.scrollTop -= containerRect.top - elementRect.top
  }
}
</script>

<style scoped>
/* Main container styles */
.container-fluid {
  height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  overflow-y: auto;
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
  max-width: 100%;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.dropdown-menu .dropdown-item {
  white-space: normal;
  word-wrap: break-word;
  padding: 0.5rem 1rem;
}

/* Dropdown styles for black highlight */
#country + .dropdown-menu .dropdown-item.active,
#state + .dropdown-menu .dropdown-item.active,
#city + .dropdown-menu .dropdown-item.active {
  background-color: #212529;
  color: white;
}

#country + .dropdown-menu .dropdown-item:hover,
#state + .dropdown-menu .dropdown-item:hover,
#city + .dropdown-menu .dropdown-item:hover {
  background-color: #f8f9fa;
  color: #212529;
}

/* Override any existing blue highlight */
.dropdown-item.active {
  background-color: #212529 !important;
  color: white !important;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: #212529;
}

/* Rest of your existing styles... */
</style>
