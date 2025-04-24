<template>
  <div class="container mt-4 mb-5">
    <!-- Header Section -->
    <div class="row p-2 g-2 mb-1">
      <div class="row justify-content-center align-items-center g-2 mb-4" style="margin-left:4px">
        <div class="col-12 col-sm-5">
          <h5 class="text-left m-0 fw-bolder text-uppercase">previous test papers</h5>
        </div>

        <div class="col-12 col-sm-5 dynamic-style text-end">
          <!-- Reserved for action buttons -->
        </div>
      </div>
      <hr>
    </div>

    <div class="row justify-content-center align-items-center g-2 mb-4">
      <div class="col-md-8">
        <!-- Search and Sorting Controls -->
        <div class="row mb-4">
          <!-- Search Container -->
          <div class="col-12 col-md-8 mb-3">
            <div class="search-container">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                class="form-control" 
                placeholder="Search by Name, Subject, Marks, Date"
                @input="searchTestPapers"
              >
            </div>
          </div>

          <!-- Sort Select -->
          <div class="col-12 col-md-4 mb-3">
            <select 
              v-model="sortOption" 
              class="form-select" 
              @change="sortTestPapers"
            >
              <option value="name-asc">Sort by Name (A-Z)</option>
              <option value="name-desc">Sort by Name (Z-A)</option>
              <option value="date-asc">Sort by Date (Oldest First)</option>
              <option value="date-desc">Sort by Date (Newest First)</option>
              <option value="marks-asc">Sort by Marks (Low to High)</option>
              <option value="marks-desc">Sort by Marks (High to Low)</option>
            </select>
          </div>
        </div>

        <!-- Test Papers Cards -->
        <div class="row" id="testPaperCards">
          <!-- Display filtered test papers -->
          <div 
            v-for="paper in filteredTestPapers" 
            :key="paper.id"
            class="col-md-4 mb-4 test-paper"
          >
            <div class="card" @click="viewTestPaper(paper.id)">
              <h5 class="card-header">{{ paper.name }}</h5>
              <div class="card-body">
                <p class="card-text">
                  <strong>Standard:</strong> {{ paper.standard }}<br>
                  <strong>Subject:</strong> {{ paper.subject }}<br>
                  <strong>Total Marks:</strong> {{ paper.marks }}<br>
                  <strong>Pattern Name:</strong> {{ paper.pattern }}<br>
                  <strong>Created At:</strong> {{ formatDate(paper.created_at) }}
                </p>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-if="filteredTestPapers.length === 0" class="col-12 text-center mt-4">
            <p class="text-muted">No test papers found. Try adjusting your search.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification for status messages -->
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ToastNotification from '@/components/common/ToastNotification.vue';

// Define component name
defineOptions({
  name: 'PreviousTestPaperDashboard'
});

// Initialize router
const router = useRouter();

// Toast notification state
const showToast = ref(false);
const toastTitle = ref('');
const toastMessage = ref('');
const toastType = ref('');

// Search and sort state
const searchQuery = ref('');
const sortOption = ref('date-desc'); // Default sort: newest first

// Loading state
const isLoading = ref(false);

// Test papers data
const testPapers = ref([
  // Sample data - will be replaced with API call
  {
    id: 1,
    name: 'Mid Term Paper',
    standard: '10th',
    subject: 'Science',
    marks: 20,
    pattern: 'MCQ Only',
    created_at: '2024-11-16T11:50:00'
  },
  {
    id: 2,
    name: 'End Term Paper',
    standard: '10th',
    subject: 'Science-2',
    marks: 40,
    pattern: 'Board Paper Pattern',
    created_at: '2024-11-14T11:50:00'
  },
  {
    id: 3,
    name: 'Final Exam',
    standard: '10th',
    subject: 'Mathematics',
    marks: 50,
    pattern: 'Board Pattern',
    created_at: '2024-12-01T09:00:00'
  },
  {
    id: 4,
    name: 'Unit Test 1',
    standard: '10th',
    subject: 'English',
    marks: 30,
    pattern: 'Short Answer',
    created_at: '2024-11-20T10:30:00'
  },
  {
    id: 5,
    name: 'Quarterly Exam',
    standard: '10th',
    subject: 'History',
    marks: 40,
    pattern: 'Essay Type',
    created_at: '2024-11-25T14:00:00'
  },
  {
    id: 6,
    name: 'Annual Exam',
    standard: '10th',
    subject: 'Geography',
    marks: 60,
    pattern: 'Multiple Choice & Short Answer',
    created_at: '2024-12-15T15:30:00'
  }
]);

// Filter and sort test papers
const filteredTestPapers = computed(() => {
  let result = [...testPapers.value];
  
  // Apply search filter if query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(paper => 
      paper.name.toLowerCase().includes(query) ||
      paper.subject.toLowerCase().includes(query) ||
      paper.marks.toString().includes(query) ||
      paper.created_at.includes(query)
    );
  }
  
  // Apply sorting
  result.sort((a, b) => {
    switch (sortOption.value) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'date-asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'date-desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'marks-asc':
        return a.marks - b.marks;
      case 'marks-desc':
        return b.marks - a.marks;
      default:
        return 0;
    }
  });
  
  return result;
});

// Format date to readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
};

// Search test papers (debounced in real implementation)
const searchTestPapers = () => {
  // In a real implementation, this might be debounced
  // For now, the computed property handles filtering
};

// Sort test papers
const sortTestPapers = () => {
  // The computed property handles sorting
};

// View test paper details
const viewTestPaper = (paperId: number) => {
  // Navigate to test paper view page
  router.push(`/teacher/testPaper/view/${paperId}`);
};

// Toast notification methods
const showErrorToast = (title: string, message: string) => {
  toastTitle.value = title;
  toastMessage.value = message;
  toastType.value = 'danger';
  showToast.value = true;
};

const closeToast = () => {
  showToast.value = false;
};

// Fetch test papers from API
const fetchTestPapers = async () => {
  try {
    isLoading.value = true;
    
    // In a real implementation, this would be an API call
    // const response = await axiosInstance.get('/api/teacher/test-papers');
    // testPapers.value = response.data;
    
    // Using sample data for now
    // Already defined above
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching test papers:', error);
    showErrorToast('Error', 'Failed to load test papers. Please try again.');
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchTestPapers();
});
</script>

<style scoped>
.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

input[type="text"] {
  padding-left: 30px;
}

.card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.dynamic-style {
  /* Styling for dynamic elements */
}
</style> 