<template>
  <div class="container mb-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <BoardFormComponent
          :isEditMode="true"
          :boardId="route.params.id as string"
          @submit="handleSubmit"
        />
      </div>
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
        <div class="modal-footer justify-content-center">
          <button type="button" class="btn btn-dark" @click="cleanupAndNavigate">
            Go to Board List
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import BoardFormComponent from '@/components/forms/BoardFormComponent.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import axiosInstance from '@/config/axios'
import { onMounted, ref } from 'vue'
import type {
  CreateInstructionMediumDto,
  CreateStandardDto,
  CreateSubjectDto,
  CreateBoardDto,
  CreateAddressDto,
} from '@/models/Board'
import * as bootstrap from 'bootstrap'

interface ExistingItem {
  id: number
  board_id: number
  name?: string
  instruction_medium?: string
  sequence_number?: number
}

// Add interfaces for board API response
interface InstructionMedium {
  id: number
  instruction_medium: string
  created_at: string
  updated_at: string
}

interface Standard {
  id: number
  name: string
  sequence_number: number
  created_at: string
  updated_at: string
}

interface Subject {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface BoardApiResponse {
  id: number
  name: string
  abbreviation: string
  address_id: number
  created_at: string
  updated_at: string
  address: {
    id: number
    postal_code: string
    street: string
    city_id: number
    city: {
      id: number
      name: string
      state_id: number
      state: {
        id: number
        name: string
        country_id: number
        country: {
          id: number
          name: string
        }
      }
    }
  }
  instruction_mediums: InstructionMedium[]
  standards: Standard[]
  subjects: Subject[]
}

// Add interfaces for form data with IDs
interface MediumFormData extends CreateInstructionMediumDto {
  id?: number
}

interface StandardFormData extends CreateStandardDto {
  id?: number
}

interface SubjectFormData extends CreateSubjectDto {
  id?: number
}

interface BoardFormSubmitData {
  address: CreateAddressDto
  board: CreateBoardDto
  mediums: MediumFormData[]
  standards: StandardFormData[]
  subjects: SubjectFormData[]
  changes?: Change[]
}

interface SchoolRelatedItem {
  id: number
  [key: string]: number | string | boolean | null
}

interface OperationResult {
  operation: string
  status: 'success' | 'error'
  message?: string
}

interface Change {
  type: 'delete' | 'modify' | 'add'
  message: string
  entity: 'medium' | 'standard' | 'subject' | 'board' | 'separator'
  data: {
    id?: number
    name?: string
    old?: { id: number; name: string }
    new?: { id?: number; name: string }
  }
}

const router = useRouter()
const route = useRoute()
const operationResults = ref<OperationResult[]>([])
const isSubmitting = ref(false)

onMounted(() => {
  console.log('EditBoard mounted with board ID:', route.params.id)
})

const updateBoard = async (formData: BoardFormSubmitData): Promise<BoardApiResponse> => {
  const { data } = await axiosInstance.put<BoardApiResponse>(`/boards/${route.params.id}`, {
    name: formData.board.name,
    abbreviation: formData.board.abbreviation,
  })
  return data
}

const deleteRelatedSchoolItems = async (
  endpoint: string,
  itemId: number,
  relationField: string,
): Promise<void> => {
  const { data: allItems } = await axiosInstance.get(endpoint)
  const relatedItems = allItems.filter((item: SchoolRelatedItem) => item[relationField] === itemId)

  for (const item of relatedItems) {
    try {
      await axiosInstance.delete(`${endpoint}/${item.id}`)
    } catch (error) {
      console.error(`Failed to delete related item ${item.id}:`, error)
    }
  }
}

const deleteMedium = async (medium: ExistingItem): Promise<void> => {
  console.log('Attempting to delete medium:', medium)
  await deleteRelatedSchoolItems('/school-instruction-mediums', medium.id, 'instruction_medium_id')
  await axiosInstance.delete(`/instruction-mediums/${medium.id}`)
}

const updateMedium = async (id: number, medium: MediumFormData, boardId: number): Promise<void> => {
  await axiosInstance.put(`/instruction-mediums/${id}`, {
    name: medium.name,
    board_id: boardId,
  })
}

const createMedium = async (medium: MediumFormData, boardId: number): Promise<void> => {
  await axiosInstance.post('/instruction-mediums', {
    name: medium.name,
    board_id: boardId,
  })
}

const handleMediumChanges = async (
  formMediums: MediumFormData[],
  existingMediums: ExistingItem[],
  boardId: number,
): Promise<void> => {
  console.log('Starting medium changes with:', {
    formMediums: formMediums.map((m) => ({ id: m.id, name: m.name })),
    existingMediums: existingMediums.map((m) => ({ id: m.id, name: m.instruction_medium })),
  })

  const validFormMediums = formMediums.filter((m) => m.name.trim())

  // Create maps for easier comparison
  const formMediumsMap = new Map(
    validFormMediums.map((m) => [m.id, { ...m, name: m.name.toLowerCase().trim() }]),
  )
  const existingMediumsMap = new Map(
    existingMediums.map((m) => [
      m.id,
      { ...m, instruction_medium: m.instruction_medium?.toLowerCase().trim() },
    ]),
  )

  // Determine which mediums need to be deleted, updated, or added
  const toDelete = existingMediums.filter(m => !formMediumsMap.get(m.id))

  const toUpdate = validFormMediums.filter(m => {
    if (!m.id) return false
    const existingMedium = existingMediumsMap.get(m.id)
    return existingMedium && existingMedium.instruction_medium !== m.name.toLowerCase().trim()
  })

  const toAdd = validFormMediums.filter(m => !m.id)

  // Log the comparison
  console.log('Medium comparison:', {
    toDelete: toDelete.map((m) => m.instruction_medium),
    toUpdate: toUpdate.map((m) => m.name),
    toAdd: toAdd.map((m) => m.name),
  })

  // Process deletions
  await processDeletes(toDelete)
  
  // Process updates
  await processUpdates(toUpdate, existingMediumsMap, boardId)
  
  // Process additions
  await processAdditions(toAdd, boardId)
}

// Helper functions to reduce complexity
const processDeletes = async (items: ExistingItem[]): Promise<void> => {
  for (const item of items) {
    try {
      console.log('Deleting medium:', item.instruction_medium)
      await deleteMedium(item)
      operationResults.value.push({
        operation: `Deleted medium: ${item.instruction_medium}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error deleting medium:', item, error)
      operationResults.value.push({
        operation: `Delete medium: ${item.instruction_medium}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

const processUpdates = async (
  items: MediumFormData[], 
  existingMap: Map<number, ExistingItem>, 
  boardId: number
): Promise<void> => {
  for (const item of items) {
    try {
      if (!item.id) continue
      const existingItem = existingMap.get(item.id)
      console.log('Updating medium:', {
        from: existingItem?.instruction_medium,
        to: item.name,
      })
      await updateMedium(item.id, item, boardId)
      operationResults.value.push({
        operation: `Updated medium: ${existingItem?.instruction_medium} → ${item.name}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error updating medium:', item, error)
      operationResults.value.push({
        operation: `Update medium: ${item.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

const processAdditions = async (items: MediumFormData[], boardId: number): Promise<void> => {
  for (const item of items) {
    try {
      console.log('Adding new medium:', item.name)
      await createMedium(item, boardId)
      operationResults.value.push({
        operation: `Added medium: ${item.name}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error adding medium:', item, error)
      operationResults.value.push({
        operation: `Add medium: ${item.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

const deleteStandard = async (standard: ExistingItem): Promise<void> => {
  console.log('Attempting to delete standard:', standard)
  await deleteRelatedSchoolItems('/school-standards', standard.id, 'standard_id')
  await axiosInstance.delete(`/standards/${standard.id}`)
}

const updateStandard = async (
  id: number,
  standard: StandardFormData,
  boardId: number,
): Promise<void> => {
  // Only update the name if it has changed, not the sequence
  await axiosInstance.put(`/standards/${id}`, {
    name: standard.name,
    board_id: boardId
  })
}

const reorderStandard = async (
  id: number,
  newPosition: number,
  boardId: number
): Promise<void> => {
  // Use the specific reorder API endpoint with the correct parameters
  console.log(`Calling reorder API for standard ${id} to position ${newPosition} in board ${boardId}`);

  try {
    const response = await axiosInstance.put(`/standards/${id}/reorder`, {
      newPosition,
      boardId
    });
    console.log('Reorder API response:', response.data);
  } catch (error) {
    console.error('Error in reorderStandard API call:', error);
    throw error;
  }
}

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createStandard = async (standard: StandardFormData, boardId: number): Promise<void> => {
  await axiosInstance.post('/standards', {
    name: standard.name,
    board_id: boardId,
    sequence_number: standard.sequence_number
  })
}

// Helper functions for standard changes
const detectOrderChanges = (
  formStandards: (StandardFormData & { _reorderDetected?: boolean })[],
  existingStandards: ExistingItem[]
): boolean => {
  const reorderDetected = formStandards.length > 0 && formStandards[0]._reorderDetected === true;
  
  const validFormStandards = formStandards.filter(s => s.name.trim());
  
  // Create a map of standard IDs to their positions in the form
  const formStandardPositions = new Map<number, number>();
  validFormStandards.forEach((standard, index) => {
    if (standard.id) {
      formStandardPositions.set(standard.id, index + 1); // 1-based position
    }
  });

  // Check if any standard has a different position in the form compared to its current sequence_number
  const orderChanged = existingStandards.some(standard => {
    const formPosition = formStandardPositions.get(standard.id);
    return formPosition !== undefined && formPosition !== standard.sequence_number;
  });

  // Also check if the order has changed by comparing the IDs in their current order
  const formStandardIds = validFormStandards.filter(s => s.id).map(s => s.id);
  const existingStandardIds = existingStandards.map(s => s.id);
  const idsOrderChanged = JSON.stringify(formStandardIds) !== JSON.stringify(existingStandardIds);

  return orderChanged || idsOrderChanged || reorderDetected;
}

const processStandardDeletions = async (
  toDelete: ExistingItem[]
): Promise<void> => {
  for (const standard of toDelete) {
    try {
      await deleteStandard(standard);
      operationResults.value.push({
        operation: `Deleted standard: ${standard.name}`,
        status: 'success',
      });
      // Add delay after deletion to prevent deadlocks
      await delay(300);
    } catch (error) {
      operationResults.value.push({
        operation: `Delete standard: ${standard.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

const processStandardNameUpdates = async (
  formStandardsMap: Map<number, StandardFormData>,
  existingStandardsMap: Map<number, ExistingItem>,
  boardId: number
): Promise<void[]> => {
  const promises: Promise<void>[] = [];
  
  for (const [id, standard] of formStandardsMap) {
    if (!id) continue;
    const existing = existingStandardsMap.get(id);
    
    // Check if name has changed
    if (existing?.name !== standard.name) {
      const promise = (async () => {
        try {
          await updateStandard(id, standard, boardId);
          operationResults.value.push({
            operation: `Updated standard: ${existing?.name} → ${standard.name}`,
            status: 'success',
          });
        } catch (error) {
          operationResults.value.push({
            operation: `Update standard: ${standard.name}`,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      })();
      promises.push(promise);
    }
  }
  
  return promises;
}

const processStandardAdditions = async (
  toAdd: StandardFormData[],
  boardId: number
): Promise<void[]> => {
  const promises: Promise<void>[] = [];
  
  for (const standard of toAdd) {
    const promise = (async () => {
      try {
        await createStandard(standard, boardId);
        operationResults.value.push({
          operation: `Added standard: ${standard.name} (sequence: ${standard.sequence_number})`,
          status: 'success',
        });
      } catch (error) {
        operationResults.value.push({
          operation: `Add standard: ${standard.name}`,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })();
    promises.push(promise);
  }
  
  return promises;
}

const findMovedStandards = (
  validFormStandards: StandardFormData[],
  updatedStandards: ExistingItem[],
  standardIdToPositionMap: Map<number, number>,
  standardIdToNameMap: Map<number, string>
): {id: number, name: string, fromPosition: number, toPosition: number}[] => {
  const movedStandards: {id: number, name: string, fromPosition: number, toPosition: number}[] = [];
  
  // Check for standards that need to be moved
  for (let i = 0; i < validFormStandards.length; i++) {
    const standard = validFormStandards[i];
    let standardId = standard.id;
    
    // Find ID for new standards
    if (!standardId) {
      const matchingStandard = updatedStandards.find(
        s => s.name.toLowerCase().trim() === standard.name.toLowerCase().trim()
      );
      if (matchingStandard) {
        standardId = matchingStandard.id;
      }
    }
    
    if (standardId) {
      const desiredPosition = i + 1; // 1-based position
      const currentPosition = standardIdToPositionMap.get(standardId) ?? 0;
      
      if (currentPosition !== desiredPosition) {
        movedStandards.push({
          id: standardId,
          name: standardIdToNameMap.get(standardId) ?? standard.name,
          fromPosition: currentPosition,
          toPosition: desiredPosition
        });
      }
    }
  }
  
  return movedStandards;
}

const forceReorderStandards = (
  validFormStandards: StandardFormData[],
  standardIdToPositionMap: Map<number, number>
): {id: number, name: string, fromPosition: number, toPosition: number}[] => {
  const movedStandards: {id: number, name: string, fromPosition: number, toPosition: number}[] = [];
  
  for (let i = 0; i < validFormStandards.length; i++) {
    const standard = validFormStandards[i];
    if (standard.id) {
      const desiredPosition = i + 1; // 1-based position
      const currentPosition = standardIdToPositionMap.get(standard.id) ?? 0;
      
      // Force reordering for all standards
      movedStandards.push({
        id: standard.id,
        name: standard.name,
        fromPosition: currentPosition,
        toPosition: desiredPosition
      });
    }
  }
  
  return movedStandards;
}

const processStandardReordering = async (
  movedStandards: {id: number, name: string, fromPosition: number, toPosition: number}[],
  boardId: number
): Promise<void> => {
  for (const standard of movedStandards) {
    try {
      console.log(`Reordering standard ${standard.name} from position ${standard.fromPosition} to ${standard.toPosition}`);
      
      await reorderStandard(standard.id, standard.toPosition, Number(boardId));
      
      operationResults.value.push({
        operation: `Reordered standard: ${standard.name} (position: ${standard.fromPosition} → ${standard.toPosition})`,
        status: 'success',
      });
      
      // Add a delay between reorder requests
      await delay(50);
    } catch (error) {
      console.error('Error reordering standard:', error);
      operationResults.value.push({
        operation: `Reorder standard: ${standard.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

const handleStandardChanges = async (
  formStandards: (StandardFormData & { _reorderDetected?: boolean })[],
  existingStandards: ExistingItem[],
  boardId: number,
): Promise<void> => {
  // Check if reordering was detected in the form data
  const reorderDetected = formStandards.length > 0 && formStandards[0]._reorderDetected === true;
  console.log('Reorder detected from form data:', reorderDetected);

  console.log('Starting handleStandardChanges with:', {
    formStandards: formStandards.map(s => ({ id: s.id, name: s.name, sequence: s.sequence_number })),
    existingStandards: existingStandards.map(s => ({ id: s.id, name: s.name, sequence: s.sequence_number }))
  });

  const validFormStandards = formStandards.filter((s) => s.name.trim());
  const formStandardsMap = new Map(validFormStandards.map((s) => [s.id, s]));
  const existingStandardsMap = new Map(existingStandards.map((s) => [s.id, s]));

  // Determine if ordering has changed
  const hasOrderChanged = detectOrderChanges(formStandards, existingStandards);
  console.log('Final order changed decision:', hasOrderChanged);

  // First: process deletions
  const toDelete = existingStandards.filter((s) => !formStandardsMap.has(s.id));
  await processStandardDeletions(toDelete);

  // Second: process name updates and additions
  const nameUpdatePromises = await processStandardNameUpdates(formStandardsMap, existingStandardsMap, boardId);
  const toAdd = validFormStandards.filter((s) => !s.id);
  const additionPromises = await processStandardAdditions(toAdd, boardId);

  // Wait for all updates and additions to complete before reordering
  if (nameUpdatePromises.length > 0 || additionPromises.length > 0) {
    await Promise.all([...nameUpdatePromises, ...additionPromises]);
    await delay(500); // Add delay before reordering
  }

  // Get the latest standards with their IDs
  const { data: updatedStandards } = await axiosInstance.get(`/standards/board/${boardId}`);
  console.log('Updated standards from API:', updatedStandards);

  // Create maps for positions and names
  const standardIdToPositionMap = new Map(
    updatedStandards.map((s: { id: number; sequence_number: number }) => [s.id, s.sequence_number])
  );
  const standardIdToNameMap = new Map(
    updatedStandards.map((s: { id: number; name: string }) => [s.id, s.name])
  );

  // Find standards that need reordering
  let movedStandards = findMovedStandards(
    validFormStandards, 
    updatedStandards, 
    standardIdToPositionMap, 
    standardIdToNameMap
  );
  
  console.log('Standards that need reordering:', movedStandards);

  // Handle the case when no standards have moved but reordering was requested
  if (movedStandards.length === 0 && hasOrderChanged) {
    console.log('Order change detected but no standards need reordering. Forcing reorder.');
    movedStandards = forceReorderStandards(validFormStandards, standardIdToPositionMap);
    
    console.log('Forced standards reordering:', movedStandards);
    if (movedStandards.length === 0) {
      console.log('No standards need reordering after force check');
      return;
    }
  } else if (movedStandards.length === 0) {
    console.log('No standards need reordering');
    return;
  }

  // Finally, process all the reordering requests
  await processStandardReordering(movedStandards, boardId);
}

const deleteSubject = async (subject: ExistingItem): Promise<void> => {
  console.log('Attempting to delete subject:', subject)
  await axiosInstance.delete(`/subjects/${subject.id}`)
}

const updateSubject = async (
  id: number,
  subject: SubjectFormData,
  boardId: number,
): Promise<void> => {
  await axiosInstance.put(`/subjects/${id}`, {
    name: subject.name,
    board_id: boardId,
  })
}

const createSubject = async (subject: SubjectFormData, boardId: number): Promise<void> => {
  await axiosInstance.post('/subjects', {
    name: subject.name,
    board_id: boardId,
  })
}

const processSubjectDeletions = async (
  toDelete: ExistingItem[]
): Promise<void> => {
  for (const subject of toDelete) {
    try {
      await deleteSubject(subject);
      operationResults.value.push({
        operation: `Deleted subject: ${subject.name}`,
        status: 'success',
      });
    } catch (error) {
      operationResults.value.push({
        operation: `Delete subject: ${subject.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

const processSubjectUpdates = async (
  formSubjectsMap: Map<number, SubjectFormData>,
  existingSubjectsMap: Map<number, ExistingItem>,
  boardId: number
): Promise<void> => {
  for (const [id, subject] of formSubjectsMap) {
    if (!id) continue;
    const existing = existingSubjectsMap.get(id);
    
    if (existing?.name !== subject.name) {
      try {
        await updateSubject(id, subject, boardId);
        operationResults.value.push({
          operation: `Updated subject: ${existing?.name} → ${subject.name}`,
          status: 'success',
        });
      } catch (error) {
        operationResults.value.push({
          operation: `Update subject: ${subject.name}`,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
}

const processSubjectAdditions = async (
  toAdd: SubjectFormData[],
  boardId: number
): Promise<void> => {
  for (const subject of toAdd) {
    try {
      await createSubject(subject, boardId);
      operationResults.value.push({
        operation: `Added subject: ${subject.name}`,
        status: 'success',
      });
    } catch (error) {
      operationResults.value.push({
        operation: `Add subject: ${subject.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

const handleSubjectChanges = async (
  formSubjects: SubjectFormData[],
  existingSubjects: ExistingItem[],
  boardId: number,
): Promise<void> => {
  const validFormSubjects = formSubjects.filter(s => s.name.trim());
  const formSubjectsMap = new Map(validFormSubjects.map(s => [s.id, s]));
  const existingSubjectsMap = new Map(existingSubjects.map(s => [s.id, s]));

  // Process deletions
  const toDelete = existingSubjects.filter(s => !formSubjectsMap.has(s.id));
  await processSubjectDeletions(toDelete);
  
  // Process updates
  await processSubjectUpdates(formSubjectsMap, existingSubjectsMap, boardId);
  
  // Process additions
  const toAdd = validFormSubjects.filter(s => !s.id);
  await processSubjectAdditions(toAdd, boardId);
}

// New helper functions to reduce cognitive complexity
const getExistingItemsFromBoard = (currentBoard: BoardApiResponse, boardId: number) => {
  // Extract instruction mediums
  const existingMediums = currentBoard.instruction_mediums.map((m: InstructionMedium) => ({
    id: m.id,
    board_id: boardId,
    instruction_medium: m.instruction_medium
  }))

  // Extract standards
  const existingStandards = currentBoard.standards.map((s: Standard) => ({
    id: s.id,
    board_id: boardId,
    name: s.name,
    sequence_number: s.sequence_number
  }))

  // Log existing standards for comparison
  console.log('Existing standards:', existingStandards.map(s => ({ id: s.id, name: s.name, sequence: s.sequence_number })));

  // Extract subjects
  const existingSubjects = currentBoard.subjects.map((s: Subject) => ({
    id: s.id,
    board_id: boardId,
    name: s.name
  }))

  return { existingMediums, existingStandards, existingSubjects }
}

const prepareStandardsForSubmission = (standards: StandardFormData[]) => {
  // Ensure standards have proper sequence numbers based on their current order
  standards.forEach((standard, index) => {
    if (standard.name.trim()) {
      standard.sequence_number = index + 1;
    }
  });
  return standards;
}

const hasReorderingChangeInFormData = (changes?: Change[]): boolean => {
  if (!changes) return false;
  return changes.some((change: Change) =>
    change.entity === 'standard' && change.message === 'Standards reordered'
  );
}

const hasBoardDetailsChanged = (
  currentBoard: BoardApiResponse, 
  formBoard: CreateBoardDto
): boolean => {
  return currentBoard.name !== formBoard.name || 
         currentBoard.abbreviation !== formBoard.abbreviation;
}

const updateBoardIfChanged = async (
  formData: BoardFormSubmitData, 
  boardChanged: boolean, 
  boardId: number
): Promise<number> => {
  if (boardChanged) {
    try {
      const board = await updateBoard(formData)
      operationResults.value.push({
        operation: 'Updated board details',
        status: 'success',
      })
      return board.id
    } catch (error) {
      operationResults.value.push({
        operation: 'Update board details',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to update board',
      })
    }
  }
  return boardId
}

const detectMediumsChanged = (
  formMediums: MediumFormData[],
  existingMediums: ExistingItem[]
): boolean => {
  const formMediumNames = formMediums.map((m) => m.name.toLowerCase().trim()).sort((a: string, b: string) => a.localeCompare(b))
  const existingMediumNames = existingMediums
    .map((m) => m.instruction_medium?.toLowerCase().trim())
    .sort((a: string | undefined, b: string | undefined) => (a ?? '').localeCompare(b ?? ''))
  return JSON.stringify(formMediumNames) !== JSON.stringify(existingMediumNames)
}

const detectSubjectsChanged = (
  formSubjects: SubjectFormData[],
  existingSubjects: ExistingItem[]
): boolean => {
  const formSubjectNames = formSubjects.map((s) => s.name.toLowerCase().trim()).sort((a: string, b: string) => a.localeCompare(b))
  const existingSubjectNames = existingSubjects.map((s) => s.name?.toLowerCase().trim()).sort((a: string | undefined, b: string | undefined) => (a ?? '').localeCompare(b ?? ''))
  return JSON.stringify(formSubjectNames) !== JSON.stringify(existingSubjectNames)
}

const detectStandardsChanged = (
  formStandards: StandardFormData[],
  existingStandards: ExistingItem[],
  hasReorderingChange: boolean
): boolean => {
  // Short-circuit if reordering change is detected
  if (hasReorderingChange) return true;

  // Check if standards count has changed
  const validFormStandards = formStandards.filter(s => s.name.trim());
  if (validFormStandards.length !== existingStandards.length) {
    console.log('Standards changed: count mismatch');
    return true;
  }

  // Check for any new standards without IDs
  const hasNewStandards = validFormStandards.some(s => !s.id);
  if (hasNewStandards) {
    console.log('Standards changed: new standard detected');
    return true;
  }

  // Check for changes in existing standards
  for (const formStandard of validFormStandards) {
    if (!formStandard.id) continue;
    
    const existingStandard = existingStandards.find(s => s.id === formStandard.id);
    
    // Check if the standard exists
    if (!existingStandard) {
      console.log('Standards changed: existing standard not found');
      return true;
    }

    // Check if name has changed
    if (existingStandard.name.toLowerCase().trim() !== formStandard.name.toLowerCase().trim()) {
      console.log('Standards changed: name changed');
      return true;
    }

    // Check if sequence has changed
    if (existingStandard.sequence_number !== formStandard.sequence_number) {
      console.log('Standards changed: sequence changed', {
        id: formStandard.id,
        name: formStandard.name,
        oldSequence: existingStandard.sequence_number,
        newSequence: formStandard.sequence_number
      });
      return true;
    }
  }

  return false;
}

const processChanges = async (
  mediumsChanged: boolean,
  standardsChanged: boolean,
  subjectsChanged: boolean,
  formData: BoardFormSubmitData,
  existingData: { 
    existingMediums: ExistingItem[], 
    existingStandards: ExistingItem[], 
    existingSubjects: ExistingItem[] 
  },
  boardId: number,
  hasReorderingChange: boolean
): Promise<void> => {
  const changePromises = []
  
  if (mediumsChanged) {
    changePromises.push(handleMediumChanges(formData.mediums, existingData.existingMediums, boardId))
  }

  if (standardsChanged) {
    // Create a modified version of formData.standards with a flag indicating if reordering was detected
    const standardsWithReorderFlag = formData.standards.map(s => ({
      ...s,
      _reorderDetected: hasReorderingChange
    }));

    changePromises.push(handleStandardChanges(
      standardsWithReorderFlag, 
      existingData.existingStandards, 
      boardId
    ))
  }

  if (subjectsChanged) {
    changePromises.push(handleSubjectChanges(
      formData.subjects, 
      existingData.existingSubjects, 
      boardId
    ))
  }

  if (changePromises.length > 0) {
    await Promise.all(changePromises)
  }
}

const showResultsModal = () => {
  const modalElement = document.getElementById('operationResultModal')
  if (modalElement) {
    const resultModal = new bootstrap.Modal(modalElement)
    resultModal.show()
  }
}

const handleSubmit = async (formData: BoardFormSubmitData): Promise<void> => {
  try {
    isSubmitting.value = true // Show loading spinner
    operationResults.value = [] // Reset results

    console.log('Received form data:', {
      standards: formData.standards.map(s => ({ id: s.id, name: s.name, sequence: s.sequence_number })),
      changes: formData.changes
    });

    // Check if there's a reordering change
    const hasReorderingChange = hasReorderingChangeInFormData(formData.changes);
    if (hasReorderingChange) {
      console.log('Reordering change detected in form data');
    }

    // Get current board data
    const boardResponse = await axiosInstance.get<BoardApiResponse>(`/boards/${route.params.id}`)
    const currentBoard = boardResponse.data
    
    // Check if board details have changed
    const boardChanged = hasBoardDetailsChanged(currentBoard, formData.board);

    // Update board only if changed
    let boardId = parseInt(route.params.id as string)
    boardId = await updateBoardIfChanged(formData, boardChanged, boardId);

    // Get existing items from the board data
    const existingData = getExistingItemsFromBoard(currentBoard, boardId);
    
    // Prepare standards with sequence numbers
    prepareStandardsForSubmission(formData.standards);

    // Detect changes in mediums, standards, and subjects
    const mediumsChanged = detectMediumsChanged(formData.mediums, existingData.existingMediums);
    const standardsChanged = detectStandardsChanged(
      formData.standards, 
      existingData.existingStandards, 
      hasReorderingChange
    );
    const subjectsChanged = detectSubjectsChanged(formData.subjects, existingData.existingSubjects);

    console.log('Changes detected:', {
      boardChanged,
      mediumsChanged,
      standardsChanged,
      subjectsChanged,
      hasReorderingChange
    });

    // Check if there are any changes to process at all
    const hasAnyChanges = boardChanged || mediumsChanged || standardsChanged || subjectsChanged;
    
    // If no changes are detected, go directly to the board dashboard
    if (!hasAnyChanges) {
      console.log('No changes detected, redirecting to board dashboard');
      router.push('/admin/board');
      return;
    }

    // Process the changes
    await processChanges(
      mediumsChanged, 
      standardsChanged, 
      subjectsChanged, 
      formData, 
      existingData, 
      boardId,
      hasReorderingChange
    );

    // Show results modal
    showResultsModal();
  } catch (error) {
    console.error('Error in handleSubmit:', error)
  } finally {
    isSubmitting.value = false // Hide loading spinner
  }
}

// Add cleanup function
const cleanupAndNavigate = () => {
  // Get the modal element
  const modalElement = document.getElementById('operationResultModal')
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement)
    modal?.hide()

    // Remove backdrop manually
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove())

    // Remove modal-open class and inline styles from body
    document.body.classList.remove('modal-open')
    document.body.style.removeProperty('padding-right')
  }

  // Navigate to board list
  router.push('/admin/board')
}
</script>

<style scoped>
/* Add to existing styles */
.list-group-item {
  border-left: 4px solid transparent;
}

.list-group-item.text-success {
  border-left-color: #198754;
}

.list-group-item.text-danger {
  border-left-color: #dc3545;
}

.badge {
  min-width: 70px;
}
</style>
