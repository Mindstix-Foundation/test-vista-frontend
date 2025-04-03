<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'questionBank' }" aria-label="Close"></router-link>
      </div>
      <div class="row justify-content-center align-items-center">
        <div class="col col-12 col-sm-5">
          <p class="text-muted text-start fs-6 m-0">
            <span class="col-12 col-md-auto">{{ questionBankData.boardName }} | </span>
            <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark m-0">
           Standard {{ questionBankData.standardName }}
            <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} | {{ questionBankData.chapterName }}</span>
          </h4>
        </div>
        <div class="col col-12 col-sm-5 dynamic-style text-end align-self-end">
          <div class="row justify-content-end align-items-end g-2">
            <div class="col col-5 col-sm-auto text-end">
              <router-link class="btn btn-dark stick-bottom" :to="{ name: 'addQuestion' }" id="addButton">Add Questions</router-link>
            </div>
            <div class="col col-7 col-sm-auto text-end">
              <router-link class="btn btn-light position-relative" style="border: 1px solid gray !important;" id="addButton" :to="{ name: 'translationPending' }">
                Translation Pending
                <span class="badge bg-danger">
                  {{ translationPendingCount > 99 ? '99+' : translationPendingCount }}
                  <span class="visually-hidden">translation pending questions</span>
                </span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
      <hr>
    </div>

    <div id="questionsSection" class="container">
      <div class="container mb-4">
        <div class="row g-2 my-2 justify-content-center">
          <div class="col-12 col-md-10">
            <!-- Search, Sort and Filter in One Row (styled like PatternDashboard) -->
            <div class="d-flex gap-2 mb-2">
              <!-- Search Bar -->
              <div class="search-field flex-grow-1">
                <i class="bi bi-search search-icon"></i>
                <input
                  type="text"
                  class="form-control search-input"
                  id="searchBar"
                  placeholder="Search questions..."
                  v-model="searchQuery"
                  @input="handleSearchInput"
                  autocomplete="off"
                  ref="searchInputRef"
                />
                <i v-if="isSearching" class="bi bi-arrow-repeat search-loading-icon"></i>
                <i v-else-if="searchQuery" class="bi bi-x-circle clear-search-icon" @click="clearSearch"></i>
              </div>

              <!-- Sort Dropdown -->
              <div class="sort-field" style="min-width: 220px;">
                <select class="form-select sort-select" id="sortSelect" v-model="sortOption" @change="filterCards">
                  <option value="question_text_asc">Sort by Question (A-Z)</option>
                  <option value="question_text_desc">Sort by Question (Z-A)</option>
                  <option value="question_type_id_asc">Sort by Question Type (A-Z)</option>
                  <option value="question_type_id_desc">Sort by Question Type (Z-A)</option>
                  <option value="created_at_asc">Sort by Created (Oldest)</option>
                  <option value="created_at_desc">Sort by Created (Newest)</option>
                  <option value="updated_at_asc">Sort by Updated (Oldest)</option>
                  <option value="updated_at_desc">Sort by Updated (Newest)</option>

                </select>
              </div>

              <!-- Filter Button -->
              <div class="filter-field">
                <button
                  class="btn filter-btn"
                  @click="toggleFilterIcon"
                  aria-expanded="false"
                  aria-controls="filter"
                  :class="{ 'active': isFilterOpen }"
                >
                  <i class="bi bi-funnel"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Collapsible Filter Section -->
        <div class="row g-2 justify-content-center">
          <div class="col-12 col-md-10 collapse" id="filter">
            <div class="card border-0">
              <div class="card-body">
                <div class="container p-0">
                  <div class="row g-2 mb-2">
                    <div class="col-md-6">
                      <SearchableDropdown
                        id="filterTopic"
                        label="Filter by Topic"
                        placeholder="Select Topic"
                        :items="topics"
                        v-model="selectedTopicObj"
                        labelKey="name"
                        valueKey="id"
                        @change="filterCards"
                        :required="false"
                      />
                    </div>
                    <div class="col-md-6">
                      <SearchableDropdown
                        id="filterType"
                        label="Filter by Type"
                        placeholder="Select Type"
                        :items="questionTypes"
                        v-model="selectedTypeObj"
                        labelKey="type_name"
                        valueKey="id"
                        @change="filterCards"
                        :required="false"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Verified/Unverified Toggle Section - Always Visible -->
        <div class="row g-2 my-2 justify-content-center">
          <div class="col-12 col-md-10">
            <div class="row mb-2 justify-content-end align-items-center">
              <!-- First column: Label Before -->
              <div class="col-auto text-end">
                <label id="verifiedLabel" class="form-check-label fw-bold" :class="{ 'text-dark': !showUnverified, 'text-secondary': showUnverified }" for="flexSwitchCheckBefore">Verified</label>
              </div>

              <!-- Second column: The Switch -->
              <div class="col-auto text-center">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="flexSwitchCheckBefore" v-model="showUnverified">
                </div>
              </div>

              <!-- Third column: Label After -->
              <div class="col-auto text-start">
                <label id="unverifiedLabel" class="form-check-label fw-bold" :class="{ 'text-dark': showUnverified, 'text-secondary': !showUnverified }" for="flexSwitchCheckBefore">Unverified</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !isSearching" class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Content when data is loaded -->
      <div class="container mb-5">
        <!-- Verified Questions -->
        <div class="row g-2 justify-content-center position-relative" id="verifiedContainer" v-show="!showUnverified">
          <!-- Loading overlay for search -->
          <div v-if="isSearching" class="search-loading-overlay">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Searching...</span>
            </div>
          </div>

          <div v-for="(question, index) in filteredVerifiedQuestions" :key="'verified-' + index" class="col-12 col-md-10">
            <div class="card" :data-unique-id="'verified-' + index" :class="{ 'card-searching': isSearching }">
              <div class="row g-0">
                <div class="col-12">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span v-if="question.translationStatus" class="badge bg-dark me-1">{{ getTranslationStatusText(question.translationStatus) }}</span>
                        <span v-if="question.isPreviousExam" class="badge bg-info">Board Exam</span>
                      </div>
                      <div class="text-end ms-auto">
                        <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                        <i class="bi bi-eraser fs-4 mx-2" @click="openRemoveConfirmationModal(index, 'verified')"></i>
                        <i class="bi bi-trash3 fs-4 ms-2" @click="openDeleteConfirmationModal(index, 'verified')"></i>
                      </div>
                    </div>

                    <!-- Replace the blockquote and all question display with QuestionDisplay component -->
                    <QuestionDisplay
                      :question="question.question"
                      :questionId="question.id"
                      :questionNumber="(currentPage - 1) * pageSize + index + 1"
                      :questionType="question.type"
                      :topics="question.topics"
                      :options="question.options"
                      :correctOptionIndex="question.correctOptionIndex"
                      :lhs="question.lhs"
                      :rhs="question.rhs"
                      :lhsImages="question.lhsImages"
                      :rhsImages="question.rhsImages"
                      :correctAnswer="question.correctAnswer"
                      :imageUrl="question.imageUrl"
                      :optionImages="question.optionImages"
                      :isPreviousExam="question.isPreviousExam"
                      :showFooter="true"
                      :highlightCorrect="true"
                      :questionTextMaxLength="questionTextMaxLength"
                      :optionTextMaxLength="optionTextMaxLength"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-if="filteredVerifiedQuestions.length === 0 && !isSearching" class="col-12 col-md-10 text-center my-5">
            <p class="text-muted">No matching questions found.</p>
          </div>
        </div>

        <!-- Unverified Questions -->
        <div class="row g-2 justify-content-center position-relative" id="unverifiedContainer" v-show="showUnverified">
          <!-- Loading overlay for search -->
          <div v-if="isSearching" class="search-loading-overlay">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">Searching...</span>
            </div>
          </div>

          <div v-for="(question, index) in filteredUnverifiedQuestions" :key="'unverified-' + index" class="col-12 col-md-10">
            <div class="card" :class="{ 'card-searching': isSearching }" :data-unique-id="'unverified-' + index">
              <div class="row g-0">
                <div class="col-12">
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span v-if="question.translationStatus" class="badge bg-dark me-1">{{ getTranslationStatusText(question.translationStatus) }}</span>
                        <span v-if="question.isPreviousExam" class="badge bg-info">Board Exam</span>
                      </div>
                      <div class="text-end ms-auto">
                        <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                        <i class="bi bi-eraser fs-4 mx-2" @click="openRemoveConfirmationModal(index, 'unverified')"></i>
                        <i class="bi bi-check-lg fs-4 ms-2" @click="openVerifyConfirmationModal(index)"></i>
                      </div>
                    </div>

                    <!-- Replace the blockquote and all question display with QuestionDisplay component -->
                    <QuestionDisplay
                      :question="question.question"
                      :questionId="question.id"
                      :questionNumber="(currentPage - 1) * pageSize + index + 1"
                      :questionType="question.type"
                      :topics="question.topics"
                      :options="question.options"
                      :correctOptionIndex="question.correctOptionIndex"
                      :lhs="question.lhs"
                      :rhs="question.rhs"
                      :lhsImages="question.lhsImages"
                      :rhsImages="question.rhsImages"
                      :correctAnswer="question.correctAnswer"
                      :imageUrl="question.imageUrl"
                      :optionImages="question.optionImages"
                      :isPreviousExam="question.isPreviousExam"
                      :showFooter="true"
                      :highlightCorrect="true"
                      :questionTextMaxLength="questionTextMaxLength"
                      :optionTextMaxLength="optionTextMaxLength"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-if="filteredUnverifiedQuestions.length === 0 && !isSearching" class="col-12 col-md-10 text-center my-5">
            <p class="text-muted">No matching questions found.</p>
          </div>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="row mt-3 p-2 justify-content-center mb-5">
        <div class="col-12 col-md-10">
          <div class="d-flex justify-content-between align-items-center">
            <!-- Pagination Info -->
            <div class="text-muted">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to
              {{ Math.min(currentPage * pageSize, totalItems) }} of {{ totalItems }} entries
            </div>

            <!-- Pagination Buttons -->
            <nav aria-label="Question pagination">
              <ul class="pagination mb-0">
                <!-- Previous Page Button -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>

                <!-- Page Numbers -->
                <li v-for="page in visiblePageNumbers" :key="page" class="page-item"
                    :class="{ active: page === currentPage, disabled: page === '...' }">
                  <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="changePage(Number(page))">{{ page }}</a>
                  <span v-else class="page-link">...</span>
                </li>

                <!-- Next Page Button -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification
      :show="showToast"
      :title="toastTitle"
      :message="toastMessage"
      :type="toastType"
      @close="closeToast"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axiosInstance from '@/config/axios'
import { Modal, Collapse } from 'bootstrap'
import ToastNotification from '@/components/common/ToastNotification.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import { useToastStore } from '@/store/toast'
import QuestionDisplay from '@/components/questiondisplay/QuestionDisplay.vue'

// Define interfaces for API response
interface ApiTopic {
  id: number;
  chapter_id: number;
  name: string;
}

interface ApiImage {
  id: number;
  original_filename: string;
  file_size: number;
  file_type: string;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
  presigned_url: string;
}

interface ApiMcqOption {
  id: number;
  question_text_id: number;
  option_text: string;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
  image_id?: number | null;
  image?: ApiImage | null;
}

interface ApiMatchPair {
  id: number;
  question_text_id: number;
  left_text: string;
  right_text: string;
  left_image_id: number | null;
  right_image_id: number | null;

  created_at: string;
  updated_at: string;
  left_image: ApiImage | null;
  right_image: ApiImage | null;
}

interface ApiQuestionText {
  id: number;
  question_id: number;
  image_id: number | null;
  question_text: string;
  created_at?: string;
  updated_at?: string;
  image: ApiImage | null;
  mcq_options: ApiMcqOption[];
  match_pairs: ApiMatchPair[];
  topic: ApiTopic;
  translation_status?: string;
  answer_text?: string;
}

interface ApiQuestionType {
  id: number;
  type_name: string;
}

interface ApiQuestion {
  id: number;
  board_question: boolean;
  question_type: ApiQuestionType;
  question_texts: ApiQuestionText[];
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
}

// Define interfaces for component's internal use
interface Topic {
  id: number;
  name: string;
  topic: string;  // Make sure the topic property is defined in the interface
}

interface Question {
  id: number;
  question: string;
  type: string;
  typeId: number;
  topics: Topic[];
  options?: string[];
  correctOptionIndex?: number;
  lhs?: string[];
  rhs?: string[];
  correctAnswer?: string;
  topic?: string;
  isPreviousExam: boolean;
  isVerified: boolean;
  imageId?: number | null;
  imageUrl?: string | null;
  correctCorrelation?: number[];
  question_text_id?: number;
  optionImages?: string[];
  translationStatus?: string;
  lhsImages?: string[];
  rhsImages?: string[];
}

// Component name (for linter)
defineOptions({
  name: 'QuestionDashboard'
})

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()

// Data from localStorage
const questionBankData = ref({
  boardId: '',
  boardName: '',
  mediumId: '',
  mediumName: '',
  standardId: '',
  standardName: '',
  subjectId: '',
  subjectName: '',
  chapterId: '',
  chapterName: '',
  mediumStandardSubjectId: null
})

// Questions data
const verifiedQuestions = ref<Question[]>([])
const unverifiedQuestions = ref<Question[]>([])
const topics = ref<Topic[]>([])
const questionTypes = ref<{ id: number; type_name: string }[]>([])

// UI state
const searchQuery = ref('')
const selectedTopicObj = ref<{ id: number; name: string } | null>(null)
const selectedTypeObj = ref<{ id: number; type_name: string } | null>(null)
const showUnverified = ref(false)
const isFilterOpen = ref(false)
const isSearching = ref(false)
const isLoading = ref(true)
const searchInputRef = ref<HTMLInputElement | null>(null)
const sortOption = ref('question_text_asc')
const searchTimeout = ref<number | null>(null)
const translationPendingCount = ref(0)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

// Toast notification state
const showToast = ref(false)
const toastTitle = ref('')
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info' | 'warning'>('info')

// Add this to the script section - new data properties
// expandedQuestions was removed since question display is now handled by QuestionDisplay component
const questionTextMaxLength = 250; // Characters before truncating
const optionTextMaxLength = 80;  // Characters before truncating for options

// Computed properties to extract IDs from selected objects
const selectedTopic = computed<number | null>(() => selectedTopicObj.value?.id || null)
const selectedType = computed<number | null>(() => selectedTypeObj.value?.id || null)

// Type definitions for sort mappings and type mappings
interface SortOption {
  sort_by: string;
  sort_order: string;
}

// Mapping for sort options to API parameters
const sortMappings: Record<string, SortOption> = {
  'question_text_asc': { sort_by: 'question_text', sort_order: 'asc' },
  'question_text_desc': { sort_by: 'question_text', sort_order: 'desc' },
  'question_type_id_asc': { sort_by: 'question_type_id', sort_order: 'asc' },
  'question_type_id_desc': { sort_by: 'question_type_id', sort_order: 'desc' },
  'created_at_asc': { sort_by: 'created_at', sort_order: 'asc' },
  'created_at_desc': { sort_by: 'created_at', sort_order: 'desc' },
  'updated_at_asc': { sort_by: 'updated_at', sort_order: 'asc' },
  'updated_at_desc': { sort_by: 'updated_at', sort_order: 'desc' }
}

// Computed properties for filtered questions
const filteredVerifiedQuestions = computed(() => verifiedQuestions.value)

const filteredUnverifiedQuestions = computed(() => unverifiedQuestions.value)

// Computed property to determine which page numbers to show
const visiblePageNumbers = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  if (totalPages.value <= maxVisiblePages) {
    // Show all pages if there are few pages
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    // Calculate start and end of visible pages
    let startPage = Math.max(2, currentPage.value - 1)
    let endPage = Math.min(totalPages.value - 1, currentPage.value + 1)

    // Adjust if we're near the beginning
    if (currentPage.value <= 3) {
      endPage = Math.min(totalPages.value - 1, 4)
    }

    // Adjust if we're near the end
    if (currentPage.value >= totalPages.value - 2) {
      startPage = Math.max(2, totalPages.value - 3)
    }

    // Add ellipsis if needed before visible pages
    if (startPage > 2) {
      pages.push('...')
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Add ellipsis if needed after visible pages
    if (endPage < totalPages.value - 1) {
      pages.push('...')
    }

    // Always show last page
    pages.push(totalPages.value)
  }

  return pages
})

// Methods
function handleSearchInput() {
  // Set searching state for visual feedback
  isSearching.value = true;

  // Clear any existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Set a new timeout
  searchTimeout.value = setTimeout(() => {
    // Reset to first page when search changes
    currentPage.value = 1;
    fetchQuestions();
  }, 500) as unknown as number; // TypeScript type assertion for timer
}

function clearSearch() {
  searchQuery.value = '';
  // Reset to first page when clearing search
  currentPage.value = 1;
  isSearching.value = true; // Set to loading state for visual feedback
  fetchQuestions();

  // Maintain focus on the search input after clearing
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
}

function filterCards() {
  // Reset to first page when filters change
  currentPage.value = 1;
  fetchQuestions();
}

function toggleFilterIcon() {
  // Toggle the filter state
  isFilterOpen.value = !isFilterOpen.value;

  // Manually toggle the collapse using Bootstrap's Collapse class
  const filterElement = document.getElementById('filter');
  if (filterElement) {
    // Get or create a collapse instance
    let bsCollapse = Collapse.getInstance(filterElement);
    if (!bsCollapse) {
      bsCollapse = new Collapse(filterElement, {
        toggle: false
      });
    }

    // Toggle the collapse
    bsCollapse.toggle();

    // Toggle active class on the filter button
    const filterBtn = document.querySelector('.filter-btn');
    if (filterBtn) {
      if (isFilterOpen.value) {
        filterBtn.classList.add('active');
      } else {
        filterBtn.classList.remove('active');
        // Clear filters when closing
        clearFilters();
      }
    }
  }
}

function clearFilters() {
  // Reset filter values
  selectedTopicObj.value = null;
  selectedTypeObj.value = null;
  // Update filtered results
  filterCards();
}

function editQuestion(question: Question) {
  // Check if this is a translated question
  if (question.translationStatus === 'translated') {
    // Navigate to edit translation page with question ID
    router.push({
      name: 'editTranslation',
      params: {
        id: question.id
      }
    });
  } else {
    // Navigate to regular edit question page with question ID
    router.push({
      name: 'editQuestion',
      params: {
        id: question.id
      }
    });
  }
}

function openRemoveConfirmationModal(index: number, type: 'verified' | 'unverified') {
  createConfirmationModal({
    title: 'Remove Question',
    titleClass: 'bg-warning text-black',
    message: 'Are you sure you want to remove this question from this Chapter?',
    confirmButtonClass: 'btn-warning',
    confirmButtonText: 'Remove',
    onConfirm: () => {
      // Get the question based on type
      const question = type === 'verified' ? verifiedQuestions.value[index] : unverifiedQuestions.value[index];
      // Call removeQuestionFromChapter for both verified and unverified questions
      removeQuestionFromChapter(question, index, type);
    }
  });
}

function openDeleteConfirmationModal(index: number, type: 'verified' | 'unverified') {
  createConfirmationModal({
    title: 'Delete Question Text',
    titleClass: 'bg-danger text-white',
    message: 'Are you sure you want to delete this question text from the Question Bank? This will not delete the entire question itself.',
    confirmButtonClass: 'btn-danger',
    confirmButtonText: 'Delete',
    onConfirm: () => {
      if (type === 'unverified') {
        deleteUnverifiedQuestion(index);
      } else {
        // For verified questions, delete the question text, not the entire question
        const question = verifiedQuestions.value[index];
        deleteVerifiedQuestion(question, index);
      }
    }
  });
}

function openVerifyConfirmationModal(index: number) {
  // Get the question from our unverified questions
  const question = unverifiedQuestions.value[index];

  // Determine if this is a translated question
  const isTranslated = question.translationStatus === 'translated';

  // Set appropriate message based on translation status
  const message = isTranslated
    ? 'Are you sure you want to verify this translated question in the Question Bank?'
    : 'Are you sure you want to verify this original question in the Question Bank?';

  // If this is a translated question, we need to check if the original is verified
  if (isTranslated && question.topics && question.topics.length > 0) {
    const topicId = question.topics[0].id;

    // Show loading message while we check the original
    const modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = 'loadingModal';
    modalElement.setAttribute('tabindex', '-1');
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.setAttribute('data-bs-backdrop', 'static');
    modalElement.setAttribute('data-bs-keyboard', 'false');

    modalElement.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body text-center p-4">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mb-0">Checking original question status...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalElement);
    const loadingModal = new Modal(modalElement);
    loadingModal.show();

    // Function to properly clean up loading modal
    const cleanupLoadingModal = () => {
      loadingModal.hide();
      setTimeout(() => {
        modalElement.remove();

        // Clean up any remaining backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
          backdrop.remove();
        });

        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
      }, 300);
    };

    // Check if the original question is verified
    axiosInstance.get(`/questions/${question.id}/topic/${topicId}/verified-texts`)
      .then(response => {
        cleanupLoadingModal();

        setTimeout(() => {
          // If we have verified texts, proceed with normal verify modal
          if (response.data && response.data.question_texts && response.data.question_texts.length > 0) {
            showVerifyModal(message, index);
          } else {
            // If no verified texts, show error modal instead
            createConfirmationModal({
              title: 'Cannot Verify Translation',
              titleClass: 'bg-warning text-black',
              message: 'The original question has not been verified yet. You cannot verify a translation before the original question is verified.',
              confirmButtonClass: 'btn-warning',
              confirmButtonText: 'OK',
              onConfirm: () => { /* Do nothing, just close */ }
            });
          }
        }, 350);
      })
      .catch(error => {
        console.error('Error checking original question status:', error);
        cleanupLoadingModal();

        setTimeout(() => {
          // Show error modal
          createConfirmationModal({
            title: 'Error',
            titleClass: 'bg-danger text-white',
            message: 'Failed to check original question status. Please try again.',
            confirmButtonClass: 'btn-danger',
            confirmButtonText: 'OK',
            onConfirm: () => { /* Do nothing, just close */ }
          });
        }, 350);
      });
  } else {
    // For original questions, just show the normal verify modal
    showVerifyModal(message, index);
  }
}

// Helper function to show the verification modal
function showVerifyModal(message: string, index: number) {
  createConfirmationModal({
    title: 'Verify Question',
    titleClass: 'bg-success text-black',
    message: message,
    confirmButtonClass: 'btn-success',
    confirmButtonText: 'Yes',
    onConfirm: () => {
      verifyQuestion(index);
    }
  });
}

function createConfirmationModal(options: {
  title: string,
  titleClass: string,
  message: string,
  confirmButtonClass: string,
  confirmButtonText: string,
  onConfirm: () => void
}) {
  // Create modal element
  const modalElement = document.createElement('div')
  modalElement.className = 'modal fade'
  modalElement.id = 'confirmationModal'
  modalElement.setAttribute('tabindex', '-1')
  modalElement.setAttribute('aria-hidden', 'true')
  modalElement.setAttribute('data-bs-backdrop', 'static')
  modalElement.setAttribute('data-bs-keyboard', 'false')

  modalElement.innerHTML = `
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header ${options.titleClass}">
          <h5 class="modal-title">${options.title}</h5>
        </div>
        <div class="modal-body">
          ${options.message}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-light" style="border: 1px solid gray !important;" id="cancelButton">Cancel</button>
          <button type="button" class="btn ${options.confirmButtonClass}" id="confirmButton">${options.confirmButtonText}</button>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modalElement)

  // Initialize and show modal
  const modal = new Modal(modalElement)
  modal.show()

  // Function to properly cleanup modal
  const cleanupModal = () => {
    modal.hide();
    // Remove the modal element from DOM
    setTimeout(() => {
      modalElement.remove();

      // Clean up any remaining backdrops
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => {
        backdrop.remove();
      });

      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    }, 300);
  };

  // Add event listeners
  document.getElementById('cancelButton')?.addEventListener('click', () => {
    cleanupModal();
  });

  document.getElementById('confirmButton')?.addEventListener('click', () => {
    cleanupModal();
    setTimeout(() => {
      options.onConfirm();
    }, 350);
  });
}

function deleteUnverifiedQuestion(index: number) {
  try {
    // Get the question before removing it
    const question = unverifiedQuestions.value[index];

    // First, fetch the question data to get the question text ID
    axiosInstance.get(`/questions/${question.id}`)
      .then((response) => {
        const questionData = response.data;

        // Make sure there's a question text to delete
        if (questionData.question_texts && questionData.question_texts.length > 0) {
          const questionTextId = questionData.question_texts[0].id;

          // Delete the question text instead of the entire question
          return axiosInstance.delete(`/question-texts/${questionTextId}`);
        } else {
          throw new Error('Question text not found');
        }
      })
      .then(() => {
        // Remove question from unverified questions
        unverifiedQuestions.value.splice(index, 1);

        // Show success toast
        toastTitle.value = 'Success';
        toastMessage.value = 'Question text deleted successfully';
        toastType.value = 'success';
        showToast.value = true;

        // Auto hide toast after 3 seconds
        setTimeout(() => {
          showToast.value = false;
        }, 3000);
      })
      .catch(error => {
        console.error('Error deleting question text:', error);

        // Show error toast
        toastTitle.value = 'Error';
        toastMessage.value = error.response?.data?.message || 'Failed to delete question text';
        toastType.value = 'error';
        showToast.value = true;

        // Auto hide toast after 5 seconds
        setTimeout(() => {
          showToast.value = false;
        }, 5000);
      });
  } catch (error) {
    console.error('Error in deleteUnverifiedQuestion:', error);

    // Show error toast
    toastTitle.value = 'Error';
    toastMessage.value = 'An unexpected error occurred';
    toastType.value = 'error';
    showToast.value = true;

    // Auto hide toast after 5 seconds
    setTimeout(() => {
      showToast.value = false;
    }, 5000);
  }
}

function verifyQuestion(index: number) {
  // Get the question from our existing data
  const question = unverifiedQuestions.value[index];

  // Check if we have all the required data
  if (!question || !question.id || !question.topics || question.topics.length === 0 || !question.question_text_id) {
    // Show error toast if we don't have required data
    toastTitle.value = 'Error';
    toastMessage.value = 'Cannot verify question: missing required data';
    toastType.value = 'error';
    showToast.value = true;

    // Auto hide toast after 5 seconds
    setTimeout(() => {
      showToast.value = false;
    }, 5000);
    return;
  }

  // Extract the needed IDs from our question data
  const topicId = question.topics[0].id;
  const questionTextId = question.question_text_id;

  // Determine if this is a translated question for better success message
  const isTranslated = question.translationStatus === 'translated';

  // Now we have all the data we need from our existing question data
  const payload = {
    question_id: question.id,
    question_text_id: questionTextId,
    topic_id: topicId,
    instruction_medium_id: Number(questionBankData.value.mediumId),
    is_verified: true
  };

  // Call the verification API
  axiosInstance.patch('/question-text-topic-medium/verify', payload)
    .then((response) => {
      // Remove from unverified list
      unverifiedQuestions.value.splice(index, 1);

      // Refresh verified questions if we're about to switch to that view
      if (!showUnverified.value) {
        fetchQuestions();
      }

      // Show success toast with message based on translation status
      toastTitle.value = 'Success';
      toastMessage.value = response.data?.message ||
        (isTranslated ? 'Translation verified successfully' : 'Question verified successfully');
      toastType.value = 'success';
      showToast.value = true;

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    })
    .catch(error => {
      console.error('Error verifying question:', error);

      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = error.response?.data?.message || 'Failed to verify question';
      toastType.value = 'error';
      showToast.value = true;

      // Auto hide toast after 5 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 5000);
    });
}

function deleteVerifiedQuestion(question: Question, index: number) {
  // First, fetch the question data to get the question text ID
  axiosInstance.get(`/questions/${question.id}`)
    .then((response) => {
      const questionData = response.data;

      // Make sure there's a question text to delete
      if (questionData.question_texts && questionData.question_texts.length > 0) {
        const questionTextId = questionData.question_texts[0].id;

        // Delete the question text instead of the entire question
        return axiosInstance.delete(`/question-texts/${questionTextId}`);
      } else {
        throw new Error('Question text not found');
      }
    })
    .then(() => {
      // Remove question from verified questions list
      verifiedQuestions.value.splice(index, 1);

      // Show success toast
      toastTitle.value = 'Success';
      toastMessage.value = 'Question text deleted successfully';
      toastType.value = 'success';
      showToast.value = true;

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    })
    .catch(error => {
      console.error('Error deleting question text:', error);

      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = error.response?.data?.message || 'Failed to delete question text';
      toastType.value = 'error';
      showToast.value = true;

      // Auto hide toast after 5 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 5000);
    });
}

// Add this interface with the component interfaces
interface AxiosError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

async function removeQuestionFromChapter(question: Question, index: number, type: 'verified' | 'unverified') {
  try {
    // Get topic ID from the question's topics array
    if (!question.topics || question.topics.length === 0) {
      throw new Error('Question has no associated topic');
    }

    const topicId = question.topics[0].id;
    const mediumId = parseInt(questionBankData.value.mediumId);

    // Prepare request body
    const requestBody = {
      topic_id: topicId,
      instruction_medium_id: mediumId
    };

    // Call the new API endpoint
    const response = await axiosInstance.delete(
      `/questions/${question.id}/remove-from-chapter`,
      { data: requestBody }
    );

    // Remove the question from the appropriate array
    if (type === 'verified') {
      verifiedQuestions.value.splice(index, 1);
    } else {
      unverifiedQuestions.value.splice(index, 1);
    }

    // Show success toast with the API response message
    toastStore.showToast({
      title: 'Success',
      message: response.data?.message || 'Question removed from chapter successfully',
      type: 'success'
    });

    // Refresh questions to update the UI
    fetchQuestions();
  } catch (error) {
    console.error('Error removing question from chapter:', error);
    
    const axiosError = error as AxiosError;
    // Show error toast with type-safe error handling
    toastStore.showToast({
      title: 'Error',
      message: axiosError.response?.data?.message || 'Failed to remove question from chapter',
      type: 'error'
    });
  }
}

// Add a watch for showUnverified to refetch questions when toggle changes
watch(showUnverified, () => {
  fetchQuestions()
})

// Add watcher to maintain focus after search completes
watch(isSearching, (newVal) => {
  // If we were searching and now we're done, restore focus to search input
  if (!newVal && searchInputRef.value) {
    searchInputRef.value.focus();
  }
});

// Function to change page
function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchQuestions()
}

// Update fetchQuestions to handle loading states properly
async function fetchQuestions() {
  try {
    // Set appropriate loading state
    if (searchQuery.value || selectedTopic.value || selectedType.value) {
      isSearching.value = true;
    } else {
      isLoading.value = true;
    }

    // Prepare query parameters
    const params: Record<string, string | number | boolean> = {
      chapter_id: questionBankData.value.chapterId,
      instruction_medium_id: questionBankData.value.mediumId,
      is_verified: !showUnverified.value, // true for verified, false for unverified
      page: currentPage.value,
      page_size: pageSize.value
    };

    // Add sort parameters
    if (sortOption.value && sortMappings[sortOption.value]) {
      params.sort_by = sortMappings[sortOption.value].sort_by;
      params.sort_order = sortMappings[sortOption.value].sort_order;
    }

    // Add search parameter if provided
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }

    // Add topic filter if selected
    if (selectedTopic.value) {
      params.topic_id = selectedTopic.value;
    }

    // Add question type filter if selected
    if (selectedType.value) {
      params.question_type_id = selectedType.value;
    }

    // Make the API call with all parameters
    const response = await axiosInstance.get('/questions', { params })
      .catch((error) => {
        console.error('Error fetching questions:', error);
        return { data: { data: [], meta: { total_count: 0, total_pages: 0 } } };
      });

    // Handle paginated response
    if (response.data && response.data.data) {
      // Update pagination data - updated to match new meta structure
      if (response.data.meta) {
        totalItems.value = response.data.meta.total_count || 0;
        totalPages.value = response.data.meta.total_pages || 1;
      }

      // Transform API response to match our component's expected structure
      const questions = response.data.data.map((apiQuestion: ApiQuestion) => {
        // Get the first question text (assuming there's at least one)
        const questionTextData = apiQuestion.question_texts.length > 0
          ? apiQuestion.question_texts[0]
          : null;

        const questionText = questionTextData
          ? questionTextData.question_text
          : '';

        // Store the question_text_id
        const questionTextId = questionTextData
          ? questionTextData.id
          : null;

        // Get image ID and presigned URL if available
        let imageId = null;
        let imageUrl = null;

        if (questionTextData) {
          // Simplified logging for debugging
          if (questionTextData.image_id && questionTextData.image) {
            imageId = questionTextData.image_id;
            imageUrl = questionTextData.image.presigned_url;

            // Basic validation
            if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') {
              imageUrl = null;
            }
          }
        }

        // Extract translation status
        const translationStatus = questionTextData && questionTextData.translation_status
          ? questionTextData.translation_status
          : null;

        // Extract topic from question_text instead of question_topics
        const questionTopics: Topic[] = [];
        if (questionTextData && questionTextData.topic) {
          const topicData = questionTextData.topic;
          questionTopics.push({
            id: topicData.id,
            name: topicData.name,
            topic: topicData.name // Add topic property to match the Topic interface
          });

          // Add to our topics collection if not already present
          if (!topics.value.some(t => t.id === topicData.id)) {
            topics.value.push({
              id: topicData.id,
              name: topicData.name,
              topic: topicData.name
            });
          }
        }

        // Handle MCQ options if present
        let options = undefined;
        let optionImages = undefined;
        let correctOptionIndex = undefined;
        let correctAnswer = undefined;

        // Extract answer_text if available
        if (questionTextData && questionTextData.answer_text) {
          correctAnswer = questionTextData.answer_text;
        }

        // Handle Odd One Out
        if (apiQuestion.question_type.type_name === 'Odd One Out' &&
            questionTextData &&
            questionTextData.mcq_options &&
            questionTextData.mcq_options.length > 0) {

          // For display purposes only, extract the options and correct index
          options = questionTextData.mcq_options.map(opt => opt.option_text);
          correctOptionIndex = questionTextData.mcq_options.findIndex(opt => opt.is_correct);
          if (correctOptionIndex !== -1) {
            // Set the correct answer to the text of the odd one out
            if (!correctAnswer) {
              correctAnswer = options[correctOptionIndex];
            }
          }
        }
        // Handle True/False
        else if (apiQuestion.question_type.type_name === 'True or False' &&
            questionTextData) {
          // If we don't have a correctAnswer already, try to determine it from mcq_options
          if (!correctAnswer && questionTextData.mcq_options && questionTextData.mcq_options.length > 0) {
            const trueOption = questionTextData.mcq_options.find(opt => opt.option_text.toLowerCase() === 'true');
            if (trueOption) {
              correctAnswer = trueOption.is_correct ? 'True' : 'False';
            } else {
              const correctOption = questionTextData.mcq_options.find(opt => opt.is_correct);
              if (correctOption) {
                correctAnswer = correctOption.option_text;
              }
            }
          }
        }
        // Handle Complete the Correlation
        else if (apiQuestion.question_type.type_name === 'Complete the Correlation' &&
            questionTextData &&
            questionTextData.match_pairs &&
            questionTextData.match_pairs.length > 0) {

          // If no correctAnswer is set, provide a default
          if (!correctAnswer) {
            correctAnswer = "See question for correlation details";
          }
        }
        // Handle MCQ options
        else if (apiQuestion.question_type.type_name === 'Multiple Choice Question (MCQ)' &&
            questionTextData &&
            questionTextData.mcq_options.length > 0) {
          options = questionTextData.mcq_options.map(opt => opt.option_text);
          correctOptionIndex = questionTextData.mcq_options.findIndex(opt => opt.is_correct);
          if (correctOptionIndex === -1) correctOptionIndex = undefined;

          // Extract option images if available
          optionImages = questionTextData.mcq_options.map(opt =>
            opt.image && opt.image.presigned_url ? opt.image.presigned_url : null
          );

          // Only include optionImages if at least one image exists
          if (optionImages.every(img => img === null)) {
            optionImages = undefined;
          }
        }

        // Handle match pairs if present
        let lhs = undefined;
        let rhs = undefined;
        let lhsImages = undefined;
        let rhsImages = undefined;

        if (apiQuestion.question_type.type_name === 'Match the Pairs' &&
            questionTextData &&
            questionTextData.match_pairs &&
            questionTextData.match_pairs.length > 0) {

          // Extract text content - keep null values to maintain structure
          lhs = questionTextData.match_pairs.map(pair => pair.left_text || null);
          rhs = questionTextData.match_pairs.map(pair => pair.right_text || null);

          // Extract image URLs for left and right sides - keep null values to maintain structure
          lhsImages = questionTextData.match_pairs.map(pair =>
            pair.left_image && pair.left_image.presigned_url ? pair.left_image.presigned_url : null
          );

          rhsImages = questionTextData.match_pairs.map(pair =>
            pair.right_image && pair.right_image.presigned_url ? pair.right_image.presigned_url : null
          );

          // Always include the arrays, even if they only contain nulls
          // This ensures the structure is maintained for display
        }

        return {
          id: apiQuestion.id,
          question: questionText,
          type: apiQuestion.question_type.type_name,
          typeId: apiQuestion.question_type.id,
          topics: questionTopics,
          options: options,
          optionImages: optionImages,
          correctOptionIndex: correctOptionIndex,
          lhs: lhs,
          rhs: rhs,
          lhsImages: lhsImages,
          rhsImages: rhsImages,
          isPreviousExam: apiQuestion.board_question,
          isVerified: apiQuestion.is_verified ?? !showUnverified.value,
          imageId: imageId,
          imageUrl: imageUrl,
          question_text_id: questionTextId,
          translationStatus: translationStatus,
          correctAnswer: correctAnswer
        };
      });

      // Update the appropriate questions array based on verification status
      if (showUnverified.value) {
        unverifiedQuestions.value = questions;
      } else {
        verifiedQuestions.value = questions;
      }
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
  } finally {
    // Always clear the loading states when done, regardless of success or failure
    isSearching.value = false;
    isLoading.value = false;
  }
}

// Close toast function
const closeToast = () => {
  showToast.value = false
}

// Lifecycle hooks
onMounted(() => {
  // Check for unverified query parameter
  if (route.query.unverified === 'true') {
    showUnverified.value = true;
  }

  // Check for sort parameter in localStorage (highest priority)
  const savedSort = localStorage.getItem('questionDashboardSort');
  if (savedSort) {
    sortOption.value = savedSort;
    // Remove the localStorage item after using it
    localStorage.removeItem('questionDashboardSort');
  }
  // Then check URL query parameter (lower priority)
  else if (route.query.sort) {
    sortOption.value = route.query.sort as string;
  }

  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank')
  if (storedData) {
    questionBankData.value = JSON.parse(storedData)
    // Initial data loading
    isLoading.value = true
    fetchQuestions()
    fetchQuestionTypes()
    fetchTranslationPendingCount()
  } else {
    // Redirect to question bank selection if no data
    router.push({ name: 'questionBank' })
  }

  // Check for tab parameter to determine which tab to show
  if (route.query.tab === 'unverified') {
    showUnverified.value = true
  }

  // Check if the filter element has the 'show' class initially
  const filterElement = document.getElementById('filter')
  if (filterElement) {
    // Check if the element has the 'show' class initially
    if (filterElement.classList.contains('show')) {
      isFilterOpen.value = true

      // Update filter button appearance
      const filterBtn = document.querySelector('.filter-btn')
      if (filterBtn) {
        filterBtn.classList.add('active')
      }
    } else {
      isFilterOpen.value = false
    }
  }

  // Check for success message in route query params
  if (route.query.success === 'true') {
    const message = route.query.message as string || 'Operation completed successfully'

    toastStore.showToast({
      title: 'Success',
      message: message,
      type: 'success'
    })

    // Remove query parameters without page reload, but preserve tab parameter
    const newQuery = { ...route.query }
    delete newQuery.success
    delete newQuery.message

    router.replace({ query: newQuery }).catch(() => {
      // Ignore navigation errors
    })
  }
})

// Function to fetch question types from API
async function fetchQuestionTypes() {
  try {
    const response = await axiosInstance.get('/question-types');
    if (response.data) {
      questionTypes.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching question types:', error);
  }
}

// Add this new function after the fetchQuestionTypes function
async function fetchTranslationPendingCount() {
  try {
    const params = {
      chapter_id: questionBankData.value.chapterId,
      is_verified: true,
      translation_status: 'original'
    };

    const response = await axiosInstance.get(
      `/questions/untranslated/${questionBankData.value.mediumId}/count`,
      { params }
    );

    translationPendingCount.value = response.data.count;
  } catch (error) {
    console.error('Error fetching translation pending count:', error);
    translationPendingCount.value = 0;
  }
}

function getTranslationStatusText(status: string): string {
  if (status === 'original') {
    return 'Original';
  } else if (status === 'translated') {
    return 'Translated';
  } else {
    return status;
  }
}
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}

/* Default styles for screens above 576px */
.dynamic-style {
  position: static;
  background-color: transparent;
  box-shadow: none;
}

/* Styles for screens below 576px */
@media (max-width: 576px) {
  .dynamic-style {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: white;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    z-index: 1000;
  }

  #addButton {
    width: 100%;
  }
}

/* Styles for nav link */
#navQuestion {
  font-weight: bolder;
  text-decoration: underline;
  text-decoration-color: white;
}

@media (max-width: 768px) {
  #navQuestion {
    font-weight: bolder;
    font-size: 1.1rem !important;
    text-decoration: none !important;
  }
}

.card.border-0 {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.collapse {
  transition: all 0.3s ease-out;
}

.input-group-text {
  transition: background-color 0.2s ease;
}

.input-group-text:hover {
  background-color: #e9ecef;
}

/* Modern search styling */
.search-field {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
  pointer-events: none;
}

.search-input {
  padding-left: 40px;
  padding-right: 40px;
  height: 48px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
  outline: 0;
}

.clear-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  cursor: pointer;
  z-index: 10;
}

.clear-search-icon:hover {
  color: #212529;
}

/* Sort dropdown styling */
.sort-select {
  height: 48px;
  padding-right: 40px;
  border-radius: 6px;
  appearance: none;
  background-image: none;
  transition: all 0.3s ease;
}

.sort-select:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: #86b7fe;
  outline: 0;
}

/* Filter button styling */
.filter-btn {
  height: 48px;
  min-width: 48px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  margin-bottom: 0;
  background-color: #f8f9fa;
  border: 1px solid #ced4da;
}

.filter-btn:hover {
  background-color: #e9ecef;
  color: #212529;
}

.filter-btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25);
  outline: 0;
}

.filter-btn.active {
  background-color: #212529;
  color: white;
  border-color: #212529;
}

.filter-btn.active:hover {
  background-color: #343a40;
  color: white;
}

/* Improved spinner animation */
@keyframes spin {
  from { transform: translateY(-50%) rotate(0deg); }
  to { transform: translateY(-50%) rotate(360deg); }
}

.search-loading-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .search-input,
  .sort-select,
  .filter-btn {
    height: 42px;
  }

  /* Adjust flex layout for mobile */
  .d-flex.gap-2 {
    flex-wrap: wrap;
  }

  .search-field {
    flex: 1 0 100%;
    margin-bottom: 0.5rem;
  }

  .sort-field {
    flex: 1 1 auto;
    min-width: 0 !important;
  }
}

/* Pagination styling */
.pagination .page-item.active .page-link {
  background-color: #212529 !important;
  border-color: #212529 !important;
  color: white !important;
}

.pagination .page-link {
  color: #212529;
}

.pagination .page-link:focus {
  box-shadow: none;
  outline: none;
}

/* Search loading overlay */
.search-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
  backdrop-filter: blur(2px);
}

.card-searching {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* Loading spinner styling */
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.spinner-border-sm {
  width: 1.5rem;
  height: 1.5rem;
}

/* Question image styling */
.question-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  min-height: 200px;
  background-color: #f8f9fa;
}

.question-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.image-error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #dc3545;
  text-align: center;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-error-message i {
  display: block;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .question-image {
    max-height: 200px;
  }

  .question-image-container {
    min-height: 150px;
  }
}

/* Question image loading container */
.question-image-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .question-image-loading-container {
    height: 150px;
  }
}

/* Question image container with loading overlay */
.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(248, 249, 250, 0.7);
  z-index: 5;
}

/* Improve card spacing and mobile responsiveness */
.card {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1.5rem;
}

/* Adjustments for mobile view */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }

  .card-text {
    font-size: 0.95rem;
  }
}

/* REMOVED: Styling for Fill in the Blanks, One-Word Answer, Short Answer, Odd One Out, Complete the Correlation, and Match the Pairs - now handled by QuestionDisplay component */

.badge.bg-danger {
  font-size: 0.75rem;
  min-width: 1.5rem;
}

.translate-middle {
  transform: translate(-50%, -50%) !important;
}
</style>
