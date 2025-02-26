<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link
          class="btn btn-close"
          :to="{
            name: isFromEditPattern ? 'editPattern' : 'createPattern',
            params: isFromEditPattern ? { id: patternId } : {},
          }"
          aria-label="Close"
        />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Edit Section</h4>
        </div>
      </div>
      <hr />
    </div>
    <div v-if="loading" class="row justify-content-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else id="form-container" class="row mt-4 justify-content-center">
      <SectionFormComponent
        @submit="handleSubmit"
        :total-pattern-marks="totalPatternMarks"
        :remaining-marks="Number($route.query.remainingMarks || 0)"
        :initial-section-data="currentSection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import SectionFormComponent from '@/components/forms/SectionFormComponent.vue'
import type { SectionFormData } from '@/components/forms/SectionFormComponent.vue'
import { usePatternStore } from '@/stores/pattern'
import { getApiUrl } from '@/config/api'

interface QuestionType {
  id: number
  type_name: string
}

interface SubsectionQuestionType {
  id: number
  section_id: number
  seqencial_subquestion_number: number
  question_type_id: number
  question_type: QuestionType
}

interface Section {
  id: number
  seqencial_section_number: number
  sub_section: string
  section_name: string
  total_questions: number
  mandotory_questions: number
  marks_per_question: number
  subsection_question_types: SubsectionQuestionType[]
}

const router = useRouter()
const route = useRoute()
const patternStore = usePatternStore()
const loading = ref(false)

// Determine if we're coming from edit pattern page
const isFromEditPattern = computed(() => route.query.fromEdit === 'true')
const patternId = computed(() => route.query.patternId?.toString())
const sectionId = computed(() => route.query.sectionId?.toString())

const sectionIndex = computed(() => {
  const index = Number(route.query.sectionIndex || 0)
  console.log('Current section index:', index)
  return index
})

const totalPatternMarks = computed(() => {
  const marks = Number(route.query.totalMarks || 0)
  console.log('Total pattern marks:', marks)
  return marks
})

const currentSection = ref<SectionFormData | null>(null)

// Fetch section data from backend
const fetchSectionFromBackend = async () => {
  try {
    loading.value = true
    const response = await fetch(getApiUrl(`/sections/${sectionId.value}`))
    if (!response.ok) throw new Error('Failed to fetch section')
    const sectionData: Section = await response.json()

    // Transform backend data to match form structure
    currentSection.value = {
      questionNumber: sectionData.seqencial_section_number.toString(),
      subQuestion: sectionData.sub_section,
      sectionName: sectionData.section_name,
      totalQuestions: sectionData.total_questions.toString(),
      requiredQuestions: sectionData.mandotory_questions.toString(),
      marksPerQuestion: sectionData.marks_per_question.toString(),
      sameType: sectionData.subsection_question_types.some(
        (qt) => qt.seqencial_subquestion_number === 0,
      ),
      questionType:
        sectionData.subsection_question_types.find((qt) => qt.seqencial_subquestion_number === 0)
          ?.question_type?.type_name || '',
      questionTypes: sectionData.subsection_question_types
        .sort((a, b) => a.seqencial_subquestion_number - b.seqencial_subquestion_number)
        .map((qt) => qt.question_type.type_name),
    }
  } catch (error) {
    console.error('Error fetching section:', error)
  } finally {
    loading.value = false
  }
}

// Get section data from store
const getSectionFromStore = () => {
  const section = patternStore.sections[sectionIndex.value]
  if (section) {
    currentSection.value = {
      questionNumber: section.questionNumber,
      subQuestion: section.subQuestion,
      sectionName: section.sectionName,
      totalQuestions: section.totalQuestions.toString(),
      requiredQuestions: section.requiredQuestions.toString(),
      marksPerQuestion: section.marksPerQuestion.toString(),
      sameType: section.sameType,
      questionType: section.questionType,
      questionTypes: [...section.questionTypes],
    }
  }
}

// Update section in backend
const updateSectionInBackend = async (formData: SectionFormData) => {
  try {
    if (!sectionId.value || !patternId.value) return
    loading.value = true

    // Get current section data to compare changes
    const currentSectionResponse = await fetch(getApiUrl(`/sections/${sectionId.value}`))
    if (!currentSectionResponse.ok) throw new Error('Failed to fetch current section')
    const currentSectionData: Section = await currentSectionResponse.json()

    // Check if section details (non-question type data) has changed
    const sectionDetailsChanged =
      currentSectionData.sub_section !== formData.subQuestion ||
      currentSectionData.section_name !== formData.sectionName ||
      currentSectionData.total_questions !== Number(formData.totalQuestions) ||
      currentSectionData.mandotory_questions !== Number(formData.requiredQuestions) ||
      currentSectionData.marks_per_question !== Number(formData.marksPerQuestion)

    // Update section details if changed
    if (sectionDetailsChanged) {
      const sectionResponse = await fetch(getApiUrl(`/sections/${sectionId.value}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sub_section: formData.subQuestion,
          section_name: formData.sectionName,
          total_questions: Number(formData.totalQuestions),
          mandotory_questions: Number(formData.requiredQuestions),
          marks_per_question: Number(formData.marksPerQuestion),
        }),
      })

      if (!sectionResponse.ok) throw new Error('Failed to update section')
    }

    // Handle question type updates
    const currentHasSameType = currentSectionData.subsection_question_types.some(
      (qt) => qt.seqencial_subquestion_number === 0,
    )

    if (currentHasSameType) {
      // Current section has same type for all questions
      if (!formData.sameType) {
        // Scenario 3: Switching from same type to different types
        // First delete the existing record with sequential number 0
        const typeToDelete = currentSectionData.subsection_question_types.find(
          (qt) => qt.seqencial_subquestion_number === 0,
        )

        if (typeToDelete) {
          await fetch(getApiUrl(`/subsection-question-types/${typeToDelete.id}`), {
            method: 'DELETE',
          })
        }

        // Create new records for each question type
        for (let i = 0; i < formData.questionTypes.length; i++) {
          const questionType = await getQuestionTypeByName(formData.questionTypes[i])
          if (questionType) {
            await createSubsectionQuestionType(Number(sectionId.value), i + 1, questionType.id)
          }
        }
      } else {
        // Scenario 4: Same type for all, just updating the type
        const currentType = currentSectionData.subsection_question_types.find(
          (qt) => qt.seqencial_subquestion_number === 0,
        )
        const newQuestionType = await getQuestionTypeByName(formData.questionType)

        if (
          currentType &&
          newQuestionType &&
          currentType.question_type.type_name !== formData.questionType
        ) {
          await fetch(getApiUrl(`/subsection-question-types/${currentType.id}`), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question_type_id: newQuestionType.id,
            }),
          })
        }
      }
    } else {
      // Current section has different types
      if (formData.sameType) {
        // Scenario 1: Switching to same type for all
        const questionType = await getQuestionTypeByName(formData.questionType)
        if (questionType) {
          // Update first question type to have sequential number 0
          const firstQuestionType = currentSectionData.subsection_question_types[0]
          if (firstQuestionType) {
            await fetch(getApiUrl(`/subsection-question-types/${firstQuestionType.id}`), {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                seqencial_subquestion_number: 0,
                question_type_id: questionType.id,
              }),
            })
          }
        }
      } else {
        // Scenario 2: Different types, updating individual types
        const currentTypes = currentSectionData.subsection_question_types
        for (let i = 0; i < formData.questionTypes.length; i++) {
          const currentType = currentTypes[i]
          const newQuestionType = await getQuestionTypeByName(formData.questionTypes[i])

          if (
            currentType &&
            newQuestionType &&
            currentType.question_type.type_name !== formData.questionTypes[i]
          ) {
            await fetch(getApiUrl(`/subsection-question-types/${currentType.id}`), {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question_type_id: newQuestionType.id,
              }),
            })
          }
        }
      }
    }

    router.push({
      name: 'editPattern',
      params: { id: patternId.value },
    })
  } catch (error) {
    console.error('Error updating section:', error)
  } finally {
    loading.value = false
  }
}

const getQuestionTypeByName = async (typeName: string): Promise<QuestionType | undefined> => {
  try {
    const response = await fetch(getApiUrl('/question-types'))
    if (!response.ok) throw new Error('Failed to fetch question types')
    const types: QuestionType[] = await response.json()
    return types.find((type) => type.type_name === typeName)
  } catch (error) {
    console.error('Error fetching question type:', error)
    return undefined
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

const handleSubmit = async (formData: SectionFormData) => {
  if (isFromEditPattern.value) {
    await updateSectionInBackend(formData)
  } else {
    // Update in store for add pattern flow
    const sectionData = {
      ...formData,
      totalQuestions: Number(formData.totalQuestions),
      requiredQuestions: Number(formData.requiredQuestions),
      marksPerQuestion: Number(formData.marksPerQuestion),
      seqencial_section_number: patternStore.sections[sectionIndex.value].seqencial_section_number,
    }
    patternStore.updateSection(sectionIndex.value, sectionData)
    router.push({ name: 'createPattern' })
  }
}

onMounted(() => {
  if (isFromEditPattern.value) {
    fetchSectionFromBackend()
  } else {
    getSectionFromStore()
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
