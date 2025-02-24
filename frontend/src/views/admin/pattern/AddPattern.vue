<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/pattern" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Create New Pattern</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <PatternFormComponent
        @submit="handleSubmit"
        @addSection="handleAddSection"
        @editSection="editSection"
        @deleteSection="deleteSection"
        :initial-data="patternStore.formData"
        :sections="patternStore.sections"
        ref="formComponent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PatternFormComponent from '@/components/forms/PatternFormComponent.vue'
import type { FormData } from '@/components/forms/PatternFormComponent.vue'
import { getApiUrl } from '@/config/api'
import { usePatternStore } from '@/stores/pattern'

interface QuestionType {
  id: number
  type_name: string
  subsection_question_types: Array<never>
}

const router = useRouter()
const patternStore = usePatternStore()
const formComponent = ref<InstanceType<typeof PatternFormComponent> | null>(null)
const questionTypes = ref<QuestionType[]>([])

// Fetch question types
const fetchQuestionTypes = async () => {
  try {
    const response = await fetch(getApiUrl('/question-types'))
    if (!response.ok) throw new Error('Failed to fetch question types')
    const data = await response.json()
    questionTypes.value = data
  } catch (error) {
    console.error('Error fetching question types:', error)
  }
}

onMounted(() => {
  fetchQuestionTypes()
})

const handleSubmit = async (formData: FormData) => {
  try {
    // First create the pattern
    const response = await fetch(getApiUrl('/patterns'), {
      method: 'POST',
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

    if (!response.ok) {
      throw new Error('Failed to create pattern')
    }

    const pattern = await response.json()

    // Now create all sections for this pattern
    for (const section of patternStore.sections) {
      // Create section
      const sectionResponse = await fetch(getApiUrl('/sections'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pattern_id: pattern.id,
          seqencial_section_number: parseInt(section.questionNumber),
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
        const questionType = questionTypes.value.find((qt) => qt.type_name === section.questionType)
        if (questionType) {
          for (let i = 1; i <= section.totalQuestions; i++) {
            await createSubsectionQuestionType(createdSection.id, i, questionType.id)
          }
        }
      } else {
        // Create entries for different question types
        for (let i = 0; i < section.questionTypes.length; i++) {
          const questionType = questionTypes.value.find(
            (qt) => qt.type_name === section.questionTypes[i],
          )
          if (questionType) {
            await createSubsectionQuestionType(createdSection.id, i + 1, questionType.id)
          }
        }
      }
    }

    patternStore.clearFormData()
    router.push('/admin/pattern')
  } catch (error) {
    console.error('Error creating pattern:', error)
    // Handle error (show error message to user)
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
    totalMarks: patternStore.formData.totalMarks,
  })

  router.push({
    name: 'editSection',
    query: {
      sectionIndex: index.toString(),
      remainingMarks: totalRemainingMarks.toString(),
      totalMarks: patternStore.formData.totalMarks.toString(),
    },
  })
}

const deleteSection = (index: number) => {
  patternStore.removeSection(index)
}

// Clear form data when component is destroyed, unless we're going to the add section page
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
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');

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
