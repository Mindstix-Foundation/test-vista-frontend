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
          <!-- Loading indicator -->
          <div v-if="isLoading" class="col-12 text-center my-5">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3">Loading test papers...</p>
          </div>

          <!-- Display filtered test papers -->
          <div 
            v-else-if="filteredTestPapers.length > 0"
            v-for="paper in filteredTestPapers" 
            :key="paper.id"
            class="col-md-4 mb-4 test-paper"
          >
            <div class="card" @click="viewTestPaper(paper.id)">
              <h5 class="card-header">{{ paper.name }}</h5>
              <div class="card-body">
                <p class="card-text">
                  <strong>Pattern:</strong> {{ paper.pattern?.pattern_name || 'N/A' }}<br>
                  <strong>School:</strong> {{ paper.school?.name || 'N/A' }}<br>
                  <strong>Total Marks:</strong> {{ paper.pattern?.total_marks || 'N/A' }}<br>
                  <strong>Exam Time:</strong> {{ formatExamTime(paper.exam_time) }}<br>
                  <strong>Created At:</strong> {{ formatDate(paper.created_at) }}
                </p>
                <!-- Display chapters if available -->
                <div v-if="paper.test_paper_chapters && paper.test_paper_chapters.length > 0" class="mt-2">
                  <strong>Chapters:</strong>
                  <ul class="chapter-list">
                    <li v-for="chapter in paper.test_paper_chapters.slice(0, 2)" :key="chapter.id">
                      {{ chapter.chapter?.name }} ({{ chapter.weightage }}%)
                    </li>
                    <li v-if="paper.test_paper_chapters.length > 2">
                      ... and {{ paper.test_paper_chapters.length - 2 }} more
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- No results message -->
          <div v-else-if="!isLoading && filteredTestPapers.length === 0" class="col-12 text-center mt-4">
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
import axiosInstance from '@/config/axios';

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

// Test papers data - will be populated from API
const testPapers = ref([]);

// Filter and sort test papers
const filteredTestPapers = computed(() => {
  let result = [...testPapers.value];
  
  // Apply search filter if query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(paper => 
      paper.name.toLowerCase().includes(query) ||
      (paper.pattern?.pattern_name?.toLowerCase().includes(query) || '') ||
      (paper.test_paper_chapters?.some(chapter => 
        chapter.chapter?.name.toLowerCase().includes(query)
      ) || false) ||
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
        return a.pattern?.total_marks - b.pattern?.total_marks;
      case 'marks-desc':
        return b.pattern?.total_marks - a.pattern?.total_marks;
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

// Format exam time to readable format
const formatExamTime = (examTimeString: string) => {
  if (!examTimeString) return 'N/A';
  
  try {
    const examTime = new Date(examTimeString);
    // Check if the date is valid
    if (isNaN(examTime.getTime())) return 'N/A';
    
    // Simple way to format the hours and minutes
    const hours = examTime.getHours();
    const minutes = examTime.getMinutes();
    
    // If both hours and minutes are available
    if (hours > 0 && minutes > 0) {
      return `${hours} Hour${hours !== 1 ? 's' : ''} ${minutes} Minute${minutes !== 1 ? 's' : ''}`;
    } 
    // If only hours are available
    else if (hours > 0) {
      return `${hours} Hour${hours !== 1 ? 's' : ''}`;
    } 
    // If only minutes are available
    else if (minutes > 0) {
      return `${minutes} Minute${minutes !== 1 ? 's' : ''}`;
    }
    
    return 'N/A';
  } catch (error) {
    console.error('Error formatting exam time:', error);
    return 'N/A';
  }
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
    
    // Get the current user's profile to get userId and schoolId
    const profileResponse = await axiosInstance.get('/auth/profile');
    let userId, schoolId;
    
    if (profileResponse.data && profileResponse.data.data) {
      userId = profileResponse.data.data.id;
      
      // Get schoolId if available
      if (profileResponse.data.data.schools && profileResponse.data.data.schools.length > 0) {
        schoolId = profileResponse.data.data.schools[0].id;
      }
    }
    
    // Build the query params
    let endpoint = '/test-paper-html';
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('userId', userId.toString());
    }
    
    if (schoolId) {
      params.append('schoolId', schoolId.toString());
    }
    
    // Append params if they exist
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    // Make the API call
    const response = await axiosInstance.get(endpoint);
    
    if (response.data) {
      testPapers.value = response.data;
      console.log('Test papers loaded:', testPapers.value);
    } else {
      testPapers.value = [];
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching test papers:', error);
    showErrorToast('Error', 'Failed to load test papers. Please try again.');
    testPapers.value = [];
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
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.chapter-list {
  list-style: disc;
  padding-left: 20px;
  margin-top: 5px;
  font-size: 0.9rem;
}

.chapter-list li {
  margin-bottom: 3px;
}

.dynamic-style {
  /* Styling for dynamic elements */
}
</style> 