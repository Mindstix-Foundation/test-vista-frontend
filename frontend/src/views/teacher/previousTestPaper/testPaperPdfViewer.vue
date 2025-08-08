<template>
  <div class="container-fluid mt-3 mb-5">
    <!-- Header Section -->
    <div class="row mb-3">
      <div class="col-12">
        <div class="d-flex align-items-center">
          <button class="btn btn-outline-secondary me-3" @click="goBack">
            <i class="bi bi-arrow-left me-1"></i> Back
          </button>
          <h5 class="m-0">{{ testPaperName || 'Test Paper PDF' }}</h5>
        </div>
      </div>
    </div>

    <!-- Medium Selector -->
    <div v-if="paperMediums.length > 0" class="row mb-3">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-body py-2">
            <div class="d-flex align-items-center flex-wrap">
              <span class="me-2"><i class="bi bi-translate me-1"></i>Switch Medium:</span>
              <div class="medium-selector-buttons">
                <div 
                  v-for="mediumFile in paperMediums" 
                  :key="mediumFile.id"
                  class="medium-btn-group mx-1 mb-1"
                >
                  <button 
                    class="btn medium-btn" 
                    :class="{'btn-dark': currentPdfUrl === mediumFile.presigned_url, 'btn-outline-dark': currentPdfUrl !== mediumFile.presigned_url}"
                    @click="switchMedium(mediumFile.presigned_url, mediumFile)"
                  >
                    {{ getMediumName(mediumFile) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF Viewer -->
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm pdf-container">
          <div class="card-body p-0">
            <iframe v-if="currentPdfUrl" :src="currentPdfUrl" class="pdf-iframe" title="Test Paper PDF"></iframe>
            <div v-else class="text-center p-5">
              <p>No PDF available for this test paper.</p>
              <button class="btn btn-primary" @click="goBack">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Row -->
    <div class="row mt-3">
      <div class="col-12 text-end">
        <a v-if="currentPdfUrl" :href="currentPdfUrl" target="_blank" class="btn btn-dark">
          <i class="bi bi-box-arrow-up-right me-1"></i> Open in New Tab
        </a>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ToastNotification from '@/components/common/ToastNotification.vue';
import axiosInstance from '@/config/axios';

// Define component name
defineOptions({
  name: 'TestPaperPdfViewer'
});

// Initialize router and route
const router = useRouter();
const route = useRoute();

// Toast notification state
const showToast = ref(false);
const toastTitle = ref('');
const toastMessage = ref('');
const toastType = ref('');

// PDF state
const currentPdfUrl = ref('');
const paperMediums = ref([]);
const testPaperId = ref(null);
const testPaperName = ref('');
const selectedMedium = ref(null);

// Loading state
const isLoading = ref(false);

// Navigate back
const goBack = () => {
  router.push('/teacher/previous-test-paper');
};

// Get medium name from file
const getMediumName = (file) => {
  return file.instruction_medium?.instruction_medium || 'Unknown';
};

// Switch between different medium PDFs
const switchMedium = (pdfUrl, mediumFile) => {
  currentPdfUrl.value = pdfUrl;
  selectedMedium.value = mediumFile;
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

// Fetch test paper data
const fetchTestPaperData = async () => {
  const id = route.params.id;
  if (!id) {
    showErrorToast('Error', 'No test paper ID provided.');
    return;
  }
  
  testPaperId.value = id;
  
  try {
    isLoading.value = true;
    
    // Get the test paper data
    const response = await axiosInstance.get(`/test-paper-html/${id}`);
    
    if (response.data) {
      const paper = response.data;
      testPaperName.value = paper.name || 'Test Paper';
      
      // Get available mediums
      if (paper.html_files && paper.html_files.length > 0) {
        paperMediums.value = paper.html_files.filter(file => file.presigned_url);
        
        // Set default PDF URL
        if (paperMediums.value.length > 0) {
          // Get the default medium PDF or first available
          const defaultMedium = paperMediums.value.find(file => file.is_default_medium) || paperMediums.value[0];
          currentPdfUrl.value = defaultMedium.presigned_url;
          selectedMedium.value = defaultMedium;
        }
      } else {
        paperMediums.value = [];
        currentPdfUrl.value = '';
      }
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching test paper:', error);
    showErrorToast('Error', 'Failed to load test paper. Please try again.');
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchTestPaperData();
});
</script>

<style scoped>
.pdf-container {
  min-height: 500px;
}

.pdf-iframe {
  width: 100%;
  height: 80vh;
  border: none;
}

/* Medium selector styling */
.medium-btn {
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
}

.medium-selector-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.medium-btn-group {
  display: flex;
}
</style> 