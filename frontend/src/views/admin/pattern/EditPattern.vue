<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/pattern" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Edit Pattern</h4>
        </div>
      </div>
      <hr />
    </div>
    <div v-if="loading" class="row justify-content-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="row justify-content-center mt-5">
      <div class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>
    <div v-else id="form-container" class="row mt-4 justify-content-center">
      <PatternFormComponent
        @submit="handleSubmit"
        @addSection="handleAddSection"
        @editSection="editSection"
        @deleteSection="deleteSection"
        :initial-data="formData"
        :sections="patternStore.sections"
        ref="formComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PatternFormComponent from '@/components/forms/PatternFormComponent.vue'
import type { FormData } from '@/components/forms/PatternFormComponent.vue'
import { getApiUrl } from '@/config/api'
import { usePatternStore } from '@/stores/pattern'

interface QuestionType {
  id: number
  type_name: string
}

interface SectionQuestionType {
  id: number
  section_id: number
  seqencial_subquestion_number: number
  question_type_id: number
  question_type: QuestionType
}

interface Board {
  id: number
  name: string
  abbreviation: string
  address_id: number
  created_at: string
  updated_at: string
}

interface Standard {
  id: number
  board_id: number
  name: string
  created_at: string
  updated_at: string
}

interface Subject {
  id: number
  board_id: number
  name: string
  created_at: string
  updated_at: string
}

interface Section {
  id: number
  pattern_id: number
  seqencial_section_number: number
  sub_section: string
  section_name: string
  total_questions: number
  mandotory_questions: number
  marks_per_question: number
  created_at: string
  updated_at: string
}

interface Pattern {
  id: number
  pattern_name: string
  board_id: number
  standard_id: number
  subject_id: number
  total_marks: number
  created_at: string
  updated_at: string
  board: Board
  standard: Standard
  subject: Subject
  sections: Section[]
}

const router = useRouter()
const route = useRoute()
const patternStore = usePatternStore()
const formComponent = ref<InstanceType<typeof PatternFormComponent> | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const formData = ref<FormData>({
  patternName: '',
  selectedBoard: null,
  selectedStandard: null,
  selectedSubject: null,
  totalMarks: 0,
})

// Fetch pattern data
const fetchPattern = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch pattern details
    const patternResponse = await fetch(getApiUrl(`/patterns/${route.params.id}`))
    if (!patternResponse.ok) throw new Error('Failed to fetch pattern')
    const pattern: Pattern = await patternResponse.json()

    // Set form data
    formData.value = {
      patternName: pattern.pattern_name,
      selectedBoard: {
        id: pattern.board.id,
        name: pattern.board.name,
        abbreviation: pattern.board.abbreviation,
        standards: [], // We'll need to fetch these separately
        subjects: [], // We'll need to fetch these separately
      },
      selectedStandard: {
        id: pattern.standard.id,
        name: pattern.standard.name,
      },
      selectedSubject: {
        id: pattern.subject.id,
        name: pattern.subject.name,
      },
      totalMarks: pattern.total_marks,
    }

    // Fetch board details to get standards and subjects
    const boardResponse = await fetch(getApiUrl(`/boards/${pattern.board_id}`))
    if (!boardResponse.ok) throw new Error('Failed to fetch board details')
    const board = await boardResponse.json()

    // Update board with standards and subjects
    if (formData.value.selectedBoard) {
      formData.value.selectedBoard.standards = board.standards
      formData.value.selectedBoard.subjects = board.subjects
    }

    // Set sections in store
    patternStore.sections = pattern.sections.map((section: Section) => ({
      questionNumber: section.seqencial_section_number.toString(),
      subQuestion: section.sub_section,
      sectionName: section.section_name,
      totalQuestions: section.total_questions,
      requiredQuestions: section.mandotory_questions,
      marksPerQuestion: section.marks_per_question,
      sameType: true, // We'll need to fetch question types separately
      questionType: '', // We'll need to fetch this
      questionTypes: [], // We'll need to fetch these
      seqencial_section_number: section.seqencial_section_number,
    }))

    // Fetch question types for each section
    for (const section of pattern.sections) {
      const questionTypesResponse = await fetch(getApiUrl(`/sections/${section.id}/question-types`))
      if (questionTypesResponse.ok) {
        const questionTypes: SectionQuestionType[] = await questionTypesResponse.json()
        const sectionIndex = patternStore.sections.findIndex(
          (s) => s.seqencial_section_number === section.seqencial_section_number,
        )
        if (sectionIndex !== -1) {
          const sameType = questionTypes.every(
            (qt, _, arr) => qt.question_type_id === arr[0].question_type_id,
          )
          patternStore.sections[sectionIndex].sameType = sameType
          patternStore.sections[sectionIndex].questionType =
            questionTypes[0]?.question_type?.type_name || ''
          patternStore.sections[sectionIndex].questionTypes = questionTypes.map(
            (qt) => qt.question_type.type_name,
          )
        }
      }
    }
  } catch (err) {
    console.error('Error fetching pattern:', err)
    error.value = 'Failed to load pattern data. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (formData: FormData) => {
  try {
    // Update pattern
    const patternResponse = await fetch(getApiUrl(`/patterns/${route.params.id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pattern_name: formData.patternName,
        board_id: formData.selectedBoard?.id,
        standard_id: formData.selectedStandard?.id,
        subject_id: formData.selectedSubject?.id,
        total_marks: formData.totalMarks,
      }),
    })

    if (!patternResponse.ok) throw new Error('Failed to update pattern')

    // Delete existing sections
    await fetch(getApiUrl(`/patterns/${route.params.id}/sections`), {
      method: 'DELETE',
    })

    // Create new sections
    for (const section of patternStore.sections) {
      console.log('Creating section with sequential number:', section.seqencial_section_number)

      // Create section
      const sectionResponse = await fetch(getApiUrl('/sections'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pattern_id: route.params.id,
          seqencial_section_number: section.seqencial_section_number,
          sub_section: section.subQuestion,
          section_name: section.sectionName,
          total_questions: section.totalQuestions,
          mandotory_questions: section.requiredQuestions,
          marks_per_question: section.marksPerQuestion,
        }),
      })

      if (!sectionResponse.ok) {
        throw new Error('Failed to create section')
      }

      const createdSection = await sectionResponse.json()

      // Create subsection question types
      if (section.sameType) {
        // If same type for all questions, create entries for each question
        const questionType = await getQuestionTypeByName(section.questionType)
        if (questionType) {
          for (let i = 1; i <= section.totalQuestions; i++) {
            await createSubsectionQuestionType(createdSection.id, i, questionType.id)
          }
        }
      } else {
        // Create entries for different question types
        for (let i = 0; i < section.questionTypes.length; i++) {
          const questionType = await getQuestionTypeByName(section.questionTypes[i])
          if (questionType) {
            await createSubsectionQuestionType(createdSection.id, i + 1, questionType.id)
          }
        }
      }
    }

    patternStore.clearFormData()
    router.push('/admin/pattern')
  } catch (error) {
    console.error('Error updating pattern:', error)
    // Handle error (show error message to user)
  }
}

const getQuestionTypeByName = async (typeName: string) => {
  try {
    const response = await fetch(getApiUrl('/question-types'))
    if (!response.ok) throw new Error('Failed to fetch question types')
    const types: QuestionType[] = await response.json()
    return types.find((type) => type.type_name === typeName)
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
  const response = await fetch(getApiUrl('/subsection-question-types'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      section_id: sectionId,
      seqencial_subquestion_number: sequentialNumber,
      question_type_id: questionTypeId,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to create subsection question type')
  }

  return await response.json()
}

const handleAddSection = (formData: FormData) => {
  patternStore.setFormData(formData)
  router.push({
    name: 'addSection',
    query: {
      remainingMarks: formData.remainingMarks?.toString() || formData.totalMarks.toString(),
    },
  })
}

const editSection = (index: number) => {
  // Get the current section data
  const sectionToEdit = patternStore.sections[index]
  console.log('Editing section:', sectionToEdit)

  // Calculate remaining marks excluding current section's marks
  const currentSectionMarks = sectionToEdit.requiredQuestions * sectionToEdit.marksPerQuestion
  const remainingMarksExcludingCurrent = formComponent.value?.remainingMarks || 0
  const totalRemainingMarks = remainingMarksExcludingCurrent + currentSectionMarks

  console.log('Navigation params:', {
    sectionIndex: index,
    remainingMarks: totalRemainingMarks,
    totalMarks: formData.value.totalMarks,
  })

  router.push({
    name: 'editSection',
    query: {
      sectionIndex: index.toString(),
      remainingMarks: totalRemainingMarks.toString(),
      totalMarks: formData.value.totalMarks.toString(),
    },
  })
}

const deleteSection = (index: number) => {
  patternStore.removeSection(index)
}

onMounted(() => {
  fetchPattern()
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
</style>
