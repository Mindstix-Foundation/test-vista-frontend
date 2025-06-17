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
        <button
          v-if="currentPdfUrl && selectedMedium"
          class="btn btn-outline-danger me-2"
          @click="confirmDeleteMedium(selectedMedium)"
          :disabled="isDeleteLoading"
        >
          <i class="bi" :class="isDeleteLoading ? 'bi-hourglass-split' : 'bi-trash'"></i>
          Delete Current Medium
        </button>
        <a v-if="currentPdfUrl" :href="currentPdfUrl" target="_blank" class="btn btn-dark">
          <i class="bi bi-box-arrow-up-right me-1"></i> Open in New Tab
        </a>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteConfirmModalLabel">Confirm Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the <strong>{{ selectedMediumToDelete?.instruction_medium?.instruction_medium || 'selected' }}</strong> version of this test paper?</p>
            <p class="text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>This action cannot be undone.</p>
            
            <!-- Verification input -->
            <div class="mt-3">
              <label for="deleteVerification" class="form-label">Type <strong>DELETE</strong> in the box below to confirm:</label>
              <input 
                type="text" 
                id="deleteVerification" 
                class="form-control" 
                v-model="deleteVerificationText"
                placeholder="Type DELETE here"
                autocomplete="off"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger"
              @click="deleteMedium"
              :disabled="isDeleteLoading || deleteVerificationText !== 'DELETE'"
            >
              <span v-if="isDeleteLoading">
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </span>
              <span v-else>
                <i class="bi bi-trash me-2"></i>Delete
              </span>
            </button>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ToastNotification from '@/components/common/ToastNotification.vue';
import axiosInstance from '@/config/axios';
import { Modal } from 'bootstrap';

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
let deleteConfirmModal = null;

// Delete medium state
const isDeleteLoading = ref(false);
const selectedMediumToDelete = ref(null);
const deleteVerificationText = ref('');

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

// Confirm medium deletion
const confirmDeleteMedium = (mediumFile) => {
  selectedMediumToDelete.value = mediumFile;
  deleteVerificationText.value = ''; // Reset verification text
  
  // Initialize delete confirmation modal if it doesn't exist
  if (!deleteConfirmModal) {
    const modalElement = document.getElementById('deleteConfirmModal');
    if (modalElement) {
      deleteConfirmModal = new Modal(modalElement);
    }
  }
  
  if (deleteConfirmModal) {
    deleteConfirmModal.show();
  }
};

// Delete medium
const deleteMedium = async () => {
  if (!selectedMediumToDelete.value || !testPaperId.value) {
    showErrorToast('Error', 'Invalid test paper or medium selected.');
    return;
  }
  
  const paperId = testPaperId.value;
  const instructionMediumId = selectedMediumToDelete.value.instruction_medium_id;
  
  if (!instructionMediumId) {
    showErrorToast('Error', 'Could not determine the medium ID.');
    return;
  }
  
  try {
    isDeleteLoading.value = true;
    
    // Call the DELETE API endpoint
    await axiosInstance.delete(`/test-paper-html/${paperId}/medium/${instructionMediumId}`);
    
    // Close the delete confirmation modal
    if (deleteConfirmModal) {
      deleteConfirmModal.hide();
    }
    
    // Remove deleted medium from the list
    const mediumIndex = paperMediums.value.findIndex(m => 
      m.instruction_medium_id === instructionMediumId
    );
    
    if (mediumIndex !== -1) {
      // If currently viewing this medium, switch to another one if available
      if (currentPdfUrl.value === paperMediums.value[mediumIndex].presigned_url) {
        if (paperMediums.value.length > 1) {
          // Find next available medium
          const nextIndex = mediumIndex === paperMediums.value.length - 1 ? 0 : mediumIndex + 1;
          currentPdfUrl.value = paperMediums.value[nextIndex].presigned_url;
          selectedMedium.value = paperMediums.value[nextIndex];
        } else {
          // No more mediums available
          currentPdfUrl.value = '';
          selectedMedium.value = null;
        }
      }
      
      // Remove from the array
      paperMediums.value.splice(mediumIndex, 1);
    }
    
    // Show success toast
    toastTitle.value = 'Success';
    toastMessage.value = 'Medium deleted successfully.';
    toastType.value = 'success';
    showToast.value = true;
    
    // If no more mediums available, go back to the dashboard
    if (paperMediums.value.length === 0) {
      setTimeout(() => {
        goBack();
      }, 1500);
    }
  } catch (error) {
    console.error('Error deleting medium:', error);
    let errorMessage = 'Failed to delete medium. Please try again.';
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = 'The medium could not be found. It may have been already deleted.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    showErrorToast('Error', errorMessage);
  } finally {
    isDeleteLoading.value = false;
    selectedMediumToDelete.value = null;
  }
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