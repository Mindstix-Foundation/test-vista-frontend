<template>
  <div class="preview-container">
    <!-- Main content container -->
    <div class="container">
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="text-center my-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading test paper details...</p>
      </div>

      <!-- School and Test Information -->
      <div v-else>
        <!-- Header with title and action button - using BoardDashboard pattern -->
        <div class="row mb-3">
          <div class="row justify-content-center align-items-center g-2 mb-4">
            <div class="col-12 col-sm-4">
              <h5 class="text-start m-0 fw-bolder">TEST PAPER PREVIEW</h5>
              <!-- Small screen only - Change All Questions button -->
              <div class="d-sm-none mt-3">
                <button 
                  class="btn btn-dark w-100" 
                  id="changeAllButtonMobile" 
                  @click="changeAllQuestions"
                  :disabled="isChangingAllQuestions"
                >
                  <span v-if="isChangingAllQuestions" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-arrow-clockwise me-2"></i> 
                  {{ isChangingAllQuestions ? 'Changing Questions...' : 'Change All Questions' }}
                </button>
              </div>
            </div>
            <div class="col-12 col-sm-8 dynamic-style text-end">
              <div class="d-flex flex-wrap justify-content-end align-items-center gap-2">
                <!-- Only show these buttons on large screens -->
                <button class="btn btn-dark d-none d-sm-inline-block" @click="printPage">
                  <i class="bi bi-printer me-1"></i> Print
                </button>
                <button class="btn btn-dark d-none d-sm-inline-block" @click="savePage">
                  <i class="bi bi-save me-1"></i> Save
                </button>
                <!-- Only show this button on large screens -->
                <button 
                  class="btn btn-dark d-none d-sm-inline-block" 
                  id="changeAllButton" 
                  @click="changeAllQuestions"
                  :disabled="isChangingAllQuestions"
                >
                  <span v-if="isChangingAllQuestions" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i v-else class="bi bi-arrow-clockwise me-2"></i> 
                  {{ isChangingAllQuestions ? 'Changing Questions...' : 'Change All Questions' }}
                </button>
                <button type="button" class="btn btn-close ms-2 align-self-center d-none d-sm-inline-block" aria-label="Close" @click="goBack"></button>
              </div>
            </div>
          </div>
          <hr class="mt-2" />
        </div>

        <div class="text-center document-header">
          <h5 class="school-name">{{ schoolName }}</h5>
          <!-- Editable Test Paper Title -->
          <div class="editable-title">
            <h3 v-if="!isEditingTitle" class="paper-title">
              {{ paperTitle }}
              <button class="edit-icon" @click="startEditingTitle" title="Edit title">
                <i class="bi bi-pencil"></i>
              </button>
            </h3>
            <div v-else class="edit-title-form">
              <input 
                type="text" 
                class="form-control" 
                v-model="paperTitle" 
                ref="titleInput"
                placeholder="Enter test paper title"
                @keyup.enter="stopEditingTitle"
              >
              <div class="d-flex mt-2">
                <button class="btn btn-sm btn-outline-secondary me-2" @click="cancelEditingTitle">Cancel</button>
                <button class="btn btn-sm btn-primary" @click="stopEditingTitle">Save</button>
              </div>
            </div>
          </div>
          <p style="margin-bottom: 5px;"><strong>Subject:</strong> {{ subjectName }} | <strong>Standard:</strong> {{ standardName }}</p>
          <p style="margin-top: 5px;">
            <strong>Time:</strong> 
            <span v-if="!isEditingTime" class="editable-field">
              {{ testDuration }}
              <button class="edit-icon" @click="startEditingTime" title="Edit time duration">
                <i class="bi bi-pencil"></i>
              </button>
            </span>
            <span v-else class="edit-time-form">
              <div class="d-inline-flex align-items-center time-inputs-container">
                <div class="d-flex align-items-center me-2">
                  <input 
                    type="number" 
                    class="form-control form-control-sm me-1" 
                    v-model="hours"
                    min="0"
                    max="12"
                    ref="hoursInput"
                    style="width: 60px;"
                  > 
                  <span>Hour(s)</span>
                </div>
                <div class="d-flex align-items-center me-2">
                  <input 
                    type="number" 
                    class="form-control form-control-sm me-1" 
                    v-model="minutes"
                    min="0"
                    max="59"
                    style="width: 60px;"
                  >
                  <span>Min(s)</span>
                </div>
                <div class="time-edit-buttons">
                  <button class="btn btn-sm btn-outline-secondary me-1" @click="cancelEditingTime">
                    <i class="bi bi-x"></i>
                  </button>
                  <button class="btn btn-sm btn-primary" @click="stopEditingTime">
                    <i class="bi bi-check"></i>
                  </button>
                </div>
              </div>
            </span>
            | <strong>Total Marks:</strong> {{ totalMarks }}
          </p>
        </div>
      </div>
      <hr>

      <!-- Questions Section - MS Office A4 style layout -->
      <div class="a4-paper-section mb-4" 
        v-for="(section, sectionIndex) in testPaperSections" 
        :key="sectionIndex"
        :class="{ 'refreshing': isChangingAllQuestions }"
      >
        <!-- Section Header -->
        <div class="section-header">
          <div class="section-title"><strong>{{ section.sectionNumberDisplay ||  section.sectionNumber }} ) {{ section.sectionName }}</strong>   [ Any {{ section.mandotory_questions }} ]</div>
         
          <div class="section-marks"><strong>{{ section.totalMarks }} Marks</strong></div>
        </div>
        
        <!-- Questions List - Plain A4 style -->
        <div class="section-content">
          <div class="question-list">
            <div v-for="(question, questionIndex) in section.questions" :key="questionIndex" class="question-item">
              <div class="question-wrapper">
                <!-- Question Content -->
                <div class="question-content">
                  <div class="question-text">
                    {{ question.questionNumber }}. {{ question.questionText }}
                    <span v-if="question.questionType" class="question-type-badge">
                      {{ question.questionType }}
                    </span>
                  </div>
                  
                  <!-- MCQ Options -->
                  <div v-if="question.options && question.options.length > 0" class="options-container mt-2">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <div class="options-title">Options</div>
                      <button class="edit-icon" @click="(event) => showLayoutOptions(sectionIndex, questionIndex, event)" title="Change options layout">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </div>
                    
                    <!-- Layout selector popup -->
                    <div v-if="activeLayoutSelector.sectionIndex === sectionIndex && activeLayoutSelector.questionIndex === questionIndex" 
                        class="layout-selector"
                        ref="layoutSelectorRef"
                        @click.stop>
                      <div class="layout-options">
                        <div class="layout-option-title">Select Options Layout</div>
                        <div class="layout-cards">
                          <div class="layout-option">
                            <div 
                              class="layout-card" 
                              :class="{ 'active': getOptionLayout(sectionIndex, questionIndex) === 'row' }"
                              @click="setOptionLayout(sectionIndex, questionIndex, 'row')"
                            >
                              <div class="layout-preview row-layout">
                                <div>A</div><div>B</div><div>C</div><div>D</div>
                              </div>
                            </div>
                            <div class="layout-label">Single Row</div>
                          </div>
                          
                          <div class="layout-option">
                            <div 
                              class="layout-card" 
                              :class="{ 'active': getOptionLayout(sectionIndex, questionIndex) === 'grid' }"
                              @click="setOptionLayout(sectionIndex, questionIndex, 'grid')"
                            >
                              <div class="layout-preview grid-layout">
                                <div>A</div><div>B</div>
                                <div>C</div><div>D</div>
                              </div>
                            </div>
                            <div class="layout-label">2x2 Grid</div>
                          </div>
                          
                          <div class="layout-option">
                            <div 
                              class="layout-card" 
                              :class="{ 'active': getOptionLayout(sectionIndex, questionIndex) === 'column' }"
                              @click="setOptionLayout(sectionIndex, questionIndex, 'column')"
                            >
                              <div class="layout-preview column-layout">
                                <div>A</div>
                                <div>B</div>
                                <div>C</div>
                                <div>D</div>
                              </div>
                            </div>
                            <div class="layout-label">Single Column</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Row layout (all options in one row) -->
                    <div v-if="getOptionLayout(sectionIndex, questionIndex) === 'row'" class="options-row">
                      <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item-row">
                        <span class="option-label">{{ option.label }})</span>
                        <span class="option-text">{{ option.text }}</span>
                      </div>
                    </div>
                    
                    <!-- Grid layout (2x2) -->
                    <div v-else-if="getOptionLayout(sectionIndex, questionIndex) === 'grid'" class="options-grid">
                      <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item-grid">
                        <span class="option-label">{{ option.label }})</span>
                        <span class="option-text">{{ option.text }}</span>
                      </div>
                    </div>
                    
                    <!-- Column layout (all options in one column) -->
                    <div v-else-if="getOptionLayout(sectionIndex, questionIndex) === 'column'" class="options-column">
                      <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item-column">
                        <span class="option-label">{{ option.label }})</span>
                        <span class="option-text">{{ option.text }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Match Pairs -->
                  <div v-if="question.matchPairs && question.matchPairs.length > 0" class="match-pairs-container">
                    <div class="row">
                      <div class="col-6">
                        <div v-for="(pair, pairIndex) in question.matchPairs" :key="`left-${pairIndex}`" class="match-pair-item">
                          {{ pairIndex + 1 }}. {{ pair.leftText }}
                        </div>
                      </div>
                      <div class="col-6">
                        <div v-for="(pair, pairIndex) in question.matchPairs" :key="`right-${pairIndex}`" class="match-pair-item">
                          {{ pair.rightText }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Marks and Change Button -->
                <div class="question-marks">
                  <div class="marks-row">
                    <span class="marks fw-bold me-2">{{ question.marks }}</span>
                    <button class="btn btn-sm btn-outline-dark shuffle-button" @click="changeQuestion(sectionIndex, questionIndex)">
                      <span class="d-inline-flex align-items-center">
                        <i class="bi bi-arrow-clockwise me-1"></i><span>Change</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <hr class="question-divider" />
            </div>
          </div>
        </div>
      </div>

      <!-- Back to top button -->
      <div id="backToTop" class="d-flex" @click="scrollToTop" style="display: none !important;">
        <i class="bi bi-arrow-up"></i>
      </div>
      
      <!-- Fixed back button for mobile only -->
      <div class="d-block d-sm-none mobile-back-button" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </div>
      
      <!-- Fixed bottom bar with action buttons for mobile -->
      <div class="d-sm-none mobile-action-buttons">
        <div class="d-flex justify-content-between align-items-center w-100">
          <button class="btn btn-dark flex-grow-1 me-2" @click="printPage">
            <i class="bi bi-printer me-1"></i> Print
          </button>
          <button class="btn btn-dark flex-grow-1" @click="savePage">
            <i class="bi bi-save me-1"></i> Save
          </button>
        </div>  
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'

// Define component name (for linter)
defineOptions({
  name: 'TestPaperPreview'
})

// Setup router and route
const router = useRouter()
const route = useRoute()

// Loading state
const isLoading = ref(true)

// For options layout management
const DEFAULT_OPTION_LAYOUT = 'grid' // Explicitly define default layout as grid
const optionsLayouts = ref<{[key: string]: string}>({})
const activeLayoutSelector = ref({
  sectionIndex: -1,
  questionIndex: -1
})

// Get option layout for a specific question
const getOptionLayout = (sectionIndex: number, questionIndex: number) => {
  const key = `${sectionIndex}-${questionIndex}`
  return optionsLayouts.value[key] || DEFAULT_OPTION_LAYOUT // Default to grid layout
}

// Set option layout for a specific question
const setOptionLayout = (sectionIndex: number, questionIndex: number, layout: string) => {
  const key = `${sectionIndex}-${questionIndex}`
  optionsLayouts.value[key] = layout
  // Auto-close the layout selector after making a selection
  hideLayoutOptions()
}

// Show layout options for a specific question
const showLayoutOptions = (sectionIndex: number, questionIndex: number, event: Event) => {
  // Prevent event from bubbling up to document, which would immediately close the popup
  event.stopPropagation()
  
  // Set the active layout selector
  activeLayoutSelector.value = { sectionIndex, questionIndex }
  
  // Add click outside event listener after the DOM updates
  nextTick(() => {
    document.addEventListener('click', handleClickOutside)
  })
}

// Handle click outside of layout selector
const handleClickOutside = (event: MouseEvent) => {
  const layoutSelector = document.querySelector('.layout-selector')
  
  // Check if click target is an edit icon or inside an edit icon
  const clickedElement = event.target as HTMLElement
  const isEditIcon = clickedElement.closest('.edit-icon') !== null
  
  // Don't close the popup if clicking on the edit icon
  if (isEditIcon) {
    return
  }
  
  if (layoutSelector && !layoutSelector.contains(event.target as Node)) {
    hideLayoutOptions()
  }
}

// Hide layout options
const hideLayoutOptions = () => {
  activeLayoutSelector.value = { sectionIndex: -1, questionIndex: -1 }
  // Remove the click outside event listener
  document.removeEventListener('click', handleClickOutside)
}

// User profile for school name
interface UserProfile {
  id: number;
  name: string;
  email_id: string;
  schools: {
    id: number;
    name: string;
  }[];
  teaching_subjects: {
    id: number;
    standard: {
      id: number;
      name: string;
      sequence_number: number;
    };
    subject: {
      id: number;
      name: string;
    };
    medium: {
      id: number;
      name: string;
    };
  }[];
}

// School information
const userProfile = ref<UserProfile | null>(null)
const schoolName = ref('')

// Time duration values
const isEditingTime = ref(false)
const hours = ref(1)
const minutes = ref(0)
const testDuration = computed(() => {
  const hourText = hours.value === 1 ? 'Hour' : 'Hours'
  const minuteText = minutes.value > 0 ? ` ${minutes.value} Minutes` : ''
  return `${hours.value} ${hourText}${minuteText}`
})
const originalHours = ref(1)
const originalMinutes = ref(0)

// Function to start editing time
const startEditingTime = () => {
  originalHours.value = hours.value
  originalMinutes.value = minutes.value
  isEditingTime.value = true
  
  // Focus the hours input field after the DOM updates
  nextTick(() => {
    const hoursInputEl = document.querySelector('.edit-time-form input:first-child') as HTMLInputElement
    if (hoursInputEl) {
      hoursInputEl.focus()
    }
  })
}

// Function to stop editing and save time
const stopEditingTime = () => {
  isEditingTime.value = false
  // Could save to API here if needed
}

// Function to cancel editing and revert to original time
const cancelEditingTime = () => {
  hours.value = originalHours.value
  minutes.value = originalMinutes.value
  isEditingTime.value = false
}

// Get details from query parameters
const patternId = computed(() => route.query.patternId as string || '1')
const boardName = computed(() => decodeURIComponent(route.query.board as string || 'Not Selected'))
const mediumName = computed(() => decodeURIComponent(route.query.medium as string || 'Not Selected'))
const standardName = computed(() => decodeURIComponent(route.query.standard as string || 'Not Selected'))
const subjectName = computed(() => decodeURIComponent(route.query.subject as string || 'Not Selected'))
const patternName = computed(() => decodeURIComponent(route.query.patternName as string || 'Mid Term Paper'))
const totalMarks = computed(() => route.query.totalMarks as string || '40')

// Editable title functionality
const defaultTitle = computed(() => `${patternName.value} - ${totalMarks.value} Marks`)
const paperTitle = ref('')
const isEditingTitle = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)
const originalTitle = ref('')

// Function to start editing title
const startEditingTitle = () => {
  originalTitle.value = paperTitle.value // Save original for cancel operation
  isEditingTitle.value = true
  
  // Focus the input field after the DOM updates
  nextTick(() => {
    if (titleInput.value) {
      titleInput.value.focus()
    }
  })
}

// Function to stop editing and save title
const stopEditingTitle = () => {
  isEditingTitle.value = false
  // Could save to API here if needed
}

// Function to cancel editing and revert to original title
const cancelEditingTitle = () => {
  paperTitle.value = originalTitle.value
  isEditingTitle.value = false
}

// Fetch user profile to get school name
const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/profile')
    if (response.data && response.data.data) {
      userProfile.value = response.data.data
      
      // Get school name from user profile
      if (userProfile.value && userProfile.value.schools && userProfile.value.schools.length > 0) {
        schoolName.value = userProfile.value.schools[0].name
      }
    } else {
      console.error('Unexpected API response format for user profile:', response.data)
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
}

// API Data interfaces
interface McqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  image_id: number | null;
  is_correct: boolean;
  image: any;
}

interface MatchPair {
  id: number;
  question_text_id: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;
  left_image: any;
  right_image: any;
}

interface QuestionText {
  id: number;
  question_id: number;
  image_id: number | null;
  question_text: string;
  image: any;
  mcq_options: McqOption[];
  match_pairs: MatchPair[];
  topic: {
    id: number;
    name: string;
    chapter_id: number;
  };
}

interface Question {
  id: number;
  question_type_id: number;
  board_question: boolean;
  question_type: {
    id: number;
    type_name: string;
  };
  question_texts: QuestionText[];
}

interface ChapterAllocation {
  chapterId: number;
  chapterName: string;
  question?: Question;
}

interface SubsectionAllocation {
  subsectionQuestionTypeId: number;
  section_id?: number;
  questionTypeName: string;
  sequentialNumber?: number;
  question_type_id?: number;
  question_type?: {
    id: number;
    type_name: string;
  };
  allocatedChapters: ChapterAllocation[];
}

interface SectionAllocation {
  sectionId: number;
  pattern_id?: number;
  sectionName: string;
  sequentialNumber?: number;
  section_number?: number;
  subSection?: string;
  totalQuestions: number;
  mandotory_questions?: number;
  marks_per_question?: number;
  absoluteMarks: number;
  totalMarks: number;
  subsectionAllocations: SubsectionAllocation[];
}

interface ChapterMark {
  chapterId: number;
  chapterName: string;
  absoluteMarks: number;
}

interface ApiResponse {
  patternId: number;
  patternName?: string;
  totalMarks: number;
  absoluteMarks: number;
  sectionAllocations: SectionAllocation[];
  chapterMarks: ChapterMark[];
}

// Display interfaces for transformed API data
interface DisplayQuestion {
  questionNumber: number;
  questionText: string;
  marks: number;
  questionType: string;
  options?: {
    label: string;
    text: string;
    isCorrect?: boolean;
  }[];
  matchPairs?: {
    leftText: string;
    rightText: string;
  }[];
  originalQuestion: Question;
}

interface DisplaySection {
  sectionNumber: number;
  sectionName: string;
  totalMarks: number;
  questions: DisplayQuestion[];
  subSection?: string;
  sectionNumberDisplay?: string; // Added field for formatted section number display
  mandotory_questions?: number; // Added to support the mandotory_questions field in template
}

// Test paper sections after API transformation
const testPaperSections = ref<DisplaySection[]>([])

// Raw data from API
const apiData = ref<ApiResponse | null>(null)

// Add state to track data from both endpoints and which was last used
const allocationData = ref<any>(null)
const distributeData = ref<any>(null)
const lastUsedEndpoint = ref<'allocation' | 'distribute' | null>(null)

// Function to get the latest data based on which endpoint was last used
const getLatestData = () => {
  if (lastUsedEndpoint.value === 'distribute' && distributeData.value) {
    console.log('Using data from distribute endpoint');
    return distributeData.value;
  } else if (lastUsedEndpoint.value === 'allocation' && allocationData.value) {
    console.log('Using data from allocation endpoint');
    return allocationData.value;
  } else {
    // Use whatever data is available if lastUsedEndpoint is not set
    return distributeData.value || allocationData.value || null;
  }
};

// Load data from localStorage based on lastUsedEndpoint
const loadStoredData = () => {
  try {
    // Check if lastUsedEndpoint is in the route query
    const endpointFromRoute = route.query.lastUsedEndpoint as string;
    if (endpointFromRoute) {
      lastUsedEndpoint.value = endpointFromRoute as 'allocation' | 'distribute';
    } else {
      // If not in route, check localStorage
      const storedEndpoint = localStorage.getItem('lastUsedEndpoint');
      if (storedEndpoint) {
        lastUsedEndpoint.value = storedEndpoint as 'allocation' | 'distribute';
      }
    }
    
    // Load allocation data if it exists
    const storedAllocationData = localStorage.getItem('allocationData');
    if (storedAllocationData) {
      try {
        allocationData.value = JSON.parse(storedAllocationData);
        console.log('Loaded allocation data from localStorage');
      } catch (e) {
        console.error('Error parsing allocation data:', e);
      }
    }
    
    // Load distribute data if it exists
    const storedDistributeData = localStorage.getItem('distributeData');
    if (storedDistributeData) {
      try {
        distributeData.value = JSON.parse(storedDistributeData);
        console.log('Loaded distribute data from localStorage');
      } catch (e) {
        console.error('Error parsing distribute data:', e);
      }
    }
    
    console.log('Last used endpoint:', lastUsedEndpoint.value);
    return getLatestData();
  } catch (e) {
    console.error('Error loading stored data:', e);
    return null;
  }
};

// Fetch test paper questions from API
const fetchTestPaperQuestions = async (storedData?: any) => {
  try {
    // Use stored data if available, otherwise create request data
    let requestData;
    
    if (storedData) {
      requestData = storedData;
      console.log('Using data from last used endpoint:', lastUsedEndpoint.value);
    } else {
      // Get the latest data based on which endpoint was last used
      const latestData = getLatestData();
      
      if (latestData) {
        requestData = latestData;
        console.log('Using latest data from endpoint:', lastUsedEndpoint.value);
      } else {
        // If no data is available, use the mock data as a fallback
        console.log('No data available from previous endpoints, using mock data');
        requestData = {
          patternId: parseInt(patternId.value),
          patternName: patternName.value,
          totalMarks: parseInt(totalMarks.value),
          absoluteMarks: 59,
          sectionAllocations: [
            {
              sectionId: 1,
              pattern_id: 1,
              sectionName: "Fill in blanks",
              sequentialNumber: 1,
              section_number: 1,
              subSection: "A",
              totalQuestions: 7,
              mandotory_questions: 5,
              marks_per_question: 1,
              absoluteMarks: 7,
              totalMarks: 5,
              subsectionAllocations: [
                {
                  subsectionQuestionTypeId: 1,
                  section_id: 1,
                  questionTypeName: "Fill in the Blanks",
                  sequentialNumber: 0,
                  question_type_id: 6,
                  question_type: {
                    id: 6,
                    type_name: "Fill in the Blanks"
                  },
                  allocatedChapters: [
                    {
                      chapterId: 1,
                      chapterName: "Addition"
                    },
                    {
                      chapterId: 3,
                      chapterName: "Multiplication"
                    }
                  ]
                }
              ]
            },
            {
              sectionId: 2,
              pattern_id: 1,
              sectionName: "Answer the following question.",
              sequentialNumber: 2,
              section_number: 1,
              subSection: "B",
              totalQuestions: 7,
              mandotory_questions: 5,
              marks_per_question: 2,
              absoluteMarks: 14,
              totalMarks: 10,
              subsectionAllocations: [
                {
                  subsectionQuestionTypeId: 2,
                  section_id: 2,
                  questionTypeName: "Multiple Choice Question (MCQ)",
                  sequentialNumber: 1,
                  question_type_id: 1,
                  question_type: {
                    id: 1,
                    type_name: "Multiple Choice Question (MCQ)"
                  },
                  allocatedChapters: [
                    {
                      chapterId: 1,
                      chapterName: "Addition"
                    }
                  ]
                }
              ]
            }
          ],
          chapterMarks: [
            {
              chapterId: 1,
              chapterName: "Addition",
              absoluteMarks: 8
            },
            {
              chapterId: 2,
              chapterName: "Subtraction",
              absoluteMarks: 7
            }
          ]
        }
      }
    }

    // Make the API call
    const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', requestData)
    
    if (response.data) {
      apiData.value = response.data
      transformApiDataToDisplayFormat(response.data)
      console.log('Successfully fetched test paper questions using data from:', lastUsedEndpoint.value)
    } else {
      console.error('Unexpected API response format:', response)
    }
  } catch (error) {
    console.error('Error fetching test paper questions:', error)
  }
}

// Transform API data to display format
const transformApiDataToDisplayFormat = (data: ApiResponse) => {
  if (!data || !data.sectionAllocations) {
    return
  }

  const displaySections: DisplaySection[] = []
  let sectionNumberCounter = 1

  // Sort sections by sequentialNumber or sectionId for consistent ordering
  const sortedSections = [...data.sectionAllocations].sort((a, b) => {
    // First try to sort by sequentialNumber if available
    if (a.sequentialNumber !== undefined && b.sequentialNumber !== undefined) {
      return a.sequentialNumber - b.sequentialNumber;
    }
    // Fall back to sectionId
    return a.sectionId - b.sectionId;
  });

  // Process each section
  sortedSections.forEach(section => {
    // Create formatted section number display (e.g., "1.A")
    const sectionNum = section.section_number || sectionNumberCounter;
    const subSection = section.subSection || '';
    const sectionNumberDisplay = subSection ? `${sectionNum}.${subSection}` : `${sectionNum}`;
    
    const displaySection: DisplaySection = {
      sectionNumber: section.section_number || sectionNumberCounter++,
      sectionName: section.sectionName,
      totalMarks: section.totalMarks,
      questions: [],
      subSection: section.subSection,
      sectionNumberDisplay: sectionNumberDisplay,
      mandotory_questions: section.mandotory_questions
    }

    let questionNumberCounter = 1

    // Process each subsection within a section
    section.subsectionAllocations.forEach(subsection => {
      // Process each chapter's questions within a subsection
      subsection.allocatedChapters.forEach(chapter => {
        if (chapter.question) {
          const question = chapter.question
          const questionText = question.question_texts[0] // Using the first question text
          
          // Create display question based on question type
          const displayQuestion: DisplayQuestion = {
            questionNumber: questionNumberCounter++,
            questionText: questionText.question_text,
            marks: section.marks_per_question || Math.ceil(section.totalMarks / section.totalQuestions), // Use marks_per_question if available
            questionType: question.question_type.type_name,
            originalQuestion: question
          }

          // Process MCQ options if they exist
          if (questionText.mcq_options && questionText.mcq_options.length > 0) {
            displayQuestion.options = questionText.mcq_options.map((option, index) => {
              return {
                label: String.fromCharCode(65 + index), // A, B, C, D...
                text: option.option_text,
                isCorrect: option.is_correct
              }
            })
          }

          // Process match pairs if they exist
          if (questionText.match_pairs && questionText.match_pairs.length > 0) {
            displayQuestion.matchPairs = questionText.match_pairs.map(pair => {
              return {
                leftText: pair.left_text,
                rightText: pair.right_text
              }
            })
          }

          displaySection.questions.push(displayQuestion)
        }
      })
    })

    displaySections.push(displaySection)
  })

  testPaperSections.value = displaySections
}

// Change a single question - calls the API to get a replacement
const changeQuestion = async (sectionIndex: number, questionIndex: number) => {
  console.log(`Change question at section ${sectionIndex}, question ${questionIndex}`)
  
  // In a real implementation, you would make an API call to get a new question
  // For now, just logging that the function was called
  
  // Example of what the implementation might look like:
  // 1. Get the current question
  // const section = testPaperSections.value[sectionIndex];
  // const question = section.questions[questionIndex];
  // const originalQuestion = question.originalQuestion;
  
  // 2. Make an API call to get a replacement question
  // const response = await axiosInstance.post('/replace-question', {
  //   questionId: originalQuestion.id,
  //   questionTypeId: originalQuestion.question_type_id,
  //   chapterId: originalQuestion.question_texts[0].topic.chapter_id
  // });
  
  // 3. Update the question in the UI
  // if (response.data && response.data.newQuestion) {
  //   // Update the question
  // }
}

// Print page functionality
const printPage = () => {
  // Create a new window for printing just the paper content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the question paper');
    return;
  }
  
  // Get the content to print
  const documentHeaderElement = document.querySelector('.document-header');
  if (!documentHeaderElement) {
    alert('Error preparing document for print');
    return;
  }
  
  const documentHeader = documentHeaderElement.cloneNode(true) as HTMLElement;
  
  // Create HTML for the print window
  let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${paperTitle.value || 'Test Paper'}</title>
      <style>
        body {
          font-family: 'Times New Roman', Times, serif;
          margin: 0;
          padding: 20px;
          background-color: white;
        }
        .print-container {
          max-width: 210mm;
          margin: 0 auto;
        }
        .document-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .school-name {
          margin: 0;
          font-weight: normal;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 1.1rem;
        }
        .paper-title {
          margin: 10px 0;
          font-size: 1.5rem;
          font-weight: normal;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          margin-bottom: 10px;
          border-bottom: 1px solid #d6d6d6;
          page-break-after: avoid;
        }
        .section-title {
          font-weight: normal;
          font-size: 1rem;
        }
        .section-marks {
          font-weight: normal;
          font-size: 0.9rem;
        }
        .question-list {
          padding-left: 25px; /* Align questions with section name */
        }
        .question-item {
          margin-bottom: 15px;
          page-break-inside: avoid; /* Prevent questions from breaking across pages */
        }
        .question-wrapper {
          display: flex;
          width: 100%;
          margin-bottom: 15px;
        }
        .question-content {
          flex: 1;
        }
        .question-marks {
          width: 50px;
          text-align: center;
          font-weight: bold;
        }
        .question-text {
          font-weight: normal;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .options-container {
          margin-top: 10px;
          padding: 5px;
          padding-left: 25px; /* Add left padding to align with question text */
          page-break-inside: avoid; /* Keep options together */
        }
        .options-title {
          font-weight: normal;
          color: #555;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }
        .match-pairs-container {
          margin-top: 10px;
          width: 100%;
          padding-left: 25px; /* Add left padding to align with question text */
          page-break-inside: avoid; /* Keep match pairs together */
        }
        .match-pair-row {
          display: flex;
          width: 100%;
          margin-bottom: 8px;
        }
        .match-pair-left {
          width: 45%;
          padding: 5px;
        }
        .match-pair-spacer {
          width: 10%;
        }
        .match-pair-right {
          width: 45%;
          padding: 5px;
        }
        .option-label {
          font-weight: normal;
          margin-right: 5px;
        }
        .option-text {
          font-weight: normal;
        }
        
        /* Row layout for options */
        .options-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: space-between;
          width: 100%;
        }
        .option-item-row {
          flex: 1 1 22%;
          min-width: 70px;
          padding: 5px;
          background-color: transparent;
          border: none;
        }
        
        /* Grid layout (2x2) */
        .options-grid {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 10px !important;
          justify-content: space-between !important;
          width: 100% !important;
        }
        .option-item-grid {
          flex: 0 0 48% !important;
          min-width: 120px !important;
          max-width: 48% !important;
          width: 48% !important;
          box-sizing: border-box !important;
          padding: 5px !important;
          margin-bottom: 5px !important;
          background-color: transparent !important;
          border: none !important;
        }
        
        /* Column layout (all options in one column) */
        .options-column {
          display: flex;
          flex-direction: column;
          gap: 5px;
          width: 100%;
        }
        .option-item-column {
          width: 100%;
          padding: 5px;
          margin-bottom: 5px;
          background-color: transparent;
          border: none;
        }
        
        .option-item {
          padding: 5px;
          margin-bottom: 5px;
          background-color: transparent;
          border: none;
        }
        
        .option-label {
          font-weight: normal;
          margin-right: 10px;
        }
        
        .option-text {
          word-break: break-word;
        }
        
        hr {
          border-top: 1px solid #eee;
          margin: 20px 0;
        }
        @page {
          size: A4;
          margin: 1cm;
        }
        /* Add a page break before if needed */
        .page-break {
          page-break-before: always;
        }
        /* Helper class to avoid orphans in paragraphs */
        .no-orphans {
          orphans: 3;
          widows: 3;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
  `;
  
  // Remove any edit buttons from header
  const editIcons = documentHeader.querySelectorAll('.edit-icon');
  editIcons.forEach(icon => icon.remove());
  
  // Add header content
  printContent += documentHeader.outerHTML;
  printContent += '<hr>';
  
  // Add each section, manually building the content to ensure layout consistency
  testPaperSections.value.forEach((section, sectionIndex) => {
    // Start section
    printContent += `
      <div class="a4-paper-section">
        <div class="section-header">
          <div class="section-title"><strong>${section.sectionNumberDisplay || section.sectionNumber} ) ${section.sectionName}</strong>   [ Any ${section.mandotory_questions} ]</div>
          <div class="section-marks"><strong>${section.totalMarks} Marks</strong></div>
        </div>
        <div class="section-content">
          <div class="question-list" style="padding-left: 25px;">
    `;
    
    // Add each question
    section.questions.forEach((question, questionIndex) => {
      printContent += `
        <div class="question-item">
          <div class="question-wrapper">
            <div class="question-content">
              <div class="question-text no-orphans">
                ${question.questionNumber}. ${question.questionText}
              </div>
      `;
      
      // Add options if present
      if (question.options && question.options.length > 0) {
        printContent += `<div class="options-container">`;
        printContent += `<div class="options-title">Options</div>`;
        
        // Get the layout for this question with explicit string comparison
        const key = `${sectionIndex}-${questionIndex}`;
        let layout = optionsLayouts.value[key] || DEFAULT_OPTION_LAYOUT;
        
        // Ensure we default to grid if anything unexpected
        if (layout !== 'row' && layout !== 'grid' && layout !== 'column') {
          console.log(`Invalid layout '${layout}' for question ${questionIndex} in section ${sectionIndex}. Using grid.`);
          layout = 'grid';
        }
        
        // Add a debugging comment to printContent (will be visible in page source)
        printContent += `<!-- Using layout: ${layout} for question ${questionIndex} in section ${sectionIndex} -->`;
        
        // For grid layout
        if (layout === 'grid') {
          // Use a simple HTML table for grid layout - most reliable for printing
          const optionsArray = question.options || [];
          printContent += `<table style="width:100%; border-collapse: collapse; border:none; margin-left: 25px;">`;
          
          // Create rows with 2 options per row
          for (let i = 0; i < optionsArray.length; i += 2) {
            printContent += `<tr>`;
            
            // First column
            printContent += `
              <td style="width:48%; padding:5px; border:none;">
                <span class="option-label">${optionsArray[i].label})</span>
                <span class="option-text">${optionsArray[i].text}</span>
              </td>
            `;
            
            // Second column (if available)
            if (i + 1 < optionsArray.length) {
              printContent += `
                <td style="width:48%; padding:5px; border:none;">
                  <span class="option-label">${optionsArray[i+1].label})</span>
                  <span class="option-text">${optionsArray[i+1].text}</span>
                </td>
              `;
            } else {
              printContent += `<td style="width:48%; border:none;"></td>`;
            }
            
            printContent += `</tr>`;
          }
          printContent += `</table>`;
        }
        // For row layout
        else if (layout === 'row') {
          printContent += `<div class="options-row" style="margin-left: 25px;">`;
          question.options.forEach(option => {
            printContent += `
              <div class="option-item-row">
                <span class="option-label">${option.label})</span>
                <span class="option-text">${option.text}</span>
              </div>
            `;
          });
          printContent += `</div>`;
        }
        // For column layout or fallback
        else {
          printContent += `<div class="options-column" style="margin-left: 25px;">`;
          question.options.forEach(option => {
            printContent += `
              <div class="option-item-column">
                <span class="option-label">${option.label})</span>
                <span class="option-text">${option.text}</span>
              </div>
            `;
          });
          printContent += `</div>`;
        }
        
        // Close the options container
        printContent += `</div>`;
      }
      
      // Add match pairs if present
      if (question.matchPairs && question.matchPairs.length > 0) {
        printContent += `<div class="match-pairs-container" style="margin-left: 25px;">`;
        
        question.matchPairs.forEach((pair, pairIndex) => {
          printContent += `
            <div class="match-pair-row">
              <div class="match-pair-left">
                ${pairIndex + 1}. ${pair.leftText}
              </div>
              <div class="match-pair-spacer"></div>
              <div class="match-pair-right">
                ${pair.rightText}
              </div>
            </div>
          `;
        });
        
        printContent += `</div>`;
      }
      
      // End question content and add marks
      printContent += `
            </div>
            <div class="question-marks">
              ${question.marks}
            </div>
          </div>
        </div>
      `;
    });
    
    // End section
    printContent += `
          </div>
        </div>
      </div>
    `;
  });
  
  // Close HTML tags
  printContent += `
      </div>
    </body>
    </html>
  `;
  
  // Write content to the new window
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = function() {
    // Add a small delay to ensure all styles are applied
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

// Save page functionality (placeholder)
const savePage = () => {
  console.log('Saving test paper...')
  // In a real implementation, this would call an API to save the test paper
}

// Go back button handler
const goBack = () => {
  router.back()
}

// Scroll to top functionality
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Initialize component data
const initializeComponent = async () => {
  isLoading.value = true
  try {
    // Set default title
    paperTitle.value = defaultTitle.value
    
    // Set default time values
    hours.value = 1
    minutes.value = 0
    
    // Load user profile and school name
    await fetchUserProfile()
    
    // Load data from localStorage
    const storedData = loadStoredData()
    
    // Fetch test paper questions
    await fetchTestPaperQuestions(storedData)
    
    console.log('Test paper initialized with data from API')
  } catch (error) {
    console.error('Error initializing test paper preview:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Immediately hide the back to top button
  const backToTopBtn = document.getElementById('backToTop')
  if (backToTopBtn) {
    backToTopBtn.style.cssText = 'display: none !important;'
  }
  
  // Initialize the component with data
  initializeComponent()
  
  // Add scroll event listener for back-to-top button visibility
  window.addEventListener('scroll', handleScroll)
  
  // Call handleScroll initially to set the correct visibility
  handleScroll()
})

// Show/hide back-to-top button based on scroll position
const handleScroll = () => {
  const backToTopBtn = document.getElementById('backToTop')
  if (backToTopBtn) {
    if (window.scrollY > 300) {
      backToTopBtn.style.cssText = 'display: flex !important;'
    } else {
      backToTopBtn.style.cssText = 'display: none !important;'
    }
  }
}

// Add a separate loading state for change all questions
const isChangingAllQuestions = ref(false)

// Change all questions - calls the API again to refresh all questions
const changeAllQuestions = async () => {
  // Remove confirmation dialog
  
  isChangingAllQuestions.value = true
  try {
    console.log('Changing all questions...')
    // Show feedback to the user
    const previousSections = testPaperSections.value
    
    // Call the same API again with the same request data
    await fetchTestPaperQuestions()
    
    // If the API call fails, restore the previous questions
    if (testPaperSections.value.length === 0) {
      testPaperSections.value = previousSections
    }
  } catch (error) {
    console.error('Error changing all questions:', error)
  } finally {
    isChangingAllQuestions.value = false
  }
}
</script>

<style scoped>
/* Main styles */
.preview-container {
  padding-top: 20px;
  padding-bottom: 50px;
  max-width: 210mm; /* A4 width */
  margin: 0 auto;
  background-color: white;
  box-shadow: none;
  font-family: 'Times New Roman', Times, serif; /* Typical document font */
}

/* Document header styles */
.document-header {
  margin-bottom: 20px;
}

.school-name {
  margin: 0;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 1.1rem;
}

.paper-title {
  margin: 10px 0;
  font-size: 1.5rem;
  font-weight: normal;
}

/* MS Office A4 style sections */
.a4-paper-section {
  margin-bottom: 20px;
  border: none;
  background-color: white;
  padding: 0 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 10px;
  border-bottom: 1px solid #d6d6d6;
}

.section-title {
  font-weight: normal;
  font-size: 1rem;
}

.section-marks {
  font-weight: normal;
  font-size: 0.9rem;
}

.section-content {
  padding: 0;
}

/* Question list instead of table */
.question-list {
  width: 100%;
  padding-left: 30px; /* Add padding to align questions with section name */
}

/* Responsive question list padding */
@media (max-width: 768px) {
  .question-list {
    padding-left: 25px; /* Slightly less padding on medium screens */
  }
}

@media (max-width: 576px) {
  .question-list {
    padding-left: 15px; /* Less padding on small screens */
  }
}

.question-item {
  margin-bottom: 15px;
}

.question-wrapper {
  display: flex;
  width: 100%;
}

.question-content {
  flex: 1;
  padding-right: 15px;
}

.question-marks {
  width: 100px;
  text-align: center;
  padding-left: 10px;
}

.question-divider {
  display: none; /* Hide the question dividers */
  margin-top: 15px;
  margin-bottom: 15px;
  border-top: 1px dotted #eaeaea;
  opacity: 0.5;
}

/* Question styling */
.question-text {
  font-weight: normal;
  line-height: 1.5;
  margin-bottom: 8px;
}

.question-type-badge {
  font-size: 0.7rem;
  background-color: #f0f0f0;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin-left: 8px;
  vertical-align: middle;
  font-weight: normal;
  white-space: nowrap;
}

/* Options styling */
.options-container {
  margin-top: 10px;
  padding: 5px;
  padding-left: 25px; /* Add left padding to align with question text */
  page-break-inside: avoid; /* Keep options together */
}

.options-title {
  font-weight: normal;
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

/* Option layout selector */
.layout-selector {
  position: absolute;
  top: 35px;
  right: 0;
  z-index: 1050;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 300px;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.layout-options {
  padding: 15px;
}

.layout-option-title {
  font-weight: bold;
  margin-bottom: 15px;
  font-size: 0.9rem;
  text-align: center;
  color: #333;
}

.layout-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 15px;
  margin-bottom: 10px;
}

.layout-option {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.layout-card {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9f9f9;
  margin-bottom: 5px;
}

.layout-card:hover {
  background-color: #f0f0f0;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.layout-card.active {
  border-color: #007bff;
  background-color: rgba(0, 123, 255, 0.08);
  box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.3);
}

.layout-preview {
  height: 50px;
  display: flex;
  font-size: 0.7rem;
  color: #666;
}

.layout-label {
  text-align: center;
  font-size: 0.8rem;
  color: #555;
  font-weight: 500;
  margin-top: 3px;
}

/* Row layout (all options in one row) */
.options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  width: 100%;
}

.option-item-row {
  flex: 1 1 22%;
  min-width: 70px;
  padding: 5px;
  background-color: transparent;
  border: none;
}

/* Grid layout (2x2) */
.options-grid {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 10px !important;
  justify-content: space-between !important;
  width: 100% !important;
}

.option-item-grid {
  flex: 0 0 48% !important;
  min-width: 120px !important;
  max-width: 48% !important;
  width: 48% !important;
  box-sizing: border-box !important;
  padding: 5px !important;
  margin-bottom: 5px !important;
  background-color: transparent !important;
  border: none !important;
}

/* Column layout (all options in one column) */
.options-column {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

.option-item-column {
  width: 100%;
  padding: 5px;
  margin-bottom: 5px;
  background-color: transparent;
  border: none;
}

.option-item {
  padding: 5px;
  margin-bottom: 5px;
  background-color: transparent;
  border: none;
}

.option-label {
  font-weight: normal;
  margin-right: 10px;
}

.option-text {
  word-break: break-word;
}

/* Match pairs styling */
.match-pairs-container {
  margin-top: 10px;
  width: 100%;
  padding-left: 25px; /* Add left padding to align with question text */
  page-break-inside: avoid; /* Keep match pairs together */
}

.match-pair-item {
  padding: 5px;
  margin-bottom: 8px;
}

/* Marks styling */
.marks {
  font-weight: bold;
}

.marks-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.shuffle-button {
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  width: auto;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: inline-block;
}

.shuffle-button span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Print styles - optimize for A4 printing */
@media print {
  .preview-container {
    box-shadow: none;
    padding: 0;
    width: 210mm;
  }
  
  .a4-paper-section {
    break-inside: avoid;
  }
  
 .section-header {
    background-color: white !important;
  }
  
  .question-list {
    padding-left: 25px !important; /* Ensure padding is preserved when printing */
  }
  
  .question-divider {
    display: none !important; /* Ensure dividers are hidden when printing */
    border-color: #eee !important;
  }
  
  .shuffle-button,
  .edit-icon {
    display: none !important;
  }
  
  .question-type-badge {
    display: none;
  }
  
  /* Print-specific option layouts */
  .options-row {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .option-item-row {
    flex: 0 0 24%;
    min-width: auto;
  }
  
  .options-grid {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .option-item-grid {
    flex: 0 0 48%;
    min-width: auto;
  }
  
  .options-column {
    gap: 2px;
  }
  
  .option-item-column {
    margin-bottom: 2px;
  }
  
  .mobile-back-button,
  #backToTop {
    display: none !important;
  }
}

/* Mobile styles for fixed bottom buttons */
@media (max-width: 576px) {
  .container {
    padding-bottom: 100px !important; /* Further increased to accommodate the action buttons */
  }
  
  /* Mobile Change All Questions button */
  #changeAllButtonMobile {
    margin-bottom: 10px;
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin-top: 5px;
  }
  
  /* Fixed bottom bar for action buttons */
  .mobile-action-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px -3px 10px rgba(0, 0, 0, 0.15);
    padding: 15px;
    z-index: 1001;
    display: flex;
    justify-content: space-between;
  }
  
  .mobile-action-buttons .btn {
    font-weight: 500;
    padding: 12px 0;
    border-radius: 4px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 0.95rem;
    letter-spacing: 0.3px;
  }
  
  .mobile-action-buttons .btn:active {
    transform: scale(0.98);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  /* Required for layout - original dynamic-style positioning for mobile */
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: transparent;
    z-index: 1000;
  }
  
  /* Removing the old mobile-button-container */
  .mobile-button-container {
    display: none !important;
  }
  
  /* Fixed mobile back button */
  .mobile-back-button {
    position: fixed;
    top: 15px;
    left: 15px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex !important;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 999;
    font-size: 1.2rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  /* Adjust back to top button position for mobile to make it visible above bottom buttons */
  #backToTop {
    bottom: 120px;
    background-color: rgba(0, 0, 0, 0.65);
    width: 45px;
    height: 45px;
    font-size: 1.6rem;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite;
  }
  
  /* Optimize document header for small screens */
  .document-header {
    padding: 0 10px;
  }
  
  .paper-title {
    font-size: 1.2rem;
    line-height: 1.3;
  }
  
  /* Optimize time editing form for small screens */
  .edit-time-form .d-inline-flex {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .time-inputs-container {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .time-edit-buttons {
    display: flex;
    justify-content: center;
    margin-top: 8px;
    width: 100%;
  }
  
  .edit-time-form input[type=number] {
    width: 50px !important;
  }
  
  .edit-time-form .me-2 {
    margin-right: 0.5rem !important;
    margin-bottom: 0.5rem;
  }
  
  /* Improve option layout selector on mobile */
  .layout-selector {
    width: 270px;
    right: -10px;
  }
  
  .layout-cards {
    grid-gap: 8px;
  }
  
  /* Maintain option layouts on mobile but with adjusted sizes */
  /* Row layout - preserve row but with smaller items */
  .option-item-row {
    font-size: 0.9rem;
  }
  
  /* Grid layout - preserve 2x2 grid */
  .options-grid {
    gap: 5px;
  }
  
  .option-item-grid {
    margin-bottom: 5px;
  }
  
  /* Column layout - no changes needed, already stacks */
  
  /* Allow text to wrap in options */
  .option-text {
    word-break: break-word;
    hyphens: auto;
  }
  
  /* Responsive question wrapper */
  .question-wrapper {
    flex-wrap: wrap;
  }
  
  .question-content {
    flex: 1 0 75%;
    padding-right: 0;
  }
  
  .question-marks {
    flex: 1 0 25%;
    width: auto;
    padding-left: 5px;
    text-align: right;
  }
  
  /* Ensure marks and change button display properly on small screens */
  .marks-row {
    justify-content: flex-end;
  }
  
  .marks {
    font-size: 0.9rem;
  }
  
  .shuffle-button {
    min-width: auto;
    padding: 0.2rem 0.4rem;
    font-size: 0.8rem;
  }
  
  /* Title editing form on mobile */
  .edit-title-form {
    min-width: auto;
    width: 100%;
    padding: 0 10px;
  }
}

/* Desktop styles */
@media (min-width: 577px) {
  .dynamic-style {
    position: static;
  }
  
  .dynamic-style .btn {
    margin-left: 8px;
  }
  
  #changeAllButton {
    min-width: 180px;
    transition: all 0.3s ease;
  }
  
  #changeAllButton:hover, .dynamic-style .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* Time editing form on desktop */
  .time-inputs-container {
    flex-wrap: nowrap !important;
  }
}

/* Editable title styles */
.editable-title {
  margin-bottom: 15px;
  position: relative;
  display: inline-block;
}

.editable-title h3 {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.edit-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0 5px;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edit-icon:hover {
  opacity: 1;
  color: #007bff;
}

.edit-title-form {
  min-width: 300px;
  margin: 0 auto;
}

/* Editable field styles */
.editable-field {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.edit-time-form {
  display: inline-block;
}

.edit-time-form input::-webkit-outer-spin-button,
.edit-time-form input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.edit-time-form input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Question type badge */
.question-type-badge {
  font-size: 0.7rem;
  background-color: #f0f0f0;
  color: #666;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin-left: 8px;
  vertical-align: middle;
  font-weight: normal;
  white-space: nowrap;
}

/* Back to top button */
#backToTop {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: none !important; /* Ensure it's hidden by default */
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 999;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

#backToTop:hover {
  background-color: rgba(0, 0, 0, 0.7);
  transform: translateY(-3px);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
    transform: scale(1);
  }
}

@media (max-width: 576px) {
  /* Adjust back to top button position for mobile to make it visible above bottom buttons */
  #backToTop {
    bottom: 120px;
    background-color: rgba(0, 0, 0, 0.65);
    width: 45px;
    height: 45px;
    font-size: 1.6rem;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    animation: pulse 2s infinite;
  }
}

/* Button styling */
#changeAllButton, #changeAllButtonMobile {
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.3px;
  border-radius: 4px;
  padding: 8px 16px;
}

#changeAllButton:hover:not(:disabled), #changeAllButtonMobile:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

#changeAllButton:disabled, #changeAllButtonMobile:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

/* When the test paper is refreshing with new questions */
.refreshing {
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

/* Layout previews for options */
.row-layout {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
}

.row-layout > div {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 22%;
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.grid-layout {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.grid-layout > div {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 45%;
  height: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.column-layout {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.column-layout > div {
  border: 1px solid #eee;
  border-radius: 3px;
  width: 100%;
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Button hover effect */
.shuffle-button:hover {
  background-color: #212529; /* Dark background for hover state */
  color: white; /* White text for better visibility */
  border-color: #212529; /* Match border with background */
  transform: translateY(-1px); /* Keep the subtle lift effect */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add subtle shadow for depth */
}
</style> 