<template>
  <div class="save-container">
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
        <!-- Save Status Alert -->
        <div v-if="saveRequested" class="alert mb-3 no-print" :class="{
          'alert-info': saveInProgress,
          'alert-success': saveComplete,
          'alert-danger': saveError
        }">
          <div v-if="saveInProgress" class="d-flex align-items-center">
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <strong>Saving test paper...</strong> Please wait while we process your test paper.
          </div>
          <div v-else-if="saveComplete">
            <i class="bi bi-check-circle me-2"></i>
            <strong>Test paper saved successfully!</strong> You can now print or go back.
          </div>
          <div v-else-if="saveError">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>Error saving test paper:</strong> {{ saveError }}
          </div>
        </div>
        
        <!-- Header with title and action button -->
        <div class="row mb-3 no-print">
          <div class="row justify-content-center align-items-center g-2 mb-4">
            <div class="col-12 col-sm-4">
              <h5 class="text-start m-0 fw-bolder">TEST PAPER</h5>
            </div>
            <div class="col-12 col-sm-8 dynamic-style text-end">
              <div class="d-flex flex-wrap justify-content-end align-items-center gap-2">
                <div class="d-flex gap-2">
                  <button 
                    class="btn btn-dark"
                    @click="printPage"
                    :disabled="saveInProgress"
                  >
                    <span v-if="saveInProgress">
                      <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Saving...
                    </span>
                    <span v-else>
                      <i class="bi bi-printer me-1"></i> Print
                    </span>
                  </button>
                  <button 
                    class="btn btn-secondary" 
                    @click="goBack"
                    :disabled="saveInProgress"
                  >
                    <i class="bi bi-arrow-left me-1"></i> Back
                  </button>
                </div>
              </div>
            </div>
          </div>
          <hr class="mt-2" />
        </div>

        <div class="paper-content" id="printSection">
          <div class="text-center document-header">
            <h5 class="school-name">{{ schoolName }}</h5>
            <h3 class="paper-title">{{ paperTitle }}</h3>
            <p style="margin-bottom: 5px;"><strong>Subject:</strong> {{ subjectName }} | <strong>Standard:</strong> {{ standardName }}</p>
            <p style="margin-top: 5px;">
              <strong>Time:</strong> {{ testDuration }} | <strong>Total Marks:</strong> {{ totalMarks }}
            </p>
            
            <!-- Exam Instructions Section - Only shown if instructions exist -->
            <div class="exam-instructions-container mt-4" v-if="examInstructions.length > 0">
              <h5 class="m-0 mb-2">Exam Instructions</h5>
              <div class="instructions-display">
                <ul class="text-start instruction-list">
                  <li v-for="(instruction, index) in examInstructions" :key="index">
                    {{ instruction }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr>

          <!-- Questions Section - MS Office A4 style layout -->
          <div class="a4-paper-section mb-4" 
            v-for="(section, sectionIndex) in testPaperSections" 
            :key="sectionIndex"
          >
            <!-- Section Header -->
            <div class="section-header">
              <div class="section-title"><strong>{{ section.sectionNumberDisplay ||  section.sectionNumber }} ) {{ section.sectionName }}</strong> <span class="nowrap">[ Any {{ section.mandotory_questions }} ]</span></div>
            
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
                      </div>
                        
                      <!-- MCQ Options -->
                      <div v-if="question.options && question.options.length > 0" class="options-container">
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
                    
                    <!-- Marks -->
                    <div class="question-marks">
                      <div class="marks-row">
                        <span class="marks fw-bold">{{ question.marks }}</span>
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
      
      <!-- Back to top button -->
      <div id="backToTop" class="d-flex no-print" @click="scrollToTop" style="display: none !important;">
        <i class="bi bi-arrow-up"></i>
      </div>

      <!-- Fixed back button for mobile only -->
      <div class="d-block d-sm-none mobile-back-button no-print" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </div>
      
      <!-- Fixed bottom bar with print button for mobile -->
      <div class="d-sm-none mobile-action-buttons no-print">
        <div class="d-flex justify-content-center align-items-center w-100">
          <button class="btn btn-dark flex-grow-1" @click="printPage" :disabled="saveInProgress">
            <span v-if="saveInProgress">
              <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Saving...
            </span>
            <span v-else>
              <i class="bi bi-printer me-1"></i> Print
            </span>
          </button>
        </div>  
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'

// Define component name (for linter)
defineOptions({
  name: 'SaveTestPaper'
})

// Setup router and route
const router = useRouter()
const route = useRoute()

// Loading state
const isLoading = ref(true)

// For options layout management
const DEFAULT_OPTION_LAYOUT = 'grid' // Default layout as grid
const optionsLayouts = ref<{[key: string]: string}>({})

// Get option layout for a specific question
const getOptionLayout = (sectionIndex: number, questionIndex: number) => {
  const key = `${sectionIndex}-${questionIndex}`
  return optionsLayouts.value[key] || DEFAULT_OPTION_LAYOUT // Default to grid layout
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

// Exam instructions loaded from localStorage
const examInstructions = ref<string[]>([])

// Get test details from query parameters or use defaults
const paperTitle = ref(decodeURIComponent(route.query.paperTitle as string || 'Test Paper'))
const testDuration = ref(route.query.testDuration as string || '1 Hour')
const standardName = computed(() => decodeURIComponent(route.query.standard as string || 'Not Selected'))
const subjectName = computed(() => decodeURIComponent(route.query.subject as string || 'Not Selected'))
const totalMarks = computed(() => route.query.totalMarks as string || '40')

// Define interface for image data
interface ImageData {
  id: number;
  presigned_url?: string;
  alt?: string;
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
  originalQuestion?: Question; // Changed from any to Question
  topicId?: number;
  chapterId?: number;
}

// Define interfaces for API data types
interface Question {
  id: number;
  question_type_id: number;
  question_type: {
    id: number;
    type_name: string;
  };
  question_texts: QuestionText[];
}

interface QuestionText {
  id: number;
  question_id: number;
  question_text: string;
  image_id: number | null;
  image: ImageData | null;
  mcq_options: McqOption[];
  match_pairs: MatchPair[];
  topic?: {
    id: number;
  };
  question_text_topics?: {
    id: number;
    question_text_id: number;
    question_topic_id: number;
    instruction_medium_id: number;
  }[];
}

interface McqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  is_correct: boolean;
  image_id: number | null;
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

interface ApiResponse {
  patternId: number;
  patternName?: string;
  totalMarks: number;
  absoluteMarks: number;
  sectionAllocations: {
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
    subsectionAllocations: {
      subsectionQuestionTypeId: number;
      section_id?: number;
      questionTypeName: string;
      sequentialNumber?: number;
      question_type_id?: number;
      question_type?: {
        id: number;
        type_name: string;
      };
      allocatedChapters: {
        chapterId: number;
        chapterName: string;
        question?: Question;
      }[];
    }[];
  }[];
  chapterMarks: {
    chapterId: number;
    chapterName: string;
    absoluteMarks: number;
  }[];
}

interface DisplaySection {
  sectionNumber: number;
  sectionName: string;
  totalMarks: number;
  questions: DisplayQuestion[];
  subSection?: string;
  sectionNumberDisplay?: string;
  mandotory_questions?: number;
}

// Test paper sections
const testPaperSections = ref<DisplaySection[]>([])

// Store raw API data for debugging
const apiData = ref<ApiResponse | null>(null)

// Check if this page should save the test paper to the API
const saveRequested = ref(route.query.saveRequested === 'true')
const saveInProgress = ref(false)
const saveComplete = ref(false)
const saveError = ref<string | null>(null)

// Function to save the test paper as PDF and call the API
const saveTestPaperToDB = async () => {
  if (!saveRequested.value || saveInProgress.value || saveComplete.value) {
    console.log('Save conditions not met:', { 
      saveRequested: saveRequested.value, 
      saveInProgress: saveInProgress.value, 
      saveComplete: saveComplete.value 
    });
    return;
  }
  
  console.log('Starting save process for test paper...');
  saveInProgress.value = true;
  saveError.value = null;
  
  try {
    // Wait for the page to fully render
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 500)); // Extra delay to ensure DOM is ready
    
    // Make sure we have the necessary data
    const userId = route.query.userId;
    const schoolId = route.query.schoolId;
    const chapters = route.query.chapters ? JSON.parse(decodeURIComponent(route.query.chapters as string)) : [];
    const weightages = route.query.weightages ? JSON.parse(decodeURIComponent(route.query.weightages as string)) : [];
    
    console.log('Parsed data for API call:', { userId, schoolId, chapters, weightages });
    
    if (!userId || !schoolId || chapters.length === 0 || weightages.length === 0) {
      throw new Error('Missing required data for saving test paper');
    }
    
    // Get the content element
    const element = document.getElementById('printSection');
    if (!element) {
      console.error('Print section element not found!');
      console.log('Available elements with IDs:', 
        Array.from(document.querySelectorAll('[id]')).map(el => ({ id: el.id, tagName: el.tagName }))
      );
      throw new Error('Print section not found');
    }
    console.log('Found printSection element:', element);
    
    // Import the library dynamically
    console.log('Importing html2pdf library...');
    let html2pdf;
    try {
      html2pdf = (await import('html2pdf.js')).default;
      console.log('html2pdf library loaded successfully');
    } catch (importError) {
      console.error('Failed to import html2pdf library:', importError);
      throw new Error('Failed to load PDF generation library');
    }
    
    // Generate PDF from the element
    console.log('Starting PDF generation...');
    const pdfBlob = await new Promise<Blob>((resolve, reject) => {
      const opt = {
        margin: 10,
        filename: 'test-paper.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: true, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().set(opt).from(element).outputPdf('blob')
        .then(blob => {
          console.log('PDF generated successfully, blob size:', blob.size);
          resolve(blob);
        })
        .catch(error => {
          console.error('Error generating PDF:', error);
          reject(error);
        });
    });
    
    console.log('PDF blob created, size:', pdfBlob.size, 'bytes');
    
    // Prepare form data
    const formData = new FormData();
    
    // Add required fields
    formData.append('name', paperTitle.value);
    formData.append('exam_time', testDuration.value);
    formData.append('pattern_id', (route.query.patternId as string) || '1');
    formData.append('test_paper_origin_type', 'both');
    
    // Add chapters and weightages
    chapters.forEach((chapterId: number) => {
      formData.append('chapters', chapterId.toString());
    });
    
    weightages.forEach((weightage: number) => {
      formData.append('weightages', weightage.toString());
    });
    
    // Add instruction mediums (just English for now)
    formData.append('instruction_mediums', '1');
    
    // Add the PDF file
    const file = new File([pdfBlob], 'test-paper.pdf', { type: 'application/pdf' });
    formData.append('files', file);
    
    console.log('FormData prepared, making API call...');
    
    // Make the API call
    const response = await axiosInstance.post(
      `/test-paper-html/create?userId=${userId}&schoolId=${schoolId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    console.log('API response received:', response);
    
    if (response.status === 201) {
      console.log('Test paper saved successfully:', response.data);
      saveComplete.value = true;
      
      // Show success message
      alert('Test paper saved successfully!');
      
      // Navigate to a confirmation or test papers list page
      // router.push({ name: 'testPapersList' });
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error saving test paper:', error);
    saveError.value = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(`Failed to save test paper: ${saveError.value}`);
  } finally {
    saveInProgress.value = false;
  }
};

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

// Load data from localStorage
const loadStoredData = () => {
  try {
    // Check if lastUsedEndpoint is in the route query
    const endpointFromRoute = route.query.lastUsedEndpoint as string;
    const endpoint = endpointFromRoute || localStorage.getItem('lastUsedEndpoint') as string;
    
    // Load appropriate data
    if (endpoint === 'distribute') {
      const storedData = localStorage.getItem('distributeData');
      return storedData ? JSON.parse(storedData) : null;
    } else {
      const storedData = localStorage.getItem('allocationData');
      return storedData ? JSON.parse(storedData) : null;
    }
  } catch (e) {
    console.error('Error loading stored data:', e);
    return null;
  }
}

// Fetch test paper questions from API
const fetchTestPaperQuestions = async (storedData?: ApiResponse) => {
  try {
    // Use stored data if available, otherwise create request data
    const requestData = storedData;
    
    if (!requestData) {
      console.error('No data available to display test paper');
      return;
    }

    // Make the API call
    const response = await axiosInstance.post('/chapter-marks-distribution/final-questions-distribution', requestData)
    
    if (response.data) {
      apiData.value = response.data;
      transformApiDataToDisplayFormat(response.data);
      console.log('Successfully fetched test paper questions');
    } else {
      console.error('Unexpected API response format:', response);
    }
  } catch (error) {
    console.error('Error fetching test paper questions:', error);
  }
}

// Transform API data to display format (same as in testPaperPreview.vue)
const transformApiDataToDisplayFormat = (data: ApiResponse) => {
  if (!data || !data.sectionAllocations) {
    return;
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
          const questionText = question.question_texts[0]; // Using the first question text
          
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
            marks: section.marks_per_question || Math.ceil(section.totalMarks / section.totalQuestions),
            questionType: question.question_type.type_name,
            topicId: topicId
          };

          // Process MCQ options if they exist
          if (questionText.mcq_options && questionText.mcq_options.length > 0) {
            displayQuestion.options = questionText.mcq_options.map((option: McqOption, index: number) => {
              return {
                label: String.fromCharCode(65 + index), // A, B, C, D...
                text: option.option_text,
                isCorrect: option.is_correct
              };
            });
          }

          // Process match pairs if they exist
          if (questionText.match_pairs && questionText.match_pairs.length > 0) {
            displayQuestion.matchPairs = questionText.match_pairs.map((pair: MatchPair) => {
              return {
                leftText: pair.left_text,
                rightText: pair.right_text
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

// Print page functionality
const printPage = () => {
  // Add temporary class to the document body
  document.body.classList.add('printing-test-paper');
  
  // Hide the app header or navigation before printing
  const appHeader = document.querySelector('header');
  const appNav = document.querySelector('nav');
  
  if (appHeader) appHeader.classList.add('no-print-important');
  if (appNav) appNav.classList.add('no-print-important');
  
  // Trigger print
  window.print();
  
  // Remove temporary class after printing dialog closes
  setTimeout(() => {
    document.body.classList.remove('printing-test-paper');
    if (appHeader) appHeader.classList.remove('no-print-important');
    if (appNav) appNav.classList.remove('no-print-important');
  }, 1000);
}

// Go back button handler
const goBack = () => {
  router.back();
}

// Scroll to top functionality
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize component data
const initializeComponent = async () => {
  isLoading.value = true;
  try {
    // Load user profile and school name
    await fetchUserProfile();
    
    // Load exam instructions from localStorage if they exist
    const savedInstructions = localStorage.getItem('examInstructions');
    if (savedInstructions) {
      try {
        examInstructions.value = JSON.parse(savedInstructions);
      } catch (e) {
        console.error('Error parsing saved instructions:', e);
      }
    }
    
    // Load data from localStorage
    const storedData = loadStoredData();
    
    // Fetch test paper questions
    await fetchTestPaperQuestions(storedData);
    
    console.log('Test paper initialized with data from API');
  } catch (error) {
    console.error('Error initializing save test paper:', error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  // Initialize the component with data
  initializeComponent();
  
  // Add scroll event listener for back-to-top button visibility
  window.addEventListener('scroll', handleScroll);
  
  // Call handleScroll initially to set the correct visibility
  handleScroll();
  
  // If save was requested, trigger the save operation after a short delay
  if (saveRequested.value) {
    setTimeout(() => {
      saveTestPaperToDB();
    }, 1000); // Give the page time to fully render
  }
});

onBeforeUnmount(() => {
  // Remove event listeners
  window.removeEventListener('scroll', handleScroll);
});

// Show/hide back-to-top button based on scroll position
const handleScroll = () => {
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    if (window.scrollY > 300) {
      backToTopBtn.style.cssText = 'display: flex !important;';
    } else {
      backToTopBtn.style.cssText = 'display: none !important;';
    }
  }
}
</script>

<style scoped>
/* Main styles */
.save-container {
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
  width: 60px;
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

/* Define no-print class to hide elements when printing */
.no-print {
  display: inherit;
}

/* Print styles - optimize for A4 printing */
@media print {
  /* Hide elements not needed in print */
  .no-print {
    display: none !important;
  }
  
  /* Hide global header and navigation elements */
  header, nav, .navbar, .app-header, .site-header, .main-header, 
  .header-container, .header-wrapper, .global-header, .site-logo {
    display: none !important;
  }
  
  /* Target specific header logo (modify these selectors as needed based on your app structure) */
  img[src*="logo"], .logo, .brand-logo, .app-logo, .header-logo {
    display: none !important;
  }
  
  /* Remove any top margin that might be causing space for the header */
  body, html, #app, .app-container, main, .main-content {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
  
  /* Force the main content to start at the very top of the page */
  #printSection {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  
  body {
    background-color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  .save-container {
    box-shadow: none;
    padding: 0;
    width: 210mm;
  }
  
  #backToTop, 
  .mobile-back-button, 
  .mobile-action-buttons {
    display: none !important;
  }
  
  /* New page break rules for sections and questions */
  .a4-paper-section {
    /* Allow section content to flow across pages as needed */
    page-break-inside: auto;
    break-inside: auto;
  }
  
  .section-header {
    /* Keep section header with at least some content */
    page-break-after: avoid;
    break-after: avoid;
    /* Don't start section header at the bottom of a page */
    page-break-before: auto;
    break-before: auto;
    background-color: white !important;
  }
  
  /* Individual question handling */
  .question-item {
    /* Each question should not be split across pages */
    page-break-inside: avoid;
    break-inside: avoid;
    /* But questions should break between them if needed */
    page-break-after: auto;
    break-after: auto;
    /* Don't force a single question to a new page unless it won't fit */
    page-break-before: auto; 
    break-before: auto;
  }
  
  /* Ensure MCQ options stay together with their question */
  .options-container {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  /* Match pairs should also stay together */
  .match-pairs-container {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  
  .question-list {
    padding-left: 25px !important; /* Ensure padding is preserved when printing */
  }
  
  .question-divider {
    display: none !important; /* Ensure dividers are hidden when printing */
    border-color: #eee !important;
  }
  
  .question-type-badge {
    display: none;
  }
  
  /* Allow content to start from the top of the page */
  .paper-content {
    margin-top: 0 !important;
  }
  
  /* Remove any unnecessary margins/paddings */
  .container {
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
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
  
  /* Allow text to wrap in options */
  .option-text {
    word-break: break-word;
    hyphens: auto;
  }
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

/* Mobile styles */
@media (max-width: 576px) {
  .container {
    padding-bottom: 100px !important; /* Increased to accommodate the action buttons */
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
  
  /* Fixed bottom bar with action buttons */
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
    padding: 10px 15px;
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
  
  /* Optimize document header for small screens */
  .document-header {
    padding: 0 10px;
  }
  
  .paper-title {
    font-size: 1.2rem;
    line-height: 1.3;
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
  
  /* Back to top button position for mobile */
  #backToTop {
    bottom: 120px;
    right: 15px;
  }
}

/* Prevent text from wrapping */
.nowrap {
  white-space: nowrap;
}

/* Exam Instructions styles */
.exam-instructions-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
  background-color: #f9f9f9;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.exam-instructions-container h5 {
  margin-bottom: 10px;
  font-weight: 600;
  color: #333;
}

.instructions-display {
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
  word-wrap: break-word;
  overflow-wrap: break-word;
  width: 100%;
  padding-right: 10px;
}

@media print {
  .exam-instructions-container {
    border: 1px solid #ddd;
    background-color: #fff !important;
    break-inside: avoid;
    width: 100%;
    margin: 15px 0;
    page-break-inside: avoid;
  }
  
  .instruction-list li {
    page-break-inside: avoid;
  }
}
</style>

<style>
/* Global styles that will affect elements outside of this component */
@media print {
  /* Hide header and navigation when printing */
  header, nav, .navbar, .app-header, .site-header, .main-header, 
  .header-container, .header-wrapper, .global-header {
    display: none !important;
    height: 0 !important;
    visibility: hidden !important;
    opacity: 0 !important;
    overflow: hidden !important;
  }
  
  /* Important style to fully hide elements when printing */
  .no-print-important {
    display: none !important;
    height: 0 !important;
    visibility: hidden !important;
    opacity: 0 !important;
    overflow: hidden !important;
  }
  
  /* When printing, ensure the body starts at the top of the page */
  body.printing-test-paper {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
  
  /* Hide any possible logo elements */
  img[alt*="logo"], img[src*="logo"], .logo, .brand-logo, .app-logo {
    display: none !important;
  }
  
  /* Override any margins set by parent elements */
  #app, .app-container, main, .main-content {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
}
</style>
