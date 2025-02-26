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
import { ref, onMounted, onBeforeUnmount } from 'vue'
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
      id: section.id,
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
      const questionTypesResponse = await fetch(
        getApiUrl(`/subsection-question-types?sectionId=${section.id}`),
      )
      if (questionTypesResponse.ok) {
        const questionTypes: SectionQuestionType[] = await questionTypesResponse.json()
        const sectionIndex = patternStore.sections.findIndex(
          (s) => s.seqencial_section_number === section.seqencial_section_number,
        )
        if (sectionIndex !== -1) {
          // Check if there's a single entry with sequential number 0
          const hasCommonType = questionTypes.some((qt) => qt.seqencial_subquestion_number === 0)

          if (hasCommonType) {
            // If sequential number is 0, all questions have the same type
            const commonType = questionTypes.find((qt) => qt.seqencial_subquestion_number === 0)
            patternStore.sections[sectionIndex].sameType = true
            patternStore.sections[sectionIndex].questionType =
              commonType?.question_type?.type_name || ''
            patternStore.sections[sectionIndex].questionTypes = [
              commonType?.question_type?.type_name || '',
            ]
          } else {
            // Multiple question types
            patternStore.sections[sectionIndex].sameType = false
            patternStore.sections[sectionIndex].questionType = ''
            patternStore.sections[sectionIndex].questionTypes = questionTypes
              .sort((a, b) => a.seqencial_subquestion_number - b.seqencial_subquestion_number)
              .map((qt) => qt.question_type.type_name)
          }
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
    // Get current pattern data to compare changes
    const currentPatternResponse = await fetch(getApiUrl(`/patterns/${route.params.id}`))
    if (!currentPatternResponse.ok) throw new Error('Failed to fetch current pattern')
    const currentPattern = await currentPatternResponse.json()

    // Check if pattern details have changed
    const patternChanged =
      currentPattern.pattern_name !== formData.patternName ||
      currentPattern.board_id !== formData.selectedBoard?.id ||
      currentPattern.standard_id !== formData.selectedStandard?.id ||
      currentPattern.subject_id !== formData.selectedSubject?.id ||
      currentPattern.total_marks !== formData.totalMarks

    // Only update if pattern details have changed
    if (patternChanged) {
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
    }

    patternStore.clearFormData()
    router.push('/admin/pattern')
  } catch (error) {
    console.error('Error updating pattern:', error)
    // Handle error (show error message to user)
  }
}

const handleAddSection = (formData: FormData) => {
  patternStore.setFormData(formData)
  router.push({
    name: 'addSection',
    query: {
      remainingMarks: formData.remainingMarks?.toString() || formData.totalMarks.toString(),
      fromEdit: 'true',
      patternId: route.params.id?.toString(),
      nextSequentialNumber: (patternStore.sections.length + 1).toString(),
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
      fromEdit: 'true',
      patternId: route.params.id?.toString(),
      sectionId: patternStore.sections[index].id?.toString(),
    },
  })
}

const deleteSection = async (index: number) => {
  try {
    loading.value = true
    const sectionToDelete = patternStore.sections[index]
    if (!sectionToDelete.id) {
      console.error('Section ID not found')
      return
    }

    // Delete section from backend
    const response = await fetch(getApiUrl(`/sections/${sectionToDelete.id}`), {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete section')
    }

    // Refresh pattern data to get updated sections from backend
    await fetchPattern()
  } catch (error) {
    console.error('Error deleting section:', error)
    error.value = 'Failed to delete section. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPattern()
})

onBeforeUnmount(() => {
  const nextRoute = router.currentRoute.value.name
  if (nextRoute !== 'addSection' && nextRoute !== 'editSection') {
    console.log('Clearing form data - navigating to:', nextRoute)
    patternStore.clearFormData()
  } else {
    console.log('Preserving form data for:', nextRoute)
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
</style>
