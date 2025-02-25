<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/pattern" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Edit Section</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
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
import { computed } from 'vue'
import SectionFormComponent from '@/components/forms/SectionFormComponent.vue'
import type { SectionFormData } from '@/components/forms/SectionFormComponent.vue'
import { usePatternStore } from '@/stores/pattern'

const router = useRouter()
const route = useRoute()
const patternStore = usePatternStore()

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

const currentSection = computed(() => {
  const section = patternStore.sections[sectionIndex.value]
  console.log('Retrieved section from store:', section)

  if (!section) {
    console.log('No section found for index:', sectionIndex.value)
    return undefined
  }

  const sectionData = {
    questionNumber: section.questionNumber,
    subQuestion: section.subQuestion,
    sectionName: section.sectionName,
    totalQuestions: section.totalQuestions,
    requiredQuestions: section.requiredQuestions,
    marksPerQuestion: section.marksPerQuestion,
    sameType: section.sameType,
    questionType: section.questionType,
    questionTypes: [...section.questionTypes],
  }

  console.log('Prepared section data for form:', sectionData)
  return sectionData
})

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
}

const handleSubmit = async (formData: SectionFormData) => {
  try {
    console.log('Submitting updated section data:', formData)

    // Convert form data to section data
    const sectionData: SectionData = {
      ...formData,
      totalQuestions: Number(formData.totalQuestions),
      requiredQuestions: Number(formData.requiredQuestions),
      marksPerQuestion: Number(formData.marksPerQuestion),
      seqencial_section_number: patternStore.sections[sectionIndex.value].seqencial_section_number, // Preserve the existing sequential number
    }

    // Update the section in the store
    patternStore.updateSection(sectionIndex.value, sectionData)

    // Navigate back to pattern creation
    router.push({
      name: 'createPattern',
    })
  } catch (error) {
    console.error('Error updating section:', error)
  }
}
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
