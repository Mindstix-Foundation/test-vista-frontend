<template>
  <div class="container my-4">
    <div class="container">
      <div class="row g-2 justify-content-end">
        <router-link class="btn btn-close" to="/admin/teacher" aria-label="Close" />
      </div>
      <div class="row justify-content-center align-items-center my-2">
        <div class="col col-12 col-sm-10 col-md-8">
          <h4 class="text-left fw-bolder text-uppercase mb-2">Add New Teacher</h4>
        </div>
      </div>
      <hr />
    </div>
    <div id="form-container" class="row mt-4 justify-content-center">
      <TeacherFormComponent @submit="handleSubmit" />
    </div>

    <LoadingSpinner :show="isSubmitting" :showOverlay="true" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import TeacherFormComponent from '@/components/forms/TeacherFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { TeacherFormData } from '@/models/Teacher'
import axiosInstance from '@/config/axios'
import { useToastStore } from '@/store/toast'

const router = useRouter()
const toastStore = useToastStore()
const isSubmitting = ref(false)

const handleSubmit = async (data: {
  formData: TeacherFormData
  changes: Array<{ type: string; message: string }>
}) => {
  console.log('AddTeacher: Starting form submission with data:', data.formData)
  console.log('AddTeacher: Teacher Subjects:', data.formData.teacherSubjects)
  try {
    isSubmitting.value = true // Show loading spinner

    // We need to make an API call to fetch the mediumStandardSubjects data
    // to extract the subject.id for each mediumStandardSubjectId
    const mediumStandardSubjectIds = data.formData.teacherSubjects.map(
      subject => subject.mediumStandardSubjectId
    );
    
    console.log('AddTeacher: Fetching medium standard subjects data');
    
    // Fetch all required medium standard subjects in a single call
    // Note: You might need to adjust this API endpoint based on your actual API
    const { data: mediumStandardSubjectsData } = await axiosInstance.get(
      `/medium-standard-subjects?ids=${mediumStandardSubjectIds.join(',')}`
    );
    
    console.log('AddTeacher: Received medium standard subjects data:', mediumStandardSubjectsData);
    
    // Create a map from mediumStandardSubject.id to actual subject.id
    const subjectIdMap = new Map<number, number>();
    
    // Define the structure for the medium standard subject data
    interface MediumStandardSubject {
      id: number;
      subject: {
        id: number;
        name: string;
      };
      instruction_medium: {
        id: number;
        instruction_medium: string;
      };
      standard: {
        id: number;
        name: string;
      };
      has_chapters: boolean;
    }
    
    // Use the interface for the data
    mediumStandardSubjectsData.forEach((msSubject: MediumStandardSubject) => {
      subjectIdMap.set(msSubject.id, msSubject.subject.id);
    });
    
    console.log('AddTeacher: Created subject ID map:', Object.fromEntries(subjectIdMap));

    // Transform the data structure to match the updated API endpoint
    const standardSubjects = data.formData.teacherSubjects.reduce((acc, subject) => {
      console.log('AddTeacher: Processing subject:', subject);
      
      // Get the actual subject.id from the mapping
      const subjectId = subjectIdMap.get(subject.mediumStandardSubjectId);
      
      if (!subjectId) {
        console.warn(
          `AddTeacher: Could not find subject.id for mediumStandardSubjectId: ${subject.mediumStandardSubjectId}`
        );
        return acc; // Skip this subject if we can't find the subject.id
      }
      
      console.log('AddTeacher: Got subject ID:', subjectId, 'for mediumStandardSubjectId:', subject.mediumStandardSubjectId);
      
      // Find or create an entry for this schoolStandardId
      const existingEntry = acc.find(entry => entry.schoolStandardId === subject.schoolStandardId);
      
      if (existingEntry) {
        console.log('AddTeacher: Adding to existing entry:', {
          schoolStandardId: subject.schoolStandardId,
          subjectId
        });
        
        // Add the subject ID if it's not already in the array
        if (!existingEntry.subjectIds.includes(subjectId)) {
          existingEntry.subjectIds.push(subjectId);
        }
      } else {
        // Create a new entry
        console.log('AddTeacher: Creating new entry:', {
          schoolStandardId: subject.schoolStandardId,
          subjectId
        });
        
        acc.push({
          schoolStandardId: subject.schoolStandardId,
          subjectIds: [subjectId]
        });
      }
      
      return acc;
    }, [] as Array<{ schoolStandardId: number; subjectIds: number[] }>);

    console.log('AddTeacher: Transformed standard subjects:', standardSubjects);

    // Create the payload for the updated API endpoint
    const payload = {
      name: data.formData.name,
      email_id: data.formData.emailId,
      password: 'Testvista@123', // Default password
      contact_number: data.formData.contactNumber,
      alternate_contact_number: data.formData.alternateContactNumber || undefined,
      highest_qualification: data.formData.highestQualification,
      status: true,
      school_id: data.formData.schoolId,
      start_date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
      end_date: null,
      standard_subjects: standardSubjects
    };

    console.log('AddTeacher: Sending request with payload:', payload);

    // Make a single API call to create the teacher with all related data
    const { data: responseData } = await axiosInstance.post('/users/teacher', payload);

    console.log('AddTeacher: Form submission completed successfully', responseData);

    // Show success toast
    toastStore.showToast({
      title: 'Success',
      message: 'Teacher created successfully!',
      type: 'success',
    });

    router.push('/admin/teacher');
  } catch (error) {
    console.error('AddTeacher: Error in form submission:', error);
    // Show error toast
    toastStore.showToast({
      title: 'Error',
      message: 'Failed to create teacher. Please try again.',
      type: 'error',
    });
  } finally {
    isSubmitting.value = false; // Hide loading spinner
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
