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
      <output class="spinner-border text-primary">
        <span class="visually-hidden">Loading...</span>
      </output>
    </div>
    <div v-else id="form-container" class="row mt-4 justify-content-center">
      <SectionFormComponent
        @submit="handleSubmit"
        :total-pattern-marks="totalPatternMarks"
        :remaining-marks="Number($route.query.remainingMarks ?? 0)"
        :initial-section-data="currentSection || undefined"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import SectionFormComponent from '@/components/forms/SectionFormComponent.vue'
import type { SectionFormData } from '@/components/forms/SectionFormComponent.vue'
import { usePatternStore } from '@/stores/pattern'
import axiosInstance from '@/config/axios'

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
  section_number: number
  sequence_number: number
  sub_section: string | null
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
const storeOnly = computed(() => route.query.storeOnly === 'true')

const sectionIndex = computed(() => {
  const index = Number(route.query.sectionIndex ?? 0)
  console.log('Current section index:', index)
  return index
})

const totalPatternMarks = computed(() => {
  const marks = Number(route.query.totalMarks ?? 0)
  console.log('Total pattern marks:', marks)
  return marks
})

const currentSection = ref<SectionFormData>({
  questionNumber: '',
  subQuestion: '',
  sectionName: '',
  totalQuestions: '',
  requiredQuestions: '',
  marksPerQuestion: '',
  sameType: false,
  questionType: '',
  questionTypes: [],
})

// Fetch section data from backend
const fetchSectionFromBackend = async () => {
  try {
    loading.value = true
    const { data: sectionData }: { data: Section } = await axiosInstance.get(
      `/sections/${sectionId.value}`,
    )

    // Transform backend data to match form structure
    currentSection.value = {
      questionNumber: sectionData.section_number.toString(),
      subQuestion: sectionData.sub_section,
      sectionName: sectionData.section_name,
      totalQuestions: sectionData.total_questions.toString(),
      requiredQuestions: sectionData.mandotory_questions.toString(),
      marksPerQuestion: sectionData.marks_per_question.toString(),
      sameType: sectionData.subsection_question_types.some(
        (qt: SubsectionQuestionType) => qt.seqencial_subquestion_number === 0,
      ),
      questionType:
        sectionData.subsection_question_types.find(
          (qt: SubsectionQuestionType) => qt.seqencial_subquestion_number === 0,
        )?.question_type?.type_name ?? '',
      questionTypes: sectionData.subsection_question_types
        .toSorted(
          (a: SubsectionQuestionType, b: SubsectionQuestionType) =>
            a.seqencial_subquestion_number - b.seqencial_subquestion_number,
        )
        .map((qt: SubsectionQuestionType) => qt.question_type.type_name),
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

const getQuestionTypeByName = async (typeName: string): Promise<QuestionType | undefined> => {
  try {
    const { data: types } = await axiosInstance.get<QuestionType[]>('/question-types')
    return types.find((type: QuestionType) => type.type_name === typeName)
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
  const { data } = await axiosInstance.post('/subsection-question-types', {
    section_id: sectionId,
    seqencial_subquestion_number: sequentialNumber,
    question_type_id: questionTypeId,
  })

  return data
}

// Helper function to validate section marks
const validateSectionMarks = (requiredQuestions: number, marksPerQuestion: number, availableMarks: number): boolean => {
  const sectionMarks = requiredQuestions * marksPerQuestion
  
  console.log('EditSection - Section marks calculation:', {
    requiredQuestions,
    marksPerQuestion,
    totalSectionMarks: sectionMarks,
    availableMarks,
    remainingAfterUpdate: availableMarks - sectionMarks
  })

  if (sectionMarks > availableMarks) {
    console.error('EditSection - Section marks exceed available marks:', {
      sectionMarks,
      availableMarks,
      difference: sectionMarks - availableMarks
    })
    alert(`Section marks (${sectionMarks}) exceed available marks (${availableMarks}). Please reduce the marks per question or the number of required questions.`)
    return false
  }
  
  return true
}

// Helper function to update section in backend
const updateSectionInBackend = async (formData: SectionFormData, sectionIdValue: string) => {
  loading.value = true
  console.log('EditSection - Updating section in backend')

  // Update section details
  await axiosInstance.put(`/sections/${sectionIdValue}`, {
    sub_section: formData.subQuestion,
    section_name: formData.sectionName,
    total_questions: Number(formData.totalQuestions),
    mandotory_questions: Number(formData.requiredQuestions),
    marks_per_question: Number(formData.marksPerQuestion),
    sequence_number: Number(route.query.sequenceNumber),
    section_number: Number(route.query.sectionNumber),
  })

  // Get current question types
  const { data: currentSectionData } = await axiosInstance.get(`/sections/${sectionIdValue}`)

  // Delete all existing question types first
  for (const qt of currentSectionData.subsection_question_types) {
    await axiosInstance.delete(`/subsection-question-types/${qt.id}`)
  }

  await updateQuestionTypes(formData, Number(sectionIdValue))
}

// Helper function to update question types
const updateQuestionTypes = async (formData: SectionFormData, sectionIdValue: number) => {
  if (formData.sameType) {
    // Create single question type with sequential number 0
    const questionType = await getQuestionTypeByName(formData.questionType)
    if (questionType) {
      await createSubsectionQuestionType(sectionIdValue, 0, questionType.id)
    }
  } else {
    // Create multiple question types with sequential numbers
    for (let i = 0; i < formData.questionTypes.length; i++) {
      const questionType = await getQuestionTypeByName(formData.questionTypes[i])
      if (questionType) {
        await createSubsectionQuestionType(sectionIdValue, i + 1, questionType.id)
      }
    }
  }
}

// Helper function to prepare section data for store
const prepareSectionDataForStore = (formData: SectionFormData, isNew: boolean = false, sectionIdValue?: string) => {
  return {
    id: sectionIdValue ? Number(sectionIdValue) : undefined,
    questionNumber: formData.questionNumber,
    subQuestion: formData.subQuestion,
    sectionName: formData.sectionName,
    totalQuestions: Number(formData.totalQuestions),
    requiredQuestions: Number(formData.requiredQuestions),
    marksPerQuestion: Number(formData.marksPerQuestion),
    sameType: formData.sameType,
    questionType: formData.questionType,
    questionTypes: formData.questionTypes,
    seqencial_section_number: isNew 
      ? patternStore.sections[sectionIndex.value].seqencial_section_number
      : Number(route.query.sequenceNumber ?? 0),
    isModified: !isNew,
    isNew: isNew,
  }
}

// Helper function to navigate back after update
const navigateBack = (isEditPattern: boolean, patternIdValue?: string) => {
  if (isEditPattern) {
    router.push({
      name: 'editPattern',
      params: { id: patternIdValue },
      query: { from: 'editSection' }
    })
  } else {
    router.push({
      name: 'createPattern',
      query: { from: 'editSection' }
    })
  }
}

const handleSubmit = async (formData: SectionFormData) => {
  try {
    console.log('EditSection - Processing form submission')
    
    // Validate section marks
    const requiredQuestions = Number(formData.requiredQuestions)
    const marksPerQuestion = Number(formData.marksPerQuestion)
    const availableMarks = Number(route.query.remainingMarks ?? 0)
    
    if (!validateSectionMarks(requiredQuestions, marksPerQuestion, availableMarks)) {
      return
    }

    // Handle three different cases
    if (isFromEditPattern.value && sectionId.value && !storeOnly.value) {
      // Case 1: Update section in backend immediately
      await updateSectionInBackend(formData, sectionId.value)
      navigateBack(true, patternId.value)
    } 
    else if (isFromEditPattern.value && storeOnly.value) {
      // Case 2: Update section in store only for edit pattern mode
      console.log('EditSection - Updating section in store')
      const sectionData = prepareSectionDataForStore(formData, false, sectionId.value)
      patternStore.updateSection(sectionIndex.value, sectionData)
      navigateBack(true, patternId.value)
    } 
    else {
      // Case 3: Update section in store for new pattern creation
      console.log('EditSection - Updating section for new pattern')
      const sectionData = prepareSectionDataForStore(formData, true)
      patternStore.updateSection(sectionIndex.value, sectionData)
      navigateBack(false)
    }
  } catch (error) {
    console.error('Error updating section:', error)
    // Handle error (show error message to user)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isFromEditPattern.value && sectionId.value && !storeOnly.value) {
    fetchSectionFromBackend()
  } else {
    getSectionFromStore()
  }
})

onBeforeRouteLeave((to, from, next) => {
  console.log('EditSection - Leaving EditSection page');
  next();
});
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
