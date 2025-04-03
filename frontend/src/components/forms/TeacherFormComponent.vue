<template>
  <form @submit.prevent="handleSubmit" class="needs-validation" novalidate>
    <div class="row g-3 justify-content-center">
      <!-- Teacher Name -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="nameInput"
            type="text"
            class="form-control"
            :class="{
              'is-invalid': !validationStates.name.valid && validationStates.name.touched,
              'is-valid': validationStates.name.valid,
            }"
            id="teacherName"
            v-model="formData.name"
            placeholder="Enter Teacher Name"
            @input="handleNameInput"
            @keydown="handleKeyDown($event, 'board')"
            required
          />
          <label for="teacherName">Teacher Name <span class="text-danger">*</span></label>
          <div
            class="invalid-feedback"
            v-if="!validationStates.name.valid && validationStates.name.touched"
          >
            {{ v$.name.$errors[0]?.$message || 'Please enter a valid name' }}
          </div>
        </div>
      </div>

      <!-- Board Selection -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating dropdown board-dropdown">
          <input
            ref="boardInput"
            type="text"
            class="form-control"
            :class="{
              'is-invalid':
                !validationStates.boardId.valid &&
                validationStates.boardId.touched &&
                !showBoardDropdown,
              'is-valid': validationStates.boardId.valid && validationStates.boardId.touched,
            }"
            id="board"
            v-model="boardSearch"
            @input="filterBoards"
            @focus="showBoardDropdown = true"
            @click="showBoardDropdown = true"
            placeholder="Search Board"
            autocomplete="off"
            @keydown="handleBoardKeydown"
            required
          />
          <div
            class="dropdown-menu"
            :class="{ show: showBoardDropdown && filteredBoards.length > 0 }"
          >
            <button
              type="button"
              v-for="(board, index) in filteredBoards"
              :key="board.id"
              class="dropdown-item"
              :class="{ active: index === selectedBoardIndex }"
              @click="selectBoard(board)"
              @mousedown.prevent="selectBoard(board)"
            >
              {{ board.name }}
            </button>
          </div>
          <label for="board">Board <span class="text-danger">*</span></label>
          <div
            class="invalid-feedback"
            v-show="
              !validationStates.boardId.valid &&
              validationStates.boardId.touched &&
              !showBoardDropdown
            "
          >
            Please select a board
          </div>
        </div>
      </div>

      <!-- School Selection -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating dropdown school-dropdown">
          <input
            ref="schoolInput"
            type="text"
            class="form-control"
            :class="{
              'is-invalid':
                !validationStates.schoolId.valid &&
                validationStates.schoolId.touched &&
                !showSchoolDropdown,
              'is-valid': validationStates.schoolId.valid && validationStates.schoolId.touched,
            }"
            id="school"
            v-model="schoolSearch"
            @input="filterSchools"
            @focus="showSchoolDropdown = true"
            @click="showSchoolDropdown = true"
            placeholder="Search School"
            autocomplete="off"
            @keydown="handleSchoolKeydown"
            :disabled="!formData.boardId"
            required
          />
          <div
            class="dropdown-menu"
            :class="{
              show:
                showSchoolDropdown &&
                (filteredSchools.length > 0 || (formData.boardId && schools.length === 0)),
            }"
          >
            <div v-if="formData.boardId && schools.length === 0" class="dropdown-item no-schools">
              This board doesn't have any schools
            </div>
            <button
              v-else
              type="button"
              v-for="(school, index) in filteredSchools"
              :key="school.id"
              class="dropdown-item"
              :class="{ active: index === selectedSchoolIndex }"
              @click="selectSchool(school)"
            >
              {{ school.name }}
            </button>
          </div>
          <label for="school">School <span class="text-danger">*</span></label>
          <div
            class="invalid-feedback"
            v-show="
              !validationStates.schoolId.valid &&
              validationStates.schoolId.touched &&
              !showSchoolDropdown
            "
          >
            {{
              !formData.boardId
                ? 'Please select a board first'
                : formData.boardId && schools.length === 0
                  ? 'This board has no schools'
                  : 'Please select a school'
            }}
          </div>
        </div>
      </div>

      <!-- Email -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="emailInput"
            type="email"
            class="form-control"
            :class="{
              'is-valid': validationStates.emailId.valid && validationStates.emailId.touched,
              'is-invalid': !validationStates.emailId.valid && validationStates.emailId.touched,
            }"
            id="emailId"
            v-model="formData.emailId"
            placeholder="Enter Email"
            @input="handleEmailInput"
            @blur="handleEmailBlur"
            @keydown="handleKeyDown($event, 'contactNumber')"
            required
          />
          <label for="emailId">Email <span class="text-danger">*</span></label>
          <div
            class="invalid-feedback"
            v-if="!validationStates.emailId.valid && validationStates.emailId.touched"
          >
            {{ emailErrorMessage }}
          </div>
        </div>
      </div>

      <!-- Contact Number -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="contactInput"
            type="tel"
            class="form-control"
            :class="{
              'is-invalid':
                !validationStates.contactNumber.valid && validationStates.contactNumber.touched,
              'is-valid':
                validationStates.contactNumber.valid && formData.contactNumber.trim().length > 0,
            }"
            id="contactNumber"
            v-model="formData.contactNumber"
            placeholder="Contact Number"
            @input="handleContactInput"
            @keydown="handleKeyDown($event, 'alternateContactNumber')"
            required
          />
          <label for="contactNumber">Contact Number <span class="text-danger">*</span></label>
          <div
            class="invalid-feedback"
            v-if="!validationStates.contactNumber.valid && validationStates.contactNumber.touched"
          >
            Please enter a valid contact number
          </div>
        </div>
      </div>

      <!-- Alternate Contact Number -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="alternateContactInput"
            type="tel"
            class="form-control"
            :class="{
              'is-invalid':
                !validationStates.alternateContactNumber.valid &&
                validationStates.alternateContactNumber.touched &&
                (formData.alternateContactNumber?.trim().length ?? 0) > 0,
              'is-valid':
                validationStates.alternateContactNumber.valid &&
                (formData.alternateContactNumber?.trim().length ?? 0) > 0,
            }"
            id="alternateContactNumber"
            v-model="formData.alternateContactNumber"
            placeholder="Alternate Contact Number"
            @input="handleAlternateContactInput"
            @keydown="handleKeyDown($event, 'highestQualification')"
          />
          <label for="alternateContactNumber">Alternate Contact Number (Optional)</label>
          <div
            class="invalid-feedback"
            v-if="
              !validationStates.alternateContactNumber.valid &&
              validationStates.alternateContactNumber.touched
            "
          >
            Please enter a valid contact number
          </div>
        </div>
      </div>

      <!-- Highest Qualification -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <input
            ref="qualificationInput"
            type="text"
            class="form-control"
            :class="{
              'is-invalid':
                !validationStates.highestQualification.valid &&
                validationStates.highestQualification.touched,
              'is-valid':
                validationStates.highestQualification.valid &&
                validationStates.highestQualification.touched,
            }"
            id="highestQualification"
            v-model="formData.highestQualification"
            placeholder="Highest Qualification"
            @input="handleQualificationInput"
            @keydown="handleKeyDown($event, 'standardSelect')"
            required
          />
          <label for="highestQualification"
            >Highest Qualification <span class="text-danger">*</span></label
          >
          <div
            class="invalid-feedback"
            v-if="
              !validationStates.highestQualification.valid &&
              validationStates.highestQualification.touched
            "
          >
            Qualification must be at least 2 characters
          </div>
        </div>
      </div>

      <!-- Standard Selection -->
      <div class="col col-12 col-sm-10 col-md-8">
        <div class="form-floating">
          <select
            ref="standardSelect"
            class="form-select"
            id="standardSelect"
            v-model="selectedStandard"
            @change="handleStandardSelect"
            :disabled="!formData.schoolId"
          >
            <option value="">
              {{ !formData.schoolId ? 'Select school first' : 'Select Standard' }}
            </option>
            <option v-for="standard in standards" :key="standard.id" :value="standard">
              {{ standard.name }}
            </option>
          </select>
          <label for="standardSelect">Standard</label>
        </div>
      </div>

      <!-- Standards & Subjects List -->
      <div
        v-if="formData.groupedSubjects && formData.groupedSubjects.length > 0"
        class="col col-12 col-sm-10 col-md-8 mt-4"
      >
        <h5 class="mb-3">Standards & Subjects</h5>
        <ul class="list-group">
          <li
            v-for="standard in formData.groupedSubjects"
            :key="standard.standardId"
            class="list-group-item mb-2"
          >
            <div class="d-flex flex-column">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold">Standard {{ standard.standardName }}</span>
                <button
                  type="button"
                  class="btn btn-custom"
                  @click="removeStandardSubjects(standard.standardId)"
                >
                  Remove
                </button>
              </div>
              <div class="ps-3 d-flex flex-wrap gap-2">
                <span
                  v-for="subject in standard.subjects"
                  :key="subject.id"
                  class="subject-badge"
                >
                  <i class="bi bi-book me-1"></i>
                  {{ subject.name }}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Subject Selection Modal -->
      <div
        class="modal fade"
        id="subjectSelectModal"
        tabindex="-1"
        aria-labelledby="subjectSelectModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title" id="subjectSelectModalLabel">
                Select Subjects for Standard {{ selectedStandard?.name || '' }}
              </h4>
            </div>
            <div class="modal-body">
              <div id="subjectSelectContainer" class="p-3 border rounded">
                <div v-if="availableSubjects.length === 0" class="text-center text-muted py-3">
                  This standard doesn't have any subjects
                </div>
                <div
                  v-else
                  v-for="subject in availableSubjects"
                  :key="subject.id"
                  class="form-check mb-2"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="'subject' + subject.id"
                    :value="subject.id"
                    v-model="selectedSubjects"
                    @keydown.enter.prevent="toggleSubject(subject.id)"
                    @keydown.space.prevent="toggleSubject(subject.id)"
                  />
                  <label class="form-check-label fs-5" :for="'subject' + subject.id">
                    {{ subject.name }}
                  </label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-light"
                style="border: 1px solid gray"
                @click="closeSubjectModal"
              >
                Close
              </button>
              <button
                type="button"
                class="btn btn-success"
                @click="addSubjects"
                :disabled="availableSubjects.length === 0"
              >
                Add Subjects
              </button>
            </div>
          </div>
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" class="btn btn-dark" @click="handleConfirm" :disabled="false">
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="text-center mt-3">
        <button type="submit" class="btn btn-dark" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
          {{ isSubmitting ? 'Submitting...' : isEditMode ? 'Update' : 'Submit' }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, email, helpers } from '@vuelidate/validators'
import type { TeacherFormData } from '@/models/Teacher'
import axiosInstance from '@/config/axios'
import { Modal } from 'bootstrap'
import { useRoute } from 'vue-router'

// Props and Emits
const props = defineProps<{
  initialData?: TeacherFormData
}>()

// Define emits with proper types
const emit = defineEmits<{
  (
    event: 'submit',
    data: {
      formData: TeacherFormData
      changes: Array<{
        type: string
        message: string
      }>
    },
  ): void
}>()

// Add route import and setup
const route = useRoute()
const isEditMode = computed(() => route.name === 'editTeacher')

// Utility functions
const validateContactNumber = (number: string): boolean => {
  const cleaned = number.replace(/[^\d+]/g, '')

  // Must contain only numbers and optionally a + at the start
  if (!/^\+?\d+$/.test(cleaned)) return false

  // If starts with +91, must have 10-15 digits after
  if (cleaned.startsWith('+91')) {
    const digitCount = cleaned.substring(3).length // Count digits after +91
    return digitCount >= 10 && digitCount <= 15
  }

  // For other international numbers
  const digitCount = cleaned.replace(/\D/g, '').length
  return digitCount >= 10 && digitCount <= 15
}

const formatContactNumber = (number: string): string => {
  // Remove all whitespace and any characters that aren't numbers or +
  const cleaned = number.replace(/[^\d+]/g, '')

  if (!cleaned) return ''

  // If it starts with +91, ensure 10-15 digits follow
  if (cleaned.startsWith('+91')) {
    const digits = cleaned.substring(3) // Remove +91
    if (digits.length > 15) {
      return '+91' + digits.substring(0, 15) // Keep only first 15 digits
    }
    return cleaned
  }

  // If it starts with +, keep it as is
  if (cleaned.startsWith('+')) {
    return cleaned
  }

  // If it's 10-15 digits (Indian number), add +91
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return `+91${cleaned}`
  }

  return cleaned
}

const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Validation States
const validationStates = reactive({
  name: { touched: false, valid: false },
  boardId: { touched: false, valid: false },
  emailId: { touched: false, valid: false },
  contactNumber: { touched: false, valid: false },
  alternateContactNumber: { touched: false, valid: false },
  highestQualification: { touched: false, valid: false },
  schoolId: { touched: false, valid: false },
  teacherSubjects: { touched: false, valid: false },
})

// State
const schools = ref<Array<{ id: number; name: string }>>([])
const schoolSearch = ref('')
const showSchoolDropdown = ref(false)
const selectedSchoolIndex = ref(-1)
const filteredSchools = ref<Array<{ id: number; name: string }>>([])
const selectedStandard = ref<{ id: number; name: string } | null>(null)
const selectedSubjects = ref<number[]>([])
const standards = ref<
  Array<{
    id: number
    name: string
    standard: {
      id: number
      name: string
    }
  }>
>([])
const availableSubjects = ref<
  Array<{
    id: number
    name: string
    schoolStandardId: number
  }>
>([])
const isSubmitting = ref(false)
const selectedSchoolBoard = ref<{ id: number; name: string } | null>(null)
const schoolStandards = ref<
  Array<{
    id: number // This is the school_standard_id
    standard_id: number
    school_id: number
    standard: {
      id: number
      name: string
    }
  }>
>([])
let subjectModal: Modal | null = null

// Add after the FormDataType interface
interface Change {
  type: 'add' | 'modify' | 'delete'
  message: string
}

// Add after other refs
const changes = ref<Change[]>([])
let saveConfirmationModal: Modal | null = null

// Add this with other refs
const initialSchoolId = ref<number | null>(null)

// Form Data with proper types for validation
interface FormDataType {
  name: string
  boardId: number
  schoolId: number
  emailId: string
  contactNumber: string
  alternateContactNumber: string
  highestQualification: string
  teacherSubjects: TeacherSubject[]
  userId?: number
  groupedSubjects?: Array<{
    standardId: number
    standardName: string
    subjects: Array<{
      id: number
      name: string
    }>
  }>
  schoolStandards?: Array<{
    id: number
    name: string
    standard: {
      id: number
      name: string
    }
  }>
}

// Form Data
const formData = reactive<FormDataType>({
  name: '',
  boardId: 0,
  schoolId: 0,
  emailId: '',
  contactNumber: '',
  alternateContactNumber: '',
  highestQualification: '',
  teacherSubjects: [],
})

// Validation Rules
const rules = {
  name: {
    required: helpers.withMessage('Teacher name is required', required),
    minLength: helpers.withMessage(
      'Name must be at least 3 characters',
      (value: string) => value.length >= 3,
    ),
    validName: helpers.withMessage('Name can only contain letters and spaces', (value: string) =>
      /^[a-zA-Z\s]*$/.test(value),
    ),
  },
  boardId: {
    required: helpers.withMessage('Board selection is required', required),
    validBoard: helpers.withMessage('Please select a valid board', (value: number) => {
      console.log('[Validation Rule] Checking boardId:', value);
      return value !== 0 && value !== undefined && value !== null;
    }),
  },
  schoolId: {
    required: helpers.withMessage('School selection is required', required),
    validSchool: helpers.withMessage(
      'Please select a valid school',
      (value: number) => value !== 0,
    ),
  },
  emailId: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Please enter a valid email address', email),
    validEmail: helpers.withMessage('Please enter a valid email address', (value: string) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
    ),
  },
  contactNumber: {
    required: helpers.withMessage('Contact number is required', required),
    valid: helpers.withMessage('Please enter a valid contact number', (value: string) =>
      validateContactNumber(value),
    ),
  },
  alternateContactNumber: {
    valid: helpers.withMessage(
      'Please enter a valid contact number',
      (value: string) => !value || validateContactNumber(value),
    ),
    different: helpers.withMessage(
      'Alternate contact number must be different from primary contact number',
      (value: string) => !value || value !== formData.contactNumber,
    ),
  },
  highestQualification: {
    required: helpers.withMessage('Qualification is required', required),
    minLength: helpers.withMessage(
      'Qualification must be at least 2 characters',
      (value: string) => value.length >= 2,
    ),
  },
  teacherSubjects: {
    required: helpers.withMessage(
      'Please select at least one standard with subjects',
      (value: TeacherSubject[]) => value.length > 0,
    ),
  },
}

const v$ = useVuelidate(rules, formData)

// Add these refs for input elements
const nameInput = ref<HTMLInputElement | null>(null)
const schoolInput = ref<HTMLInputElement | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)
const contactInput = ref<HTMLInputElement | null>(null)
const alternateContactInput = ref<HTMLInputElement | null>(null)
const qualificationInput = ref<HTMLInputElement | null>(null)
const standardSelect = ref<HTMLSelectElement | null>(null)

// Add keyboard navigation function
const handleKeyDown = (event: KeyboardEvent, nextField: string) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const nextElement = document.getElementById(nextField)
    if (nextElement) {
      nextElement.focus()
      if (nextElement instanceof HTMLInputElement) {
        nextElement.select()
      }
    }
  }
}

// Update school keyboard navigation
const handleSchoolKeydown = (event: KeyboardEvent) => {
  if (!formData.boardId || !filteredSchools.value.length) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedSchoolIndex.value = Math.min(
        selectedSchoolIndex.value + 1,
        filteredSchools.value.length - 1,
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedSchoolIndex.value = Math.max(selectedSchoolIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedSchoolIndex.value >= 0) {
        selectSchool(filteredSchools.value[selectedSchoolIndex.value])
        // Focus next field after selection
        const nextElement = document.getElementById('emailId')
        if (nextElement) {
          nextElement.focus()
        }
      } else if (filteredSchools.value.length === 1) {
        // If there's only one school in the list, select it
        selectSchool(filteredSchools.value[0])
        // Focus next field after selection
        const nextElement = document.getElementById('emailId')
        if (nextElement) {
          nextElement.focus()
        }
      }
      break
    case 'Escape':
      showSchoolDropdown.value = false
      break
    case 'Tab':
      showSchoolDropdown.value = false
      break
  }
}

// Watch for initialData changes
watch(
  () => props.initialData,
  async (newData) => {
    console.log('[Validation] Watch triggered with initialData:', newData)
    if (newData) {
      // Store the initial school ID
      initialSchoolId.value = newData.schoolId
      console.log('[Validation] Stored initial school ID:', initialSchoolId.value)

      // First fetch school details to get board information
      if (newData.schoolId) {
        try {
          const { data: schoolData } = await axiosInstance.get(`/schools/${newData.schoolId}`)
          console.log('[Validation] School data fetched:', schoolData)

          // Update form data first, but preserve the board ID we're about to set
          const boardId = schoolData.board.id
          Object.assign(formData, newData)
          formData.boardId = boardId // Ensure boardId is set correctly

          // Fetch boards and set board name
          await fetchBoards()
          const board = boards.value.find((b) => b.id === boardId)
          if (board) {
            boardSearch.value = board.name
            validationStates.boardId.valid = true
            validationStates.boardId.touched = true
          }

          // Set school name
          schoolSearch.value = schoolData.name
          validationStates.schoolId.valid = true
          validationStates.schoolId.touched = true

          // Store board info for later use
          selectedSchoolBoard.value = { id: boardId, name: schoolData.board.name }

          // Fetch schools for this board
          await fetchSchools()

          // Fetch standards for this school
          const { data: schoolStandardsData } = await axiosInstance.get(
            `/school-standards/school/${newData.schoolId}`,
          )

          // Store the complete school standards data
          schoolStandards.value = schoolStandardsData.map((item: { 
            id: number; 
            school_id: number; 
            standard: { 
              id: number; 
              name: string; 
            } 
          }) => ({
            id: item.id,
            standard_id: item.standard.id,
            school_id: item.school_id,
            standard: item.standard
          }))

          // Map the response to get standard details for display
          standards.value = schoolStandardsData.map(
            (item: { id: number; school_id: number; standard: { id: number; name: string } }) => ({
              id: item.standard.id, // Use standard.id as the id
              name: item.standard.name,
              standard: item.standard,
            }),
          )
        } catch (error) {
          console.error('Error fetching school details:', error)
        }
      } else {
        // If no schoolId, just update form data
        Object.assign(formData, newData)
      }

      // First mark all fields as touched
      Object.keys(validationStates).forEach((key) => {
        validationStates[key as keyof typeof validationStates].touched = true
      })

      // Then validate each field and store results
      const nameValid = newData.name.length >= 3 && /^[a-zA-Z\s]*$/.test(newData.name)
      const emailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newData.emailId)
      const contactValid = validateContactNumber(newData.contactNumber)
      const alternateContactValid =
        !newData.alternateContactNumber ||
        (validateContactNumber(newData.alternateContactNumber) &&
          newData.alternateContactNumber !== newData.contactNumber)
      const qualificationValid = newData.highestQualification.length >= 2
      const schoolValid = newData.schoolId !== 0
      const boardValid = formData.boardId !== 0

      // Update all validation states at once
      validationStates.name.valid = nameValid
      validationStates.emailId.valid = emailValid
      validationStates.contactNumber.valid = contactValid
      validationStates.alternateContactNumber.valid = alternateContactValid
      validationStates.highestQualification.valid = qualificationValid
      validationStates.schoolId.valid = schoolValid
      validationStates.boardId.valid = boardValid

      // Log validation results
      console.log('[Validation] Results:', {
        name: { value: newData.name, valid: nameValid },
        email: { value: newData.emailId, valid: emailValid },
        contact: { value: newData.contactNumber, valid: contactValid },
        alternateContact: { value: newData.alternateContactNumber, valid: alternateContactValid },
        qualification: { value: newData.highestQualification, valid: qualificationValid },
        school: { value: newData.schoolId, valid: schoolValid },
        board: { value: formData.boardId, valid: boardValid },
      })

      // Trigger vuelidate validation
      console.log('[Validation] Triggering vuelidate...')
      await v$.value.$touch()
      console.log('[Validation] Vuelidate result:', v$.value)

      console.log('[Validation] Final states:', JSON.stringify(validationStates))
    }
  },
  { immediate: true },
)

// Add watch for form data changes
watch(
  formData,
  (newData) => {
    console.log('[Validation] Form data changed:', newData)

    // Update validation states based on current values
    validationStates.name.valid = newData.name.length >= 3 && /^[a-zA-Z\s]*$/.test(newData.name)
    validationStates.emailId.valid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      newData.emailId,
    )
    validationStates.contactNumber.valid = validateContactNumber(newData.contactNumber)
    validationStates.alternateContactNumber.valid =
      !newData.alternateContactNumber ||
      (validateContactNumber(newData.alternateContactNumber) &&
        newData.alternateContactNumber !== newData.contactNumber)
    validationStates.highestQualification.valid = newData.highestQualification.length >= 2
    validationStates.schoolId.valid = newData.schoolId !== 0

    console.log('[Validation] Updated validation states:', JSON.stringify(validationStates))
  },
  { deep: true },
)

// API calls
async function fetchSchools() {
  try {
    console.log('Fetching schools...')
    if (!formData.boardId) {
      console.log('No board selected, skipping school fetch')
      schools.value = []
      return
    }

    const response = await axiosInstance.get(`/schools?boardId=${formData.boardId}`)
    console.log('Fetched schools:', response.data)
    // Extract schools from the data wrapper if it exists
    schools.value = response.data.data || response.data
    console.log('Updated schools.value:', schools.value)

    // If we have initial data, set the school name after schools are loaded
    if (props.initialData?.schoolId) {
      const school = schools.value.find((s) => s.id === props.initialData?.schoolId)
      if (school) {
        schoolSearch.value = school.name
        validationStates.schoolId.valid = true
        validationStates.schoolId.touched = true
      }
    }
  } catch (error) {
    console.error('Error fetching schools:', error)
  }
}

// Form submission
const handleSubmit = async () => {
  console.log('[Submit Validation] Starting form validation')
  console.log('[Submit Validation] Current form data:', formData)
  console.log('[Submit Validation] Validation states:', validationStates)
  console.log('[Submit Validation] Vuelidate state:', v$.value)

  // CRITICAL FIX: Force update the board validation state based on the boardSearch value
  // If boardSearch matches a board name, ensure the boardId is set correctly
  if (boardSearch.value) {
    const matchingBoard = boards.value.find(
      board => board.name.toLowerCase() === boardSearch.value.toLowerCase()
    );

    if (matchingBoard) {
      console.log('[Submit Validation] Found matching board:', matchingBoard);
      formData.boardId = matchingBoard.id;
      validationStates.boardId.valid = true;
      validationStates.boardId.touched = true;
      v$.value.boardId.$model = matchingBoard.id;
      v$.value.boardId.$touch();

      // If we have a matching board but no school selected, we need to fetch schools
      if (!formData.schoolId) {
        await fetchSchools();
      }
    }
  }

  // Mark all fields as touched to show validation errors
  Object.keys(validationStates).forEach((key) => {
    validationStates[key as keyof typeof validationStates].touched = true
  })

  // Check if at least one standard-subject pair is selected
  if (formData.teacherSubjects.length === 0) {
    validationStates.teacherSubjects.valid = false
    // Show error message
    const standardSelect = document.getElementById('standardSelect')
    if (standardSelect) {
      standardSelect.scrollIntoView({ behavior: 'smooth', block: 'center' })
      standardSelect.focus()
    }
    return
  }

  // Ensure boardId is set from the school's board
  if (selectedSchoolBoard.value) {
    formData.boardId = selectedSchoolBoard.value.id
    // Make sure validation state is updated
    validationStates.boardId.valid = true
    v$.value.boardId.$model = selectedSchoolBoard.value.id
  }

  console.log('[Submit Validation] Before final validation - boardId:', formData.boardId)
  console.log('[Submit Validation] Board validation state:', validationStates.boardId)

  // Trigger validation
  const isValid = await v$.value.$validate()
  console.log('[Submit Validation] Vuelidate validation result:', isValid)

  if (!isValid) {
    console.log('[Submit Validation] Form validation failed')

    // CRITICAL FIX: Check if the board field is the one causing validation failure
    if (v$.value.boardId.$error) {
      console.log('[Submit Validation] Board validation failed, checking if we have a valid board name');

      // If we have a board name but validation failed, try to find the board again
      if (boardSearch.value) {
        const matchingBoard = boards.value.find(
          board => board.name.toLowerCase() === boardSearch.value.toLowerCase()
        );

        if (matchingBoard) {
          console.log('[Submit Validation] Found matching board on retry:', matchingBoard);
          // Force update the model and validation state
          formData.boardId = matchingBoard.id;
          v$.value.boardId.$model = matchingBoard.id;
          await v$.value.boardId.$touch();

          // Try validation again
          const retryValid = await v$.value.$validate();
          console.log('[Submit Validation] Retry validation result:', retryValid);

          if (retryValid) {
            // If validation passes on retry, proceed with form submission
            if (isEditMode.value) {
              await calculateChanges();
              saveConfirmationModal?.show();
            } else {
              emit('submit', {
                formData: {
                  name: formData.name,
                  emailId: formData.emailId,
                  contactNumber: formData.contactNumber,
                  alternateContactNumber: formData.alternateContactNumber,
                  highestQualification: formData.highestQualification,
                  schoolId: formData.schoolId,
                  boardId: formData.boardId,
                  teacherSubjects: formData.teacherSubjects,
                  groupedSubjects: formData.groupedSubjects,
                },
                changes: [],
              });
            }
            return;
          }
        }
      }
    }

    // Define the order of fields to check (matching the actual input IDs)
    const fieldOrder = [
      { id: 'teacherName', key: 'name' },
      { id: 'board', key: 'boardId' },
      { id: 'school', key: 'schoolId' },
      { id: 'emailId', key: 'emailId' },
      { id: 'contactNumber', key: 'contactNumber' },
      { id: 'highestQualification', key: 'highestQualification' },
    ]

    // Find the first invalid field based on our preferred order
    const firstInvalidField = fieldOrder.find((field) => {
      const validationField = v$.value[field.key]
      return validationField && validationField.$error
    })

    // Focus the first invalid field
    if (firstInvalidField) {
      console.log('[Submit Validation] Focusing on invalid field:', firstInvalidField);
      const element = document.getElementById(firstInvalidField.id)
      if (element) {
        element.focus()
        // Scroll the element into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    return
  }

  // If we're in edit mode, show confirmation modal
  if (isEditMode.value) {
    // Calculate changes before showing modal
    await calculateChanges()
    // Show confirmation modal
    saveConfirmationModal?.show()
  } else {
    // For add mode, directly emit the form data
    emit('submit', {
      formData: {
        name: formData.name,
        emailId: formData.emailId,
        contactNumber: formData.contactNumber,
        alternateContactNumber: formData.alternateContactNumber,
        highestQualification: formData.highestQualification,
        schoolId: formData.schoolId,
        boardId: formData.boardId,
        teacherSubjects: formData.teacherSubjects,
        groupedSubjects: formData.groupedSubjects,
      },
      changes: [],
    })
  }
}

// Add new functions for change tracking
const calculateChanges = async () => {
  console.log('[Calculate Changes] Starting with:', {
    initialData: props.initialData,
    currentFormData: formData,
  })

  console.log('[Calculate Changes] Initial teacherSubjects:', {
    initial: props.initialData?.teacherSubjects,
    current: formData.teacherSubjects,
  })

  console.log('[Calculate Changes] Initial groupedSubjects:', {
    initial: props.initialData?.groupedSubjects,
    current: formData.groupedSubjects,
  })

  changes.value = []

  if (!props.initialData) {
    console.log('[Calculate Changes] No initial data, treating everything as new')
    // If no initial data, all current subjects are additions
    formData.groupedSubjects?.forEach((standard) => {
      standard.subjects.forEach((subject) => {
        changes.value.push({
          type: 'add',
          message: `Added "${subject.name}" to Standard ${standard.standardName}`,
        })
      })
    })
    return
  }

  // Check basic information changes
  if (formData.name !== props.initialData.name) {
    changes.value.push({
      type: 'modify',
      message: `Name: ${props.initialData.name} → ${formData.name}`,
    })
  }

  if (formData.emailId !== props.initialData.emailId) {
    changes.value.push({
      type: 'modify',
      message: `Email: ${props.initialData.emailId} → ${formData.emailId}`,
    })
  }

  if (formData.contactNumber !== props.initialData.contactNumber) {
    changes.value.push({
      type: 'modify',
      message: `Contact Number: ${props.initialData.contactNumber} → ${formData.contactNumber}`,
    })
  }

  if (formData.alternateContactNumber !== props.initialData.alternateContactNumber) {
    changes.value.push({
      type: 'modify',
      message: `Alternate Contact: ${props.initialData.alternateContactNumber || 'None'} → ${
        formData.alternateContactNumber || 'None'
      }`,
    })
  }

  if (formData.highestQualification !== props.initialData.highestQualification) {
    changes.value.push({
      type: 'modify',
      message: `Qualification: ${props.initialData.highestQualification} → ${formData.highestQualification}`,
    })
  }

  // Check school change
  if (formData.schoolId !== props.initialData.schoolId) {
    const oldSchool = schools.value.find((s) => s.id === props.initialData?.schoolId)
    const newSchool = schools.value.find((s) => s.id === formData.schoolId)
    changes.value.push({
      type: 'modify',
      message: `School: ${oldSchool?.name || ''} → ${newSchool?.name || ''}`,
    })
  }

  // Check subject changes
  const initialSubjects = props.initialData.teacherSubjects || []
  const currentSubjects = formData.teacherSubjects

  console.log('[Calculate Changes] Comparing subjects:', {
    initialSubjects,
    currentSubjects,
    initialGrouped: props.initialData.groupedSubjects,
    currentGrouped: formData.groupedSubjects,
  })

  // Track removed standards (entire standard with all its subjects)
  const initialStandards = props.initialData.groupedSubjects || []
  const currentStandards = formData.groupedSubjects || []

  console.log('[Calculate Changes] Standards comparison:', {
    initialStandards,
    currentStandards,
  })

  // Check for completely removed standards
  initialStandards.forEach((standard) => {
    const standardExists = currentStandards.some((s) => s.standardId === standard.standardId)
    console.log(`[Calculate Changes] Checking standard ${standard.standardName}:`, {
      standardId: standard.standardId,
      exists: standardExists,
    })

    if (!standardExists) {
      console.log(`[Calculate Changes] Standard ${standard.standardName} was removed`)
      // Add individual removal messages for each subject in the standard
      standard.subjects.forEach((subject) => {
        changes.value.push({
          type: 'delete',
          message: `Removed "${subject.name}" from Standard ${standard.standardName}`,
        })
      })
    }
  })

  // Check for completely new standards
  currentStandards.forEach((standard) => {
    const standardIsNew = !initialStandards.some((s) => s.standardId === standard.standardId)
    console.log(`[Calculate Changes] Checking if standard ${standard.standardName} is new:`, {
      standardId: standard.standardId,
      isNew: standardIsNew,
    })

    if (standardIsNew) {
      console.log(`[Calculate Changes] Standard ${standard.standardName} is new`)
      standard.subjects.forEach((subject) => {
        changes.value.push({
          type: 'add',
          message: `Added "${subject.name}" to Standard ${standard.standardName}`,
        })
      })
    }
  })

  // Check for individual subject changes within existing standards
  currentStandards.forEach((currentStandard) => {
    const initialStandard = initialStandards.find(
      (s) => s.standardId === currentStandard.standardId,
    )
    if (initialStandard) {
      console.log(
        `[Calculate Changes] Comparing subjects for standard ${currentStandard.standardName}:`,
        {
          initial: initialStandard.subjects,
          current: currentStandard.subjects,
        },
      )

      // Check for added subjects
      currentStandard.subjects.forEach((subject) => {
        const subjectExists = initialStandard.subjects.some((s) => s.id === subject.id)
        if (!subjectExists) {
          console.log(`[Calculate Changes] New subject detected: ${subject.name}`)
          changes.value.push({
            type: 'add',
            message: `Added "${subject.name}" to Standard ${currentStandard.standardName}`,
          })
        }
      })

      // Check for removed subjects
      initialStandard.subjects.forEach((subject) => {
        const subjectStillExists = currentStandard.subjects.some((s) => s.id === subject.id)
        if (!subjectStillExists) {
          console.log(`[Calculate Changes] Removed subject detected: ${subject.name}`)
          changes.value.push({
            type: 'delete',
            message: `Removed "${subject.name}" from Standard ${currentStandard.standardName}`,
          })
        }
      })
    }
  })

  console.log('[Calculate Changes] Final changes:', changes.value)
}

const handleConfirm = async () => {
  try {
    // Emit form data and changes
    emit('submit', {
      formData: {
        name: formData.name,
        emailId: formData.emailId,
        contactNumber: formData.contactNumber,
        alternateContactNumber: formData.alternateContactNumber,
        highestQualification: formData.highestQualification,
        schoolId: formData.schoolId,
        boardId: formData.boardId,
        teacherSubjects: formData.teacherSubjects,
      },
      changes: changes.value,
    })

    // Close modal
    saveConfirmationModal?.hide()
  } catch (error) {
    console.error('Error in handleConfirm:', error)
    alert('Failed to update teacher information. Please try again.')
  }
}

// Filter schools based on search
const filterSchools = () => {
  console.log('Filtering schools with search:', schoolSearch.value)
  console.log('Current schools list:', schools.value)

  // If no board is selected, don't proceed
  if (!formData.boardId) {
    console.log('No board selected, skipping school filter')
    return
  }

  // Mark the field as touched when user starts typing
  validationStates.schoolId.touched = true

  if (!schoolSearch.value) {
    console.log('Empty search, showing all schools')
    filteredSchools.value = schools.value
    validationStates.schoolId.valid = false
  } else {
    filteredSchools.value = schools.value.filter((school) =>
      school.name.toLowerCase().includes(schoolSearch.value.toLowerCase()),
    )
    console.log('Filtered schools:', filteredSchools.value)
  }
  selectedSchoolIndex.value = -1
}

// Handle school selection
const selectSchool = async (school: { id: number; name: string }) => {
  // Check if school has changed
  const hasSchoolChanged = formData.schoolId !== school.id

  formData.schoolId = school.id
  schoolSearch.value = school.name
  showSchoolDropdown.value = false

  // Reset standard selection
  selectedStandard.value = null
  standards.value = []

  // If school has changed, clear all standard-subject pairs
  if (hasSchoolChanged) {
    formData.teacherSubjects = []
    formData.groupedSubjects = []
    console.log('[School Change] Cleared all standard-subject pairs due to school change')
  }

  try {
    // Get school details
    const { data: schoolData } = await axiosInstance.get(`/schools/${school.id}`)

    // Fetch standards for this school
    const { data: schoolStandardsData } = await axiosInstance.get(
      `/school-standards/school/${school.id}`,
    )
    
    console.log('[School Standards] Raw response:', schoolStandardsData)

    // Store the complete school standards data
    schoolStandards.value = schoolStandardsData.map((item: { 
      id: number; 
      school_id: number; 
      standard: { 
        id: number; 
        name: string; 
      } 
    }) => ({
      id: item.id,
      standard_id: item.standard.id,
      school_id: item.school_id,
      standard: item.standard
    }))
    
    console.log('[School Standards] Processed school standards:', schoolStandards.value)

    // Map the response to get standard details for display
    standards.value = schoolStandardsData.map(
      (item: { id: number; school_id: number; standard: { id: number; name: string } }) => ({
        id: item.standard.id, // Use standard.id as the id
        name: item.standard.name,
        standard: item.standard,
      }),
    )
    
    console.log('[School Standards] Processed standards for display:', standards.value)

    // Store board info for later use
    selectedSchoolBoard.value = { id: schoolData.board_id, name: schoolData.board.name }

    // Update validation
    validationStates.schoolId.touched = true
    validationStates.schoolId.valid = true
    await v$.value.$touch()
    await v$.value.schoolId.$touch()

    // Focus email field after selection
    const emailInput = document.getElementById('emailId')
    if (emailInput) {
      emailInput.focus()
    }
  } catch (error) {
    console.error('Error fetching school details:', error)
    validationStates.schoolId.valid = false
  }
}

// Add watch for school search to validate empty field
watch(schoolSearch, (newValue) => {
  if (!newValue && validationStates.schoolId.touched) {
    validationStates.schoolId.valid = false
  }
})

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  console.log('Click outside event target:', target)
  
  if (!target.closest('.board-dropdown')) {
    console.log('Closing board dropdown')
    showBoardDropdown.value = false
  }
  
  // Only close school dropdown if we're not in transition mode
  if (!target.closest('.school-dropdown') && !isTransitioningToSchool.value) {
    console.log('Closing school dropdown')
    showSchoolDropdown.value = false
  }
}

// Initialize filtered schools
watch(
  schools,
  (newSchools) => {
    console.log('Schools watch triggered with:', newSchools)
    filteredSchools.value = newSchools
    console.log('Updated filteredSchools:', filteredSchools.value)
  },
  { immediate: true },
)

// Initialize modal on mount
onMounted(() => {
  console.log('Component mounted')
  document.addEventListener('click', handleClickOutside)
  console.log('Starting to fetch boards...')
  fetchBoards()
    .then(() => {
      console.log('Boards fetch complete')
      if (formData.boardId) {
        return fetchSchools()
      }
    })
    .catch((error) => console.error('Error in initial data fetch:', error))

  const modalElement = document.getElementById('subjectSelectModal')
  if (modalElement) {
    subjectModal = new Modal(modalElement)
    console.log('Subject modal initialized')
  } else {
    console.warn('Subject modal element not found')
  }

  // Initialize save confirmation modal
  const saveModalElement = document.getElementById('saveConfirmationModal')
  if (saveModalElement) {
    saveConfirmationModal = new Modal(saveModalElement)
    console.log('Save confirmation modal initialized')
  } else {
    console.warn('Save confirmation modal element not found')
  }

  // Initialize validation states
  Object.keys(validationStates).forEach((key) => {
    validationStates[key as keyof typeof validationStates].touched = false
    validationStates[key as keyof typeof validationStates].valid = false
  })
})

// Handle standard selection
const handleStandardSelect = async () => {
  if (!selectedStandard.value || !formData.schoolId) {
    console.error('No standard or school selected')
    return
  }

  try {
    const standard = selectedStandard.value
    console.log('[Subject Selection] Selected standard:', standard)
    console.log('[Subject Selection] Current schoolStandards:', schoolStandards.value)

    // Find the corresponding school standard
    const schoolStandard = schoolStandards.value.find((ss) => {
      console.log('[Subject Selection] Comparing standard IDs:', {
        standardId: ss.standard_id,
        selectedId: standard.id,
        match: ss.standard_id === standard.id,
      })
      return ss.standard_id === standard.id
    })

    console.log('[Subject Selection] Found school standard:', schoolStandard)

    if (!schoolStandard) {
      console.error('School standard not found')
      throw new Error('School standard not found')
    }

    const schoolStandardId = schoolStandard.id
    console.log('[Subject Selection] Using school standard ID:', schoolStandardId)

    // Fetch subjects using the new API endpoint
    console.log('[Subject Selection] Fetching subjects with school_id:', formData.schoolId, 'and standard_id:', standard.id)
    const { data: subjects } = await axiosInstance.get(
      `/subjects/school-standard?school_id=${formData.schoolId}&standard_id=${standard.id}`,
    )
    console.log('[Subject Selection] Fetched subjects:', subjects)

    // Create unique list of subjects
    const uniqueSubjects = new Map()
    subjects.forEach((subject: { id: number; name: string }) => {
      console.log('[Subject Selection] Processing subject:', {
        id: subject.id,
        name: subject.name,
        standardName: standard.name,
      })
      if (!uniqueSubjects.has(subject.id)) {
        uniqueSubjects.set(subject.id, {
          id: subject.id,
          name: subject.name,
          schoolStandardId: schoolStandardId,
          standardName: standard.name,
          subjectId: subject.id, // The subject.id is now directly the subject ID
        })
      }
    })

    availableSubjects.value = Array.from(uniqueSubjects.values())
    console.log('[Subject Selection] Final available subjects:', availableSubjects.value)

    // Pre-select already selected subjects for this standard
    if (formData.teacherSubjects) {
      const selectedSubjectIds = formData.teacherSubjects
        .filter((subject) => subject.schoolStandardId === schoolStandardId)
        .map((subject) => subject.mediumStandardSubjectId)

      selectedSubjects.value = selectedSubjectIds
      console.log('[Subject Selection] Pre-selected subjects:', selectedSubjects.value)
    }

    // Show modal even if there are no subjects
    subjectModal?.show()
    // Focus the first checkbox after modal is shown (if there are subjects)
    setTimeout(() => {
      const firstCheckbox = document.querySelector(
        '#subjectSelectContainer .form-check-input',
      ) as HTMLElement
      if (firstCheckbox) {
        firstCheckbox.focus()
      }
    }, 500)
  } catch (error) {
    console.error('Error in handleStandardSelect:', error)
  }
}

// Update addSubjects function
const addSubjects = () => {
  console.log('[Add Subjects] Starting addSubjects with:', {
    selectedStandard: selectedStandard.value,
    selectedSubjects: selectedSubjects.value,
    availableSubjects: availableSubjects.value,
  })

  if (!selectedStandard.value) {
    console.error('No standard selected')
    return
  }

  const schoolStandard = schoolStandards.value.find(
    (ss) => ss.standard_id === selectedStandard.value?.id,
  )

  console.log('[Add Subjects] Found school standard:', schoolStandard)

  if (!schoolStandard) {
    console.error('School standard not found')
    return
  }

  const schoolStandardId = schoolStandard.id

  // Keep existing pairs for other standards
  const otherStandardsPairs = formData.teacherSubjects.filter(
    (subject) => subject.schoolStandardId !== schoolStandardId,
  )
  console.log('[Add Subjects] Existing pairs for other standards:', otherStandardsPairs)

  // Create new pairs for selected subjects using the subject ID directly
  const newPairs = selectedSubjects.value.map((selectedId) => {
    const subject = availableSubjects.value.find((s) => s.id === selectedId)
    console.log('[Add Subjects] Creating pair for subject:', {
      selectedId,
      foundSubject: subject,
      schoolStandardId,
    })
    return {
      schoolStandardId,
      mediumStandardSubjectId: selectedId, // This is now the actual subject ID from the API
    }
  })
  console.log('[Add Subjects] New subject pairs:', newPairs)

  // Update form data with combined pairs
  formData.teacherSubjects = [...otherStandardsPairs, ...newPairs]
  console.log('[Add Subjects] Updated teacherSubjects:', formData.teacherSubjects)

  // Get selected subjects with their full information
  const selectedSubjectsInfo = selectedSubjects.value.map((subjectId) => {
    const subject = availableSubjects.value.find((s) => s.id === subjectId)
    console.log('[Add Subjects] Processing subject info:', {
      subjectId,
      foundSubject: subject,
      availableSubjects: availableSubjects.value,
    })
    return {
      id: subjectId, // Use the subject ID directly
      name: subject?.name || 'Unknown Subject',
    }
  })
  console.log('[Add Subjects] Selected subjects info:', selectedSubjectsInfo)

  // Remove existing standard from groupedSubjects if it exists
  const otherStandards = (formData.groupedSubjects || []).filter(
    (group) => group.standardId !== schoolStandard.standard.id,
  )
  console.log('[Add Subjects] Other standards:', otherStandards)

  // Add new standard with selected subjects only if there are subjects selected
  if (selectedSubjectsInfo.length > 0) {
    const newGroupedSubjects = [
      ...otherStandards,
      {
        standardId: schoolStandard.standard.id,
        standardName: selectedStandard.value.name,
        subjects: selectedSubjectsInfo,
      },
    ]
    console.log('[Add Subjects] New grouped subjects:', newGroupedSubjects)
    formData.groupedSubjects = newGroupedSubjects
  } else {
    formData.groupedSubjects = otherStandards
  }

  console.log('[Add Subjects] Final formData:', {
    teacherSubjects: formData.teacherSubjects,
    groupedSubjects: formData.groupedSubjects,
  })

  // After updating formData.teacherSubjects and formData.groupedSubjects
  // Update validation state
  validationStates.teacherSubjects.touched = true
  validationStates.teacherSubjects.valid = formData.teacherSubjects.length > 0
  v$.value.teacherSubjects.$touch()

  closeSubjectModal()
}

// Close modal and reset selections
const closeSubjectModal = () => {
  selectedSubjects.value = []
  selectedStandard.value = null
  subjectModal?.hide()
}

interface TeacherSubject {
  id?: number // Make id optional since new assignments won't have an id yet
  schoolStandardId: number
  mediumStandardSubjectId: number
}

const removeStandardSubjects = (standardId: number) => {
  console.log('[Remove Subjects] Starting removal for standardId:', standardId)
  console.log('[Remove Subjects] Current teacherSubjects:', formData.teacherSubjects)
  console.log('[Remove Subjects] Current groupedSubjects:', formData.groupedSubjects)

  if (!formData.teacherSubjects || !formData.groupedSubjects) return

  // Find the standard info before removing
  const standardInfo = formData.groupedSubjects.find((group) => group.standardId === standardId)
  console.log('[Remove Subjects] Found standard info:', standardInfo)

  if (standardInfo) {
    // Remove from teacherSubjects
    formData.teacherSubjects = formData.teacherSubjects.filter((subject: TeacherSubject) => {
      const schoolStandard = schoolStandards.value.find((ss) => ss.standard.id === standardId)
      return subject.schoolStandardId !== schoolStandard?.id
    })

    // Remove from groupedSubjects
    formData.groupedSubjects = formData.groupedSubjects.filter(
      (group) => group.standardId !== standardId,
    )
  }

  console.log('[Remove Subjects] Updated teacherSubjects:', formData.teacherSubjects)
  console.log('[Remove Subjects] Updated groupedSubjects:', formData.groupedSubjects)

  // After removing subjects, update validation state
  validationStates.teacherSubjects.touched = true
  validationStates.teacherSubjects.valid = formData.teacherSubjects.length > 0
  v$.value.teacherSubjects.$touch()
}

// Update input handlers to only set touched state and trigger validation
const handleInput = (field: keyof typeof validationStates, value: string) => {
  if (
    field === 'name' ||
    field === 'emailId' ||
    field === 'contactNumber' ||
    field === 'alternateContactNumber' ||
    field === 'highestQualification'
  ) {
    formData[field] = value
  }
  validationStates[field].touched = true
  v$.value[field].$touch()
}

const handleNameInput = (e: Event) => {
  const value = capitalizeWords((e.target as HTMLInputElement).value)
  handleInput('name', value)

  // Trigger validation immediately
  validationStates.name.touched = true
  validationStates.name.valid = value.length >= 3 && /^[a-zA-Z\s]*$/.test(value)
  v$.value.name.$touch()
}

// Add this with other reactive variables
const emailErrorMessage = ref('')

const handleEmailInput = async (e: Event) => {
  const value = (e.target as HTMLInputElement).value.trim()
  handleInput('emailId', value)

  // Basic email format validation
  validationStates.emailId.touched = true
  const isValidFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)

  if (isValidFormat && value) {
    try {
      // Skip uniqueness check if we're in edit mode and the email hasn't changed
      if (isEditMode.value && props.initialData?.emailId === value) {
        validationStates.emailId.valid = true
        emailErrorMessage.value = ''
        return
      }

      // Use the dedicated API endpoint to check email availability
      const { data } = await axiosInstance.get(`/users/check-email/${encodeURIComponent(value)}`)
      
      // The response structure is: { email, available, message }
      const isAvailable = data.available === true
      
      validationStates.emailId.valid = isAvailable
      emailErrorMessage.value = isAvailable ? '' : data.message || 'This email is already in use'
    } catch (error) {
      console.error('Error checking email availability:', error)
      // If there's an error checking, we'll just validate the format
      validationStates.emailId.valid = isValidFormat
      emailErrorMessage.value = ''
    }
  } else {
    validationStates.emailId.valid = false
    emailErrorMessage.value = 'Please enter a valid email address'
  }

  v$.value.emailId.$touch()
}

// Handle email validation when user leaves the email field
const handleEmailBlur = async () => {
  const value = formData.emailId.trim()
  validationStates.emailId.touched = true
  
  if (!value) {
    validationStates.emailId.valid = false
    emailErrorMessage.value = 'Email is required'
    v$.value.emailId.$touch()
    return
  }
  
  const isValidFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
  
  if (!isValidFormat) {
    validationStates.emailId.valid = false
    emailErrorMessage.value = 'Please enter a valid email address'
    v$.value.emailId.$touch()
    return
  }
  
  try {
    // Skip uniqueness check if we're in edit mode and the email hasn't changed
    if (isEditMode.value && props.initialData?.emailId === value) {
      validationStates.emailId.valid = true
      emailErrorMessage.value = ''
      return
    }

    // Use the dedicated API endpoint to check email availability
    const { data } = await axiosInstance.get(`/users/check-email/${encodeURIComponent(value)}`)
    
    // The response structure is: { email, available, message }
    const isAvailable = data.available === true
    
    validationStates.emailId.valid = isAvailable
    emailErrorMessage.value = isAvailable ? '' : data.message || 'This email is already in use'
  } catch (error) {
    console.error('Error checking email availability on blur:', error)
    // If there's an error checking, we'll just validate the format
    validationStates.emailId.valid = isValidFormat
    emailErrorMessage.value = ''
  }
  
  v$.value.emailId.$touch()
}

const handleContactInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  const formattedValue = formatContactNumber(value)
  if (formattedValue.length <= 16) {
    // +91 + 10 digits = 13, allow up to 16 for other formats
    formData.contactNumber = formattedValue
    validationStates.contactNumber.touched = true
    validationStates.contactNumber.valid = validateContactNumber(formattedValue)
    v$.value.contactNumber.$touch()
  }
}

const handleAlternateContactInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  const formattedValue = formatContactNumber(value)
  if (formattedValue.length <= 16) {
    formData.alternateContactNumber = formattedValue
    validationStates.alternateContactNumber.touched = true
    validationStates.alternateContactNumber.valid =
      !formattedValue ||
      (validateContactNumber(formattedValue) && formattedValue !== formData.contactNumber)
    v$.value.alternateContactNumber.$touch()
  }
}

const handleQualificationInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  formData.highestQualification = target.value
  v$.value.highestQualification.$touch()
}

// Add these functions in the script section
const toggleSubject = (subjectId: number) => {
  const index = selectedSubjects.value.indexOf(subjectId)
  if (index === -1) {
    selectedSubjects.value.push(subjectId)
  } else {
    selectedSubjects.value.splice(index, 1)
  }
}

// Add board-related state
const boards = ref<Array<{ id: number; name: string }>>([])
const boardSearch = ref('')
const showBoardDropdown = ref(false)
const selectedBoardIndex = ref(-1)
const filteredBoards = ref<Array<{ id: number; name: string }>>([])
const boardInput = ref<HTMLInputElement | null>(null)

// Add a flag to track if we're transitioning from board to school
const isTransitioningToSchool = ref(false)

// Add after fetchSchools function
async function fetchBoards() {
  try {
    console.log('Fetching boards...')
    const response = await axiosInstance.get('/boards')
    console.log('Fetched boards:', response.data)
    // Extract boards from the data wrapper
    boards.value = response.data.data
    console.log('Updated boards.value:', boards.value)

    // If we have initial data, set the board name after boards are loaded
    if (props.initialData?.boardId) {
      const board = boards.value.find((b) => b.id === props.initialData?.boardId)
      if (board) {
        boardSearch.value = board.name
        validationStates.boardId.valid = true
        validationStates.boardId.touched = true
      }
    }
  } catch (error) {
    console.error('Error fetching boards:', error)
  }
}

// Add board filtering function
const filterBoards = () => {
  console.log('Filtering boards with search:', boardSearch.value)
  console.log('Current boards list:', boards.value)

  validationStates.boardId.touched = true

  if (!boardSearch.value) {
    console.log('Empty search, showing all boards')
    filteredBoards.value = boards.value
    validationStates.boardId.valid = false
    v$.value.boardId.$model = 0 // Reset the vuelidate model when search is empty
  } else {
    filteredBoards.value = boards.value.filter((board) =>
      board.name.toLowerCase().includes(boardSearch.value.toLowerCase()),
    )
    console.log('Filtered boards:', filteredBoards.value)

    // Check if the current search exactly matches a board name
    const exactMatch = boards.value.find(
      (board) => board.name.toLowerCase() === boardSearch.value.toLowerCase()
    )

    if (exactMatch) {
      // If there's an exact match, update the validation state
      formData.boardId = exactMatch.id
      validationStates.boardId.valid = true
      v$.value.boardId.$model = exactMatch.id
    } else {
      // If no exact match, mark as invalid
      validationStates.boardId.valid = false
      v$.value.boardId.$model = 0
    }
  }
  selectedBoardIndex.value = -1
}

// Add board keyboard navigation
const handleBoardKeydown = (event: KeyboardEvent) => {
  if (!filteredBoards.value.length) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedBoardIndex.value = Math.min(
        selectedBoardIndex.value + 1,
        filteredBoards.value.length - 1,
      )
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedBoardIndex.value = Math.max(selectedBoardIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      
      // Set the transition flag directly here
      isTransitioningToSchool.value = true
      
      if (selectedBoardIndex.value >= 0) {
        console.log('[Board Keydown] Selecting board via keyboard:', filteredBoards.value[selectedBoardIndex.value])
        selectBoard(filteredBoards.value[selectedBoardIndex.value])
      } else if (filteredBoards.value.length === 1) {
        console.log('[Board Keydown] Selecting single board match:', filteredBoards.value[0])
        selectBoard(filteredBoards.value[0])
      }
      break
    case 'Escape':
      showBoardDropdown.value = false
      break
    case 'Tab':
      showBoardDropdown.value = false
      break
  }
}

// Add board selection function
const selectBoard = async (board: { id: number; name: string }) => {
  console.log('[Board Selection] Selected board:', board)

  // Set the transition flag
  isTransitioningToSchool.value = true

  // CRITICAL FIX: Directly update the Vuelidate model first
  v$.value.boardId.$model = board.id

  // Then update the form data and UI state
  formData.boardId = board.id
  boardSearch.value = board.name
  showBoardDropdown.value = false

  // Reset school and standard related fields
  formData.schoolId = 0
  schoolSearch.value = ''
  schools.value = []
  validationStates.schoolId.valid = false
  validationStates.schoolId.touched = false

  // Reset standard selection
  selectedStandard.value = null
  standards.value = []

  // Validate board selection - ensure this is set correctly
  validationStates.boardId.touched = true
  validationStates.boardId.valid = true

  // Force validation update
  await v$.value.boardId.$touch()
  await v$.value.$touch()

  console.log('[Board Selection] Updated validation state:', {
    formDataBoardId: formData.boardId,
    validationState: validationStates.boardId,
    vuelidateState: v$.value.boardId,
    vuelidateErrors: v$.value.boardId.$errors
  })

  // Fetch schools for selected board
  await fetchSchools()

  // Focus school field after selection and ensure dropdown stays open
  const schoolInputElement = document.getElementById('school')
  if (schoolInputElement) {
    schoolInputElement.focus()
    
    // Set a small timeout to ensure the dropdown opens and stays open after focus
    setTimeout(() => {
      showSchoolDropdown.value = true
      
      // Reset the transition flag after a brief delay
      setTimeout(() => {
        isTransitioningToSchool.value = false
      }, 300)
    }, 50)
  }
}

// Add watch for board search to validate empty field
watch(boardSearch, (newValue) => {
  if (!newValue && validationStates.boardId.touched) {
    console.log('[Board Watch] Board search cleared, updating validation state')
    validationStates.boardId.valid = false
    formData.boardId = 0
    v$.value.boardId.$model = 0
    v$.value.boardId.$touch()
  }
})

// Initialize filtered boards
watch(
  boards,
  (newBoards) => {
    console.log('Boards watch triggered with:', newBoards)
    filteredBoards.value = newBoards
    console.log('Updated filteredBoards:', filteredBoards.value)
  },
  { immediate: true },
)
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

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.dropdown {
  position: relative;
}

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

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
}

.btn-outline-danger {
  border: 1px solid #dc3545;
  background-color: transparent;
  color: #dc3545;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

@media (max-width: 576px) {
  .btn-outline-danger {
    background-color: #dc3545;
    color: white;
  }
}

/* Desktop styles */
@media (min-width: 577px) {
  .btn-custom {
    border: 1px solid gray !important;
    background-color: #f8f9fa;
    color: black;
    transition:
      background-color 0.3s ease,
      color 0.3s ease;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  .btn-custom:hover {
    border: 1px solid #dc3545 !important;
    background-color: #dc3545 !important;
    color: white !important;
  }
}

/* Mobile styles */
@media (max-width: 576px) {
  .btn-custom {
    background-color: #dc3545 !important;
    color: white !important;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
  }
}

.list-group-item {
  border-radius: 0.375rem;
  border: 1px solid rgba(0, 0, 0, 0.175);
  background-color: #fff;
  transition: all 0.2s ease-in-out;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.list-group-item .btn-custom {
  min-width: 80px;
}

/* Add specific styling for school dropdown */
.school-dropdown .dropdown-menu {
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

.school-dropdown .dropdown-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  display: block;
  color: #212529;
}

.school-dropdown .dropdown-item:hover {
  background-color: #f8f9fa;
}

.school-dropdown .dropdown-item.active {
  background-color: #212529;
  color: white;
}

/* Add board dropdown specific styles */
.board-dropdown .dropdown-menu {
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

.board-dropdown .dropdown-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  display: block;
  color: #212529;
}

.board-dropdown .dropdown-item:hover {
  background-color: #f8f9fa;
}

.board-dropdown .dropdown-item.active {
  background-color: #212529;
  color: white;
}

/* Add no-schools message styling */
.dropdown-item.no-schools {
  color: #6c757d;
  font-style: italic;
  cursor: default;
  pointer-events: none;
  text-align: center;
  padding: 1rem;
}

.dropdown-item.no-schools:hover {
  background-color: transparent;
}

/* Add style for disabled Add Subjects button */
.btn-success:disabled {
  background-color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

/* Replace with enhanced styling */
.subject-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin: 0.25rem;
  border-radius: 2rem;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;
}

.subject-badge:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

.subject-badge i {
  margin-right: 0.5rem;
  color: #6c757d;
}
</style>
