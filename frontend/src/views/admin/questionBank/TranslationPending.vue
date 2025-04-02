<template>
  <div class="container my-4">
    <!-- Remove full-screen overlay -->

    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" :to="{ name: 'questionDashboard', query: { unverified: 'true' } }" aria-label="Close"></router-link>
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 ">
          <p class="text-muted text-start fs-5 m-0">
            <span class="col-12 col-md-auto">{{ questionBankData.boardName }} |</span>
            <span class="col-12 col-md-auto"> {{ questionBankData.mediumName }}</span>
          </p>
          <h4 class="fw-bolder text-start text-dark m-0 ">
            Standard {{ questionBankData.standardName }}
            <span class="d-block text-start text-secondary">{{ questionBankData.subjectName }} : {{ questionBankData.chapterName }}</span>
          </h4>
          <h4 class="text-left fw-bolder text-uppercase mb-2">Translation Pending</h4>
        </div>
      </div>
      <hr>
    </div>

    <div id="questionsSection" class="container">
      <div class="container mb-4">
        <div class="row g-2 my-2 justify-content-center">
          <div class="col-12 col-md-10">
            <!-- Search, Sort and Filter in One Row (like QuestionDashboard) -->
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
                  <option value="question_type_id_asc">Sort by Question Type (Ascending)</option>
                  <option value="question_type_id_desc">Sort by Question Type (Descending)</option>
                  <option value="created_at_asc">Sort by Created Date (Oldest First)</option>
                  <option value="created_at_desc">Sort by Created Date (Newest First)</option>
                  <option value="updated_at_asc">Sort by Updated Date (Oldest First)</option>
                  <option value="updated_at_desc">Sort by Updated Date (Newest First)</option>
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
                        :items="topicsWithIds"
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
                        :items="questionTypesWithIds"
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
      </div>

      <div class="container mb-5">
        <div class="row g-2 justify-content-center position-relative" id="verifiedContainer">
          <!-- Loading indicators -->
          <!-- Initial loading spinner (below search/filter, only shown during initial load) -->
          <div v-if="isInitialLoading" class="col-12 col-md-10 text-center my-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading questions...</span>
            </div>
            <p class="mt-3 text-primary">Loading translation questions...</p>
          </div>

          <!-- Loading overlay for search - only shown during search/filtering -->
          <div v-if="isSearching && !isInitialLoading" class="search-loading-overlay">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Searching...</span>
            </div>
          </div>

          <!-- Questions list - only shown when not in initial loading -->
          <template v-if="!isInitialLoading && filteredQuestions.length > 0">
            <div v-for="(question, index) in filteredQuestions" :key="'question-' + index" class="col-12 col-md-10">
              <div class="card" :class="{ 'questions-searching': isSearching }">
                <div class="row g-0">
                  <div class="col-12">
                    <div class="card-body">
                      <div class="col-12 text-end">
                        <button class="btn btn-light translate-btn" @click="translateQuestion(question)">
                          <i class="bi bi-vector-pen me-1"></i> Translate
                        </button>
                      </div>

                      <!-- Pass the question number to QuestionDisplay -->
                      <QuestionDisplay
                        :question="question.question"
                        :questionId="question.id"
                        :questionType="question.type"
                        :topics="question.topics"
                        :options="question.options"
                        :correctOptionIndex="question.correctOptionIndex"
                        :lhs="question.lhs"
                        :rhs="question.rhs"
                        :correctAnswer="question.correctAnswer"
                        :imageUrl="question.imageUrl"
                        :optionImages="question.optionImages"
                        :isPreviousExam="question.isPreviousExam"
                        :showFooter="true"
                        :highlightCorrect="true"
                        :questionNumber="(currentPage - 1) * pageSize + index + 1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- No Results Message - only shown when not loading and no results -->
          <div v-if="!isInitialLoading && !isSearching && filteredQuestions.length === 0" class="col-12 col-md-10 text-center my-4">
            <div class="alert alert-info">
              <i class="bi bi-search me-2"></i>
              No questions found matching your search criteria
            </div>
          </div>
        </div>

        <!-- Pagination Controls - only shown when there are questions and not in initial loading -->
        <div v-if="!isInitialLoading && filteredQuestions.length > 0" class="row mt-4 justify-content-center">
          <div class="col-12 col-md-10">
            <nav aria-label="Question pagination">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
            <div class="text-center">
              <select class="form-select d-inline-block w-auto" v-model="pageSize" @change="fetchQuestions">
                <option :value="5">5 per page</option>
                <option :value="10">10 per page</option>
                <option :value="25">25 per page</option>
                <option :value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '@/config/axios'
import { Collapse } from 'bootstrap'
import SearchableDropdown from '@/components/common/SearchableDropdown.vue'
import QuestionDisplay from '@/components/questiondisplay/QuestionDisplay.vue'

console.log('QuestionDisplay component imported:', !!QuestionDisplay);

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
  image_url: string;
  presigned_url: string;
  created_at: string;
  updated_at: string;
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
  left_image?: ApiImage | null;
  right_image?: ApiImage | null;
  created_at?: string;
  updated_at?: string;
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
  translation_status?: string | null;
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
}

// Define interfaces for component's internal use
interface Topic {
  topic: string;
  id?: number;
}

interface Question {
  id: number;
  question: string;
  type: string;
  topics: Topic[];
  options?: string[];
  correctOption?: string;
  lhs?: (string | null)[];
  rhs?: (string | null)[];
  correctAnswer?: string;
  topic?: string;
  isPreviousExam: boolean;
  isVerified: boolean;
  imageId?: number | null;
  imageUrl?: string | null;
  imageLoading?: boolean;
  imageError?: boolean;
  imageLoadingState?: boolean;
  optionImages?: string[];
  correctOptionIndex?: number;
  lhsImages?: (string | null)[];
  rhsImages?: (string | null)[];
  translationStatus?: string | null;
}

// Define interface for paginated API response
interface PaginatedApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

// Define the topic structure to include IDs
interface TopicWithId {
  id: number;
  name: string;
}

// Component name (for linter)
defineOptions({
  name: 'TranslationPending'
})

const router = useRouter()

// Add initial loading state
const isInitialLoading = ref(true)

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
const questions = ref<Question[]>([])
const topics = ref<string[]>([])
const topicsWithIds = ref<TopicWithId[]>([])
const isLoadingTopics = ref(false)

// UI state
const searchQuery = ref('')
const isSearching = ref(false)
const isFilterOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchTimeout = ref<number | null>(null)

// Define new object-based selectors for SearchableDropdown
const selectedTopicObj = ref<{ id: number; name: string } | null>(null)
const selectedTypeObj = ref<{ id: number; type_name: string } | null>(null)

// Computed properties to extract IDs from selected objects
const selectedTopic = computed<number | null>(() => selectedTopicObj.value?.id || null)
const selectedType = computed<number | null>(() => selectedTypeObj.value?.id || null)

// Add pagination and sorting state
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const totalItems = ref(0)

// Update sort option to match QuestionDashboard
const sortOption = ref('created_at_desc')

// Mapping for sort options to API parameters (updated to match API options)
const sortMappings: Record<string, { sort_by: string; sort_order: string }> = {
  'question_text_asc': { sort_by: 'question_text', sort_order: 'asc' },
  'question_text_desc': { sort_by: 'question_text', sort_order: 'desc' },
  'question_type_id_asc': { sort_by: 'question_type_id', sort_order: 'asc' },
  'question_type_id_desc': { sort_by: 'question_type_id', sort_order: 'desc' },
  'created_at_asc': { sort_by: 'created_at', sort_order: 'asc' },
  'created_at_desc': { sort_by: 'created_at', sort_order: 'desc' },
  'updated_at_asc': { sort_by: 'updated_at', sort_order: 'asc' },
  'updated_at_desc': { sort_by: 'updated_at', sort_order: 'desc' }
}

// Reformat question types for SearchableDropdown
const questionTypesWithIds = ref<{ id: number; type_name: string }[]>([
  { id: 1, type_name: 'MCQ' },
  { id: 2, type_name: 'Descriptive' },
  { id: 3, type_name: 'Fill in the Blanks' },
  { id: 4, type_name: 'Match the Pairs' }
])

// Computed property for filtered questions - we now use the API for filtering
const filteredQuestions = computed(() => questions.value)

// Computed property for pagination
const displayedPages = computed(() => {
  const pages = []
  const maxVisiblePages = 5

  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2))
  const endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1)

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
function handleSearchInput() {
  // Immediately set searching state for visual feedback
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

    // Update URL params for bookmarking
    updateUrlParams();
  }, 500) as unknown as number; // TypeScript type assertion for timer
}

function clearSearch() {
  searchQuery.value = '';
  // Reset to first page when clearing search
  currentPage.value = 1;
  isSearching.value = true; // Set to loading state for visual feedback
  fetchQuestions();

  // Update URL params
  updateUrlParams();

  // Maintain focus on the search input after clearing
  if (searchInputRef.value) {
    searchInputRef.value.focus();
  }
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
  fetchQuestions();
}

function filterCards() {
  // Reset to first page when filters change
  currentPage.value = 1;
  fetchQuestions();

  // Update URL params
  updateUrlParams();
}

function translateQuestion(question: Question) {
  // Navigate to add translation page with question ID
  router.push({
    name: 'addTranslation',
    params: {
      id: question.id.toString()
    }
  })
}

// Pagination method
function changePage(page: number) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchQuestions();

  // Update URL params
  updateUrlParams();
}

// Add watcher to maintain focus after search completes and for search-related UI updates
watch(isSearching, (newVal) => {
  // If we were searching and now we're done, restore focus to search input
  if (!newVal && searchInputRef.value) {
    searchInputRef.value.focus();
  }
});

// Add a function to fetch all available topics for the chapter
async function fetchTopicsForChapter() {
  try {
    isLoadingTopics.value = true;

    // Get chapter ID from stored data
    const chapterId = questionBankData.value.chapterId;

    if (!chapterId) {
      console.error('Chapter ID not available');
      return;
    }

    // Fetch topics for the chapter
    const response = await axiosInstance.get(`/topics`, {
      params: {
        chapter_id: chapterId
      }
    });

    if (response.data && Array.isArray(response.data.data)) {
      // Transform API response to match our component's structure
      topicsWithIds.value = response.data.data.map((topic: ApiTopic) => ({
        id: topic.id,
        name: topic.name
      }));

      // Legacy topics array (to maintain compatibility)
      topics.value = topicsWithIds.value.map(t => t.name);
    }
  } catch (error) {
    console.error('Error fetching topics for chapter:', error);
    // Fallback to extracting topics from questions when API fails
    extractTopicsFromQuestions();
  } finally {
    isLoadingTopics.value = false;
  }
}

// Extract topics from questions as a fallback method
function extractTopicsFromQuestions() {
  const topicsMap = new Map<number, string>();

  questions.value.forEach(q => {
    if (q.topics) {
      q.topics.forEach(t => {
        if (t.topic && t.id) {
          topicsMap.set(t.id, t.topic);
        }
      });
    }
  });

  topicsWithIds.value = Array.from(topicsMap.entries()).map(([id, name]) => ({ id, name }));
  topics.value = Array.from(topicsMap.values());
}

// Update the fetchQuestions function
async function fetchQuestions() {
  try {
    // Set searching state appropriately
    if (searchQuery.value || selectedTopic.value || selectedType.value) {
      isSearching.value = true;
    }

    const mediumId = questionBankData.value.mediumId

    // Parameters for the API call including pagination and sorting
    const params: Record<string, string | number | boolean | undefined> = {
      chapter_id: questionBankData.value.chapterId,
      instruction_medium_id: questionBankData.value.mediumId,
      is_verified: true,
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value || undefined,
      topic_id: selectedTopic.value || undefined,
      question_type_id: selectedType.value || undefined
    }

    // Add sort parameters from sort mapping
    if (sortOption.value && sortMappings[sortOption.value]) {
      params.sort_by = sortMappings[sortOption.value].sort_by;
      params.sort_order = sortMappings[sortOption.value].sort_order;
    }

    console.log('API Request Params:', params); // Add logging to debug the params

    const response = await axiosInstance.get<PaginatedApiResponse<ApiQuestion>>(`/questions/untranslated/${mediumId}`, {
      params: params
    }).catch((error) => {
      console.error('Error fetching untranslated questions:', error);
      return { data: { data: [], meta: { total: 0, current_page: 1, last_page: 1, per_page: pageSize.value } } };
    });

    // Update pagination info
    if (response.data.meta) {
      totalItems.value = response.data.meta.total || 0
      totalPages.value = response.data.meta.last_page || 1
    }

    // Inside fetchQuestions function before mapping
    console.log('API Response:', response.data);

    // Transform API response to match our component's expected structure
    questions.value = (response.data.data || []).map((apiQuestion: ApiQuestion) => {
      // Get the first question text (assuming there's at least one)
      const questionTextData = apiQuestion.question_texts.length > 0
        ? apiQuestion.question_texts[0]
        : null;

      const questionText = questionTextData
        ? questionTextData.question_text
        : '';

      // Get image ID and presigned URL if available
      let imageId = null;
      let imageUrl = null;

      if (questionTextData) {
        if (questionTextData.image_id && questionTextData.image) {
          imageId = questionTextData.image_id;
          imageUrl = questionTextData.image.presigned_url;
        }
      }

      // Extract translation status
      const translationStatus = questionTextData && questionTextData.translation_status
        ? questionTextData.translation_status
        : null;

      // Extract topics
      const questionTopics = apiQuestion.question_topics.map(qt => ({
        topic: qt.topic.name,
        id: qt.topic_id
      }));

      // Handle match pairs if present
      let lhs = undefined;
      let rhs = undefined;
      let lhsImages = undefined;
      let rhsImages = undefined;

      if ((apiQuestion.question_type.type_name === 'Match the Pairs' || 
           apiQuestion.question_type.type_name === 'Complete the Correlation') &&
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
      }

      return {
        id: apiQuestion.id,
        question: questionText,
        type: apiQuestion.question_type.type_name,
        topics: questionTopics,
        lhs: lhs,
        rhs: rhs,
        lhsImages: lhsImages,
        rhsImages: rhsImages,
        isPreviousExam: apiQuestion.board_question,
        isVerified: apiQuestion.is_verified,
        imageId: imageId,
        imageUrl: imageUrl,
        translationStatus: translationStatus
      };
    });

    // If we don't have topics yet or they need refreshing, fetch them
    if (topicsWithIds.value.length === 0 && !isLoadingTopics.value) {
      fetchTopicsForChapter();
    }

    return true; // Return true to indicate successful completion
  } catch (error) {
    console.error('Error fetching untranslated questions:', error);
    return false; // Return false to indicate error
  } finally {
    // Clear search loading state but NOT the initial loading state
    // We'll handle isInitialLoading separately in onMounted
    isSearching.value = false;
  }
}

// Add a function to update URL parameters without reloading the page
function updateUrlParams() {
  const query: Record<string, string> = {};

  if (searchQuery.value) {
    query.search = searchQuery.value;
  }

  if (currentPage.value > 1) {
    query.page = currentPage.value.toString();
  }

  if (sortOption.value !== 'created_at_desc') { // Default is created_at_desc
    query.sort = sortOption.value;
  }

  if (selectedTopic.value) {
    query.topic = selectedTopic.value.toString();
  }

  if (selectedType.value) {
    query.type = selectedType.value.toString();
  }

  // Update URL without reloading the page
  router.replace({ query }).catch(() => {
    // Ignore navigation errors
  });
}

// Lifecycle hooks
onMounted(async () => {
  // Set initial loading state
  isInitialLoading.value = true;

  // Record start time for minimum loading duration
  const minLoadingTime = 800; // Consistent with AddTranslation.vue
  const startTime = Date.now();

  // Load data from localStorage
  const storedData = localStorage.getItem('questionBank');
  if (storedData) {
    questionBankData.value = JSON.parse(storedData);

    // Initialize from route query parameters if present
    const route = useRouter().currentRoute.value;

    if (route.query.search) {
      searchQuery.value = route.query.search as string;
    }

    if (route.query.page) {
      const pageNum = parseInt(route.query.page as string, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        currentPage.value = pageNum;
      }
    }

    if (route.query.sort) {
      sortOption.value = route.query.sort as string;
    }

    if (route.query.topic) {
      const topicId = parseInt(route.query.topic as string, 10);
      // We'll set the selected topic after fetching topics
      await fetchTopicsForChapter().then(() => {
        const topic = topicsWithIds.value.find(t => t.id === topicId);
        if (topic) {
          selectedTopicObj.value = topic;
        }
      });
    }

    if (route.query.type) {
      const typeId = parseInt(route.query.type as string, 10);
      const type = questionTypesWithIds.value.find(t => t.id === typeId);
      if (type) {
        selectedTypeObj.value = type;
      }
    }

    // Initialize the component by fetching questions and topics
    // Wait for fetchQuestions to complete before turning off loading state
    await fetchQuestions();
    if (!route.query.topic) {
      await fetchTopicsForChapter();
    }

    // Ensure minimum loading time to avoid flickering UI
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < minLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
    }

    // Only turn off loading after everything is complete and minimum time has elapsed
    isInitialLoading.value = false;
  } else {
    // Redirect to question bank selection if no data
    isInitialLoading.value = false;
    router.push({ name: 'questionBank' });
  }

  // Check if the filter element has the 'show' class initially
  const filterElement = document.getElementById('filter');
  if (filterElement) {
    // Check if the element has the 'show' class initially
    if (filterElement.classList.contains('show')) {
      isFilterOpen.value = true;

      // Update filter button appearance
      const filterBtn = document.querySelector('.filter-btn');
      if (filterBtn) {
        filterBtn.classList.add('active');
      }
    } else {
      isFilterOpen.value = false;
    }
  }
});
</script>

<style scoped>
#questionsSection {
  margin-top: 10px;
  margin-bottom: 90px;
}

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

/* Translate button styling */
.translate-btn {
  border: 1px solid black !important;
  transition: all 0.3s ease;
}

.translate-btn:hover {
  background-color: #212529 !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* Add search loading overlay similar to BoardDashboard */
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

.questions-searching {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}
</style>
