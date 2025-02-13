// School form data interface
export interface SchoolFormData {
  name: string
  board_id: number
  address_id: number
  principal_name: string
  email: string
  contact_number: string
  alternate_contact_number?: string
  address: {
    street: string
    postal_code: string
    city_id: number
    state_id: number
    country_id: number
  }
  mediums: number[] // Array of instruction_medium_ids
  standards: number[] // Array of standard_ids
}

// Create DTOs
export interface CreateSchoolDto {
  name: string
  board_id: number
  address_id: number
  principal_name: string
  email: string
  contact_number: string
  alternate_contact_number?: string
}

export interface CreateSchoolAddressDto {
  street: string
  postal_code: string
  city_id: number
}

export interface CreateSchoolMediumDto {
  school_id: number
  instruction_medium_id: number
}

export interface CreateSchoolStandardDto {
  school_id: number
  standard_id: number
}

// Response interfaces
export interface School {
  id: number
  name: string
  board_id: number
  address_id: number
  principal_name: string
  email: string
  contact_number: string
  alternate_contact_number?: string
  created_at: string
  updated_at: string
  created_by: number
  updated_by: number
}

export interface SchoolAddress {
  id?: number
  street: string
  postal_code: string
  city_id: number
  state_id: number
  country_id: number
  city: {
    id: number
    state_id: number
    name: string
  }
  state: {
    id: number
    country_id: number
    name: string
  }
  country: {
    id: number
    name: string
  }
}

export interface SchoolMedium {
  id: number
  school_id: number
  instruction_medium_id: number
  created_at: string
  updated_at: string
  created_by: number
  updated_by: number
}

export interface SchoolStandard {
  id: number
  school_id: number
  standard_id: number
  created_at: string
  updated_at: string
  created_by: number
  updated_by: number
}

// Validation state interface
export interface ValidationState {
  valid: boolean
  touched: boolean
}

export interface SchoolValidationStates {
  name: ValidationState
  board: ValidationState
  country: ValidationState
  state: ValidationState
  city: ValidationState
  address: ValidationState
  postalCode: ValidationState
  principalName: ValidationState
  email: ValidationState
  contactNumber: ValidationState
  alternateContactNumber: ValidationState
  mediums: ValidationState
  standards: ValidationState
}
