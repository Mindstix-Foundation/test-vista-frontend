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
                <div class="row justify-content-end">
                <button type="button" class="btn btn-close ms-2 align-self-center d-none d-sm-inline-block" aria-label="Close" @click="goBack"></button>
                </div>

          <div class="row justify-content-center align-items-center g-2 mb-4">
            <div class="col-12 col-sm-4">
              <!-- Mobile view title with medium button after -->
              <div class="d-flex align-items-center d-sm-none mb-2">
                <h5 class="text-start m-0 fw-bolder me-2 mobile-title">TEST PAPER PREVIEW</h5>
                <button 
                  class="btn btn-custom medium-button-mobile"
                  @click="toggleMediumDropdown"
                  ref="mediumButtonMobileRef"
                >
                  <i class="bi bi-translate"></i> {{ currentMediumName }}
                </button>
              </div>
              
              <!-- Desktop view title only -->
              <h5 class="text-start m-0 fw-bolder d-none d-sm-block">TEST PAPER PREVIEW</h5>
              
              <!-- Mobile view other action buttons -->
              <div class="d-sm-none mt-2">
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-custom mobile-action-btn flex-grow-1 d-flex justify-content-center align-items-center"
                    id="changeAllButtonMobile" 
                    @click="changeAllQuestions"
                    :disabled="isChangingAllQuestions"
                  >
                    <span v-if="isChangingAllQuestions" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-arrow-clockwise me-1"></i> 
                    <span>{{ isChangingAllQuestions ? 'Changing...' : 'New Set' }}</span>
                  </button>
                  <button 
                    class="btn btn-custom mobile-action-btn flex-grow-1 d-flex justify-content-center align-items-center"
                    id="changeAllLayoutButtonMobile" 
                    @click="(event) => showGlobalLayoutOptions(event)"
                  >
                    <i class="bi bi-grid me-1"></i> <span>Option Style</span>
                  </button>
                </div>
              </div>
              
              <!-- Medium dropdown for mobile -->
             
            </div>
            <div class="col-12 col-sm-8 dynamic-style text-end">
              <div class="d-flex flex-wrap justify-content-end align-items-center gap-2">
                <!-- Buttons for desktop/tablet screens -->
                <div class="d-none d-sm-flex gap-2">
                <button 
                    class="btn btn-custom dropdown-toggle"
                    @click="toggleMediumDropdown"
                  >
                    <i class="bi bi-translate me-1"></i> {{ currentMediumName }}
                  </button>
                  <button 
                    class="btn btn-custom" 
                    @click="changeAllQuestions"
                    :disabled="isChangingAllQuestions"
                  >
                    <span v-if="isChangingAllQuestions" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-arrow-clockwise me-2"></i> 
                    {{ isChangingAllQuestions ? 'Changing...' : 'New Set' }}
                  </button>
                  <button 
                    class="btn btn-custom" 
                    @click="(event) => showGlobalLayoutOptions(event)"
                  >
                    <i class="bi bi-grid me-1"></i> Option Style
                  </button>
                </div>
                <div class="d-none d-sm-flex gap-2">
                  <button 
                    class="btn btn-dark" 
                    @click="savePage"
                  >
                    <i class="bi bi-save me-1"></i> Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          <hr class="mt-2" />
        </div>

        <!-- New View Mode Toggle for Mobile -->
        <div class="row mb-3 d-md-none">
          <div class="col-12 d-flex justify-content-center">
            <div class="view-mode-toggle-container">
              <div class="form-check form-switch form-check-inline">
                <input class="form-check-input" type="checkbox" id="viewModeToggle" v-model="mobileViewMode">
                <label class="form-check-label" for="viewModeToggle">
                  <span v-if="mobileViewMode"><i class="bi bi-phone me-1"></i> Mobile View</span>
                  <span v-else><i class="bi bi-file-earmark-text me-1"></i> A4 Preview</span>
                </label>
              </div>
              <!-- New zoom slider for A4 view on mobile -->
              <div v-if="!mobileViewMode" class="zoom-control-container mt-2">
                <div class="zoom-label d-flex align-items-center justify-content-center">
                  <i class="bi bi-zoom-out me-2"></i>
                  <input 
                    type="range" 
                    class="form-range zoom-slider" 
                    min="50" 
                    max="100" 
                    step="5" 
                    v-model="zoomLevel"
                    @input="updateZoom"
                  >
                  <i class="bi bi-zoom-in ms-2"></i>
                </div>
                <div class="zoom-value">{{ zoomLevel }}%</div>
              </div>
              <div v-if="!mobileViewMode" class="scroll-hint d-md-none">
                <small><i class="bi bi-arrows-expand-horizontal"></i> Scroll horizontally to view full page</small>
              </div>
            </div>
          </div>
        </div>

        <!-- A4 Paper Wrapper -->
        <div class="a4-paper-container" :class="{'mobile-view': mobileViewMode}">
          <div class="a4-paper-card" :style="a4PaperStyle">
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
              
              <!-- Exam Instructions Section -->
              <div class="exam-instructions-container mt-4">
                <div class="d-flex align-items-center justify-content-center mb-2">
                  <h5 class="m-0 me-2">Exam Instructions</h5>
                  <button class="edit-icon" @click="startEditingInstructions" title="Edit instructions">
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>
                
                <!-- Instructions Display View -->
                <div v-if="!isEditingInstructions" class="instructions-display">
                  <ul class="text-start instruction-list" v-if="examInstructions.length > 0">
                    <li v-for="(instruction, index) in examInstructions" :key="index">
                      {{ instruction }}
                    </li>
                  </ul>
                  <p v-else class="text-muted fst-italic">Click the pencil icon to add exam instructions</p>
                </div>
                
                <!-- Instructions Edit View -->
                <div v-else class="instructions-edit-form">
                  <div class="form-group">
                    <textarea 
                      class="form-control instruction-textarea" 
                      v-model="instructionsText"
                      placeholder="Enter instructions (press Enter for new line)"
                      ref="instructionsTextarea"
                    ></textarea>
                    <div class="text-muted small mt-1">Press Enter for a new line. Each line will appear as a bullet point.</div>
                  </div>
                  <div class="d-flex justify-content-center mt-2">
                    <button class="btn btn-sm btn-outline-secondary me-2" @click="cancelEditingInstructions">Cancel</button>
                    <button class="btn btn-sm btn-primary" @click="saveInstructions">Save</button>
                  </div>
                </div>
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
                <div class="section-title"><strong>{{ section.sectionNumberDisplay ||  section.sectionNumber }} ) {{ section.sectionName }}</strong> <span v-if="section.mandotory_questions && section.questions && section.mandotory_questions < section.questions.length" class="nowrap">[ Any {{ section.mandotory_questions }} ]</span></div>
              
                <div class="section-marks">
                  <strong>
                    <span class="nowrap">
                      {{ section.totalMarks }} <span class="d-none d-sm-inline">Marks</span><span class="d-inline d-sm-none">M</span>
                    </span>
                  </strong>
                </div>
              </div>
              
              <!-- Questions List - Plain A4 style -->
              <div class="section-content">
                <div class="question-list">
                  <div v-for="(question, questionIndex) in section.questions" :key="questionIndex" class="question-item">
                    <div class="question-wrapper" :id="`question-${sectionIndex}-${questionIndex}`">
                      <div class="d-flex w-100">
                      <!-- Question Content -->
                      <div class="question-content">
                        <div class="question-text">
                          {{ question.questionNumber }}. {{ question.questionText }}
                          <span v-if="question.questionType" class="question-type-badge">
                            {{ question.questionType }}
                          </span>
                            <button v-if="question.options && question.options.length > 0" 
                                    class="edit-icon ms-2" 
                                    @click="(event) => showLayoutOptions(sectionIndex, questionIndex, event)" 
                                    title="Change options layout"
                                    style="vertical-align: middle; margin-top: -2px;">
                              <i class="bi bi-grid"></i>
                            </button>
                          </div>
                          
                          <!-- MCQ Options -->
                          <div v-if="question.options && question.options.length > 0" class="options-container">
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
                            <button class="btn btn-sm btn-custom shuffle-button" @click="changeQuestion(sectionIndex, questionIndex)">
                            <span class="d-inline-flex align-items-center">
                                <i class="bi bi-arrow-clockwise me-md-1"></i><span class="d-none d-sm-inline">Change</span>
                            </span>
                          </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr class="question-divider" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to top button -->
      <div id="backToTop" class="d-flex" @click="scrollToTop" style="display: none !important;">
        <i class="bi bi-arrow-up"></i>
      </div>
      
      <!-- Simple toast notification for layout changes -->
      <div id="layoutToast" class="layout-toast" :class="{ 'show-toast': showLayoutToast }">
        <div class="layout-toast-content">
          <i class="bi bi-check-circle me-2"></i> {{ layoutToastMessage }}
        </div>
      </div>
      
      <!-- Fixed back button for mobile only -->
      <div class="d-block d-sm-none mobile-back-button" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </div>
      
      <!-- Fixed bottom bar with action buttons for mobile -->
      <div class="d-sm-none mobile-action-buttons">
        <div class="d-flex justify-content-between align-items-center w-100">
          <button class="btn btn-dark flex-grow-1" @click="savePage">
            <i class="bi bi-save me-1"></i> Save
          </button>
        </div>  
      </div>
      
      <!-- Global Layout Selector -->
      <div v-if="globalLayoutSelectorVisible" 
           class="global-layout-selector"
           ref="globalLayoutSelectorRef"
           @click.stop>
        <div class="layout-options">
          <div class="layout-option-title">Select Layout for All MCQ Options</div>
          <div class="layout-cards">
            <div class="layout-option">
              <div 
                class="layout-card" 
                :class="{ 'active': globalSelectedLayout === 'row' }"
                @click="applyGlobalLayout('row')"
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
                :class="{ 'active': globalSelectedLayout === 'grid' }"
                @click="applyGlobalLayout('grid')"
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
                :class="{ 'active': globalSelectedLayout === 'column' }"
                @click="applyGlobalLayout('column')"
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
          <div class="text-center mt-3">
            <button class="btn btn-sm btn-outline-secondary" @click="hideGlobalLayoutOptions">
              Cancel
            </button>
          </div>
        </div>  
      </div>
      
      <!-- Medium Dropdown (single instance for both mobile and desktop) -->
      <div 
        v-if="showMediumDropdown" 
        class="medium-dropdown-mobile"
        ref="mediumDropdownMobileRef"
      >
        <div class="medium-dropdown-header">Select Medium</div>
        <div class="medium-dropdown-items">
          <div 
            v-for="medium in availableMediums" 
            :key="medium.id"
            class="medium-dropdown-item"
            :class="{ 'active': medium.id === currentMediumId }"
            @click="changeMedium(medium.id)"
          >
            {{ medium.name }}
          </div>
        </div>
        <div class="text-center mt-2">
          <button class="btn btn-sm btn-outline-secondary" @click="toggleMediumDropdown">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
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
  
  // Save the updated layouts to localStorage
  saveOptionLayoutsToLocalStorage()
  
  // Auto-close the layout selector after making a selection
  hideLayoutOptions()
}

// Save option layouts to localStorage
const saveOptionLayoutsToLocalStorage = () => {
  try {
    localStorage.setItem('optionsLayouts', JSON.stringify(optionsLayouts.value))
    console.log('Saved option layouts to localStorage')
  } catch (error) {
    console.error('Error saving option layouts to localStorage:', error)
  }
}

// Load option layouts from localStorage
const loadOptionLayoutsFromLocalStorage = () => {
  try {
    const savedLayouts = localStorage.getItem('optionsLayouts')
    if (savedLayouts) {
      optionsLayouts.value = JSON.parse(savedLayouts)
      console.log('Loaded option layouts from localStorage')
    }
  } catch (error) {
    console.error('Error loading option layouts from localStorage:', error)
  }
}

// Show layout options for a specific question
const showLayoutOptions = (sectionIndex: number, questionIndex: number, event: Event) => {
  // Prevent event from bubbling up to document, which would immediately close the popup
  event.stopPropagation()
  
  // Set the active layout selector
  activeLayoutSelector.value = { sectionIndex, questionIndex }
  
  // Add click outside event listener after the DOM updates
  nextTick(() => {
    // Get the clicked element (pencil icon)
    const clickedIcon = event.target as HTMLElement;
    const iconButton = clickedIcon.closest('.edit-icon') as HTMLElement;
    
    // Get the layout selector element
    const layoutSelector = document.querySelector('.layout-selector') as HTMLElement;
    
    // If both elements exist, position the layout selector relative to the icon
    if (iconButton && layoutSelector) {
      const iconRect = iconButton.getBoundingClientRect();
      
      // Position the layout selector below the icon
      layoutSelector.style.position = 'fixed';
      layoutSelector.style.top = `${iconRect.bottom + 5}px`;
      layoutSelector.style.left = `${iconRect.left - layoutSelector.offsetWidth / 2 + iconRect.width / 2}px`;
      
      // Make sure it doesn't go off-screen on the right
      const rightEdge = layoutSelector.getBoundingClientRect().right;
      const windowWidth = window.innerWidth;
      if (rightEdge > windowWidth - 10) {
        layoutSelector.style.left = `${windowWidth - layoutSelector.offsetWidth - 10}px`;
      }
      
      // Make sure it doesn't go off-screen on the left
      if (parseFloat(layoutSelector.style.left) < 10) {
        layoutSelector.style.left = '10px';
      }
    }
    
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
  
  // Reset any inline styles on the layout selector
  const layoutSelector = document.querySelector('.layout-selector') as HTMLElement;
  if (layoutSelector) {
    layoutSelector.style.position = '';
    layoutSelector.style.top = '';
    layoutSelector.style.left = '';
  }
  
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
interface ImageData {
  id?: number;
  url?: string;
  alt?: string;
}

interface McqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  image_id: number | null;
  is_correct: boolean;
  image: ImageData | null;
}

interface MatchPair {
  id: number;
  question_text_id: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;
  left_image: ImageData | null;
  right_image: ImageData | null;
}

interface QuestionText {
  id: number;
  question_id: number;
  image_id: number | null;
  question_text: string;
  image: ImageData | null;
  mcq_options: McqOption[];
  match_pairs: MatchPair[];
  topic?: {
    id: number;
    name: string;
    chapter_id: number;
  };
  question_text_topics?: {
    id: number;
    question_text_id: number;
    question_topic_id: number;
    instruction_medium_id: number;
  }[];
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

// Add interface for ApiResponse
interface ApiResponse {
  patternId: number;
  patternName?: string;
  totalMarks: number;
  absoluteMarks: number;
  sectionAllocations: SectionAllocation[];
  chapterMarks: ChapterMark[];
  mediums?: ApiMedium[];
  questionOrigin?: string;
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
  topicId?: number; // Add topic ID for future reference
  chapterId?: number; // Add chapter ID to maintain it across replacements
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

// Global layout selector state
const globalLayoutSelectorVisible = ref(false)
const globalLayoutSelectorRef = ref<HTMLElement | null>(null)
const globalSelectedLayout = ref(DEFAULT_OPTION_LAYOUT)

// Add state to track data from both endpoints and which was last used
const allocationData = ref<ApiResponse | null>(null)
const distributeData = ref<ApiResponse | null>(null)
const lastUsedEndpoint = ref<'allocation' | 'distribute' | null>(null)
// Store raw API data for debugging
const apiData = ref<ApiResponse | null>(null)

// Helper function to get the latest test paper data
const getLatestData = (): ApiResponse | null => {
  // First check if we have already loaded data in apiData
  if (apiData.value) {
    return apiData.value;
  }
  
  // If not, try to get data from localStorage
  try {
    const storedData = loadStoredData();
    return storedData;
  } catch (error) {
    console.error('Error getting latest test paper data:', error);
    return null;
  }
}

// Load data from localStorage based on lastUsedEndpoint
const loadStoredData = () => {
  try {
    // First check if we have finalQuestionsDistribution data from the final API call
    const finalDistributionData = localStorage.getItem('finalQuestionsDistribution');
    if (finalDistributionData && route.query.hasFinalDistribution === 'true') {
      try {
        const parsedData = JSON.parse(finalDistributionData);
        console.log('Loaded final questions distribution data from localStorage');
        apiData.value = parsedData;
        return parsedData;
      } catch (e) {
        console.error('Error parsing final questions distribution data:', e);
      }
    }
    
    // If no final distribution data, check lastUsedEndpoint
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
const fetchTestPaperQuestions = async (storedData?: ApiResponse) => {
  try {
    // First check if we already have final questions distribution data
    if (storedData && route.query.hasFinalDistribution === 'true') {
      console.log('Using final questions distribution data');
      apiData.value = storedData;
      transformApiDataToDisplayFormat(storedData);
      return;
    }
    
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

    // Make the API call to get final questions distribution
    const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', requestData)
    
    if (response.data) {
      apiData.value = response.data
      console.log('API Response Data Structure:', response.data)
      
      // Save the data to localStorage for future use
      localStorage.setItem('finalQuestionsDistribution', JSON.stringify(response.data));
      
      // Check for question_text_topics in the first question if available
      if (response.data.sectionAllocations && 
          response.data.sectionAllocations[0] && 
          response.data.sectionAllocations[0].subsectionAllocations &&
          response.data.sectionAllocations[0].subsectionAllocations[0] &&
          response.data.sectionAllocations[0].subsectionAllocations[0].allocatedChapters &&
          response.data.sectionAllocations[0].subsectionAllocations[0].allocatedChapters[0] &&
          response.data.sectionAllocations[0].subsectionAllocations[0].allocatedChapters[0].question) {
        const firstQuestion = response.data.sectionAllocations[0].subsectionAllocations[0].allocatedChapters[0].question;
        if (firstQuestion.question_texts && firstQuestion.question_texts[0]) {
          console.log('First question text structure:', firstQuestion.question_texts[0]);
        }
      }
      
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
    console.error('Invalid API data: missing sectionAllocations');
    return;
  }

  // Extract available mediums from the API response if available
  if (data.mediums && data.mediums.length > 0) {
    console.log('Mediums from API:', data.mediums);
    availableMediums.value = data.mediums.map((medium: ApiMedium) => ({
      id: medium.id,
      name: medium.instruction_medium
    }));
    
    // If current medium is not in the available list, reset to the first one
    if (!availableMediums.value.some(m => m.id === currentMediumId.value) && availableMediums.value.length > 0) {
      console.log('Current medium not in available list, resetting to:', availableMediums.value[0].name);
      currentMediumId.value = availableMediums.value[0].id;
    }
  } else {
    console.warn('No mediums available in API response');
  }

  const displaySections: DisplaySection[] = [];
  let sectionNumberCounter = 1;

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
    };

    let questionNumberCounter = 1;

    // Process each subsection within a section
    section.subsectionAllocations.forEach(subsection => {
      // Process each chapter's questions within a subsection
      subsection.allocatedChapters.forEach(chapter => {
        if (chapter.question) {
          const question = chapter.question;
          
          // Find the correct question text based on the current medium
          let questionText: QuestionText | undefined;
          
          if (question.question_texts && question.question_texts.length > 0) {
            // First try to find an exact match for the current medium
            questionText = question.question_texts.find(text => 
              text.question_text_topics && 
              text.question_text_topics.length > 0 && 
              text.question_text_topics[0].instruction_medium_id === currentMediumId.value
            );
            
            // If no match, use the first question text as a fallback
            if (!questionText) {
              console.warn(`No question text found for medium ID ${currentMediumId.value}, using first available`);
              questionText = question.question_texts[0];
            }
          } else {
            console.warn('Question has no question_texts array, skipping');
            return; // Skip this question if no question texts available
          }
          
          // Extract topic ID from either topic or question_text_topics
          let topicId: number | undefined;
          if (questionText.topic) {
            topicId = questionText.topic.id;
          } else if (questionText.question_text_topics && questionText.question_text_topics.length > 0) {
            topicId = questionText.question_text_topics[0].question_topic_id;
          }
          
          // Create display question based on question type
          const displayQuestion: DisplayQuestion = {
            questionNumber: questionNumberCounter++,
            questionText: questionText.question_text,
            marks: section.marks_per_question || Math.ceil(section.totalMarks / section.totalQuestions), // Use marks_per_question if available
            questionType: question.question_type.type_name,
            originalQuestion: question,
            topicId: topicId,
            chapterId: chapter.chapterId // Store the chapter ID with the question
          };

          // Process MCQ options if they exist
          if (questionText.mcq_options && questionText.mcq_options.length > 0) {
            displayQuestion.options = questionText.mcq_options.map((option, index) => {
              return {
                label: String.fromCharCode(65 + index), // A, B, C, D...
                text: option.option_text,
                isCorrect: option.is_correct
              };
            });
          }

          // Process match pairs if they exist
          if (questionText.match_pairs && questionText.match_pairs.length > 0) {
            displayQuestion.matchPairs = questionText.match_pairs.map(pair => {
              return {
                leftText: pair.left_text || '', // Handle null left_text
                rightText: pair.right_text || '' // Handle null right_text
              };
            });
          }

          displaySection.questions.push(displayQuestion);
        }
      });
    });

    displaySections.push(displaySection);
  });

  testPaperSections.value = displaySections;
}

// Change a single question - calls the API to get a replacement
const changeQuestion = async (sectionIndex: number, questionIndex: number) => {
  try {
    // Show loading state on the button
    const button = document.querySelector(`#question-${sectionIndex}-${questionIndex} .shuffle-button`) as HTMLButtonElement;
    if (button) {
      button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...`;
      button.disabled = true;
    }

    // Get the current question
    const section = testPaperSections.value[sectionIndex];
    const question = section.questions[questionIndex];
    const originalQuestion = question.originalQuestion;
    
    // Get the question text id
    const questionTextId = originalQuestion.question_texts && originalQuestion.question_texts.length > 0 
      ? originalQuestion.question_texts[0].id 
      : null;
      
    if (!questionTextId) {
      throw new Error('Question text ID not found');
    }
    
    // Get all available medium IDs instead of just the current one
    const mediumIds = availableMediums.value.map(medium => medium.id);
    
    // If no medium IDs available, use the current medium ID as fallback
    if (mediumIds.length === 0) {
      mediumIds.push(currentMediumId.value);
    }
    
    // Find the chapter ID for the current question
    let chapterId: number | undefined;
    
    // First try to get chapter ID from question_topics
    if (originalQuestion.question_topics && originalQuestion.question_topics.length > 0) {
      chapterId = originalQuestion.question_topics[0].topic?.chapter?.id;
    }
    
    // If not found in question_topics, try question_text_topics
    if (!chapterId && originalQuestion.question_texts && originalQuestion.question_texts.length > 0) {
      const questionText = originalQuestion.question_texts[0];
      if (questionText.question_text_topics && questionText.question_text_topics.length > 0) {
        const questionTopic = questionText.question_text_topics[0].question_topic;
        if (questionTopic && questionTopic.topic && questionTopic.topic.chapter) {
          chapterId = questionTopic.topic.chapter.id;
        }
      }
    }
    
    // If still not found, check if it was stored in the display question from previous changes
    if (!chapterId && question.chapterId) {
      chapterId = question.chapterId;
    }
    
    // If no chapter ID found, use from API data
    if (!chapterId) {
      const apiDataValue = apiData.value;
      if (apiDataValue && apiDataValue.sectionAllocations) {
        // Find the question in the API data to get its chapter ID
        outerLoop: for (const section of apiDataValue.sectionAllocations) {
          if (section.subsectionAllocations) {
            for (const subsection of section.subsectionAllocations) {
              if (subsection.allocatedChapters) {
                for (const chapter of subsection.allocatedChapters) {
                  if (chapter.question && chapter.question.id === originalQuestion.id) {
                    chapterId = chapter.chapterId;
                    break outerLoop;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // If still no chapter ID, fallback to route params
    if (!chapterId) {
      const chapters = route.query.chapters ? JSON.parse(decodeURIComponent(route.query.chapters as string)) : [];
      chapterId = chapters.length > 0 ? chapters[0].id : 1;
      console.warn(`Chapter ID not found, using default from route: ${chapterId}`);
    }
    
    // Get the question type ID
    const questionTypeId = originalQuestion.question_type_id;
    
    // Get all question text IDs from the same chapter and question type across the entire test paper
    const questionTextIds: number[] = [];
    
    // First add the current question text ID
    questionTextIds.push(questionTextId);
    
    // Helper function to get chapter ID for a question
    const getQuestionChapterId = (q: Question): number | undefined => {
      // Try from question_topics first
      if (q.question_topics && q.question_topics.length > 0) {
        const topic = q.question_topics[0].topic;
        if (topic && topic.chapter) {
          return topic.chapter.id;
        }
      }
      
      // Try from question_text_topics next
      if (q.question_texts && q.question_texts.length > 0) {
        const questionText = q.question_texts[0];
        if (questionText.question_text_topics && questionText.question_text_topics.length > 0) {
          const questionTopic = questionText.question_text_topics[0].question_topic;
          if (questionTopic && questionTopic.topic && questionTopic.topic.chapter) {
            return questionTopic.topic.chapter.id;
          }
        }
      }
      
      // Look in API data as fallback
      const apiDataValue = apiData.value;
      if (apiDataValue && apiDataValue.sectionAllocations) {
        for (const section of apiDataValue.sectionAllocations) {
          if (section.subsectionAllocations) {
            for (const subsection of section.subsectionAllocations) {
              if (subsection.allocatedChapters) {
                for (const chapter of subsection.allocatedChapters) {
                  if (chapter.question && chapter.question.id === q.id) {
                    return chapter.chapterId;
                  }
                }
              }
            }
          }
        }
      }
      
      return undefined;
    };
    
    // Loop through all sections in the test paper
    for (const section of testPaperSections.value) {
      for (const q of section.questions) {
        // Skip the current question as we already added it
        if (q.originalQuestion.id === originalQuestion.id) continue;
        
        // Only consider questions with the same question type
        if (q.originalQuestion.question_type_id === questionTypeId) {
          // Get the chapter ID for this question
          let questionChapterId: number | undefined;
          
          // First check if the question has a stored chapterId property
          if (q.chapterId) {
            questionChapterId = q.chapterId;
          } else {
            // Otherwise, try to find it from the question data
            questionChapterId = getQuestionChapterId(q.originalQuestion);
          }
          
          // Only include question text IDs from the same chapter
          if (questionChapterId === chapterId) {
            // Get the question text ID
            if (q.originalQuestion.question_texts && q.originalQuestion.question_texts.length > 0) {
              const qTextId = q.originalQuestion.question_texts[0].id;
              questionTextIds.push(qTextId);
            }
          }
        }
      }
    }
    
    console.log('Change question parameters:', {
      questionTextIds,
      mediumIds,
      chapterId,
      questionOrigin: 'both'
    });
    
    // Build query params
    const queryParams = new URLSearchParams();
    
    // Add question text IDs
    questionTextIds.forEach(id => {
      queryParams.append('questionTextIds', id.toString());
    });
    
    // Add all medium IDs
    mediumIds.forEach(id => {
      queryParams.append('mediumIds', id.toString());
    });
    
    // Add chapter ID
    queryParams.append('chapterId', chapterId.toString());
    
    // Add question origin
    queryParams.append('questionOrigin', 'both');
    
    // Make the API call to get a replacement question
    const response = await axiosInstance.get(`/chapter-marks-distribution/change-question?${queryParams.toString()}`);
    
    if (response.data && response.data.question) {
      const newQuestion = response.data.question;
      console.log('New question received:', newQuestion);
      
      // Find the correct question text based on the current medium
      let questionText: QuestionText | undefined;
      
      if (newQuestion.question_texts && newQuestion.question_texts.length > 0) {
        // First try to find an exact match for the current medium
        questionText = newQuestion.question_texts.find(text => 
          text.question_text_topics && 
          text.question_text_topics.length > 0 && 
          text.question_text_topics[0].instruction_medium_id === currentMediumId.value
        );
        
        // If no match, use the first question text as a fallback
        if (!questionText) {
          questionText = newQuestion.question_texts[0];
        }
      } else {
        throw new Error('No question texts available in the new question');
      }
      
      // Extract topic ID from question_topics or question_text_topics
      let topicId: number | undefined;
      if (newQuestion.question_topics && newQuestion.question_topics.length > 0) {
        topicId = newQuestion.question_topics[0].topic_id;
      } else if (questionText.question_text_topics && questionText.question_text_topics.length > 0) {
        topicId = questionText.question_text_topics[0].question_topic_id;
      }
      
      // Create display question based on question type
      const displayQuestion: DisplayQuestion = {
        questionNumber: question.questionNumber, // Keep the same question number
        questionText: questionText.question_text,
        marks: question.marks, // Keep the same marks
        questionType: newQuestion.question_type.type_name,
        originalQuestion: newQuestion,
        topicId: topicId,
        chapterId: chapterId // Store the chapter ID with the question for future changes
      };
      
      // Process MCQ options if they exist
      if (questionText.mcq_options && questionText.mcq_options.length > 0) {
        displayQuestion.options = questionText.mcq_options.map((option, index) => {
          return {
            label: String.fromCharCode(65 + index), // A, B, C, D...
            text: option.option_text,
            isCorrect: option.is_correct
          };
        });
      }
      
      // Process match pairs if they exist
      if (questionText.match_pairs && questionText.match_pairs.length > 0) {
        displayQuestion.matchPairs = questionText.match_pairs.map(pair => {
          return {
            leftText: pair.left_text,
            rightText: pair.right_text
          };
        });
      }
      
      // Replace the question in the section
      section.questions[questionIndex] = displayQuestion;
      
      // Update the stored API data structure to include this new question
      // This is the key step to ensure medium changes work with changed questions
      updateStoredApiDataWithNewQuestion(sectionIndex, questionIndex, newQuestion, chapterId);
      
      console.log('Question successfully changed');
    } else {
      console.error('Unexpected API response format:', response.data);
      throw new Error('Failed to get replacement question');
    }
  } catch (error) {
    console.error('Error changing question:', error);
    // Show error message to user
    alert('Failed to change question. Please try again later.');
  } finally {
    // Restore the button to its original state
    const button = document.querySelector(`#question-${sectionIndex}-${questionIndex} .shuffle-button`) as HTMLButtonElement;
    if (button) {
      button.innerHTML = `<span class="d-inline-flex align-items-center">
        <i class="bi bi-arrow-clockwise me-1"></i><span class="d-none d-sm-inline">Change</span>
      </span>`;
      button.disabled = false;
    }
  }
}

// New function to update the stored API data structure with a new question
const updateStoredApiDataWithNewQuestion = (sectionIndex: number, questionIndex: number, newQuestion: Question, chapterId: number) => {
  if (!apiData.value || !apiData.value.sectionAllocations) {
    console.warn('Cannot update stored API data: no apiData available');
    return;
  }
  
  try {
    // Find the section in the API data that corresponds to the display section
    const section = testPaperSections.value[sectionIndex];
    
    // Find the corresponding section in the API data
    const apiSection = apiData.value.sectionAllocations.find(s => 
      s.sectionName === section.sectionName && 
      (s.section_number === section.sectionNumber || s.sequentialNumber === section.sectionNumber)
    );
    
    if (!apiSection) {
      console.warn(`Cannot find section in API data for section index ${sectionIndex}`);
      return;
    }
    
    // Now we need to find the corresponding question in the API data structure
    // Loop through all subsections and their allocated chapters
    let found = false;
    
    for (const subsection of apiSection.subsectionAllocations) {
      if (found) break;
      
      for (let i = 0; i < subsection.allocatedChapters.length; i++) {
        const chapter = subsection.allocatedChapters[i];
        
        // If this chapter has a question and it's the one we're replacing
        if (chapter.question) {
          // Count how many questions we've seen so far
          let questionCount = 0;
          
          // Count questions in all previous subsections
          for (const prevSubsection of apiSection.subsectionAllocations) {
            if (prevSubsection === subsection) {
              // For the current subsection, count questions up to the current chapter
              for (let j = 0; j < i; j++) {
                if (prevSubsection.allocatedChapters[j].question) {
                  questionCount++;
                }
              }
              break;
            } else {
              // For previous subsections, count all questions
              for (const prevChapter of prevSubsection.allocatedChapters) {
                if (prevChapter.question) {
                  questionCount++;
                }
              }
            }
          }
          
          // If this is the question we're looking for
          if (questionCount === questionIndex) {
            // Replace the question in the API data structure
            chapter.question = newQuestion;
            
            // Update the chapter ID if needed
            if (chapter.chapterId !== chapterId) {
              chapter.chapterId = chapterId;
            }
            
            console.log(`Updated question in API data at section ${sectionIndex}, question ${questionIndex}`);
            found = true;
            break;
          }
        }
      }
    }
    
    if (!found) {
      console.warn(`Could not find question in API data for section ${sectionIndex}, question ${questionIndex}`);
    }
    
    // Update the stored data
    localStorage.setItem('finalQuestionsDistribution', JSON.stringify(apiData.value));
    console.log('Updated finalQuestionsDistribution in localStorage with new question');
  } catch (error) {
    console.error('Error updating stored API data with new question:', error);
  }
}

// Save page functionality (placeholder)
const savePage = async () => {
  try {
    console.log('Saving test paper...');
    
    // Show loading indicator or disable button here
    const saveButton = document.querySelector('.btn-dark') as HTMLButtonElement;
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Saving...';
    }
    
    // Get the current test paper data
    const latestData = getLatestData();
    if (!latestData) {
      throw new Error('No test paper data available');
    }

    // Save the current data to localStorage for the saveTestPaper page to use
    localStorage.setItem('finalQuestionsDistribution', JSON.stringify(latestData));
    console.log('Saved test paper data to localStorage');

    // Extract the pattern ID from latest data
    const patternId = latestData.patternId ? latestData.patternId.toString() : route.query.patternId;
    console.log(`Using pattern ID: ${patternId}`);

    // Get chapters and weightages from the data
    const chapters: number[] = [];
    const weightages: number[] = [];

    if (latestData.chapterMarks && latestData.chapterMarks.length > 0) {
      latestData.chapterMarks.forEach(chapterMark => {
        chapters.push(chapterMark.chapterId);
        
        // Use absolute marks directly (actual marks, not percentage)
        weightages.push(chapterMark.absoluteMarks);
      });
    }
    
    // Get user ID and school ID from user profile
    const userId = userProfile.value?.id;
    const schoolId = userProfile.value?.schools && userProfile.value.schools.length > 0 
      ? userProfile.value.schools[0].id 
      : null;
      
    if (!userId || !schoolId) {
      throw new Error('User ID or School ID not available');
    }
    
    // Navigate to saveTestPaper page with all the necessary data
    router.push({
      name: 'saveTestPaper',
      query: {
        ...route.query, // Pass along current query params
        paperTitle: paperTitle.value,
        testDuration: `${hours.value}:${minutes.value}`,
        saveRequested: 'true', // Flag to indicate save should be performed
        userId: userId.toString(),
        schoolId: schoolId.toString(),
        chapters: JSON.stringify(chapters),
        weightages: JSON.stringify(weightages),
        patternId: patternId ? patternId.toString() : '1' // Ensure pattern ID is passed
      }
    });
    
  } catch (error) {
    console.error('Error saving test paper:', error);
    alert('Failed to save test paper. Please try again.');
    
    // Reset save button
    const saveButton = document.querySelector('.btn-dark') as HTMLButtonElement;
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.innerHTML = '<i class="bi bi-save me-1"></i> Save';
    }
  }
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
    
    // Load saved option layouts
    loadOptionLayoutsFromLocalStorage()
    
    // Load user profile and school name
    await fetchUserProfile()
    
    // Load data from localStorage
    const storedData = loadStoredData()
    
    // Fetch test paper questions
    await fetchTestPaperQuestions(storedData)
    
    // Extract available mediums from API data after questions are loaded
    fetchAvailableMediums()
    
    // Load saved zoom level from localStorage
    const savedZoomLevel = localStorage.getItem('a4ZoomLevel');
    if (savedZoomLevel) {
      zoomLevel.value = parseInt(savedZoomLevel);
    }
    
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
  
  // Add scroll event listener to hide layout selectors when scrolling
  window.addEventListener('scroll', handleLayoutSelectorsOnScroll)
  
  // Call handleScroll initially to set the correct visibility
  handleScroll()
  
  // Load instructions from localStorage if they exist
  const savedInstructions = localStorage.getItem('examInstructions')
  if (savedInstructions) {
    try {
      examInstructions.value = JSON.parse(savedInstructions)
    } catch (e) {
      console.error('Error parsing saved instructions:', e)
    }
  }
})

onBeforeUnmount(() => {
  // Remove event listeners
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('scroll', handleLayoutSelectorsOnScroll)
  document.removeEventListener('click', handleGlobalLayoutClickOutside)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('click', handleMediumDropdownClickOutside)
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
  isChangingAllQuestions.value = true
  try {
    console.log('Changing all questions...')
    // Show feedback to the user
    const previousSections = testPaperSections.value
    
    // Call the same API again with the same request data
    const requestData = getLatestData();
    if (!requestData) {
      console.error('No request data available to change questions');
      throw new Error('Failed to get request data for changing questions');
    }
    
    // Use the original request data without modifying it
    const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', requestData);
    
    if (response.data) {
      console.log('New questions received from API');
      apiData.value = response.data;
      
      // Extract available mediums from the response
      if (response.data.mediums && response.data.mediums.length > 0) {
        availableMediums.value = response.data.mediums.map((medium: ApiMedium) => ({
          id: medium.id,
          name: medium.instruction_medium
        }));
        
        // If current medium is not in the available list, reset to the first one
        if (!availableMediums.value.some(m => m.id === currentMediumId.value) && availableMediums.value.length > 0) {
          currentMediumId.value = availableMediums.value[0].id;
        }
      }
      
      transformApiDataToDisplayFormat(response.data);
    } else {
      throw new Error('Unexpected API response format when changing questions');
    }
    
    // If the API call fails or returns empty data, restore the previous questions
    if (testPaperSections.value.length === 0) {
      console.warn('API returned no sections, restoring previous state');
      testPaperSections.value = previousSections;
    }
  } catch (error) {
    console.error('Error changing all questions:', error);
    // Show error message to user
    alert('Failed to change questions. Please try again later.');
  } finally {
    isChangingAllQuestions.value = false;
  }
}

// Show global layout options
const showGlobalLayoutOptions = (event: Event) => {
  // Prevent propagation
  event.stopPropagation()
  
  // Set the global layout selector as visible
  globalLayoutSelectorVisible.value = true
  
  // Add click outside event listener after the DOM updates
  nextTick(() => {
    // Get the clicked button
    const clickedButton = event.target as HTMLElement;
    const button = clickedButton.closest('.btn') as HTMLElement;
    
    // Position the layout selector relative to the button
    if (button && globalLayoutSelectorRef.value) {
      // For desktop view, position based on the button
      if (window.innerWidth >= 576) {
        const buttonRect = button.getBoundingClientRect();
        globalLayoutSelectorRef.value.style.position = 'fixed';
        globalLayoutSelectorRef.value.style.top = `${buttonRect.bottom + 5}px`;
        globalLayoutSelectorRef.value.style.left = `${buttonRect.left - globalLayoutSelectorRef.value.offsetWidth / 2 + buttonRect.width / 2}px`;
        globalLayoutSelectorRef.value.style.transform = '';
        
        // Make sure it doesn't go off-screen
        const rect = globalLayoutSelectorRef.value.getBoundingClientRect();
        if (rect.right > window.innerWidth - 10) {
          globalLayoutSelectorRef.value.style.left = `${window.innerWidth - globalLayoutSelectorRef.value.offsetWidth - 10}px`;
        }
        if (rect.left < 10) {
          globalLayoutSelectorRef.value.style.left = '10px';
        }
      } else {
        // For mobile view, always center in the screen regardless of click position
        globalLayoutSelectorRef.value.style.position = 'fixed';
        globalLayoutSelectorRef.value.style.top = '50%';
        globalLayoutSelectorRef.value.style.left = '50%';
        globalLayoutSelectorRef.value.style.transform = 'translate(-50%, -50%)';
        // Clear any previous positioning
        globalLayoutSelectorRef.value.style.right = '';
        globalLayoutSelectorRef.value.style.bottom = '';
      }
    }
    
    // Add event listener for clicks outside
    document.addEventListener('click', handleGlobalLayoutClickOutside);
  });
}

// Hide global layout options
const hideGlobalLayoutOptions = () => {
  globalLayoutSelectorVisible.value = false;
  document.removeEventListener('click', handleGlobalLayoutClickOutside);
}

// Handle click outside of global layout selector
const handleGlobalLayoutClickOutside = (event: MouseEvent) => {
  if (globalLayoutSelectorRef.value && !globalLayoutSelectorRef.value.contains(event.target as Node)) {
    hideGlobalLayoutOptions();
  }
}

// Show layout change toast notification
const showLayoutChangeToast = (message: string) => {
  layoutToastMessage.value = message;
  showLayoutToast.value = true;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showLayoutToast.value = false;
  }, 3000);
}

// Apply global layout to all MCQ questions
const applyGlobalLayout = (layout: string) => {
  // Set the selected global layout
  globalSelectedLayout.value = layout;
  
  // Apply this layout to all MCQ questions
  let mcqCount = 0;
  testPaperSections.value.forEach((section, sectionIndex) => {
    section.questions.forEach((question, questionIndex) => {
      // Only apply to questions that have options (MCQs)
      if (question.options && question.options.length > 0) {
        const key = `${sectionIndex}-${questionIndex}`;
        optionsLayouts.value[key] = layout;
        mcqCount++;
      }
    });
  });
  
  // Save the updated layouts to localStorage
  saveOptionLayoutsToLocalStorage()
  
  // Show feedback
  const layoutNames = {
    'row': 'Single Row',
    'grid': '2x2 Grid',
    'column': 'Single Column'
  };
  
  // Show feedback with toast notification
  const message = `Applied ${layoutNames[layout as keyof typeof layoutNames]} layout to ${mcqCount} questions`;
  showLayoutChangeToast(message);
  
  // Close the selector
  hideGlobalLayoutOptions();
}

// Clean up event listeners
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('click', handleGlobalLayoutClickOutside);
});

// Toast notification for layout changes
const showLayoutToast = ref(false)
const layoutToastMessage = ref('')

// Hide layout selectors when scrolling
const handleLayoutSelectorsOnScroll = () => {
  // Hide global layout selector if visible
  if (globalLayoutSelectorVisible.value) {
    globalLayoutSelectorVisible.value = false
    document.removeEventListener('click', handleGlobalLayoutClickOutside)
  }
  
  // Hide individual layout selector if visible
  if (activeLayoutSelector.value.sectionIndex !== -1) {
    hideLayoutOptions()
  }
  
  // Hide medium dropdown if visible
  if (showMediumDropdown.value) {
    showMediumDropdown.value = false
    document.removeEventListener('click', handleMediumDropdownClickOutside)
  }
}

// Exam Instructions functionality
const examInstructions = ref<string[]>([])
const isEditingInstructions = ref(false)
const instructionsText = ref('')
const instructionsTextarea = ref<HTMLTextAreaElement | null>(null)

// Function to start editing instructions
const startEditingInstructions = () => {
  isEditingInstructions.value = true
  instructionsText.value = examInstructions.value.join('\n')
  nextTick(() => {
    if (instructionsTextarea.value) {
      instructionsTextarea.value.focus()
    }
  })
}

// Function to cancel editing instructions
const cancelEditingInstructions = () => {
  isEditingInstructions.value = false
  instructionsText.value = ''
}

// Function to save instructions
const saveInstructions = () => {
  isEditingInstructions.value = false
  // Filter out empty lines
  examInstructions.value = instructionsText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
  
  // Save to localStorage for persistence
  localStorage.setItem('examInstructions', JSON.stringify(examInstructions.value))
}

// Medium selection state and refs
interface Medium {
  id: number;
  name: string;
}

// Define interface for API Medium response
interface ApiMedium {
  id: number;
  instruction_medium: string;
}

const availableMediums = ref<Medium[]>([]);
const currentMediumId = ref<number>(1); // Default medium ID
const currentMediumName = computed(() => {
  const medium = availableMediums.value.find(m => m.id === currentMediumId.value);
  return medium ? medium.name : 'Medium';
});
const showMediumDropdown = ref(false);
const mediumButtonMobileRef = ref<HTMLElement | null>(null);
const mediumDropdownMobileRef = ref<HTMLElement | null>(null);

// Function to toggle medium dropdown
const toggleMediumDropdown = (event: MouseEvent) => {
  event.stopPropagation();
  showMediumDropdown.value = !showMediumDropdown.value;
  
  if (showMediumDropdown.value) {
    nextTick(() => {
      // Get the clicked button (could be mobile or desktop)
      const clickedElement = event.target as HTMLElement;
      const buttonElement = clickedElement.closest('button') as HTMLElement;
      
      if (buttonElement && mediumDropdownMobileRef.value) {
        const buttonRect = buttonElement.getBoundingClientRect();
        mediumDropdownMobileRef.value.style.position = 'fixed';
        mediumDropdownMobileRef.value.style.top = `${buttonRect.bottom + 5}px`;
        
        // Center horizontally relative to the button
        const dropdownWidth = mediumDropdownMobileRef.value.offsetWidth;
        const buttonCenterX = buttonRect.left + (buttonRect.width / 2);
        const leftPosition = buttonCenterX - (dropdownWidth / 2);
        
        // Ensure it doesn't go off-screen on the left
        const adjustedLeft = Math.max(10, leftPosition);
        
        // Ensure it doesn't go off-screen on the right
        const rightEdge = adjustedLeft + dropdownWidth;
        if (rightEdge > window.innerWidth - 10) {
          mediumDropdownMobileRef.value.style.left = `${window.innerWidth - dropdownWidth - 10}px`;
        } else {
          mediumDropdownMobileRef.value.style.left = `${adjustedLeft}px`;
        }
        
        // Remove centered transform
        mediumDropdownMobileRef.value.style.transform = 'none';
      }
      
      // Add click outside listener
      document.addEventListener('click', handleMediumDropdownClickOutside);
    });
  } else {
    document.removeEventListener('click', handleMediumDropdownClickOutside);
  }
};

// Handle click outside medium dropdown
const handleMediumDropdownClickOutside = (event: MouseEvent) => {
  const dropdown = mediumDropdownMobileRef.value;
  
  // Check if click is outside dropdown
  if (dropdown && !dropdown.contains(event.target as Node)) {
    showMediumDropdown.value = false;
    document.removeEventListener('click', handleMediumDropdownClickOutside);
  }
};

// Fetch available mediums
const fetchAvailableMediums = () => {
  try {
    // Extract mediums from the API response data
    if (apiData.value && apiData.value.mediums && apiData.value.mediums.length > 0) {
      availableMediums.value = apiData.value.mediums.map((medium: ApiMedium) => ({
        id: medium.id,
        name: medium.instruction_medium
      }));
      
      // If no current medium ID is set, set to the first available medium
      if (availableMediums.value.length > 0 && currentMediumId.value === 1) {
        currentMediumId.value = availableMediums.value[0].id;
      }
    } else {
      // If no mediums in API data, use default
      availableMediums.value = [{ id: 1, name: 'English' }];
    }
  } catch (error) {
    console.error('Error extracting available mediums:', error);
    // Add default medium as fallback
    availableMediums.value = [{ id: 1, name: 'English' }];
  }
};

// Change the current medium
const changeMedium = async (mediumId: number) => {
  if (currentMediumId.value === mediumId) {
    // If same medium, just close the dropdown
    showMediumDropdown.value = false;
    return;
  }
  
  // Store the previous medium for reference
  const previousMediumId = currentMediumId.value;
  
  // Update current medium ID
  currentMediumId.value = mediumId;
  showMediumDropdown.value = false;
  
  // Show toast notification for medium change
  const mediumName = availableMediums.value.find(m => m.id === mediumId)?.name || 'Unknown';
  showLayoutChangeToast(`Changed to ${mediumName} medium`);
  
  try {
    // For questions that have been individually changed, we need to check if they have
    // the correct language version and potentially fetch new ones
    
    // First transform the existing data for immediate display
    if (apiData.value) {
      transformApiDataToDisplayFormat(apiData.value);
    }
    
    // Then check each question to see if it needs to be updated
    const questionsToFetch = [];
    
    for (let sectionIndex = 0; sectionIndex < testPaperSections.value.length; sectionIndex++) {
      const section = testPaperSections.value[sectionIndex];
      
      for (let questionIndex = 0; questionIndex < section.questions.length; questionIndex++) {
        const question = section.questions[questionIndex];
        const originalQuestion = question.originalQuestion;
        
        // Check if this question has a text for the current medium
        const hasTextForCurrentMedium = originalQuestion.question_texts.some(text => 
          text.question_text_topics && 
          text.question_text_topics.length > 0 && 
          text.question_text_topics[0].instruction_medium_id === mediumId
        );
        
        // If no text for current medium, add to list of questions to fetch
        if (!hasTextForCurrentMedium && question.chapterId) {
          questionsToFetch.push({
            sectionIndex,
            questionIndex,
            questionTextId: originalQuestion.question_texts[0].id,
            chapterId: question.chapterId
          });
        }
      }
    }
    
    // If we found questions that need updating, fetch them one by one
    if (questionsToFetch.length > 0) {
      console.log(`Found ${questionsToFetch.length} questions that need updating for medium ${mediumId}`);
      
      // Show loading state
      isChangingAllQuestions.value = true;
      
      // Process each question that needs updating
      for (const questionInfo of questionsToFetch) {
        await fetchQuestionWithNewMedium(
          questionInfo.sectionIndex,
          questionInfo.questionIndex,
          questionInfo.questionTextId,
          questionInfo.chapterId,
          mediumId
        );
      }
      
      // Hide loading state
      isChangingAllQuestions.value = false;
    }
  } catch (error) {
    console.error('Error changing medium:', error);
    // In case of error, revert to previous medium
    currentMediumId.value = previousMediumId;
    showLayoutChangeToast('Failed to change medium. Please try again.');
  }
};

// Helper function to fetch a specific question with new medium
const fetchQuestionWithNewMedium = async (
  sectionIndex: number,
  questionIndex: number,
  questionTextId: number,
  chapterId: number,
  mediumId: number
) => {
  try {
    // Get all available medium IDs
    const mediumIds = availableMediums.value.map(medium => medium.id);
    
    // Make sure the target medium is included
    if (!mediumIds.includes(mediumId)) {
      mediumIds.push(mediumId);
    }
    
    // Build query params
    const queryParams = new URLSearchParams();
    
    // Add question text ID
    queryParams.append('questionTextIds', questionTextId.toString());
    
    // Add all medium IDs
    mediumIds.forEach(id => {
      queryParams.append('mediumIds', id.toString());
    });
    
    // Add chapter ID
    queryParams.append('chapterId', chapterId.toString());
    
    // Add question origin
    queryParams.append('questionOrigin', 'both');
    
    // Make the API call to get a replacement question
    const response = await axiosInstance.get(`/chapter-marks-distribution/change-question?${queryParams.toString()}`);
    
    if (response.data && response.data.question) {
      const newQuestion = response.data.question;
      
      // Check if the new question has the text for the current medium
      const hasTextForCurrentMedium = newQuestion.question_texts.some(text => 
        text.question_text_topics && 
        text.question_text_topics.length > 0 && 
        text.question_text_topics[0].instruction_medium_id === mediumId
      );
      
      if (hasTextForCurrentMedium) {
        // Update the question in our display data
        const section = testPaperSections.value[sectionIndex];
        const question = section.questions[questionIndex];
        
        // Store the new question data
        question.originalQuestion = newQuestion;
        
        // Find the correct question text based on the current medium
        const questionText = newQuestion.question_texts.find(text => 
          text.question_text_topics && 
          text.question_text_topics.length > 0 && 
          text.question_text_topics[0].instruction_medium_id === mediumId
        ) || newQuestion.question_texts[0];
        
        // Update the question display
        question.questionText = questionText.question_text;
        
        // Process MCQ options if they exist
        if (questionText.mcq_options && questionText.mcq_options.length > 0) {
          question.options = questionText.mcq_options.map((option, index) => {
            return {
              label: String.fromCharCode(65 + index), // A, B, C, D...
              text: option.option_text,
              isCorrect: option.is_correct
            };
          });
        }
        
        // Process match pairs if they exist
        if (questionText.match_pairs && questionText.match_pairs.length > 0) {
          question.matchPairs = questionText.match_pairs.map(pair => {
            return {
              leftText: pair.left_text || '', // Handle null left_text
              rightText: pair.right_text || '' // Handle null right_text
            };
          });
        }
        
        console.log(`Updated question ${sectionIndex}-${questionIndex} with medium ${mediumId}`);
      } else {
        console.warn(`New question does not have text for medium ${mediumId}`);
      }
    } else {
      console.error('Unexpected API response format:', response.data);
    }
  } catch (error) {
    console.error('Error fetching question with new medium:', error);
  }
};

// Add mobileViewMode state
const mobileViewMode = ref(false);

// Add zoom level state and computed style for A4 paper
const zoomLevel = ref(100);

// Computed style for A4 paper based on zoom level
const a4PaperStyle = computed(() => {
  if (!mobileViewMode.value && zoomLevel.value < 100) {
    const scale = zoomLevel.value / 100;
    return {
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
      marginBottom: `${30 - (30 * scale)}px`
    };
  }
  return {};
});

// Update zoom function
const updateZoom = () => {
  // Update localStorage to remember user's preference
  localStorage.setItem('a4ZoomLevel', zoomLevel.value.toString());
};
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
  text-align: right;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  padding: 5px;
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
  position: fixed;
  top: calc(100% + 5px);
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
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}

.option-item-row {
  flex: 1;
  padding: 5px;
  margin-right: 10px;
  background-color: transparent;
  border: none;
  white-space: normal;
}

.option-item-row:last-child {
  margin-right: 0;
}

/* Grid layout (2x2) */
.options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 10px;
  width: 100%;
  margin-bottom: 10px;
}

.option-item-grid {
  padding: 5px;
  background-color: transparent;
  border: none;
}

/* Column layout (all options in one column) */
.options-column {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 10px;
}

.option-item-column {
  width: 100%;
  padding: 5px;
  margin-bottom: 8px;
  background-color: transparent;
  border: none;
}

.option-item-column:last-child {
  margin-bottom: 0;
}

/* Mobile layout fixes */
@media (max-width: 576px) {
  /* Row layout - forced to be one row with scrolling if needed */
  .options-row {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    justify-content: space-between !important;
    width: 100% !important;
    overflow-x: auto !important;
    padding-bottom: 5px !important;
  }
  
  .option-item-row {
    flex: 1 0 auto !important;
    min-width: 70px !important;
    margin-right: 10px !important;
    white-space: normal !important;
  }
  
  /* Grid layout - exact 2x2 grid */
  .options-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    grid-template-rows: auto auto !important;
    gap: 8px !important;
    width: 100% !important;
  }
  
  /* Column layout - stacked vertically */
  .options-column {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
  }
  
  .option-item-column {
    width: 100% !important;
    margin-bottom: 8px !important;
  }
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
  
  .question-wrapper {
    display: flex !important;
    width: 100% !important;
    page-break-inside: avoid !important;
  }
  
  .question-content {
    flex: 1 !important;
  }
  
  .question-marks {
    width: 100px !important;
    text-align: right !important;
  }
  
  .option-item-row, .option-item-grid, .option-item-column {
    page-break-inside: avoid !important;
  }
  
  .shuffle-button {
    display: none !important; /* Hide change button in print */
  }
  
  /* Ensure section headers don't break across pages */
  .section-header {
    page-break-inside: avoid !important;
    page-break-after: avoid !important;
  }
}

/* Mobile styles for fixed bottom buttons */
@media (max-width: 576px) {
  .container {
    padding-bottom: 100px !important; /* Further increased to accommodate the action buttons */
  }
  
  /* Mobile Change All Questions button */
  #changeAllButtonMobile {
    font-weight: 500;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
    font-weight: normal;
    padding: 6px 12px;
    border-radius: 4px;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-size: inherit;
    letter-spacing: normal;
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
  }
  
  @media (max-width: 576px) {
    /* Layout selector mobile positioning adjustments */
    .layout-selector {
      width: 90%;
      max-width: 270px;
    }
    
    .layout-cards {
      grid-gap: 8px;
    }
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
    transition: background-color 0.3s ease;
  }
  
  #changeAllButton:hover, .dynamic-style .btn:hover {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
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
  transition: background-color 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.3px;
}

#changeAllButton:hover:not(:disabled), #changeAllButtonMobile:hover:not(:disabled) {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

#changeAllButton:disabled, #changeAllButtonMobile:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

/* New custom button style matching TeacherProfile.vue but with dark button colors */
.btn-custom {
  border: 1px solid gray !important;
  background-color: #f8f9fa;
  color: black;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.btn-custom:hover {
  border: 1px solid #343a40 !important;
  background-color: #343a40 !important;
  color: white !important;
}

@media (max-width: 576px) {
  .btn-custom {
    border: 1px solid #212529 !important;
    background-color: #212529 !important;
    color: white !important;
  }
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add subtle shadow for depth */
}

/* Global Layout Selector Styles */
.global-layout-selector {
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 300px;
  padding: 15px;
  z-index: 1050;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.layout-options {
  margin-bottom: 15px;
}

.layout-option-title {
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
}

.layout-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
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
  padding: 5px;
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

.cancel-button {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 0.75rem 1rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  color: #333;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-button:hover {
  background-color: #e0e0e0;
}

/* Toast notification styles */
.layout-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  display: none;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.layout-toast.show-toast {
  display: block;
}

.layout-toast-content {
  display: flex;
  align-items: center;
}

.layout-toast i {
  margin-right: 10px;
}

/* Mobile action buttons at bottom */
.mobile-action-buttons {
  position: fixed;
  left: 0;
  right: 0;
  width: 100%;
  padding: 10px 15px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-action-buttons .btn {
  border-radius: 4px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mobile-action-buttons .btn:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Prevent text from wrapping */
.nowrap {
  white-space: nowrap;
}

/* Mobile layout fixes */
@media (max-width: 576px) {
  /* Row layout */
  .options-row {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: flex-start !important;
    gap: 8px !important;
  }
  
  /* Grid layout */
  .options-grid {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: space-between !important;
    gap: 8px !important;
  }
  
  .option-item-grid {
    flex: 0 0 48% !important;
    width: 48% !important;
    max-width: 48% !important;
  }
  
  /* Column layout */
  .options-column {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
  }
  
  .option-item-column {
    width: 100% !important;
  }
}

/* Layout previews for options */
.global-layout-selector {
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  width: 300px;
  padding: 15px;
  z-index: 1050;
  animation: fadeIn 0.2s ease-in-out;
}

@media (max-width: 576px) {
  .global-layout-selector {
    width: 90% !important;
    max-width: 320px !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    position: fixed !important;
    margin: 0 !important;
  }
}

/* Exam Instructions styles */
.exam-instructions-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
  max-width: 100%; /* Changed from 800px to 100% to fit A4 width */
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box; /* Ensure padding is included in width calculations */
}

.exam-instructions-container h5 {
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
}

.instructions-display, .instructions-edit-form {
  margin-top: 10px;
  width: 100%;
}

.instruction-list {
  list-style-type: disc !important;
  padding-left: 20px !important;
  margin-bottom: 0;
  text-align: left;
  max-width: 100%;
}

.instruction-list li {
  margin-bottom: 5px;
  line-height: 1.5;
  position: relative;
  text-align: left;
  word-wrap: break-word; /* Ensure long words wrap */
  overflow-wrap: break-word; /* Modern alternative to word-wrap */
  width: 100%;
  padding-right: 10px; /* Add some padding to avoid text touching the edge */
}

.instructions-edit-form .instruction-textarea {
  width: 100%;
  min-height: 120px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  resize: vertical; /* Allow vertical resizing only */
  white-space: pre-wrap; /* Preserve white space and wrap text */
  word-wrap: break-word; /* Break long words */
  overflow-wrap: break-word;
}

.instructions-edit-form button {
  margin-right: 10px;
}

/* Print-specific styles for instructions */
@media print {
  .exam-instructions-container {
    border: 1px solid #ddd;
    background-color: #fff !important;
    break-inside: avoid; /* Keep instructions together when printing */
    width: 100%;
    margin: 15px 0;
    page-break-inside: avoid;
  }
  
  .instruction-list li {
    page-break-inside: avoid;
  }
}

/* Mobile specific styles */
@media (max-width: 576px) {
  .exam-instructions-container {
    padding: 10px;
  }
  
  .instruction-list {
    padding-left: 15px !important;
  }
  
  .instructions-edit-form .instruction-textarea {
    min-height: 100px;
  }
}

/* Medium dropdown styles */
.medium-dropdown, .medium-dropdown-mobile {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1050;
  animation: fadeIn 0.2s ease-in-out;
  min-width: 180px;
}

.medium-dropdown-mobile {
  position: fixed;
  width: 90%;
  max-width: 250px;
  padding: 10px;
  border-radius: 8px;
  animation: fadeInDropdown 0.2s ease-out;
}

.medium-dropdown-header {
  font-weight: bold;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  color: #333;
}

.medium-dropdown-items {
  max-height: 250px;
  overflow-y: auto;
}

.medium-dropdown-item {
  padding: 8px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.medium-dropdown-item:hover {
  background-color: #f5f5f5;
}

.medium-dropdown-item.active {
  background-color: #e9f5ff;
  color: #007bff;
  font-weight: 500;
}

/* Add mobile styles for the medium button */
@media (max-width: 576px) {
  .medium-dropdown-mobile {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
  
  .medium-dropdown-item {
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .medium-dropdown-item:last-child {
    border-bottom: none;
  }
}

/* Styles for mobile medium button that appears after the title */
.medium-button-mobile {
  padding: 6px 10px;
  font-size: 0.9rem;
  white-space: nowrap;
  min-width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-left: auto; /* Push to right side if there's space */
}

/* Extra responsive styles for very small mobile screens */
@media (max-width: 375px) {
  .medium-button-mobile,
  .mobile-action-btn {
    padding: 5px 8px;
    font-size: 0.85rem;
  }
  
  .d-flex h5.fw-bolder,
  .mobile-title {
    font-size: 1rem;
  }
}

/* Mobile title style */
.mobile-title {
  font-size: 1.1rem;
}

/* Styles for mobile medium button that appears after the title */
.medium-button-mobile {
  padding: 6px 10px;
  font-size: 0.9rem;
  white-space: nowrap;
  min-width: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-left: auto; /* Push to right side if there's space */
}

/* Consistent styling for mobile action buttons */
.mobile-action-btn {
  padding: 6px 10px;
  font-size: 0.9rem;
}

/* Animation for dropdown that appears from top */
@keyframes fadeInDropdown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.medium-dropdown-mobile {
  position: fixed;
  width: 90%;
  max-width: 250px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1050;
  animation: fadeInDropdown 0.2s ease-out;
}

/* A4 Paper Card Styles */
.a4-paper-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 30px;
  overflow-x: auto; /* Add horizontal scrolling for small screens */
  -webkit-overflow-scrolling: touch; /* Smoother scrolling on iOS */
}

.a4-paper-card {
  width: 210mm; /* A4 width */
  background-color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 10mm; /* Standard A4 margins */
  border: 1px solid #ddd;
  margin: 0 auto;
  position: relative;
  overflow: visible;
  flex-shrink: 0; /* Prevent paper from shrinking */
  /* Add transition for smooth zoom effect */
  transition: transform 0.2s ease;
}

/* Mobile view mode styles */
.mobile-view {
  width: 100%;
  padding: 0;
  overflow-x: visible; /* Reset overflow behavior for mobile view */
}

.mobile-view .a4-paper-card {
  width: 100%; /* Allow full width for mobile view mode */
  min-width: auto; /* Allow to shrink in mobile view */
  max-width: 100%; /* Ensure it doesn't exceed screen width */
  min-height: auto;
  padding: 15px;
  box-shadow: none;
  border: none;
  margin: 0;
  overflow: visible;
  flex-shrink: 1; /* Allow shrinking in mobile view */
  transform: none !important; /* Reset any transform in mobile view */
}

/* For screens smaller than tablets, ensure A4 remains visible */
@media (max-width: 768px) {
  .a4-paper-container:not(.mobile-view) {
    justify-content: flex-start; /* Align to start for better scrolling UX */
    padding-bottom: 10px; /* Add space for scrollbar */
  }
  
  .a4-paper-container:not(.mobile-view)::after {
    content: '';
    display: block;
    width: 20px; /* Space after the A4 paper */
    flex-shrink: 0;
  }
}

/* For desktop screens, improve A4 display */
@media (min-width: 769px) {
  .preview-container {
    padding-bottom: 60px;
  }
  
  .a4-paper-container {
    max-width: 210mm; /* Limit to A4 width */
    margin-left: auto;
    margin-right: auto;
    overflow-x: visible; /* No horizontal scroll needed on desktop */
  }
  
  .a4-paper-card {
    max-width: 100%; /* Ensure it fits within container */
    box-shadow: 0 8px 24px rgba(0,0,0,0.12); /* Enhanced shadow for desktop */
  }
}

/* View Mode Toggle Styles */
.view-mode-toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
  background-color: rgba(255,255,255,0.9);
  padding: 5px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.form-check-input {
  margin-right: 10px;
}

.scroll-hint {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 5px;
  text-align: center;
}

/* Print styles for A4 paper */
@media print {
  .a4-paper-card {
    width: 210mm;
    height: 297mm;
    padding: 0;
    box-shadow: none;
    border: none;
    margin: 0;
  }
  
  /* Hide view mode toggle when printing */
  .view-mode-toggle-container {
    display: none !important;
  }
  
  /* Always use A4 preview mode when printing */
  .mobile-view .a4-paper-card {
    width: 210mm;
    min-height: 297mm;
    padding: 20mm;
  }
}
</style> 