import { defineStore } from 'pinia'

interface Board {
  id: number
  name: string
  abbreviation: string
  standards: Array<{
    id: number
    name: string
  }>
  subjects: Array<{
    id: number
    name: string
  }>
}

interface StandardSubject {
  id: number
  name: string
}

interface PatternFormData {
  patternName: string
  selectedBoard: Board | null
  selectedStandard: StandardSubject | null
  selectedSubject: StandardSubject | null
  totalMarks: number
}

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
}

export const usePatternStore = defineStore('pattern', {
  state: () => ({
    formData: {
      patternName: '',
      selectedBoard: null,
      selectedStandard: null,
      selectedSubject: null,
      totalMarks: 0,
    } as PatternFormData,
    sections: [] as SectionData[],
  }),

  getters: {
    totalSectionMarks(): number {
      return this.sections.reduce(
        (total, section) => total + section.requiredQuestions * section.marksPerQuestion,
        0,
      )
    },
    remainingMarks(): number {
      return this.formData.totalMarks - this.totalSectionMarks
    },
    canAddMoreSections(): boolean {
      return this.remainingMarks > 0
    },
  },

  actions: {
    setFormData(data: PatternFormData) {
      this.formData = { ...data }
    },

    addSection(sectionData: SectionData) {
      this.sections.push({ ...sectionData })
    },

    updateSection(index: number, sectionData: SectionData) {
      if (index >= 0 && index < this.sections.length) {
        this.sections[index] = sectionData
      }
    },

    removeSection(index: number) {
      this.sections.splice(index, 1)
    },

    clearFormData() {
      this.formData = {
        patternName: '',
        selectedBoard: null,
        selectedStandard: null,
        selectedSubject: null,
        totalMarks: 0,
      }
      this.sections = []
    },
  },
})
