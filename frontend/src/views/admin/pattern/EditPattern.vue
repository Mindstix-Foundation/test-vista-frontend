<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'patternDashboard' }" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Edit Pattern</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <form @submit.prevent="handleSubmit">
        <div class="row g-3 justify-content-center">
          <fieldset class="border p-2 rounded col col-12 col-sm-10 col-md-8 mb-2">
            <legend class="float-none w-auto">Pattern Details &nbsp;</legend>

            <div class="row g-2 justify-content-center">
              <!-- Pattern Name -->
              <div class="col col-12">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    id="patternName"
                    placeholder="Enter Pattern Name"
                    v-model="formData.patternName"
                    required
                  />
                  <label for="patternName" class="form-label">Pattern Name</label>
                </div>
              </div>

              <!-- Board Selection -->
              <div class="col col-12">
                <SearchableDropdown
                  id="filterBoard"
                  label="Board"
                  placeholder="Search for Board"
                  :items="boards"
                  v-model="formData.selectedBoard"
                  :search-keys="['name', 'abbreviation']"
                  required
                  @change="(value: Item | null) => handleBoardChange(value)"
                />
              </div>

              <!-- Standard Selection -->
              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <select
                    id="standard"
                    class="form-select"
                    v-model="formData.selectedStandard"
                    required
                  >
                    <option value="">Select Standard</option>
                    <option v-for="std in standards" :key="std" :value="std">{{ std }}</option>
                  </select>
                  <label for="standard" class="form-label">Standard</label>
                </div>
              </div>

              <!-- Subject Selection -->
              <div class="col-12 col-md-6">
                <div class="form-floating">
                  <select
                    id="subject"
                    class="form-select"
                    v-model="formData.selectedSubject"
                    required
                  >
                    <option value="">Select Subject</option>
                    <option v-for="sub in subjects" :key="sub" :value="sub">{{ sub }}</option>
                  </select>
                  <label for="subject" class="form-label">Subject</label>
                </div>
              </div>

              <!-- Total Marks -->
              <div class="col col-12">
                <div class="form-floating">
                  <input
                    type="number"
                    class="form-control"
                    id="totalMarks"
                    placeholder="Enter Total Marks"
                    v-model="formData.totalMarks"
                    @input="calculateRemainingMarks"
                    required
                  />
                  <label for="totalMarks" class="form-label">Total Marks</label>
                </div>
              </div>

              <!-- Remaining Marks -->
              <div class="col col-12">
                <div class="row">
                  <label for="remainingMarks" class="col-form-label col-6 col-sm-auto fw-bold"
                    >Remaining Marks:</label
                  >
                  <div class="col-6 col-sm-auto">
                    <input
                      type="text"
                      readonly
                      class="form-control-plaintext"
                      id="remainingMarks"
                      :value="remainingMarks"
                    />
                  </div>
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Add Section Button -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="row g-3 justify-content-center mb-4">
              <div class="col-12">
                <div class="btn-group w-100">
                  <router-link
                    class="btn btn-light"
                    style="border: 1px solid gray !important"
                    :to="{
                      name: 'createSection',
                      query: {
                        patternName: formData.patternName,
                        board: formData.selectedBoard?.id,
                        standard: formData.selectedStandard,
                        subject: formData.selectedSubject,
                        totalMarks: formData.totalMarks.toString(),
                      },
                    }"
                    :disabled="!canAddSection"
                  >
                    Add Section
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Cards -->
          <div v-for="section in sections" :key="section.id" class="col col-12 col-sm-10 col-md-8">
            <div class="card">
              <div class="card-body">
                <div class="container">
                  <div class="row mb-2 justify-content-between">
                    <div class="col-12 col-sm-3 text-center">
                      <strong>Total Questions:</strong>
                      <span>{{ section.totalQuestions }}</span>
                    </div>
                    <div class="col-12 col-sm-3 text-center">
                      <strong>Mandatory Questions:</strong>
                      <span>{{ section.mandatoryQuestions }}</span>
                    </div>
                    <div class="col-12 col-sm-3 text-center">
                      <strong>Section Marks:</strong>
                      <span>{{ section.sectionMarks }}</span>
                    </div>
                    <div class="col-12 col-sm-auto text-end">
                      <router-link
                        :to="{
                          name: 'editSection',
                          params: { id: section.id },
                          query: {
                            patternId: patternId,
                          },
                        }"
                        class="text-decoration-none text-black me-2 fs-5"
                      >
                        <i class="bi bi-pencil-square" />
                      </router-link>
                      <i
                        class="bi bi-trash3 ms-3 fs-5"
                        @click="showDeleteConfirmation(section)"
                        style="cursor: pointer"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="mt-2">
                      <span>
                        <strong class="me-3">{{ section.questionNumber }}</strong>
                        {{ section.sectionName }}
                      </span>
                    </div>
                  </div>
                  <hr />
                  <ul class="list-group list-group-flush">
                    <li
                      v-for="(type, index) in section.questionTypes"
                      :key="index"
                      class="list-group-item"
                    >
                      {{ type }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="col col-12 col-sm-10 col-md-8">
            <div class="text-center mt-3">
              <button type="submit" class="btn btn-dark" :disabled="!isFormValid">Submit</button>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteConfirmationModal"
      tabindex="-1"
      aria-labelledby="deleteConfirmationModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="deleteConfirmationModalLabel">Remove Section</h5>
          </div>
          <div class="modal-body">
            Are you sure you want to delete this section from this pattern?
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              id="cancelButton"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-danger"
              id="deleteButton"
              @click="deleteSection"
              data-bs-dismiss="modal"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'

interface Board {
  id: number
  name: string
  abbreviation: string
}

interface Item {
  id: number | string
  [key: string]: unknown
}

interface Section {
  id: number
  questionNumber: string
  sectionName: string
  totalQuestions: number
  mandatoryQuestions: number
  sectionMarks: number
  questionTypes: string[]
}

interface FormData {
  patternName: string
  selectedBoard: Board | null
  selectedStandard: string
  selectedSubject: string
  totalMarks: number
}

const route = useRoute()
const router = useRouter()
const patternId = route.params.id as string

// Constants
const standards = [
  'First',
  'Second',
  'Third',
  'Fourth',
  'Fifth',
  'Sixth',
  'Seventh',
  'Eighth',
  'Ninth',
  'Tenth',
]

const subjects = [
  'Marathi',
  'Hindi',
  'English',
  'Maths',
  'Science',
  'Social Science',
  'Sanskrit',
  'Health & Physical Education',
]

const boards = [
  {
    id: 1,
    name: 'Maharashtra State Board of Secondary and Higher Secondary Education',
    abbreviation: 'MSBSHSE',
  },
  {
    id: 2,
    name: 'Central Board of Secondary Education',
    abbreviation: 'CBSE',
  },
  {
    id: 3,
    name: 'Council for the Indian School Certificate Examinations',
    abbreviation: 'CISCE',
  },
]

// Form data
const formData = ref<FormData>({
  patternName: '',
  selectedBoard: null,
  selectedStandard: '',
  selectedSubject: '',
  totalMarks: 0,
})

const sections = ref<Section[]>([])
const selectedSectionForDelete = ref<Section | null>(null)
const remainingMarks = ref(0)

// Computed properties
const isFormValid = computed(() => {
  return (
    formData.value.patternName &&
    formData.value.selectedBoard &&
    formData.value.selectedStandard &&
    formData.value.selectedSubject &&
    formData.value.totalMarks > 0
  )
})

const canAddSection = computed(() => {
  return isFormValid.value && remainingMarks.value > 0
})

// Methods
const handleBoardChange = (value: Item | null) => {
  if (value && typeof value.name === 'string' && typeof value.abbreviation === 'string') {
    formData.value.selectedBoard = {
      id: value.id,
      name: value.name,
      abbreviation: value.abbreviation,
    } as Board
  } else {
    formData.value.selectedBoard = null
  }
}

const calculateRemainingMarks = () => {
  const usedMarks = sections.value.reduce((total, section) => total + section.sectionMarks, 0)
  remainingMarks.value = formData.value.totalMarks - usedMarks
}

const showDeleteConfirmation = (section: Section) => {
  selectedSectionForDelete.value = section
  const modal = new Modal(document.getElementById('deleteConfirmationModal')!)
  modal.show()
}

const deleteSection = async () => {
  if (!selectedSectionForDelete.value) return

  try {
    // TODO: Implement section deletion logic
    const sectionId = selectedSectionForDelete.value.id
    sections.value = sections.value.filter((section) => section.id !== sectionId)
    calculateRemainingMarks()
  } catch (error) {
    console.error('Error deleting section:', error)
  }
}

const handleSubmit = async () => {
  try {
    // TODO: Implement pattern update logic
    console.log('Pattern data:', {
      ...formData.value,
      sections: sections.value,
    })
    router.push({ name: 'patternDashboard' })
  } catch (error) {
    console.error('Error updating pattern:', error)
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    // TODO: Fetch pattern data
    // For now, using mock data
    formData.value = {
      patternName: 'Unit Test',
      selectedBoard: boards[0],
      selectedStandard: 'Tenth',
      selectedSubject: 'Science',
      totalMarks: 80,
    }

    sections.value = [
      {
        id: 1,
        questionNumber: 'Q1 A',
        sectionName: 'Answer the following questions:',
        totalQuestions: 5,
        mandatoryQuestions: 5,
        sectionMarks: 5,
        questionTypes: [
          'I - Fill in the Blanks',
          'II - Matching',
          'III - Fill in the Blanks',
          'IV - Case Study',
          'V - Diagram Based',
        ],
      },
      {
        id: 2,
        questionNumber: 'Q1 B',
        sectionName: 'Answer the following questions:',
        totalQuestions: 5,
        mandatoryQuestions: 5,
        sectionMarks: 10,
        questionTypes: [
          'I - Fill in the Blanks',
          'II - Matching',
          'III - Fill in the Blanks',
          'IV - Case Study',
          'V - Diagram Based',
        ],
      },
    ]

    calculateRemainingMarks()
  } catch (error) {
    console.error('Error fetching pattern data:', error)
  }
})
</script>

<style scoped>
fieldset {
  border-color: #dee2e6;
}

legend {
  font-size: 1rem;
  margin-bottom: 0;
  color: #6c757d;
}

.form-floating > label {
  left: 0.5rem;
}

.form-control-plaintext {
  font-weight: bold;
}
</style>
