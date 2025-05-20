<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link
          class="btn btn-close"
          :to="
            $route.query.fromEdit
              ? { name: 'editPattern', params: { id: String($route.query.patternId) }, query: { from: 'editSection' } }
              : { name: 'createPattern' }
          "
          aria-label="Close"
        />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Create New Section</h4>
          <div v-if="!canAddSection" class="alert alert-warning">
            Cannot add more sections as it would exceed the total pattern marks.
          </div>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <SectionFormComponent
        @submit="handleSubmit"
        :total-pattern-marks="totalPatternMarks"
        :remaining-marks="Number($route.query.remainingMarks || 0)"
        :disabled="isDisabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import SectionFormComponent from '@/components/forms/SectionFormComponent.vue'
import type { SectionFormData } from '@/components/forms/SectionFormComponent.vue'
import { usePatternStore } from '@/stores/pattern'
import { computed } from 'vue'
import axiosInstance from '@/config/axios'

const router = useRouter()
const route = useRoute()
const patternStore = usePatternStore()

const totalPatternMarks = computed(() => Number(route.query.remainingMarks ?? 0))
const isDisabled = computed(() => totalPatternMarks.value <= 0)
const storeOnly = computed(() => route.query.storeOnly === 'true')

interface SectionData {
  questionNumber: string
  subQuestion: string
  sectionName: string
  totalQuestions: number
  requiredQuestions: number
  marksPerQuestion: number
  sameType: boolean
  questionType: string
  questionTypes: string[]
  seqencial_section_number: number
  isNew?: boolean
  isModified?: boolean
  id?: number
}

const handleSubmit = async (formData: SectionFormData) => {
  try {
    const isFromEditPattern = route.query.fromEdit === 'true'
    const patternId = route.query.patternId as string
    const nextSequenceNumber = route.query.nextSequenceNumber as string
    const nextSectionNumber = route.query.nextSectionNumber as string || '1'

    console.log('Handling section submission:')
    console.log('- isFromEditPattern:', isFromEditPattern)
    console.log('- storeOnly:', storeOnly.value)
    console.log('- patternId:', patternId)
    console.log('- nextSequenceNumber:', nextSequenceNumber)
    console.log('- Form data:', formData)

    // Handle section creation based on context
    await handleSectionCreation(
      isFromEditPattern,
      patternId,
      nextSequenceNumber,
      nextSectionNumber,
      formData
    )
  } catch (error) {
    console.error('Error handling section submission:', error)
    // Handle error (show error message to user)
  }
}

// Helper function to handle different cases of section creation
const handleSectionCreation = async (
  isFromEditPattern: boolean,
  patternId: string,
  nextSequenceNumber: string,
  nextSectionNumber: string,
  formData: SectionFormData
) => {
  if (isFromEditPattern && patternId && !storeOnly.value) {
    await createSectionInBackend(patternId, nextSequenceNumber, formData)
  } else if (isFromEditPattern && patternId && storeOnly.value) {
    addSectionToStoreForEditPattern(patternId, nextSectionNumber, nextSequenceNumber, formData)
  } else {
    addSectionToStoreForNewPattern(nextSectionNumber, formData)
  }
}

// Helper function to create section in backend
const createSectionInBackend = async (
  patternId: string,
  nextSequenceNumber: string,
  formData: SectionFormData
) => {
  // Create section immediately in backend for edit pattern
  const { data: createdSection } = await axiosInstance.post('/sections', {
    pattern_id: Number(patternId),
    sequence_number: Number(nextSequenceNumber),
    section_number: Number(formData.questionNumber),
    sub_section: formData.subQuestion,
    section_name: formData.sectionName,
    total_questions: Number(formData.totalQuestions),
    mandotory_questions: Number(formData.requiredQuestions),
    marks_per_question: Number(formData.marksPerQuestion),
  })

  await setupQuestionTypes(formData, createdSection.id)

  // Return to edit pattern page after successful creation
  navigateToEditPattern(patternId)
}

// Helper function to handle question types
const setupQuestionTypes = async (formData: SectionFormData, sectionId: number) => {
  if (formData.sameType) {
    // If same type for all questions, create single entry with sequential number 0
    const questionType = await getQuestionTypeByName(formData.questionType)
    if (questionType) {
      await createSubsectionQuestionType(sectionId, 0, questionType.id)
    }
  } else {
    // Create entries for different question types
    await createMultipleQuestionTypes(formData.questionTypes, sectionId)
  }
}

// Helper function to create multiple question types
const createMultipleQuestionTypes = async (questionTypes: string[], sectionId: number) => {
  for (let i = 0; i < questionTypes.length; i++) {
    const questionType = await getQuestionTypeByName(questionTypes[i])
    if (questionType) {
      await createSubsectionQuestionType(sectionId, i + 1, questionType.id)
    }
  }
}

// Helper function to add section to store for edit pattern mode
const addSectionToStoreForEditPattern = (
  patternId: string,
  nextSectionNumber: string,
  nextSequenceNumber: string,
  formData: SectionFormData
) => {
  console.log('Adding section to store for edit pattern mode')
  const sectionData: SectionData = {
    questionNumber: formData.questionNumber || nextSectionNumber,
    subQuestion: formData.subQuestion,
    sectionName: formData.sectionName,
    totalQuestions: Number(formData.totalQuestions),
    requiredQuestions: Number(formData.requiredQuestions),
    marksPerQuestion: Number(formData.marksPerQuestion),
    sameType: formData.sameType,
    questionType: formData.questionType,
    questionTypes: formData.questionTypes,
    seqencial_section_number: Number(nextSequenceNumber),
    isNew: true, // Mark as new section
    isModified: false, // Not modified since it's new
  }
  patternStore.addSection(sectionData)
  navigateToEditPattern(patternId)
}

// Helper function to add section to store for new pattern
const addSectionToStoreForNewPattern = (nextSectionNumber: string, formData: SectionFormData) => {
  console.log('Adding section to store for new pattern creation')
  const sectionData: SectionData = {
    questionNumber: formData.questionNumber || nextSectionNumber,
    subQuestion: formData.subQuestion,
    sectionName: formData.sectionName,
    totalQuestions: Number(formData.totalQuestions),
    requiredQuestions: Number(formData.requiredQuestions),
    marksPerQuestion: Number(formData.marksPerQuestion),
    sameType: formData.sameType,
    questionType: formData.questionType,
    questionTypes: formData.questionTypes,
    seqencial_section_number: patternStore.sections.length + 1,
  }
  patternStore.addSection(sectionData)
  router.push({ name: 'createPattern' })
}

// Helper function to navigate to edit pattern
const navigateToEditPattern = (patternId: string) => {
  router.push({
    name: 'editPattern',
    params: { id: patternId },
    query: { from: 'editSection' }
  })
}

const getQuestionTypeByName = async (typeName: string) => {
  try {
    const { data: types } = await axiosInstance.get('/question-types')
    return types.find((type: { type_name: string }) => type.type_name === typeName)
  } catch (error) {
    console.error('Error fetching question type:', error)
    return null
  }
}

const createSubsectionQuestionType = async (
  sectionId: number,
  sequentialNumber: number,
  questionTypeId: number,
) => {
  const { data } = await axiosInstance.post('/subsection-question-types', {
    section_id: sectionId,
    seqencial_subquestion_number: sequentialNumber,
    question_type_id: questionTypeId,
  })

  return data
}

// Add computed property to check if more sections can be added
const canAddSection = computed(() => {
  return patternStore.remainingMarks > 0
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