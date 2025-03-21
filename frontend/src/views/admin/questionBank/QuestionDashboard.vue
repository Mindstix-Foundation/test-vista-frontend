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
              <router-link class="btn btn-light" style="border: 1px solid gray !important;" id="addButton" :to="{ name: 'translationPending' }">Translation Pending</router-link>
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
                  <option value="question_asc">Sort by Question (A-Z)</option>
                  <option value="question_desc">Sort by Question (Z-A)</option>
                  <option value="created_desc">Sort by Created (Newest)</option>
                  <option value="created_asc">Sort by Created (Oldest)</option>
                  <option value="updated_desc">Sort by Updated (Newest)</option>
                  <option value="updated_asc">Sort by Updated (Oldest)</option>
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
                    <div class="col-12 text-end">
                      <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                      <i class="bi bi-eraser fs-4 mx-2" @click="openRemoveConfirmationModal(index, 'verified')"></i>
                      <i class="bi bi-trash3 fs-4 ms-2" @click="openDeleteConfirmationModal(index, 'verified')"></i>
                    </div>
                    <blockquote class="blockquote mb-0">
                      <p class="card-text"><strong>Q{{ (currentPage - 1) * pageSize + index + 1 }}:</strong> &nbsp; {{ question.question }}</p>

                      <!-- Question Image Loading State -->
                      <div v-if="question.imageLoading" class="question-image-loading-container mb-3">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading image...</span>
                        </div>
                      </div>

                      <!-- Question Image (if available) -->
                      <div v-else-if="question.imageUrl" class="question-image-container mb-3">
                        <div v-if="question.imageLoadingState" class="image-loading-overlay">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading image...</span>
                          </div>
                        </div>
                        <img
                          :src="question.imageUrl"
                          class="question-image"
                          alt="Question Image"
                          @load="handleImageLoad(question)"
                          @error="handleImageError(question)"
                        />
                        <div v-if="question.imageError" class="image-error-message">
                          <i class="bi bi-exclamation-triangle"></i>
                          Failed to load image
                        </div>
                      </div>

                      <!-- MCQ Options -->
                      <div v-if="question.type === 'MCQ'" class="row g-2">
                        <div v-for="(option, optIndex) in question.options" :key="optIndex" class="col-12 col-md-6 col-lg-3">
                          <strong>{{ String.fromCharCode(97 + optIndex) }} : &nbsp;</strong>{{ option }}
                        </div>
                      </div>

                      <!-- Match the Pairs -->
                      <ul v-if="question.type === 'Match the Pairs' && question.rhs" class="list-group">
                        <li v-for="(rhs, idx) in question.rhs" :key="idx" class="list-group-item" :class="{ 'disabled': !(question.lhs && question.lhs[idx]) }">
                          {{ (question.lhs && question.lhs[idx]) || '...........' }} <strong>&lt;-&gt;</strong> {{ rhs }}
                        </li>
                      </ul>

                      <footer class="blockquote-footer text-end mt-2">
                        {{ getTopicsDisplay(question) }} <br> {{ question.type }}
                        <span v-if="question.isPreviousExam" class="badge bg-info ms-2">Board Exam</span>
                      </footer>
                    </blockquote>
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
            <div class="card" :class="[getUnverifiedCardClass(question), { 'card-searching': isSearching }]" :data-unique-id="'unverified-' + index">
              <div class="row g-0">
                <div class="col-12">
                  <div class="card-body">
                    <div class="col-12 text-end">
                      <i class="bi bi-pencil-square fs-4 me-2" @click="editQuestion(question)"></i>
                      <i class="bi bi-eraser fs-4 mx-2" @click="openRemoveConfirmationModal(index, 'unverified')"></i>
                      <i v-if="canVerifyQuestion(question)" class="bi bi-check-lg fs-4 ms-2" @click="openVerifyConfirmationModal(index)"></i>
                    </div>
                    <blockquote class="blockquote mb-0">
                      <p class="card-text"><strong>Q{{ (currentPage - 1) * pageSize + index + 1 }}:</strong> &nbsp; {{ question.question }}</p>

                      <!-- Question Image Loading State -->
                      <div v-if="question.imageLoading" class="question-image-loading-container mb-3">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading image...</span>
                        </div>
                      </div>

                      <!-- Question Image (if available) -->
                      <div v-else-if="question.imageUrl" class="question-image-container mb-3">
                        <div v-if="question.imageLoadingState" class="image-loading-overlay">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading image...</span>
                          </div>
                        </div>
                        <img
                          :src="question.imageUrl"
                          class="question-image"
                          alt="Question Image"
                          @load="handleImageLoad(question)"
                          @error="handleImageError(question)"
                        />
                        <div v-if="question.imageError" class="image-error-message">
                          <i class="bi bi-exclamation-triangle"></i>
                          Failed to load image
                        </div>
                      </div>

                      <!-- MCQ Options -->
                      <div v-if="question.type === 'MCQ'" class="row g-2">
                        <div v-for="(option, optIndex) in question.options" :key="optIndex" class="col-12 col-md-6 col-lg-3">
                          <strong>{{ String.fromCharCode(97 + optIndex) }} : &nbsp;</strong>{{ option }}
                        </div>
                      </div>

                      <!-- Match the Pairs -->
                      <ul v-if="question.type === 'Match the Pairs' && question.rhs" class="list-group">
                        <li v-for="(rhs, idx) in question.rhs" :key="idx" class="list-group-item" :class="{ 'disabled': !(question.lhs && question.lhs[idx]) }">
                          {{ (question.lhs && question.lhs[idx]) || '...........' }} <strong>&lt;-&gt;</strong> {{ rhs }}
                        </li>
                      </ul>

                      <footer class="blockquote-footer text-end mt-2">
                        {{ getTopicsDisplay(question) }} <br> {{ question.type }}
                        <span v-if="question.isPreviousExam" class="badge bg-info ms-2">Board Exam</span>
                      </footer>
                    </blockquote>
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
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import { Modal, Collapse } from 'bootstrap'
import ToastNotification from '@/components/common/ToastNotification.vue'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'

// Define interfaces for API response
interface ApiTopic {
  id: number;
  chapter_id: number;
  sequential_topic_number: number;
  name: string;
  created_at: string;
  updated_at: string;
  chapter?: {
    id: number;
    medium_standard_subject_id: number;
    sequential_chapter_number: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
}

interface ApiQuestionTopic {
  id: number;
  question_id: number;
  topic_id: number;
  created_at: string;
  updated_at: string;
  topic: ApiTopic;
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
}

interface ApiMatchPair {
  id: number;
  question_text_id: number;
  left_side: string;
  right_side: string;
  created_at: string;
  updated_at: string;
}

interface ApiQuestionText {
  id: number;
  question_id: number;
  image_id: number | null;
  question_text: string;
  created_at: string;
  updated_at: string;
  image: ApiImage | null;
  mcq_options: ApiMcqOption[];
  match_pairs: ApiMatchPair[];
}

interface ApiQuestionType {
  id: number;
  type_name: string;
}

interface ApiQuestion {
  id: number;
  question_type_id: number;
  board_question: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  question_type: ApiQuestionType;
  question_texts: ApiQuestionText[];
  question_topics: ApiQuestionTopic[];
  imageId?: number | null;
  imageUrl?: string | null;
  imageError?: boolean;
  imageLoadingState?: boolean;
}

// Define interfaces for component's internal use
interface Topic {
  id: number;
  name: string;
}

interface Question {
  id: number;
  question: string;
  type: string;
  typeId: number;
  topics: Topic[];
  options?: string[];
  correctOption?: string;
  lhs?: string[];
  rhs?: string[];
  correctAnswer?: string;
  topic?: string;
  isPreviousExam: boolean;
  isVerified: boolean;
  imageId?: number | null;
  imageUrl?: string | null;
  imageLoading?: boolean;
  imageError?: boolean;
  imageLoadingState?: boolean;
}

// Component name (for linter)
defineOptions({
  name: 'QuestionDashboard'
})

const router = useRouter()

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
const sortOption = ref('question_asc')
const searchTimeout = ref<number | null>(null)

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
  'question_asc': { sort_by: 'name', sort_order: 'asc' },
  'question_desc': { sort_by: 'name', sort_order: 'desc' },
  'created_asc': { sort_by: 'created_at', sort_order: 'asc' },
  'created_desc': { sort_by: 'created_at', sort_order: 'desc' },
  'updated_asc': { sort_by: 'updated_at', sort_order: 'asc' },
  'updated_desc': { sort_by: 'updated_at', sort_order: 'desc' }
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

function getTopicsDisplay(question: Question) {
  if (question.topics && question.topics.length > 0) {
    return question.topics.map(topic => topic.name).join(', ')
  }
  return question.topic || ''
}

function normalizeText(text: string) {
  return text.toLowerCase().trim()
}

function getUnverifiedCardClass(question: Question) {
  // Determine card border class based on question status
  if (verifiedQuestions.value.some(vq => normalizeText(vq.question) === normalizeText(question.question))) {
    return 'border-danger' // Red border - duplicate of verified question
  } else if (unverifiedQuestions.value.filter(uq =>
    normalizeText(uq.question) === normalizeText(question.question)).length > 1) {
    return 'border-warning' // Yellow border - duplicate in unverified
  }
  return 'border-dark' // Default border
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

function canVerifyQuestion(question: Question) {
  // Check if question can be verified (not a duplicate of verified question)
  return !verifiedQuestions.value.some(vq => normalizeText(vq.question) === normalizeText(question.question))
}

function editQuestion(question: Question) {
  // Navigate to edit question page with question ID
  router.push({
    name: 'editQuestion',
    params: {
      id: question.id
    }
  })
}

function openRemoveConfirmationModal(index: number, type: 'verified' | 'unverified') {
  createConfirmationModal({
    title: 'Remove Question',
    titleClass: 'bg-warning text-black',
    message: 'Are you sure you want to remove this question from this Chapter?',
    confirmButtonClass: 'btn-warning',
    confirmButtonText: 'Remove',
    onConfirm: () => {
      if (type === 'unverified') {
        // For unverified questions, just delete them
        deleteUnverifiedQuestion(index);
      } else {
        // For verified questions, remove from this chapter
        const question = verifiedQuestions.value[index];
        removeQuestionFromChapter(question.id);
      }
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
  createConfirmationModal({
    title: 'Verify Question',
    titleClass: 'bg-success text-black',
    message: 'You want to add this question in the Question Bank?',
    confirmButtonClass: 'btn-success',
    confirmButtonText: 'Yes',
    onConfirm: () => {
      verifyQuestion(index)
    }
  })
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

  // Add event listeners
  document.getElementById('cancelButton')?.addEventListener('click', () => {
    modal.hide()
    setTimeout(() => {
      modalElement.remove()
    }, 300)
  })

  document.getElementById('confirmButton')?.addEventListener('click', () => {
    modal.hide()
    setTimeout(() => {
      modalElement.remove()
      options.onConfirm()
    }, 300)
  })
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
  const question = unverifiedQuestions.value[index];

  // First, fetch the question data to get the question text ID
  axiosInstance.get(`/questions/${question.id}`)
    .then((response) => {
      const questionData = response.data;

      // Make sure there's a question text to verify
      if (questionData.question_texts && questionData.question_texts.length > 0) {
        const questionTextId = questionData.question_texts[0].id;

        // Update the verification status of the question text
        return axiosInstance.put(`/question-texts/${questionTextId}`, { is_verified: true });
      } else {
        throw new Error('Question text not found');
      }
    })
    .then(() => {
      console.log('Question text verified successfully');
      // Remove from unverified list
      unverifiedQuestions.value.splice(index, 1);
      // Refresh verified questions if we're about to switch to that view
      // This will apply all filters including instruction_medium_id
      if (!showUnverified.value) {
        fetchQuestions();
      }

      // Show success toast
      toastTitle.value = 'Success';
      toastMessage.value = 'Question text verified successfully';
      toastType.value = 'success';
      showToast.value = true;

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    })
    .catch(error => {
      console.error('Error verifying question text:', error);

      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = error.response?.data?.message || 'Failed to verify question text';
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

function removeQuestionFromChapter(questionId: number) {
  // Make API call to remove the question from this chapter
  // The exact endpoint would depend on your API structure
  axiosInstance.delete(`/questions/${questionId}/chapter/${questionBankData.value.chapterId}`)
    .then(() => {
      // Refresh questions after removal
      // This will apply all filters including instruction_medium_id
      fetchQuestions();

      // Show success toast
      toastTitle.value = 'Success';
      toastMessage.value = 'Question removed from chapter successfully';
      toastType.value = 'success';
      showToast.value = true;

      // Auto hide toast after 3 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    })
    .catch(error => {
      console.error('Error removing question from chapter:', error);

      // Show error toast
      toastTitle.value = 'Error';
      toastMessage.value = error.response?.data?.message || 'Failed to remove question from chapter';
      toastType.value = 'error';
      showToast.value = true;

      // Auto hide toast after 5 seconds
      setTimeout(() => {
        showToast.value = false;
      }, 5000);
    });
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
        return { data: { data: [], meta: { total: 0, total_pages: 0 } } };
      });

    // Handle paginated response
    if (response.data && response.data.data) {
      // Update pagination data
      if (response.data.meta) {
        totalItems.value = response.data.meta.total || 0;
        totalPages.value = response.data.meta.total_pages || 1;
      }

      // Transform API response to match our component's expected structure
      const questions = response.data.data.map((apiQuestion: ApiQuestion) => {
        // Get the first question text (assuming there's at least one)
        const questionText = apiQuestion.question_texts.length > 0
          ? apiQuestion.question_texts[0].question_text
          : '';

        // Get image ID and presigned URL if available
        let imageId = null;
        let imageUrl = null;

        if (apiQuestion.question_texts.length > 0 &&
            apiQuestion.question_texts[0].image_id &&
            apiQuestion.question_texts[0].image) {
          imageId = apiQuestion.question_texts[0].image_id;
          imageUrl = apiQuestion.question_texts[0].image.presigned_url;
        }

        // Extract topics from question_topics
        const questionTopics = apiQuestion.question_topics.map(qt => ({
          id: qt.topic_id,
          name: qt.topic.name
        }));

        // Also collect topics for the dropdown
        apiQuestion.question_topics.forEach(qt => {
          if (qt.topic && qt.topic_id) {
            // Add to our topics collection if not already present
            if (!topics.value.some(t => t.id === qt.topic_id)) {
              topics.value.push({
                id: qt.topic_id,
                name: qt.topic.name
              });
            }
          }
        });

        // Handle MCQ options if present
        let options = undefined;
        if (apiQuestion.question_type.type_name === 'MCQ' &&
            apiQuestion.question_texts.length > 0 &&
            apiQuestion.question_texts[0].mcq_options.length > 0) {
          options = apiQuestion.question_texts[0].mcq_options.map(opt => opt.option_text);
        }

        // Handle match pairs if present
        let lhs = undefined;
        let rhs = undefined;
        if (apiQuestion.question_type.type_name === 'Match the Pairs' &&
            apiQuestion.question_texts.length > 0 &&
            apiQuestion.question_texts[0].match_pairs.length > 0) {
          lhs = apiQuestion.question_texts[0].match_pairs.map(pair => pair.left_side);
          rhs = apiQuestion.question_texts[0].match_pairs.map(pair => pair.right_side);
        }

        return {
          id: apiQuestion.id,
          question: questionText,
          type: apiQuestion.question_type.type_name,
          typeId: apiQuestion.question_type_id,
          topics: questionTopics,
          options: options,
          lhs: lhs,
          rhs: rhs,
          isPreviousExam: apiQuestion.board_question,
          isVerified: apiQuestion.is_verified,
          imageId: imageId,
          imageUrl: imageUrl,
          imageLoading: imageId !== null && imageUrl === null,
          imageError: false,
          imageLoadingState: imageUrl !== null
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

// Handle image load events
function handleImageLoad(question: Question) {
  question.imageLoading = false;
  question.imageLoadingState = false;
  question.imageError = false;
  console.log(`Image loaded successfully for question ${question.id}`);
}

// Handle image error events
function handleImageError(question: Question) {
  console.error(`Failed to load image for question ${question.id}`);
  console.error('Image URL:', question.imageUrl);
  question.imageLoading = false;
  question.imageLoadingState = false;
  question.imageError = true;
}

// Close toast function
const closeToast = () => {
  showToast.value = false
}

// Lifecycle hooks
onMounted(() => {
  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank')
  if (storedData) {
    questionBankData.value = JSON.parse(storedData)
    // Initial data loading
    isLoading.value = true
    fetchQuestions()
    // Fetch question types
    fetchQuestionTypes()
  } else {
    // Redirect to question bank selection if no data
    router.push({ name: 'questionBank' })
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
</style>
