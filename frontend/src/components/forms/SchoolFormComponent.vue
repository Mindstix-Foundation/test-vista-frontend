<template>
  <div class="container mt-3">
    <div class="row g-2 justify-content-end">
      <button class="btn btn-close" @click="goBack" aria-label="Close"></button>
    </div>
    <div class="row justify-content-center align-items-center my-2">
      <div class="col col-12 col-sm-10 col-md-8">
        <h4 class="text-left fw-bolder text-uppercase mb-2">
          {{ isEditMode ? 'Edit School' : 'Add New School' }}
        </h4>
      </div>
    </div>
    <hr />

    <div id="form-container" class="row mt-4 justify-content-center">
      <form @submit.prevent="onSubmit">
        <div class="row justify-content-center">
          <!-- School Details Section -->
          <div class="col-12 col-sm-10 col-md-8 mb-4">
            <div class="row g-3">
              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid': !validationStates.name.valid && validationStates.name.touched,
                      'is-valid': validationStates.name.valid,
                    }"
                    id="schoolName"
                    v-model="form.name"
                    @input="
                      (e) => {
                        form.name = capitalizeWords((e.target as HTMLInputElement).value)
                        validationStates.name.valid = form.name.trim().length > 0
                        validationStates.name.touched = true
                      }
                    "
                    @blur="validationStates.name.touched = true"
                    placeholder="School Name"
                    required
                    @keydown="(e) => handleEnterKey(e, 'boardName')"
                  />
                  <label for="schoolName">School Name <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please enter a school name</div>
                </div>
              </div>
              <div class="col-12">
                <div class="form-floating dropdown">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.board.valid &&
                        validationStates.board.touched &&
                        !showBoardDropdown,
                      'is-valid': validationStates.board.valid,
                    }"
                    id="boardName"
                    v-model="boardSearch"
                    @input="filterBoards"
                    @focus="showBoardDropdown = true"
                    @click="showBoardDropdown = true"
                    placeholder="Search Board"
                    required
                    autocomplete="off"
                    @keydown="handleBoardKeydown"
                    :disabled="isEditMode"
                  />
                  <div
                    class="dropdown-menu"
                    :class="{ show: showBoardDropdown && filteredBoards.length > 0 && !isEditMode }"
                    style="position: absolute; width: 100%; z-index: 1000"
                  >
                    <button
                      v-for="(board, index) in filteredBoards"
                      :key="board.id"
                      class="dropdown-item"
                      :class="{ active: index === selectedBoardIndex }"
                      @click="
                        async () => {
                          selectedBoardIndex = index
                          await selectBoard(board)
                        }
                      "
                      type="button"
                    >
                      {{ board.name }}
                    </button>
                  </div>
                  <label for="boardName">Board <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" v-show="!showBoardDropdown">
                    Please select a board
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Section -->
          <fieldset class="border p-3 rounded col col-12 col-sm-10 col-md-8 mb-4">
            <legend class="float-none w-auto px-2">School Address &nbsp;</legend>
            <div class="row g-3 justify-content-center">
              <!-- Country -->
              <div class="col-12 col-xl-4">
                <div class="form-floating dropdown">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.country.valid &&
                        validationStates.country.touched &&
                        !showCountryDropdown,
                      'is-valid': validationStates.country.valid,
                    }"
                    id="country"
                    v-model="countrySearch"
                    @input="filterCountries"
                    @focus="showCountryDropdown = true"
                    @click="showCountryDropdown = true"
                    placeholder="Search Country"
                    required
                    autocomplete="new-password"
                    @keydown="handleCountryKeydown"
                  />
                  <div
                    class="dropdown-menu"
                    :class="{ show: showCountryDropdown && filteredCountries.length > 0 }"
                    style="position: absolute; width: 100%; z-index: 1000"
                  >
                    <button
                      v-for="(country, index) in filteredCountries"
                      :key="country.id"
                      class="dropdown-item"
                      :class="{ active: index === selectedCountryIndex }"
                      @click="selectCountry(country)"
                      type="button"
                    >
                      {{ country.name }}
                    </button>
                  </div>
                  <label for="country">Country <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" v-show="!showCountryDropdown">
                    Please select a country
                  </div>
                </div>
              </div>

              <!-- State -->
              <div class="col-12 col-xl-4">
                <div class="form-floating dropdown">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.state.valid &&
                        validationStates.state.touched &&
                        !showStateDropdown,
                      'is-valid': validationStates.state.valid,
                    }"
                    id="state"
                    v-model="stateSearch"
                    @input="filterStates"
                    @focus="showStateDropdown = true"
                    @click="showStateDropdown = true"
                    placeholder="Search State"
                    :disabled="!form.address.country_id"
                    required
                    autocomplete="new-password"
                    @keydown="handleStateKeydown"
                  />
                  <div
                    class="dropdown-menu"
                    :class="{ show: showStateDropdown && filteredStates.length > 0 }"
                    style="position: absolute; width: 100%; z-index: 1000"
                  >
                    <button
                      v-for="(state, index) in filteredStates"
                      :key="state.id"
                      class="dropdown-item"
                      :class="{ active: index === selectedStateIndex }"
                      @click="selectState(state)"
                      type="button"
                    >
                      {{ state.name }}
                    </button>
                  </div>
                  <label for="state">State <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" v-show="!showStateDropdown">
                    Please select a state
                  </div>
                </div>
              </div>

              <!-- City -->
              <div class="col-12 col-xl-4">
                <div class="form-floating dropdown">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.city.valid &&
                        validationStates.city.touched &&
                        !showCityDropdown,
                      'is-valid': validationStates.city.valid,
                    }"
                    id="city"
                    v-model="citySearch"
                    @input="filterCities"
                    @focus="showCityDropdown = true"
                    @click="showCityDropdown = true"
                    placeholder="Search City"
                    :disabled="!form.address.state_id"
                    required
                    autocomplete="new-password"
                    @keydown="handleCityKeydown"
                  />
                  <div
                    class="dropdown-menu"
                    :class="{ show: showCityDropdown && filteredCities.length > 0 }"
                    style="position: absolute; width: 100%; z-index: 1000"
                  >
                    <button
                      v-for="(city, index) in filteredCities"
                      :key="city.id"
                      class="dropdown-item"
                      :class="{ active: index === selectedCityIndex }"
                      @click="selectCity(city)"
                      type="button"
                    >
                      {{ city.name }}
                    </button>
                  </div>
                  <label for="city">City <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" v-show="!showCityDropdown">
                    Please select a city
                  </div>
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
                    style="min-height: 100px"
                    required
                    @input="
                      (e) => {
                        autoResizeTextarea(e)
                        form.address.street = (e.target as HTMLTextAreaElement).value
                        validationStates.address.valid = validateAddress(form.address.street)
                        validationStates.address.touched = true
                      }
                    "
                  ></textarea>
                  <label for="address">Address <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please enter an address</div>
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
                    required
                    @input="
                      (e) => {
                        const value = (e.target as HTMLInputElement).value
                        form.address.postal_code = value
                        validationStates.postalCode.valid = validatePostalCode(value)
                        validationStates.postalCode.touched = true
                      }
                    "
                    @keydown="(e) => handleEnterKey(e, 'principalName')"
                  />
                  <label for="postalCode">Postal Code <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">
                    Please enter a valid postal code (letters, numbers, and hyphens allowed)
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Principal's Information -->
          <fieldset class="border p-3 rounded col-12 col-sm-10 col-md-8 mb-4">
            <legend class="float-none w-auto px-2">Principal's Information</legend>
            <div class="row g-3">
              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.principalName.valid &&
                        validationStates.principalName.touched,
                      'is-valid': validationStates.principalName.valid,
                    }"
                    id="principalName"
                    v-model="form.principal_name"
                    @input="
                      (e) => {
                        form.principal_name = capitalizeWords((e.target as HTMLInputElement).value)
                        validationStates.principalName.valid = validatePrincipalName(
                          form.principal_name,
                        )
                        validationStates.principalName.touched = true
                      }
                    "
                    placeholder="Principal's Name"
                    required
                    @keydown="(e) => handleEnterKey(e, 'contactNo1')"
                  />
                  <label for="principalName"
                    >Principal's Name <span class="text-danger">*</span></label
                  >
                  <div class="invalid-feedback">
                    Please enter a valid principal name (only letters and spaces, minimum 3
                    characters)
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="tel"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.contactNumber.valid &&
                        validationStates.contactNumber.touched,
                      'is-valid': validationStates.contactNumber.valid,
                    }"
                    id="contactNo1"
                    v-model="form.contact_number"
                    placeholder="Contact Number"
                    required
                    @input="(e) => handleContactNumberInput(e, false)"
                    @keydown="(e) => handleEnterKey(e, 'contactNo2')"
                  />
                  <label for="contactNo1">Contact Number <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please enter a contact number</div>
                </div>
              </div>

              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="tel"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        !validationStates.alternateContactNumber.valid &&
                        validationStates.alternateContactNumber.touched &&
                        (form.alternate_contact_number?.trim().length ?? 0) > 0,
                      'is-valid':
                        validationStates.alternateContactNumber.valid &&
                        (form.alternate_contact_number?.trim().length ?? 0) > 0,
                    }"
                    id="contactNo2"
                    v-model="form.alternate_contact_number"
                    placeholder="Alternate Contact Number"
                    @input="(e) => handleContactNumberInput(e, true)"
                    @keydown="(e) => handleEnterKey(e, 'email')"
                  />
                  <label for="contactNo2">Alternate Contact Number (Optional)</label>
                  <div class="invalid-feedback">
                    Please enter a valid contact number that is different from the primary contact number
                  </div>
                </div>
              </div>

              <div class="col-12">
                <div class="form-floating">
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    placeholder="Enter Email"
                    v-model="form.email"
                    :class="{
                      'is-valid': validationStates.email.valid && validationStates.email.touched,
                      'is-invalid': !validationStates.email.valid && validationStates.email.touched,
                    }"
                    @input="handleEmailInput"
                    @keydown="handleEmailEnter"
                  />
                  <label for="email">Email <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please enter a valid email address</div>
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Mediums and Standards -->
          <div class="col-12 col-sm-10 col-md-8">
            <div class="row g-3">
              <!-- Mediums -->
              <div class="col-12 col-md-6">
                <fieldset class="border p-3 rounded h-100">
                  <legend class="float-none w-auto px-2">
                    Mediums Offered <span class="text-danger">*</span>
                  </legend>
                  <div
                    class="form-check"
                    :class="{
                      'is-invalid':
                        !validationStates.mediums.valid && validationStates.mediums.touched,
                    }"
                    v-for="medium in availableMediums"
                    :key="medium.id"
                  >
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="'medium' + medium.id"
                      v-model="form.mediums"
                      :value="medium.id"
                      @change="
                        () => {
                          validationStates.mediums.touched = true
                          validationStates.mediums.valid = form.mediums.length > 0
                        }
                      "
                      @keydown="(e) => handleCheckboxKeydown(e, 'medium', medium.id)"
                      tabindex="0"
                    />
                    <label class="form-check-label" :for="'medium' + medium.id">
                      {{ medium.name }}
                    </label>
                  </div>
                  <div v-if="availableMediums.length === 0" class="text-muted">
                    Please select a board to view available mediums
                  </div>
                  <div
                    class="invalid-feedback d-block"
                    v-if="!validationStates.mediums.valid && validationStates.mediums.touched"
                  >
                    Please select at least one medium
                  </div>
                </fieldset>
              </div>

              <!-- Standards -->
              <div class="col-12 col-md-6">
                <fieldset class="border p-3 rounded h-100">
                  <legend class="float-none w-auto px-2">
                    Standards Offered <span class="text-danger">*</span>
                  </legend>
                  <div
                    class="form-check"
                    :class="{
                      'is-invalid':
                        !validationStates.standards.valid && validationStates.standards.touched,
                    }"
                    v-for="standard in availableStandards"
                    :key="standard.id"
                  >
                    <input
                      type="checkbox"
                      class="form-check-input"
                      :id="'standard' + standard.id"
                      v-model="form.standards"
                      :value="standard.id"
                      @change="
                        () => {
                          validationStates.standards.touched = true
                          validationStates.standards.valid = form.standards.length > 0
                        }
                      "
                      @keydown="(e) => handleCheckboxKeydown(e, 'standard', standard.id)"
                      tabindex="0"
                    />
                    <label class="form-check-label" :for="'standard' + standard.id">
                      {{ standard.name }}
                    </label>
                  </div>
                  <div v-if="availableStandards.length === 0" class="text-muted">
                    Please select a board to view available standards
                  </div>
                  <div
                    class="invalid-feedback d-block"
                    v-if="!validationStates.standards.valid && validationStates.standards.touched"
                  >
                    Please select at least one standard
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col-12 col-sm-10 col-md-8 mt-4">
            <div class="text-center">
              <button
                type="submit"
                class="btn btn-dark"
                :disabled="isSubmitting"
                @click="onSubmit"
                @keydown="handleSaveKeydown"
              >
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

          <div v-if="changes.length === 0" class="text-muted">No changes detected.</div>

          <div v-else>
            <ul class="list-group">
              <li
                v-for="(change, index) in changes"
                :key="index"
                class="list-group-item"
                :class="{
                  'list-group-item-danger': change.type === 'delete',
                  'list-group-item-warning': change.type === 'modify',
                  'list-group-item-success': change.type === 'add',
                }"
              >
                <i
                  :class="{
                    'bi bi-trash': change.type === 'delete',
                    'bi bi-pencil': change.type === 'modify',
                    'bi bi-plus-circle': change.type === 'add',
                  }"
                  class="me-2"
                ></i>
                {{ change.message }}
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button
            type="button"
            class="btn btn-dark"
            @click="confirmAndSubmit"
            :disabled="changes.length === 0"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Import necessary dependencies and types
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { SchoolFormData, SchoolValidationStates } from '@/models/School'
import { Modal } from 'bootstrap'
import axiosInstance from '@/config/axios'

// Update interfaces based on Prisma schema
interface Country {
  id: number
  name: string
}

interface State {
  id: number
  country_id: number
  name: string
}

interface City {
  id: number
  state_id: number
  name: string
}

interface Board {
  id: number
  name: string
  abbreviation: string
  address_id: number
}

interface BoardListItem {
  id: number
  name: string
  abbreviation: string
  address_id: number
}

// Add interfaces for the API responses
interface SchoolMediumResponse {
  id?: number
  instruction_medium_id?: number
  instruction_medium?: {
    id: number
    name: string
  }
  name?: string
}

interface SchoolStandardResponse {
  id?: number
  standard_id?: number
  standard?: {
    id: number
    name: string
  }
  name?: string
}

// Define props
const props = defineProps<{
  isEditMode: boolean
  schoolId?: string
  initialData?: SchoolFormData | null
  isLoading?: boolean
}>()

const router = useRouter()
const isSubmitting = ref(false)
const availableMediums = ref<{ id: number; name: string }[]>([])
const availableStandards = ref<{ id: number; name: string; sequence_number: number }[]>([])
const boards = ref<Board[]>([])
const boardSearch = ref('')
const showBoardDropdown = ref(false)

// Update capitalizeFirstLetter to handle multiple words
const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Update validation states initialization
const validationStates = ref<SchoolValidationStates>({
  name: { valid: false, touched: false },
  board: { valid: false, touched: false },
  country: { valid: false, touched: false },
  state: { valid: false, touched: false },
  city: { valid: false, touched: false },
  address: { valid: false, touched: false },
  postalCode: { valid: false, touched: false },
  principalName: { valid: false, touched: false },
  email: { valid: false, touched: false },
  contactNumber: { valid: false, touched: false },
  alternateContactNumber: { valid: true, touched: false },
  mediums: { valid: false, touched: false },
  standards: { valid: false, touched: false },
})

// Update form data handling
const form = ref<SchoolFormData>({
  name: '',
  board_id: 0,
  address_id: 0,
  principal_name: '',
  email: '',
  contact_number: '',
  alternate_contact_number: '',
  address: {
    street: '',
    postal_code: '',
    city_id: 0,
    state_id: 0,
    country_id: 0,
  },
  mediums: [],
  standards: [],
})

// Update type for data refs
const countries = ref<Country[]>([])
const states = ref<State[]>([])
const cities = ref<City[]>([])

const countrySearch = ref('')
const stateSearch = ref('')
const citySearch = ref('')
const showCountryDropdown = ref(false)
const showStateDropdown = ref(false)
const showCityDropdown = ref(false)

// Add refs for keyboard navigation
const selectedCountryIndex = ref(-1)
const selectedStateIndex = ref(-1)
const selectedCityIndex = ref(-1)

// Add selectedBoardIndex for keyboard navigation
const selectedBoardIndex = ref(-1)

// Add refs for selected items and data
const selectedBoard = ref<Board | null>(null)
const selectedCountry = ref<Country | null>(null)
const selectedState = ref<State | null>(null)
const selectedCity = ref<City | null>(null)

// Add refs for tracking previous selections
const previousSelections = ref(
  new Map<
    number,
    {
      mediums: number[]
      standards: number[]
    }
  >(),
)

// Add ref for tracking the previous board ID
const previousBoardId = ref<number | null>(null)

// Update filtered items with proper types
const filteredBoards = computed(() => {
  if (!boardSearch.value) return boards.value
  const search = boardSearch.value.toLowerCase()
  return boards.value.filter((board) => board.name.toLowerCase().includes(search))
})

const filteredCountries = computed(() => {
  console.log('Filtering countries with search:', countrySearch.value)
  console.log('Available countries:', countries.value)
  if (!countrySearch.value) return countries.value
  const search = countrySearch.value.toLowerCase()
  return countries.value.filter((country) => country.name.toLowerCase().includes(search))
})

const filteredStates = computed(() => {
  console.log('Filtering states with search:', stateSearch.value)
  console.log('Available states:', states.value)
  if (!stateSearch.value) return states.value
  const search = stateSearch.value.toLowerCase()
  return states.value.filter((state) => state.name.toLowerCase().includes(search))
})

const filteredCities = computed(() => {
  console.log('Filtering cities with search:', citySearch.value)
  console.log('Available cities:', cities.value)
  if (!citySearch.value) return cities.value
  const search = citySearch.value.toLowerCase()
  return cities.value.filter((city) => city.name.toLowerCase().includes(search))
})

// Update event handlers to handle type conversion
const selectCountry = async (country: Country) => {
  console.log('Selecting country:', country)
  countrySearch.value = country.name
  form.value.address.country_id = country.id
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

  // Fetch states for the selected country
  await handleCountryChange()

  // Move focus to state field
  const stateInput = document.getElementById('state')
  if (stateInput) stateInput.focus()
}

const selectState = async (state: State) => {
  console.log('Selecting state:', state)
  stateSearch.value = state.name
  form.value.address.state_id = state.id
  showStateDropdown.value = false
  validationStates.value.state.valid = true
  validationStates.value.state.touched = true

  // Reset city
  citySearch.value = ''
  form.value.address.city_id = 0
  validationStates.value.city.valid = false

  // Fetch cities for the selected state
  await handleStateChange()

  // Move focus to city field
  const cityInput = document.getElementById('city')
  if (cityInput) cityInput.focus()
}

const selectCity = (city: City) => {
  citySearch.value = city.name
  form.value.address.city_id = city.id
  showCityDropdown.value = false
  validationStates.value.city.valid = true
  validationStates.value.city.touched = true

  // Move focus to address field
  nextTick(() => {
    const addressInput = document.getElementById('address')
    if (addressInput) {
      addressInput.focus()
    }
  })
}

// Update board selection to handle previous selections
const selectBoard = async (board: BoardListItem) => {
  console.log('Selecting board:', board)

  // Store current selections if we have a previous board
  if (form.value.board_id && form.value.board_id !== board.id) {
    previousSelections.value.set(form.value.board_id, {
      mediums: [...form.value.mediums],
      standards: [...form.value.standards],
    })
  }

  // Store the previous board ID
  previousBoardId.value = form.value.board_id

  // Update board selection
  boardSearch.value = board.name
  form.value.board_id = board.id
  showBoardDropdown.value = false
  validationStates.value.board.valid = true
  validationStates.value.board.touched = true

  try {
    console.log('Fetching board data for ID:', board.id)
    // Fetch board's available mediums and standards using the board endpoints
    const [{ data: mediums }, { data: standards }] = await Promise.all([
      axiosInstance.get(`/instruction-mediums/board/${board.id}`),
      axiosInstance.get(`/standards/board/${board.id}`),
    ])
    console.log('Fetched mediums:', mediums)
    console.log('Fetched standards:', standards)

    // Map the data to the required format
    availableMediums.value = mediums.map((m: { id: number; instruction_medium: string }) => ({
      id: m.id,
      name: m.instruction_medium,
    }))
    availableStandards.value = standards
      .map((s: { id: number; name: string; sequence_number: number }) => ({
        id: s.id,
        name: s.name,
        sequence_number: s.sequence_number
      }))
      .sort((a: { sequence_number: number }, b: { sequence_number: number }) => a.sequence_number - b.sequence_number)

    // Check if we're returning to a previous board
    const previousSelection = previousSelections.value.get(board.id)
    if (previousSelection) {
      // Restore previous selections
      form.value.mediums = previousSelection.mediums
      form.value.standards = previousSelection.standards
    } else {
      // Reset selections for new board
      form.value.mediums = []
      form.value.standards = []
    }

    validationStates.value.mediums.touched = false
    validationStates.value.standards.touched = false

    // Focus on the next field (country) after selection
    nextTick(() => {
      const countryInput = document.getElementById('country')
      if (countryInput) {
        countryInput.focus()
      }
    })
  } catch (error) {
    console.error('Error in selectBoard:', error)
  }
}

// Update functions to fetch school mediums and standards with proper types
const fetchSchoolMediums = async (schoolId: number) => {
  try {
    const url = `/school-instruction-mediums/school/${schoolId}`
    console.log('Fetching mediums from URL:', url)
    const { data } = await axiosInstance.get(url)
    console.log('Raw mediums data:', data)

    // Map the data to the required format
    const mappedData = data.map((m: { instruction_medium: { id: number; name: string } }) => ({
      id: m.instruction_medium.id,
      name: m.instruction_medium.name,
    }))
    console.log('Mapped mediums data:', mappedData)
    return mappedData
  } catch (error) {
    console.error('Error in fetchSchoolMediums:', error)
    return []
  }
}

const fetchSchoolStandards = async (schoolId: number) => {
  try {
    const url = `/school-standards/school/${schoolId}`
    console.log('Fetching standards from URL:', url)
    const { data } = await axiosInstance.get(url)
    console.log('Raw standards data:', data)

    // Map the data to the required format
    const mappedData = data.map((s: { standard: { id: number; name: string; sequence_number: number } }) => ({
      id: s.standard.id,
      name: s.standard.name,
      sequence_number: s.standard.sequence_number
    }))
    .sort((a: { sequence_number: number }, b: { sequence_number: number }) => a.sequence_number - b.sequence_number)
    console.log('Mapped standards data:', mappedData)
    return mappedData
  } catch (error) {
    console.error('Error in fetchSchoolStandards:', error)
    return []
  }
}

// Add scrollToSelectedItem function
const scrollToSelectedItem = (type: 'board' | 'country' | 'state' | 'city') => {
  nextTick(() => {
    const activeItem = document.querySelector(`#${type}Name + .dropdown-menu .dropdown-item.active`)
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

// Update handleBoardKeydown function
const handleBoardKeydown = async (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (showBoardDropdown.value && filteredBoards.value.length && selectedBoardIndex.value >= 0) {
      await selectBoard(filteredBoards.value[selectedBoardIndex.value])
    } else if (filteredBoards.value.length === 1) {
      // If there's only one board, select it
      await selectBoard(filteredBoards.value[0])
    }
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    showBoardDropdown.value = false
    return
  }

  if (!showBoardDropdown.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      showBoardDropdown.value = true
      selectedBoardIndex.value = 0
      scrollToSelectedItem('board')
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedBoardIndex.value = Math.min(
      selectedBoardIndex.value + 1,
      filteredBoards.value.length - 1,
    )
    scrollToSelectedItem('board')
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedBoardIndex.value = Math.max(selectedBoardIndex.value - 1, 0)
    scrollToSelectedItem('board')
  }
}

// Update handleCountryKeydown function
const handleCountryKeydown = async (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (
      showCountryDropdown.value &&
      filteredCountries.value.length &&
      selectedCountryIndex.value >= 0
    ) {
      const selectedCountry = filteredCountries.value[selectedCountryIndex.value]
      await selectCountry(selectedCountry)
    }
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    showCountryDropdown.value = false
    return
  }

  if (!showCountryDropdown.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      showCountryDropdown.value = true
      selectedCountryIndex.value = 0
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedCountryIndex.value = Math.min(
      selectedCountryIndex.value + 1,
      filteredCountries.value.length - 1,
    )
    scrollToSelectedItem('country')
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedCountryIndex.value = Math.max(selectedCountryIndex.value - 1, 0)
    scrollToSelectedItem('country')
  }
}

// Update handleStateKeydown function
const handleStateKeydown = async (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (showStateDropdown.value && filteredStates.value.length && selectedStateIndex.value >= 0) {
      const selectedState = filteredStates.value[selectedStateIndex.value]
      await selectState(selectedState)
    }
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    showStateDropdown.value = false
    return
  }

  if (!showStateDropdown.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      showStateDropdown.value = true
      selectedStateIndex.value = 0
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedStateIndex.value = Math.min(
      selectedStateIndex.value + 1,
      filteredStates.value.length - 1,
    )
    scrollToSelectedItem('state')
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedStateIndex.value = Math.max(selectedStateIndex.value - 1, 0)
    scrollToSelectedItem('state')
  }
}

// Update handleCityKeydown function
const handleCityKeydown = async (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (showCityDropdown.value && filteredCities.value.length && selectedCityIndex.value >= 0) {
      const selectedCity = filteredCities.value[selectedCityIndex.value]
      selectCity(selectedCity)
    }
    return
  }

  if (e.key === 'Escape') {
    e.preventDefault()
    showCityDropdown.value = false
    return
  }

  if (!showCityDropdown.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      showCityDropdown.value = true
      selectedCityIndex.value = 0
    }
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedCityIndex.value = Math.min(selectedCityIndex.value + 1, filteredCities.value.length - 1)
    scrollToSelectedItem('city')
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedCityIndex.value = Math.max(selectedCityIndex.value - 1, 0)
    scrollToSelectedItem('city')
  }
}

// Update filter functions to reset selection index
const filterCountries = () => {
  showCountryDropdown.value = true
  selectedCountryIndex.value = -1
  if (!countrySearch.value) {
    form.value.address.country_id = 0
  }
  validationStates.value.country.touched = true
}

const filterStates = () => {
  showStateDropdown.value = true
  selectedStateIndex.value = -1
  if (!stateSearch.value) {
    form.value.address.state_id = 0
  }
  validationStates.value.state.touched = true
}

const filterCities = () => {
  showCityDropdown.value = true
  selectedCityIndex.value = -1
  if (!citySearch.value) {
    form.value.address.city_id = 0
  }
  validationStates.value.city.touched = true
}

// Update handleEnterKey function to handle tab order and keyboard navigation
const handleEnterKey = (event: KeyboardEvent, nextElementId: string) => {
  if (event.key === 'Enter') {
    event.preventDefault() // Prevent form submission
    const nextElement = document.getElementById(nextElementId)
    if (nextElement) {
      nextElement.focus()
    }
  } else if (event.key === 'Tab') {
    // Let default tab behavior work
    return
  } else if (event.key === 'Escape') {
    // Close any open dropdowns
    showBoardDropdown.value = false
    showCountryDropdown.value = false
    showStateDropdown.value = false
    showCityDropdown.value = false
  }
}

// Update isFormValid computed
const isFormValid = computed(() => {
  console.log('Form values:', {
    name: form.value.name,
    board_id: form.value.board_id,
    address: form.value.address,
    principal_name: form.value.principal_name,
    contact_number: form.value.contact_number,
    email: form.value.email,
    mediums: form.value.mediums,
    standards: form.value.standards,
  })

  const addressValid =
    form.value.address.street.trim() !== '' &&
    form.value.address.country_id !== 0 &&
    form.value.address.state_id !== 0 &&
    form.value.address.city_id !== 0 &&
    validatePostalCode(form.value.address.postal_code)

  const contactValid = validateContactNumber(form.value.contact_number)

  // Check if alternate contact is valid and not the same as primary contact
  const alternateContactValid = !form.value.alternate_contact_number ||
    (validateContactNumber(form.value.alternate_contact_number) &&
     form.value.alternate_contact_number !== form.value.contact_number)

  const isValid =
    form.value.name.trim() !== '' &&
    form.value.board_id !== 0 &&
    addressValid &&
    validatePrincipalName(form.value.principal_name) &&
    contactValid &&
    alternateContactValid &&
    validateEmail(form.value.email) &&
    form.value.mediums.length > 0 &&
    form.value.standards.length > 0

  console.log('Form validity result:', isValid)
  return isValid
})

// Watch for initialData changes and update form
watch(
  () => props.initialData,
  async (newData) => {
    console.log('Received initial data:', newData)
    if (newData) {
      // Update form with initial data
      form.value = {
        name: newData.name,
        board_id: newData.board_id,
        address_id: newData.address_id,
        principal_name: newData.principal_name,
        email: newData.email,
        contact_number: newData.contact_number,
        alternate_contact_number: newData.alternate_contact_number,
        mediums: newData.mediums,
        standards: newData.standards,
        address: {
          street: newData.address.street,
          postal_code: newData.address.postal_code,
          city_id: newData.address.city_id,
          state_id: newData.address.state_id,
          country_id: newData.address.country_id,
        },
      }

      // Update validation states
      Object.keys(validationStates.value).forEach((key) => {
        const field = key as keyof SchoolValidationStates
        validationStates.value[field].valid = true
        validationStates.value[field].touched = true
      })

      // Fetch board details and update board search
      if (form.value.board_id) {
        try {
          const { data: board } = await axiosInstance.get(`/boards/${form.value.board_id}`)
          selectedBoard.value = board
          boardSearch.value = board.name
        } catch (error) {
          console.error('Error fetching board details:', error)
        }
      }

      // Update location searches
      await updateLocationSearches()
    }
  },
  { immediate: true, deep: true },
)

// Define emits with proper types
const emit = defineEmits<{
  (e: 'submit', data: SchoolFormData): void
}>()

// Add autoResizeTextarea function
const autoResizeTextarea = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  textarea.style.height = 'auto'
  textarea.style.height = textarea.scrollHeight + 'px'
}

// Add contact number formatting function
const formatContactNumber = (number: string): string => {
  // Remove all whitespace and any characters that aren't numbers or +
  const cleaned = number.replace(/[^\d+]/g, '')

  if (!cleaned) return ''

  // If it starts with +, keep it as is
  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // If it's 10 digits (Indian number), add +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`
  }

  // For other lengths, if no + prefix, add it
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return `+${cleaned}`
  }

  return cleaned
}

// Update contact number validation
const validateContactNumber = (number: string): boolean => {
  const cleaned = number.replace(/[^\d+]/g, '')

  // Must contain only numbers and optionally a + at the start
  if (!/^\+?\d+$/.test(cleaned)) return false

  // Must be between 10 and 15 digits (including country code)
  const digitCount = cleaned.replace(/\D/g, '').length
  return digitCount >= 10 && digitCount <= 15
}

// Update contact number input handler
const handleContactNumberInput = (event: Event, isAlternate = false) => {
  const input = event.target as HTMLInputElement
  const formatted = formatContactNumber(input.value)

  if (isAlternate) {
    form.value.alternate_contact_number = formatted
    if (formatted) {
      // Check if alternate contact number is the same as primary contact number
      const isSameAsPrimary = formatted === form.value.contact_number && formatted !== '';
      validationStates.value.alternateContactNumber.valid = validateContactNumber(formatted) && !isSameAsPrimary;
    } else {
      validationStates.value.alternateContactNumber.valid = true // Empty is valid for alternate
    }
    validationStates.value.alternateContactNumber.touched = true
  } else {
    form.value.contact_number = formatted
    validationStates.value.contactNumber.valid = validateContactNumber(formatted)
    validationStates.value.contactNumber.touched = true

    // If primary contact number changes, also validate alternate contact number
    if (form.value.alternate_contact_number) {
      const isSameAsPrimary = form.value.alternate_contact_number === formatted && formatted !== '';
      validationStates.value.alternateContactNumber.valid = validateContactNumber(form.value.alternate_contact_number) && !isSameAsPrimary;
    }
  }
}

// Update interface for change tracking
interface Change {
  type: 'delete' | 'modify' | 'add'
  message: string
  entity: 'medium' | 'standard' | 'school' | 'separator'
  data: {
    id?: number
    name?: string
    old?: { id: number; name: string }
    new?: { id?: number; name: string }
  }
}

// Add ref for tracking changes
const changes = ref<Change[]>([])

// Helper functions for change tracking
const addChange = (change: Change) => {
  changes.value.push(change)
}

const handleBoardChange = (
  oldBoardId: number,
  newBoardId: number,
  currentMediums: SchoolMediumResponse[],
  currentStandards: SchoolStandardResponse[],
) => {
  const oldBoard = boards.value.find((b) => b.id === oldBoardId)
  const newBoard = boards.value.find((b) => b.id === newBoardId)

  addChange({
    type: 'modify',
    message: `Change board: ${oldBoard?.name || ''} → ${newBoard?.name || ''}`,
    entity: 'school',
    data: {
      old: { id: oldBoardId, name: oldBoard?.name || '' },
      new: { id: newBoardId, name: newBoard?.name || '' },
    },
  })

  // Handle deletions for board change
  handleBoardChangeDeletes(currentMediums, currentStandards)
  // Handle additions for board change
  handleBoardChangeAdditions()
}

const handleBoardChangeDeletes = (
  currentMediums: SchoolMediumResponse[],
  currentStandards: SchoolStandardResponse[],
) => {
  // Delete current mediums
  if (currentMediums?.length > 0) {
    currentMediums.forEach((medium) => {
      const mediumId = medium.instruction_medium_id || medium.id
      const mediumName = medium.instruction_medium?.name || medium.name
      if (mediumId) {
        addChange({
          type: 'delete',
          message: `Delete medium (board change): ${mediumName}`,
          entity: 'medium',
          data: { id: mediumId, name: mediumName },
        })
      }
    })
  }

  // Delete current standards
  if (currentStandards?.length > 0) {
    currentStandards.forEach((standard) => {
      const standardId = standard.standard_id || standard.id
      const standardName = standard.standard?.name || standard.name
      if (standardId) {
        addChange({
          type: 'delete',
          message: `Delete standard (board change): ${standardName}`,
          entity: 'standard',
          data: { id: standardId, name: standardName },
        })
      }
    })
  }
}

const handleBoardChangeAdditions = () => {
  // Add new mediums
  form.value.mediums.forEach((mediumId) => {
    const medium = availableMediums.value.find((m) => m.id === mediumId)
    if (medium) {
      addChange({
        type: 'add',
        message: `Add medium (new board): ${medium.name}`,
        entity: 'medium',
        data: { id: medium.id, name: medium.name },
      })
    }
  })

  // Add new standards
  form.value.standards.forEach((standardId) => {
    const standard = availableStandards.value.find((s) => s.id === standardId)
    if (standard) {
      addChange({
        type: 'add',
        message: `Add standard (new board): ${standard.name}`,
        entity: 'standard',
        data: { id: standard.id, name: standard.name },
      })
    }
  })
}

const handleNormalChanges = (
  currentMediums: SchoolMediumResponse[],
  currentStandards: SchoolStandardResponse[],
) => {
  const formMediums = form.value.mediums.filter((id) => id > 0)
  const formStandards = form.value.standards.filter((id) => id > 0)

  handleMediumChanges(currentMediums, formMediums)
  handleStandardChanges(currentStandards, formStandards)
}

const handleMediumChanges = (currentMediums: SchoolMediumResponse[], formMediums: number[]) => {
  // Handle deleted mediums
  currentMediums.forEach((medium) => {
    const mediumId = medium.instruction_medium_id || medium.id
    if (mediumId && !formMediums.includes(mediumId)) {
      // Find the medium name from availableMediums
      const mediumInfo = availableMediums.value.find((m) => m.id === mediumId)
      const mediumName = mediumInfo?.name || 'Unknown Medium'
      addChange({
        type: 'delete',
        message: `Delete medium: ${mediumName}`,
        entity: 'medium',
        data: { id: mediumId, name: mediumName },
      })
    }
  })

  // Handle added mediums
  formMediums.forEach((mediumId) => {
    const exists = currentMediums.some((m) => {
      const existingId = m.instruction_medium_id || m.id
      return existingId === mediumId
    })

    if (!exists) {
      const medium = availableMediums.value.find((m) => m.id === mediumId)
      if (medium) {
        addChange({
          type: 'add',
          message: `Add medium: ${medium.name}`,
          entity: 'medium',
          data: { id: medium.id, name: medium.name },
        })
      }
    }
  })
}

const handleStandardChanges = (
  currentStandards: SchoolStandardResponse[],
  formStandards: number[],
) => {
  // Handle deleted standards
  currentStandards.forEach((standard) => {
    const standardId = standard.standard_id || standard.id
    if (standardId && !formStandards.includes(standardId)) {
      const standardName = standard.standard?.name || standard.name
      addChange({
        type: 'delete',
        message: `Delete standard: ${standardName}`,
        entity: 'standard',
        data: { id: standardId, name: standardName },
      })
    }
  })

  // Handle added standards
  formStandards.forEach((standardId) => {
    const exists = currentStandards.some((s) => {
      const existingId = s.standard_id || s.id
      return existingId === standardId
    })

    if (!exists) {
      const standard = availableStandards.value.find((s) => s.id === standardId)
      if (standard) {
        addChange({
          type: 'add',
          message: `Add standard: ${standard.name}`,
          entity: 'standard',
          data: { id: standard.id, name: standard.name },
        })
      }
    }
  })
}

const handleBasicInfoChanges = (schoolId: number) => {
  if (!props.initialData) return

  if (form.value.name !== props.initialData.name) {
    addChange({
      type: 'modify',
      message: `Modify school name: ${props.initialData.name} → ${form.value.name}`,
      entity: 'school',
      data: {
        old: { id: schoolId, name: props.initialData.name },
        new: { name: form.value.name },
      },
    })
  }

  // Add other basic info changes here...
}

// Main calculateChanges function
const calculateChanges = async () => {
  changes.value = []

  if (!props.isEditMode || !props.schoolId) return

  const schoolId = parseInt(props.schoolId)
  const [currentMediums, currentStandards] = await Promise.all([
    fetchSchoolMediums(schoolId),
    fetchSchoolStandards(schoolId),
  ])

  if (props.initialData && form.value.board_id !== props.initialData.board_id) {
    // Handle board change
    handleBoardChange(
      props.initialData.board_id,
      form.value.board_id,
      currentMediums,
      currentStandards,
    )
  } else {
    // Handle normal changes
    handleNormalChanges(currentMediums, currentStandards)
  }

  // Handle basic info changes
  handleBasicInfoChanges(schoolId)
}

// Update confirmAndSubmit to handle both add and edit modes
const confirmAndSubmit = async () => {
  try {
    isSubmitting.value = true

    if (props.isEditMode) {
      // Close the confirmation modal if in edit mode
      const modalElement = document.getElementById('saveConfirmationModal') as HTMLElement
      const modal = Modal.getInstance(modalElement)
      modal?.hide()

      // Remove backdrop manually
      document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

      // Remove modal-open class and inline styles from body
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('padding-right')
    }

    // Emit the form data to the parent component
    emit('submit', form.value)
  } catch (error) {
    console.error('Error submitting form:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Navigation
const goBack = () => {
  resetForm()
  router.push('/admin/school')
}

// Add necessary state and methods
// Similar to BoardFormComponent but adapted for school

// Add fetchBoards function
const fetchBoards = async () => {
  try {
    const { data } = await axiosInstance.get('/boards')
    // Handle both paginated and non-paginated response formats
    boards.value = data.data || data
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

// Add onMounted hook to fetch boards when component mounts
onMounted(async () => {
  console.log('Component mounted')
  // Fetch initial data
  await fetchCountries()
  await fetchBoards()

  // Add click outside handlers
  document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('#boardName')) {
      showBoardDropdown.value = false
    }
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

  // If in edit mode and we have initial data, load the locations
  if (props.isEditMode && props.initialData) {
    await updateLocationSearches()
  }
})

// Update function to use specific ID-based endpoints
const updateLocationSearches = async () => {
  try {
    if (form.value.address.city_id) {
      // Fetch city details by ID
      const { data: city } = await axiosInstance.get(`/cities/${form.value.address.city_id}`)
      citySearch.value = city.name
      selectedCity.value = city
      form.value.address.state_id = city.state_id

      // Fetch state by ID
      const { data: state } = await axiosInstance.get(`/states/${city.state_id}`)
      stateSearch.value = state.name
      selectedState.value = state
      form.value.address.country_id = state.country_id

      // Fetch country by ID
      const { data: country } = await axiosInstance.get(`/countries/${state.country_id}`)
      countrySearch.value = country.name
      selectedCountry.value = country

      // Update validation states
      validationStates.value.city.valid = true
      validationStates.value.state.valid = true
      validationStates.value.country.valid = true

      // Fetch states and cities for dropdowns
      await fetchStates(state.country_id)
      await fetchCities(state.id)
    }
  } catch (error) {
    console.error('Error updating location searches:', error)
  }
}

// Update fetchStates to only fetch states for a specific country
const fetchStates = async (countryId: number) => {
  try {
    const { data } = await axiosInstance.get(`/states?countryId=${countryId}`)
    states.value = data
  } catch (error) {
    console.error('Error fetching states:', error)
    states.value = []
  }
}

// Update fetchCities to only fetch cities for a specific state
const fetchCities = async (stateId: number) => {
  try {
    const { data } = await axiosInstance.get(`/cities?stateId=${stateId}`)
    cities.value = data
  } catch (error) {
    console.error('Error fetching cities:', error)
    cities.value = []
  }
}

const resetForm = () => {
  // Reset form fields
  form.value.name = ''
  form.value.board_id = 0
  form.value.address.street = ''
  form.value.address.postal_code = ''
  form.value.address.city_id = 0
  form.value.address.state_id = 0
  form.value.address.country_id = 0
  form.value.principal_name = ''
  form.value.email = ''
  form.value.contact_number = ''
  form.value.alternate_contact_number = ''
  form.value.mediums = []
  form.value.standards = []

  // Reset validation states
  validationStates.value.name.touched = false
  validationStates.value.board.touched = false
  validationStates.value.country.touched = false
  validationStates.value.state.touched = false
  validationStates.value.city.touched = false
  validationStates.value.address.touched = false
  validationStates.value.postalCode.touched = false
  validationStates.value.principalName.touched = false
  validationStates.value.email.touched = false
  validationStates.value.contactNumber.touched = false
  validationStates.value.mediums.touched = false
  validationStates.value.standards.touched = false

  // Reset dropdowns
  showCountryDropdown.value = false
  showStateDropdown.value = false
  showCityDropdown.value = false
  selectedCountryIndex.value = -1
  selectedStateIndex.value = -1
  selectedCityIndex.value = -1
  selectedBoardIndex.value = -1

  // Reset board mediums and standards
  availableMediums.value = []
  availableStandards.value = []
  boardSearch.value = ''
}

const handleCheckboxKeydown = (event: KeyboardEvent, type: 'medium' | 'standard', id: number) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (type === 'medium') {
      const index = form.value.mediums.indexOf(id)
      if (index === -1) {
        form.value.mediums.push(id)
      } else {
        form.value.mediums.splice(index, 1)
      }
      validationStates.value.mediums.touched = true
      validationStates.value.mediums.valid = form.value.mediums.length > 0
    } else {
      const index = form.value.standards.indexOf(id)
      if (index === -1) {
        form.value.standards.push(id)
      } else {
        form.value.standards.splice(index, 1)
      }
      validationStates.value.standards.touched = true
      validationStates.value.standards.valid = form.value.standards.length > 0
    }
  }
}

const handleSaveKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !isSubmitting.value && isFormValid.value) {
    event.preventDefault()
    onSubmit(event)
  }
}

const filterBoards = () => {
  showBoardDropdown.value = true
  selectedBoardIndex.value = -1
  if (!boardSearch.value) {
    form.value.board_id = 0
    // Clear mediums and standards when board is cleared
    availableMediums.value = []
    availableStandards.value = []
    form.value.mediums = []
    form.value.standards = []
  }
  validationStates.value.board.touched = true
}

// Add validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

const validatePostalCode = (code: string): boolean => {
  // Postal code should not be empty and can contain letters, numbers, and hyphens
  return code.trim().length > 0 && /^[a-zA-Z0-9-]*$/.test(code)
}

const validatePrincipalName = (name: string): boolean => {
  // Principal name should be at least 3 characters and contain only letters and spaces
  return /^[a-zA-Z\s]{3,}$/.test(name)
}

// Add address validation function
const validateAddress = (address: string): boolean => {
  // Address should be at least 10 characters and contain alphanumeric characters
  return address.trim().length >= 10 && /^[a-zA-Z0-9\s,.-]+$/.test(address)
}

// Update handleCountryChange function
const handleCountryChange = async () => {
  // Reset dependent fields
  form.value.address.state_id = 0
  form.value.address.city_id = 0
  stateSearch.value = ''
  citySearch.value = ''
  validationStates.value.state.valid = false
  validationStates.value.city.valid = false

  // Fetch states for selected country using query parameter
  if (form.value.address.country_id) {
    try {
      console.log('Fetching states for country:', form.value.address.country_id)
      const { data } = await axiosInstance.get(`/states?countryId=${form.value.address.country_id}`)
      console.log('Fetched states:', data)
      states.value = data
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
      console.log('Fetching cities for state:', form.value.address.state_id)
      const { data } = await axiosInstance.get(`/cities?stateId=${form.value.address.state_id}`)
      console.log('Fetched cities:', data)
      cities.value = data
    } catch (error) {
      console.error('Error fetching cities:', error)
      cities.value = []
    }
  } else {
    cities.value = []
  }
}

// Add fetchCountries function
const fetchCountries = async () => {
  try {
    const { data } = await axiosInstance.get('/countries')
    countries.value = data
  } catch (error) {
    console.error('Error fetching countries:', error)
    countries.value = []
  }
}

// Add handleEmailEnter function
const handleEmailEnter = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault() // Prevent form submission

    // Try to focus on first medium input if exists
    const firstMediumInput = document.getElementById('medium0')
    if (firstMediumInput) {
      firstMediumInput.focus()
      return
    }

    // If no mediums, try to focus on first standard input
    const firstStandardInput = document.getElementById('standard0')
    if (firstStandardInput) {
      firstStandardInput.focus()
      return
    }

    // If no standards, focus on save button
    const saveButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
    if (saveButton) {
      saveButton.focus()
    }
  }
}

// Add handleEmailInput function
const handleEmailInput = () => {
  validationStates.value.email.valid = validateEmail(form.value.email)
  validationStates.value.email.touched = true
}

// Expose necessary properties for external access
defineExpose({
  availableMediums,
  availableStandards,
  boardSearch,
})

// Rename handleSubmit to onSubmit for clarity
const onSubmit = async (e: Event) => {
  e.preventDefault()
  console.log('Form submission started')

  // Mark all fields as touched to trigger validation display
  Object.keys(validationStates.value).forEach((key) => {
    validationStates.value[key as keyof typeof validationStates.value].touched = true
  })

  // Update validation states for mediums and standards
  validationStates.value.mediums.valid = form.value.mediums.length > 0
  validationStates.value.standards.valid = form.value.standards.length > 0

  // Check if form is valid
  if (!isFormValid.value) {
    console.log('Form validation failed')
    const firstInvalidField = document.querySelector('.is-invalid') as HTMLElement
    if (firstInvalidField) {
      firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' })
      firstInvalidField.focus()
    }
    return
  }

  console.log('Form is valid, proceeding with submission')

  try {
    isSubmitting.value = true

    if (props.isEditMode) {
      // Calculate changes and show confirmation modal only in edit mode
      await calculateChanges()
      const modal = new Modal(document.getElementById('saveConfirmationModal') as HTMLElement)
      modal.show()
    } else {
      // In add mode, directly submit the form
      console.log('Submitting form data:', form.value)
      emit('submit', form.value)
    }
  } catch (error) {
    console.error('Error in form submission:', error)
  } finally {
    isSubmitting.value = false
  }
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
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
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
  color: #212529;
}

.dropdown-item.active {
  background-color: #212529;
  color: white;
}

/* Form select styles */
.form-select {
  appearance: auto;
  background-image: none;
  padding-right: 2rem;
}

.form-select option {
  padding: 8px;
}

.form-floating > .form-select {
  padding-top: 1.625rem;
  padding-bottom: 0.625rem;
}

/* Scrollbar styles for dropdowns */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Specific dropdown styles */
#country + .dropdown-menu .dropdown-item.active,
#state + .dropdown-menu .dropdown-item.active,
#city + .dropdown-menu .dropdown-item.active,
#boardName + .dropdown-menu .dropdown-item.active {
  background-color: #212529;
  color: white;
}

#country + .dropdown-menu .dropdown-item:hover,
#state + .dropdown-menu .dropdown-item.hover,
#city + .dropdown-menu .dropdown-item:hover,
#boardName + .dropdown-menu .dropdown-item:hover {
  background-color: #f8f9fa;
  color: #212529;
}

/* Custom breakpoint for when text might overflow */
@media (max-width: 1200px) {
  .col-12 {
    margin-bottom: 0.5rem;
  }

  .col-12:last-child {
    margin-bottom: 0;
  }

  .row + .row {
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .form-floating > .form-control,
  .form-floating > .form-select {
    height: calc(3rem + 2px);
    font-size: 0.9rem;
  }

  .form-floating > label {
    font-size: 0.9rem;
  }
}
</style>
