<template>
  <fieldset class="border p-3 rounded col-12 col-sm-10 col-md-8" 
    autocomplete="off" 
    data-form-type="other" 
    data-address-type="none"
  >
    <legend class="float-none w-auto px-2">{{ title }} Address &nbsp;</legend>
    <div class="row g-3">
      <!-- Country -->
      <div class="col-12 col-xl-4">
        <SearchableDropdown
          :id="'country'"
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
          :id="'state'"
          label="State"
          placeholder="Search State"
          :items="states"
          v-model="selectedState"
          :required="true"
          :disabled="!address.country_id"
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
          :id="'city'"
          label="City"
          placeholder="Search City"
          :items="cities"
          v-model="selectedCity"
          :required="true"
          :disabled="!address.state_id"
          :class="{
            'is-invalid': !validationStates.city.valid && validationStates.city.touched,
            'is-valid': validationStates.city.valid,
          }"
          nextFieldId="address"
          @change="handleCityChange"
        />
        <div class="invalid-feedback">Please select a city</div>
      </div>

      <!-- Street Address -->
      <div class="col-12">
        <div class="autofill-block">
          <!-- Hidden inputs to confuse Chrome's autofill -->
          <input type="text" style="display:none" name="address-line1" autocomplete="off" />
          <input type="text" style="display:none" name="street-address" autocomplete="off" />
          <input type="text" style="display:none" name="address1" autocomplete="off" />
          <input type="text" style="display:none" name="address" autocomplete="off" />
        </div>
        <FormInput
          id="address"
          label="Address"
          type="textarea"
          :model-value="address.street"
          :is-valid="validationStates.address.valid"
          :is-touched="validationStates.address.touched"
          :required="true"
          :error-message="'Please enter an address.'"
          next-field-id="postalCode"
          autocomplete="off"
          @update:model-value="updateStreet"
          @input="handleStreetInput"
        />
      </div>

      <!-- Postal Code -->
      <div class="col-12">
        <FormInput
          id="postalCode"
          label="Postal Code"
          type="text"
          :model-value="address.postal_code"
          :is-valid="validationStates.postalCode.valid"
          :is-touched="validationStates.postalCode.touched"
          :required="true"
          :error-message="'Please enter a postal code.'"
          @update:model-value="updatePostalCode"
          @input="handlePostalCodeInput"
        />
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import FormInput from '@/components/common/FormInput.vue'
import axiosInstance from '@/config/axios'

// Define interfaces
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

interface Address {
  street: string
  postal_code: string
  city_id: number
  state_id: number
  country_id: number
}

interface ValidationState {
  valid: boolean
  touched: boolean
}

interface ValidationStates {
  country: ValidationState
  state: ValidationState
  city: ValidationState
  address: ValidationState
  postalCode: ValidationState
}

// Props
const props = withDefaults(
  defineProps<{
    title: string
    modelValue: Address
    validationStates: ValidationStates
  }>(),
  {
    title: 'Entity',
  },
)

// Emit
const emit = defineEmits<{
  (e: 'update:modelValue', value: Address): void
  (e: 'update:validationStates', value: ValidationStates): void
  (e: 'country-change', country: Country | null): void
  (e: 'state-change', state: State | null): void
  (e: 'city-change', city: City | null): void
}>()

// Data refs
const countries = ref<Country[]>([])
const states = ref<State[]>([])
const cities = ref<City[]>([])
const selectedCountry = ref<Country | null>(null)
const selectedState = ref<State | null>(null)
const selectedCity = ref<City | null>(null)

// Computed property for the address
const address = computed(() => props.modelValue)

// Fetch country data on mount
onMounted(async () => {
  // First fetch all countries
  await fetchCountries()
  
  // Wait a small delay to ensure countries are loaded properly
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // If address already has data, initialize selections
  if (address.value.country_id && address.value.state_id && address.value.city_id) {
    await fetchInitialData()
  }
})

// Fetch countries
const fetchCountries = async () => {
  try {
    const response = await axiosInstance.get('/countries')
    countries.value = response.data
    
    // If we have a country_id, select the country
    if (address.value.country_id) {
      const country = countries.value.find(c => c.id === address.value.country_id)
      if (country) {
        selectedCountry.value = country
      }
    }
  } catch (error) {
    console.error('Error fetching countries:', error)
  }
}

// Fetch initial data for editing
const fetchInitialData = async () => {
  try {
    if (!address.value.country_id) return
    
    await fetchAndSetCountry()
    if (address.value.state_id) {
      await fetchAndSetState()
      if (address.value.city_id) {
        await fetchAndSetCity()
      }
    }
    
    updateValidationStates()
  } catch (error) {
    console.error('Error fetching initial address data:', error)
  }
}

// Helper function to fetch and set country
const fetchAndSetCountry = async () => {
  const country = countries.value.find(c => c.id === address.value.country_id)
  if (!country) return
  
  selectedCountry.value = country
  
  // Fetch states for this country
  const statesResponse = await axiosInstance.get(`/states?countryId=${address.value.country_id}`)
  states.value = statesResponse.data
  
  // Short delay to ensure states are processed
  await new Promise(resolve => setTimeout(resolve, 100))
}

// Helper function to fetch and set state
const fetchAndSetState = async () => {
  const state = states.value.find(s => s.id === address.value.state_id)
  if (!state) return
  
  selectedState.value = state
  
  // Fetch cities for this state
  const citiesResponse = await axiosInstance.get(`/cities?stateId=${address.value.state_id}`)
  cities.value = citiesResponse.data
  
  // Short delay to ensure cities are processed
  await new Promise(resolve => setTimeout(resolve, 100))
}

// Helper function to fetch and set city
const fetchAndSetCity = async () => {
  const city = cities.value.find(c => c.id === address.value.city_id)
  if (city) {
    selectedCity.value = city
  }
}

// Update validation states
const updateValidationStates = () => {
  const updatedValidation = {
    ...props.validationStates,
    country: {
      valid: !!selectedCountry.value,
      touched: !!selectedCountry.value,
    },
    state: {
      valid: !!selectedState.value,
      touched: !!selectedState.value,
    },
    city: {
      valid: !!selectedCity.value,
      touched: !!selectedCity.value,
    },
    address: {
      valid: address.value.street.trim().length > 0,
      touched: address.value.street.trim().length > 0,
    },
    postalCode: {
      valid: address.value.postal_code.trim().length > 0,
      touched: address.value.postal_code.trim().length > 0,
    }
  }
  
  emit('update:validationStates', updatedValidation)
}

// Country change
const handleCountryChange = async (value: Country | null) => {
  try {
    // Update selected country
    selectedCountry.value = value
    
    // Reset state and city
    selectedState.value = null
    selectedCity.value = null
    states.value = []
    cities.value = []
    
    // Update address data
    const updatedAddress = {
      ...address.value,
      country_id: value?.id ?? 0,
      state_id: 0,
      city_id: 0,
    }
    emit('update:modelValue', updatedAddress)
    
    // Update validation states
    const updatedValidation = {
      ...props.validationStates,
      country: {
        valid: !!value,
        touched: true,
      },
      state: {
        valid: false,
        touched: false,
      },
      city: {
        valid: false,
        touched: false,
      }
    }
    emit('update:validationStates', updatedValidation)
    
    // Emit country change
    emit('country-change', value)
    
    // Fetch states for this country
    if (value?.id) {
      const response = await axiosInstance.get(`/states?countryId=${value.id}`)
      states.value = response.data
    }
  } catch (error) {
    console.error('Error in handleCountryChange:', error)
  }
}

// State change
const handleStateChange = async (value: State | null) => {
  try {
    // Update selected state
    selectedState.value = value
    
    // Reset city
    selectedCity.value = null
    cities.value = []
    
    // Update address data
    const updatedAddress = {
      ...address.value,
      state_id: value?.id ?? 0,
      city_id: 0,
    }
    emit('update:modelValue', updatedAddress)
    
    // Update validation states
    const updatedValidation = {
      ...props.validationStates,
      state: {
        valid: !!value,
        touched: true,
      },
      city: {
        valid: false,
        touched: false,
      }
    }
    emit('update:validationStates', updatedValidation)
    
    // Emit state change
    emit('state-change', value)
    
    // Fetch cities for this state
    if (value?.id) {
      const response = await axiosInstance.get(`/cities?stateId=${value.id}`)
      cities.value = response.data
    }
  } catch (error) {
    console.error('Error in handleStateChange:', error)
  }
}

// City change
const handleCityChange = (value: City | null) => {
  // Update selected city
  selectedCity.value = value
  
  // Update address data
  const updatedAddress = {
    ...address.value,
    city_id: value?.id ?? 0,
  }
  emit('update:modelValue', updatedAddress)
  
  // Update validation states
  const updatedValidation = {
    ...props.validationStates,
    city: {
      valid: !!value,
      touched: true,
    }
  }
  emit('update:validationStates', updatedValidation)
  
  // Emit city change
  emit('city-change', value)
}

// Street input
const updateStreet = (value: string) => {
  const updatedAddress = {
    ...address.value,
    street: value,
  }
  emit('update:modelValue', updatedAddress)
}

const handleStreetInput = () => {
  // Update validation states
  const updatedValidation = {
    ...props.validationStates,
    address: {
      valid: !!address.value.street.trim(),
      touched: true,
    }
  }
  emit('update:validationStates', updatedValidation)
}

// Postal code input
const updatePostalCode = (value: string) => {
  const updatedAddress = {
    ...address.value,
    postal_code: value,
  }
  emit('update:modelValue', updatedAddress)
}

const handlePostalCodeInput = () => {
  // Update validation states
  const updatedValidation = {
    ...props.validationStates,
    postalCode: {
      valid: !!address.value.postal_code.trim(),
      touched: true,
    }
  }
  emit('update:validationStates', updatedValidation)
}

// Watch for country changes from parent
watch(
  () => address.value,
  async (newAddress) => {
    // If we have all location IDs but no selections, re-initialize
    if (
      newAddress.country_id && 
      newAddress.state_id && 
      newAddress.city_id && 
      (!selectedCountry.value || !selectedState.value || !selectedCity.value)
    ) {
      await fetchInitialData()
    }
  },
  { deep: true, immediate: true }
)

// Watch for country changes from parent
watch(
  () => address.value.country_id,
  async (newValue, oldValue) => {
    if (newValue !== oldValue && newValue) {
      // Find the country in our list
      const country = countries.value.find(c => c.id === newValue)
      if (country && !selectedCountry.value) {
        selectedCountry.value = country
        
        // Fetch states for this country
        const response = await axiosInstance.get(`/states?countryId=${newValue}`)
        states.value = response.data
      }
    }
  }
)

// Watch for state changes from parent
watch(
  () => address.value.state_id,
  async (newValue, oldValue) => {
    if (newValue !== oldValue && newValue) {
      // Find the state in our list
      const state = states.value.find(s => s.id === newValue)
      if (state && !selectedState.value) {
        selectedState.value = state
        
        // Fetch cities for this state
        const response = await axiosInstance.get(`/cities?stateId=${newValue}`)
        cities.value = response.data
      }
    }
  }
)

// Watch for city changes from parent
watch(
  () => address.value.city_id,
  (newValue, oldValue) => {
    if (newValue !== oldValue && newValue) {
      // Find the city in our list
      const city = cities.value.find(c => c.id === newValue)
      if (city && !selectedCity.value) {
        selectedCity.value = city
      }
    }
  }
)
</script>

<style scoped>
.form-floating {
  margin-bottom: 0;
}

.invalid-feedback {
  display: none;
}

.is-invalid ~ .invalid-feedback {
  display: block;
}
</style> 