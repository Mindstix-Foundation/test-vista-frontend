// Validation constants to match backend validation messages
export const VALIDATION_MESSAGES = {
  CONTACT: {
    REQUIRED: 'Contact number is required',
    INVALID: 'Please enter exactly 10 digits starting with 6, 7, 8, or 9',
    DUPLICATE: 'Alternate contact number cannot be the same as primary contact number',
    DIFFERENT: 'Alternate contact number must be different from primary contact number'
  },
  EMAIL: {
    REQUIRED: 'Email is required',
    INVALID: 'Please enter a valid email address'
  },
  FIELD: {
    REQUIRED: 'This field is required'
  },
  FORM: {
    FILL_ALL_REQUIRED: 'Please fill all required fields'
  },
  LIST: {
    DUPLICATE: 'already exists',
    AT_LEAST_ONE_REQUIRED: 'is required'
  },
  NAME: {
    REQUIRED: 'Name is required',
    INVALID: 'Please enter a valid name (only letters and spaces, minimum 3 characters)',
    MIN_LENGTH: 'Name must be at least 3 characters',
    INVALID_CHARS: 'Name can only contain letters and spaces'
  },
  PASSWORD: {
    REQUIRED: 'Password is required',
    CURRENT_REQUIRED: 'Current password is required',
    COMPLEXITY: 'Password does not meet complexity requirements',
    MISMATCH: 'Passwords do not match',
    INCORRECT: 'Current password is incorrect. Please try again'
  },
  QUALIFICATION: {
    REQUIRED: 'Qualification is required',
    MIN_LENGTH: 'Qualification must be at least 2 characters'
  },
  BOARD: {
    REQUIRED: 'Board selection is required',
    INVALID: 'Please select a valid board'
  },
  SCHOOL: {
    REQUIRED: 'School selection is required',
    INVALID: 'Please select a valid school',
    SELECT_BOARD_FIRST: 'Please select a board first',
    NO_SCHOOLS: 'This board has no schools'
  },
  MEDIUM: {
    REQUIRED: 'Please select at least one medium'
  },
  STANDARD: {
    REQUIRED: 'Please select at least one standard'
  },
  TEACHER_SUBJECTS: {
    REQUIRED: 'Please select at least one standard with subjects'
  },
  SECTION: {
    QUESTION_NUMBER: 'Please enter a valid question number greater than 0',
    SUB_QUESTION: 'Please enter a valid sub question',
    NAME: 'Please enter a section name',
    HEADER_FIELDS: 'Please fill in all section header fields',
    TOTAL_QUESTIONS: 'Please enter total questions',
    REQUIRED_QUESTIONS: 'Please enter required questions',
    MARKS_PER_QUESTION: 'Please enter marks per question',
    MARKS_GREATER_THAN_ZERO: 'Marks per question must be greater than 0'
  }
}

// Contact number validation function
export const validateContactNumber = (number: string): boolean => {
  if (!number) return false
  
  // Remove all non-digit characters for validation
  const cleaned = number.replace(/\D/g, '')
  
  // Must be exactly 10 digits for Indian mobile numbers
  return cleaned.length === 10 && /^[6-9]/.test(cleaned)
}

// Contact number formatting function for display (no + prefix, allow more than 10 digits to show user input)
export const formatContactNumber = (number: string): string => {
  if (!number) return ''
  
  // Remove all non-digit characters
  const cleaned = number.replace(/\D/g, '')
  
  // Return the cleaned number as-is (don't limit to 10 digits for display)
  return cleaned
}

// Function to format contact number for API submission (adds +91)
export const formatContactNumberForAPI = (number: string): string => {
  if (!number) return ''
  
  // Remove all non-digit characters
  const cleaned = number.replace(/\D/g, '')
  
  // If it's exactly 10 digits, add +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`
  }
  
  return cleaned
}

// Email validation function
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
} 