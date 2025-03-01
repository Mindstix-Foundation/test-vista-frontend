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
        @updatePatternInfo="handlePatternUpdate"
        @addSection="handleAddSection"
        @editSection="editSection"
        @deleteSection="deleteSection"
        :initial-data="formData"
        :sections="patternStore.sections"
        :is-edit-mode="true"
        ref="formComponent"
      />
    </div>
  </div>

  <!-- Delete Section Confirmation Modal -->
  <div
    class="modal fade"
    id="deleteSectionModal"
    tabindex="-1"
    aria-labelledby="deleteSectionModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title" id="deleteSectionModalLabel">Delete Section</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Are you sure you want to delete this section?</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmDeleteSection">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PatternFormComponent from '@/components/forms/PatternFormComponent.vue'
import type { FormData } from '@/components/forms/PatternFormComponent.vue'
import axiosInstance from '@/config/axios'
import { usePatternStore } from '@/stores/pattern'
import { Modal } from 'bootstrap'
import { useToastStore } from '@/store/toast'

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
  section_number: number
  sequence_number: number
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

interface PatternUpdateData {
  pattern_name: string
  board_id: number | undefined
  standard_id: number | undefined
  subject_id: number | undefined
  total_marks: number
}

const router = useRouter()
const route = useRoute()
const patternStore = usePatternStore()
const toastStore = useToastStore()
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

const sectionToDeleteIndex = ref<number | null>(null)
let deleteSectionModal: Modal | null = null

// Fetch pattern data
const fetchPattern = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch pattern details
    const { data: pattern }: { data: Pattern } = await axiosInstance.get(
      `/patterns/${route.params.id}`,
    )

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
    const { data: board } = await axiosInstance.get(`/boards/${pattern.board_id}`)

    // Update board with standards and subjects
    if (formData.value.selectedBoard) {
      formData.value.selectedBoard.standards = board.standards
      formData.value.selectedBoard.subjects = board.subjects
    }

    // Set sections in store
    patternStore.sections = pattern.sections.map((section: Section) => ({
      id: section.id,
      questionNumber: section.section_number.toString(),
      subQuestion: section.sub_section,
      sectionName: section.section_name,
      totalQuestions: section.total_questions,
      requiredQuestions: section.mandotory_questions,
      marksPerQuestion: section.marks_per_question,
      sameType: true,
      questionType: '',
      questionTypes: [],
      seqencial_section_number: section.sequence_number,
    }))

    // Fetch question types for each section
    for (const section of pattern.sections) {
      const { data: questionTypes } = await axiosInstance.get(
        `/subsection-question-types?sectionId=${section.id}`,
      )
      const sectionIndex = patternStore.sections.findIndex((s) => s.id === section.id)
      if (sectionIndex !== -1) {
        // Check if there's a single entry with sequential number 0
        const hasCommonType = questionTypes.some(
          (qt: SectionQuestionType) => qt.seqencial_subquestion_number === 0,
        )

        if (hasCommonType) {
          // If sequential number is 0, all questions have the same type
          const commonType = questionTypes.find(
            (qt: SectionQuestionType) => qt.seqencial_subquestion_number === 0,
          )
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
            .sort(
              (a: SectionQuestionType, b: SectionQuestionType) =>
                a.seqencial_subquestion_number - b.seqencial_subquestion_number,
            )
            .map((qt: SectionQuestionType) => qt.question_type.type_name)
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

const handlePatternUpdate = async (updateData: PatternUpdateData) => {
  try {
    loading.value = true
    error.value = null

    // Update pattern details
    await axiosInstance.put(`/patterns/${route.params.id}`, {
      pattern_name: updateData.pattern_name,
      board_id: updateData.board_id,
      standard_id: updateData.standard_id,
      subject_id: updateData.subject_id,
      total_marks: updateData.total_marks,
    })

    // Show success toast
    toastStore.showToast({
      type: 'success',
      title: 'Success',
      message: 'Pattern updated successfully!',
    })

    // Navigate back to pattern list after successful update
    router.push('/admin/pattern')
  } catch (err) {
    console.error('Error updating pattern:', err)
    error.value = 'Failed to update pattern. Please try again.'

    // Show error toast
    toastStore.showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to update pattern. Please try again.',
    })
  } finally {
    loading.value = false
  }
}

const handleAddSection = (formData: FormData) => {
  patternStore.setFormData(formData)
  // Calculate next sequence number (always sequential)
  const nextSequenceNumber = patternStore.sections.length + 1

  router.push({
    name: 'addSection',
    query: {
      remainingMarks: formData.remainingMarks?.toString() || formData.totalMarks.toString(),
      fromEdit: 'true',
      patternId: route.params.id?.toString(),
      nextSequenceNumber: nextSequenceNumber.toString(), // This is for ordering (1,2,3,4,5)
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
      sequenceNumber: patternStore.sections[index].seqencial_section_number?.toString(),
      sectionNumber: patternStore.sections[index].questionNumber?.toString(), // This is the Q number
    },
  })
}

const deleteSection = (index: number) => {
  console.log('Delete section called for index:', index)
  sectionToDeleteIndex.value = index
  if (deleteSectionModal) {
    deleteSectionModal.show()
  } else {
    console.error('Delete section modal not initialized')
  }
}

const confirmDeleteSection = async () => {
  if (sectionToDeleteIndex.value === null) return

  try {
    loading.value = true
    const sectionToDelete = patternStore.sections[sectionToDeleteIndex.value]
    if (!sectionToDelete.id) {
      console.error('Section ID not found')
      return
    }

    // Delete section from backend
    await axiosInstance.delete(`/sections/${sectionToDelete.id}`)

    // Hide modal
    deleteSectionModal?.hide()

    // Refresh pattern data to get updated sections from backend
    await fetchPattern()
  } catch (err: unknown) {
    console.error('Error deleting section:', err)
    error.value = 'Failed to delete section. Please try again.'
  } finally {
    loading.value = false
    sectionToDeleteIndex.value = null
  }
}

onMounted(() => {
  fetchPattern()
  // Initialize delete section modal
  deleteSectionModal = new Modal(document.getElementById('deleteSectionModal')!)
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
