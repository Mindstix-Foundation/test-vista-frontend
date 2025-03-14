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
import type { TeacherFormData } from '@/models/Teacher'
import axiosInstance from '@/config/axios'
import * as bootstrap from 'bootstrap'
import { useToastStore } from '@/store/toast'

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

interface SchoolAssignment {
  end_date: string | null
  school: {
    id: number
    name: string
    board_id: number
  }
}

interface SchoolStandard {
  standard_id: number
  standard: {
    id: number
    name: string
  }
}

interface TeacherSubject {
  id: number
  school_standard: {
    id: number
    standard: {
      id: number
      name: string
    }
  }
  medium_standard_subject: {
    id: number
    subject: {
      name: string
    }
  }
}

const router = useRouter()
const route = useRoute()
const teacherData = ref<TeacherFormData | null>(null)
const operationResults = ref<OperationResult[]>([])
const toastStore = useToastStore()
let operationResultModal: bootstrap.Modal | null = null

const fetchTeacherData = async (id: string) => {
  try {
    // Fetch user data
    const { data: userData } = await axiosInstance.get(`/users/${id}`)

    // Fetch school data
    const { data: schoolData } = await axiosInstance.get(`/user-schools/user/${id}`)
    const activeSchool = schoolData.find((s: SchoolAssignment) => !s.end_date)

    let schoolStandards: SchoolStandard[] = []
    if (activeSchool) {
      // Fetch standards from school standard table
      const { data: standards } = await axiosInstance.get(
        `/school-standards/school/${activeSchool.school.id}`,
      )
      schoolStandards = standards
    }

    // Fetch teacher subjects
    const { data: subjectsData } = await axiosInstance.get(`/teacher-subjects?userId=${id}`)

    // Process and group subjects by standard
    const standardSubjects = new Map()
    subjectsData.forEach((subject: TeacherSubject) => {
      const standardId = subject.school_standard.standard.id
      const standardName = subject.school_standard.standard.name
      if (!standardSubjects.has(standardId)) {
        standardSubjects.set(standardId, {
          name: standardName,
          subjects: [],
        })
      }
      standardSubjects.get(standardId).subjects.push({
        id: subject.medium_standard_subject.id,
        name: subject.medium_standard_subject.subject.name,
      })
    })

    // Convert Map to array format for component
    const groupedSubjectsArray = Array.from(standardSubjects.entries()).map(
      ([standardId, data]: [
        number,
        { name: string; subjects: Array<{ id: number; name: string }> },
      ]) => ({
        standardId,
        standardName: data.name,
        subjects: data.subjects,
      }),
    )

    // Prepare form data
    teacherData.value = {
      name: userData.name,
      emailId: userData.email_id,
      contactNumber: userData.contact_number.toString(),
      alternateContactNumber: userData.alternate_contact_number?.toString(),
      highestQualification: userData.highest_qualification || '',
      schoolId: activeSchool?.school.id || 0,
      boardId: activeSchool?.school.board_id || 0,
      teacherSubjects: subjectsData.map((subject: TeacherSubject) => ({
        schoolStandardId: subject.school_standard.id,
        mediumStandardSubjectId: subject.medium_standard_subject.id,
      })),
      userId: parseInt(id),
      groupedSubjects: groupedSubjectsArray,
      schoolStandards: schoolStandards.map((standard: SchoolStandard) => ({
        id: standard.standard_id,
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

const updateUserData = async (userId: string, formData: TeacherFormData) => {
  await axiosInstance.put(`/users/${userId}`, {
    name: formData.name,
    email_id: formData.emailId,
    contact_number: formData.contactNumber,
    alternate_contact_number: formData.alternateContactNumber,
    highest_qualification: formData.highestQualification,
  })
}

const updateSchoolAssignment = async (userId: string, schoolId: number) => {
  // Get current school assignments
  const { data: schoolData } = await axiosInstance.get(`/user-schools/user/${userId}`)

  // Find the active school assignment (one without an end_date)
  const activeSchool = schoolData.find((s: SchoolAssignment) => !s.end_date)

  // If there's an active school and it's different from the selected school
  if (activeSchool && activeSchool.school.id !== schoolId) {
    // End the current active assignment
    await axiosInstance.put(`/user-schools/${activeSchool.id}`, {
      ...activeSchool,
      end_date: new Date().toISOString(),
    })
  }

  // If there's no active school or the school has changed, create a new assignment
  if (!activeSchool || activeSchool.school.id !== schoolId) {
    // Create new assignment with null end_date
    await axiosInstance.post('/user-schools', {
      user_id: parseInt(userId, 10),
      school_id: schoolId,
      start_date: new Date().toISOString(),
      end_date: null,
    })
  }
}

const deleteSubject = async (subjectId: number) => {
  await axiosInstance.delete(`/teacher-subjects/${subjectId}`)
}

const addSubject = async (
  userId: string,
  schoolStandardId: number,
  mediumStandardSubjectId: number,
) => {
  await axiosInstance.post('/teacher-subjects', {
    user_id: parseInt(userId, 10),
    school_standard_id: schoolStandardId,
    medium_standard_subject_id: mediumStandardSubjectId,
  })
}

const cleanupAndNavigate = () => {
  operationResultModal?.hide()
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

const getSubjectDetails = async (mediumStandardSubjectId: number) => {
  console.log('[getSubjectDetails] Starting with mediumStandardSubjectId:', mediumStandardSubjectId)

  try {
    const { data } = await axiosInstance.get(`/medium-standard-subjects/${mediumStandardSubjectId}`)
    console.log('[getSubjectDetails] Response data:', data)

    return {
      name: data.subject?.name || 'Unknown Subject',
      standardName: data.standard?.name || 'Unknown Standard',
    }
  } catch (error) {
    console.error('[getSubjectDetails] Error:', error)
    return {
      name: 'Unknown Subject',
      standardName: 'Unknown Standard',
    }
  }
}

const handleSubmit = async (data: {
  formData: TeacherFormData
  changes: Array<{ type: string; message: string }>
}) => {
  try {
    console.log('[handleSubmit] Starting with formData:', data.formData)
    operationResults.value = []
    const userId = route.params.id as string
    const { formData, changes } = data

    // Only update user data if there are changes to basic information
    const hasBasicInfoChanges = changes.some((change) =>
      ['Name:', 'Email:', 'Contact Number:', 'Alternate Contact:', 'Qualification:'].some(
        (prefix) => change.message.startsWith(prefix),
      ),
    )

    if (hasBasicInfoChanges) {
      try {
        await updateUserData(userId, formData)
        operationResults.value.push({
          operation: formatOperationMessage('Update Teacher Information', true),
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: formatOperationMessage('Update Teacher Information', false),
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update teacher information',
        })
      }
    }

    // Update school assignment if changed
    if (formData.schoolId !== teacherData.value?.schoolId) {
      try {
        await updateSchoolAssignment(userId, formData.schoolId)
        operationResults.value.push({
          operation: formatOperationMessage('Update School Assignment', true),
          status: 'success',
        })

        // After successful school change, handle subject changes
        const { data: subjectsData } = await axiosInstance.get(`/teacher-subjects?userId=${userId}`)

        // Remove all existing subject assignments as school has changed
        for (const subject of subjectsData) {
          try {
            await deleteSubject(subject.id)
          } catch (error) {
            console.error('[handleSubmit] Error removing old subject:', error)
          }
        }

        // Add new subject assignments
        for (const subject of formData.teacherSubjects) {
          try {
            const subjectDetails = await getSubjectDetails(subject.mediumStandardSubjectId)
            await addSubject(userId, subject.schoolStandardId, subject.mediumStandardSubjectId)
            operationResults.value.push({
              operation: formatOperationMessage(
                `Add "${subjectDetails.name}" to Standard ${subjectDetails.standardName}`,
                true,
              ),
              status: 'success',
            })
          } catch (error) {
            operationResults.value.push({
              operation: 'Add Subject',
              status: 'error',
              message: error instanceof Error ? error.message : 'Failed to add subject assignment',
            })
          }
        }
      } catch (error) {
        operationResults.value.push({
          operation: formatOperationMessage('Update School Assignment', false),
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update school assignment',
        })
      }
    } else {
      // If school hasn't changed, handle only subject changes
      const { data: subjectsData } = await axiosInstance.get(`/teacher-subjects?userId=${userId}`)

      // Find subjects to remove
      const subjectsToRemove = subjectsData.filter(
        (current: TeacherSubject) =>
          !formData.teacherSubjects.some(
            (newSubj) =>
              newSubj.schoolStandardId === current.school_standard.id &&
              newSubj.mediumStandardSubjectId === current.medium_standard_subject.id,
          ),
      )

      // Find subjects to add
      const subjectsToAdd = formData.teacherSubjects.filter(
        (newSubj) =>
          !subjectsData.some(
            (current: TeacherSubject) =>
              current.school_standard.id === newSubj.schoolStandardId &&
              current.medium_standard_subject.id === newSubj.mediumStandardSubjectId,
          ),
      )

      // Process removals
      for (const subject of subjectsToRemove) {
        try {
          await deleteSubject(subject.id)
          const standardName = subject.school_standard.standard.name
          const subjectName = subject.medium_standard_subject.subject.name
          operationResults.value.push({
            operation: formatOperationMessage(
              `Remove "${subjectName}" from Standard ${standardName}`,
              true,
            ),
            status: 'success',
          })
        } catch (error) {
          const standardName = subject.school_standard.standard.name
          const subjectName = subject.medium_standard_subject.subject.name
          operationResults.value.push({
            operation: formatOperationMessage(
              `Remove "${subjectName}" from Standard ${standardName}`,
              false,
            ),
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to remove subject assignment',
          })
        }
      }

      // Process additions
      for (const subject of subjectsToAdd) {
        try {
          const subjectDetails = await getSubjectDetails(subject.mediumStandardSubjectId)
          await addSubject(userId, subject.schoolStandardId, subject.mediumStandardSubjectId)
          operationResults.value.push({
            operation: formatOperationMessage(
              `Add "${subjectDetails.name}" to Standard ${subjectDetails.standardName}`,
              true,
            ),
            status: 'success',
          })
        } catch (error) {
          operationResults.value.push({
            operation: 'Add Subject',
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to add subject assignment',
          })
        }
      }
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
