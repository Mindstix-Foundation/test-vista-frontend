<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/teacher" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Edit Teacher Information</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <TeacherFormComponent v-if="teacherData" :initial-data="teacherData" @submit="handleSubmit" />
      <div v-else class="text-center">
        <output class="spinner-border">
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>
    </div>

    <LoadingSpinner :show="isSubmitting" :showOverlay="true" />

    <!-- Operation Result Modal -->
    <div
      class="modal fade"
      id="operationResultModal"
      tabindex="-1"
      aria-hidden="true"
      data-bs-backdrop="static"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Operation Results</h5>
          </div>
          <div class="modal-body">
            <ul class="list-group">
              <li
                v-for="(result, index) in operationResults"
                :key="index"
                class="list-group-item d-flex justify-content-between align-items-start"
                :class="{
                  'text-success': result.status === 'success',
                  'text-danger': result.status === 'error',
                }"
              >
                <div class="ms-2 me-auto">
                  <div>{{ result.operation }}</div>
                  <div v-if="result.status === 'error'" class="text-danger small">
                    Error: {{ result.message }}
                  </div>
                </div>
                <span
                  class="badge rounded-pill"
                  :class="{
                    'bg-success': result.status === 'success',
                    'bg-danger': result.status === 'error',
                  }"
                >
                  {{ result.status }}
                </span>
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-dark" @click="cleanupAndNavigate">
              Go to Teacher List
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TeacherFormComponent from '@/components/forms/TeacherFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { TeacherFormData } from '@/models/Teacher'
import axiosInstance from '@/config/axios'
import * as bootstrap from 'bootstrap'
import { useToastStore } from '@/store/toast'

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

interface SchoolStandard {
  id: number
  school_id: number
  standard: {
    id: number
    name: string
    sequence_number: number
    board_id: number
  }
}

// Add new interface for the teaching assignment structure from API
interface TeachingAssignmentResponse {
  id: number
  standard: {
    id: number
    name: string
    sequence_number: number
  }
  subject: {
    id: number
    name: string
  }
}

interface TeacherSubjectAssignment {
  schoolStandardId: number;
  mediumStandardSubjectId: number;
}

const router = useRouter()
const route = useRoute()
const teacherData = ref<TeacherFormData | null>(null)
const operationResults = ref<OperationResult[]>([])
const toastStore = useToastStore()
const isSubmitting = ref(false)
let operationResultModal: bootstrap.Modal | null = null

const fetchTeacherData = async (id: string) => {
  try {
    // Fetch user data with the new API response format
    const { data: userData } = await axiosInstance.get(`/users/${id}`)
    console.log('Fetched teacher data:', userData)

    // Extract school information from the updated API response
    const activeSchool = userData.schools && userData.schools.length > 0 ? userData.schools[0] : null
    
    let schoolStandards: SchoolStandard[] = []
    if (activeSchool) {
      // Fetch standards from school standard table
      const { data: standards } = await axiosInstance.get(
        `/school-standards/school/${activeSchool.id}`,
      )
      schoolStandards = standards
      console.log('Fetched school standards:', schoolStandards)
    }

    // Create a map of standard.id to school_standard.id for easy lookup
    const standardIdToSchoolStandardId = new Map(
      schoolStandards.map(ss => [ss.standard.id, ss.id])
    );

    // Process teaching assignments from the updated API response
    const teachingAssignments = userData.teaching_assignments || []
    
    // Process and group subjects by standard
    const standardSubjects = new Map()
    teachingAssignments.forEach((assignment: TeachingAssignmentResponse) => {
      const standardId = assignment.standard.id
      const schoolStandardId = standardIdToSchoolStandardId.get(standardId)
      if (!schoolStandardId) {
        console.warn(`No school standard ID found for standard ID ${standardId}`)
        return
      }

      const standardName = assignment.standard.name
      if (!standardSubjects.has(standardId)) {
        standardSubjects.set(standardId, {
          name: standardName,
          schoolStandardId, // Store the school_standard_id
          subjects: [],
        })
      }
      standardSubjects.get(standardId).subjects.push({
        id: assignment.subject.id, // Use the actual subject ID
        name: assignment.subject.name,
      })
    })

    // Convert Map to array format for component
    const groupedSubjectsArray = Array.from(standardSubjects.entries()).map(
      ([standardId, data]: [
        number,
        { name: string; schoolStandardId: number; subjects: Array<{ id: number; name: string }> },
      ]) => ({
        standardId,
        standardName: data.name,
        schoolStandardId: data.schoolStandardId,
        subjects: data.subjects,
      }),
    )

    // Prepare form data with the new structure
    teacherData.value = {
      name: userData.name,
      emailId: userData.email_id,
      contactNumber: userData.contact_number.toString(),
      alternateContactNumber: userData.alternate_contact_number?.toString() || '',
      highestQualification: userData.highest_qualification || '',
      schoolId: activeSchool?.id || 0,
      boardId: activeSchool?.board_id || 0,
      teacherSubjects: teachingAssignments.map((assignment: TeachingAssignmentResponse) => {
        const schoolStandardId = standardIdToSchoolStandardId.get(assignment.standard.id);
        if (!schoolStandardId) {
          console.warn(`No school standard ID found for standard ID ${assignment.standard.id}`);
          return null;
        }
        return {
          schoolStandardId, // Use the correct school_standard_id
          mediumStandardSubjectId: assignment.subject.id, // Use the actual subject ID
        };
      }).filter((assignment: TeacherSubjectAssignment | null): assignment is TeacherSubjectAssignment => assignment !== null),
      userId: parseInt(id),
      groupedSubjects: groupedSubjectsArray,
      schoolStandards: schoolStandards.map((standard: SchoolStandard) => ({
        id: standard.id, // Use the school_standard_id
        name: standard.standard.name,
        standard: standard.standard,
      })),
    }

    console.log('Teacher data prepared:', teacherData.value)
  } catch (error) {
    console.error('Error fetching teacher data:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to fetch teacher data',
      type: 'error',
    })
    router.push('/admin/teacher')
  }
}

const cleanupAndNavigate = () => {
  // Get the modal element
  const modalElement = document.getElementById('operationResultModal')
  if (modalElement) {
    operationResultModal?.hide()

    // Remove backdrop manually
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

    // Remove modal-open class and inline styles from body
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
  }

  // Navigate to teacher list
  router.push('/admin/teacher')
}

// Add helper function to format operation messages
const formatOperationMessage = (operation: string, isResult: boolean) => {
  if (!isResult) return operation // Return as is for confirmation modal

  // Convert to past tense for result modal
  if (operation.startsWith('Add ')) {
    return operation.replace('Add ', 'Added ')
  }
  if (operation.startsWith('Remove ')) {
    return operation.replace('Remove ', 'Removed ')
  }
  if (operation.startsWith('Update ')) {
    return operation.replace('Update ', 'Updated ')
  }
  return operation
}

// NEW CONSOLIDATED TEACHER UPDATE FUNCTION
const updateTeacher = async (userId: string, formData: TeacherFormData) => {
  try {
    // Reorganize the teacherSubjects data to match the expected format
    const standardSubjectsMap = new Map<number, number[]>();
    
    // Group subject IDs by schoolStandardId
    formData.teacherSubjects.forEach(subject => {
      const schoolStandardId = subject.schoolStandardId;
      if (!standardSubjectsMap.has(schoolStandardId)) {
        standardSubjectsMap.set(schoolStandardId, []);
      }
      
      // Use the subject ID directly (mediumStandardSubjectId is now the actual subject ID)
      standardSubjectsMap.get(schoolStandardId)?.push(subject.mediumStandardSubjectId);
    });
    
    // Convert to the expected format for the API
    const standard_subjects = Array.from(standardSubjectsMap.entries()).map(([schoolStandardId, subjectIds]) => ({
      schoolStandardId,
      subjectIds // These are now the actual subject IDs
    }));
    
    // Prepare the request payload
    const payload = {
      name: formData.name,
      email_id: formData.emailId,
      contact_number: formData.contactNumber,
      alternate_contact_number: formData.alternateContactNumber || null,
      highest_qualification: formData.highestQualification,
      status: true,
      school_id: formData.schoolId,
      start_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      end_date: null,
      standard_subjects
    };
    
    console.log('Updating teacher with payload:', payload);
    
    // Make the API call using the new endpoint
    const response = await axiosInstance.put(`/users/teachers/${userId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating teacher:', error);
    throw error;
  }
}

const handleSubmit = async (data: {
  formData: TeacherFormData
  changes: Array<{ type: string; message: string }>
}) => {
  try {
    console.log('[handleSubmit] Starting with formData:', data.formData)
    isSubmitting.value = true // Show loading spinner
    operationResults.value = []
    const userId = route.params.id as string
    const { formData, changes } = data
    
    // Check if there are any changes to process
    if (changes.length === 0) {
      toastStore.showToast({
        title: 'Info',
        message: 'No changes detected.',
        type: 'info',
      })
      router.push('/admin/teacher')
      return
    }
    
    try {
      // Use the new consolidated API endpoint
      const result = await updateTeacher(userId, formData);
      
      // Add a success entry for teacher update
      operationResults.value.push({
        operation: formatOperationMessage('Update Teacher Information', true),
        status: 'success',
      });
      
      // Add operation results for each change
      changes.forEach(change => {
        const changeType = change.message.split(':')[0].trim();
        let operation = '';
        
        if (changeType === 'School') {
          operation = 'Update School Assignment';
        } else if (change.message.includes('added to')) {
          operation = change.message;
        } else if (change.message.includes('removed from')) {
          operation = change.message;
        } else {
          operation = change.message;
        }
        
        operationResults.value.push({
          operation: formatOperationMessage(operation, true),
          status: 'success',
        });
      });
      
      // Show success message
      console.log('Teacher updated successfully:', result);
    } catch (error: unknown) {
      console.error('[handleSubmit] Error updating teacher:', error);
      
      // Handle specific error messages from the API
      let errorMessage = 'Failed to update teacher';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      operationResults.value.push({
        operation: 'Update Teacher',
        status: 'error',
        message: errorMessage,
      });
    }
    
    // Show the results modal if there were any operations
    if (operationResults.value.length > 0) {
      operationResultModal?.show()
    } else {
      // If no changes were made, just navigate back
      router.push('/admin/teacher')
    }
  } catch (error) {
    console.error('[handleSubmit] Error in handleSubmit:', error)
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to update teacher information',
      type: 'error',
    })
  } finally {
    isSubmitting.value = false // Hide loading spinner
  }
}

onMounted(async () => {
  const teacherId = route.params.id as string
  if (!teacherId) {
    router.push('/admin/teacher')
    return
  }

  await fetchTeacherData(teacherId)
  operationResultModal = new bootstrap.Modal(document.getElementById('operationResultModal')!)
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.list-group-item {
  transition: all 0.2s ease-in-out;
  border-left-width: 4px;
}

.list-group-item.text-success {
  border-left-color: #198754;
  color: #198754 !important;
}

.list-group-item.text-danger {
  border-left-color: #dc3545;
  color: #dc3545 !important;
}

.badge.bg-success {
  background-color: #198754 !important;
}

.badge.bg-danger {
  background-color: #dc3545 !important;
}
</style>
