<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/pattern" aria-label="Close" />
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

const router = useRouter()
const route = useRoute()
const patternStore = usePatternStore()

const totalPatternMarks = computed(() => Number(route.query.remainingMarks || 0))
const isDisabled = computed(() => totalPatternMarks.value <= 0)

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
  // Convert string values to numbers
  const sectionData: SectionData = {
    ...formData,
    totalQuestions: Number(formData.totalQuestions),
    requiredQuestions: Number(formData.requiredQuestions),
    marksPerQuestion: Number(formData.marksPerQuestion),
    seqencial_section_number: patternStore.sections.length + 1,
  }

  try {
    // Validate section marks before adding
    if (!validateSectionMarks(sectionData)) {
      // You might want to show an error message here
      console.error('Adding this section would exceed total pattern marks')
      return
    }

    // Add section to pattern store
    patternStore.addSection(sectionData)

    // Navigate back to pattern creation
    router.push({
      name: 'createPattern',
    })
  } catch (error) {
    console.error('Error adding section:', error)
  }
}

// Add computed property to check if more sections can be added
const canAddSection = computed(() => {
  return patternStore.remainingMarks > 0
})

// Add validation to prevent adding sections if total marks would be exceeded
const validateSectionMarks = (formData: SectionData) => {
  const sectionMarks = formData.requiredQuestions * formData.marksPerQuestion
  return patternStore.formData.totalMarks >= patternStore.totalSectionMarks + sectionMarks
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

.form-control-plaintext {
  font-weight: bold;
}
</style>
