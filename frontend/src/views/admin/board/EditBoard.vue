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
  const toDelete = existingMediums.filter((m) => {
    const formMedium = formMediumsMap.get(m.id)
    // Only delete if the medium is not in the form data at all
    return !formMedium
  })

  const toUpdate = validFormMediums.filter((m) => {
    if (!m.id) return false
    const existingMedium = existingMediumsMap.get(m.id)
    // Only update if the names are different
    return existingMedium && existingMedium.instruction_medium !== m.name.toLowerCase().trim()
  })

  const toAdd = validFormMediums.filter((m) => !m.id)

  // Log the comparison
  console.log('Medium comparison:', {
    toDelete: toDelete.map((m) => m.instruction_medium),
    toUpdate: toUpdate.map((m) => m.name),
    toAdd: toAdd.map((m) => m.name),
  })

  // Handle deletions
  for (const medium of toDelete) {
    try {
      console.log('Deleting medium:', medium.instruction_medium)
      await deleteMedium(medium)
      operationResults.value.push({
        operation: `Deleted medium: ${medium.instruction_medium}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error deleting medium:', medium, error)
      operationResults.value.push({
        operation: `Delete medium: ${medium.instruction_medium}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Handle updates
  for (const medium of toUpdate) {
    try {
      if (!medium.id) continue
      const existingMedium = existingMediumsMap.get(medium.id)
      console.log('Updating medium:', {
        from: existingMedium?.instruction_medium,
        to: medium.name,
      })
      await updateMedium(medium.id, medium, boardId)
      operationResults.value.push({
        operation: `Updated medium: ${existingMedium?.instruction_medium} → ${medium.name}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error updating medium:', medium, error)
      operationResults.value.push({
        operation: `Update medium: ${medium.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Handle additions
  for (const medium of toAdd) {
    try {
      console.log('Adding new medium:', medium.name)
      await createMedium(medium, boardId)
      operationResults.value.push({
        operation: `Added medium: ${medium.name}`,
        status: 'success',
      })
    } catch (error) {
      console.error('Error adding medium:', medium, error)
      operationResults.value.push({
        operation: `Add medium: ${medium.name}`,
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

  const validFormStandards = formStandards.filter((s) => s.name.trim())
  const formStandardsMap = new Map(validFormStandards.map((s) => [s.id, s]))
  const existingStandardsMap = new Map(existingStandards.map((s) => [s.id, s]))

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

  console.log('Order changed (by sequence):', orderChanged);

  // Also check if the order has changed by comparing the IDs in their current order
  const formStandardIds = validFormStandards.filter(s => s.id).map(s => s.id);
  const existingStandardIds = existingStandards.map(s => s.id);

  const idsOrderChanged = JSON.stringify(formStandardIds) !== JSON.stringify(existingStandardIds);
  console.log('Order changed (by ID order):', idsOrderChanged, {
    formStandardIds,
    existingStandardIds
  });

  // Use either method to detect order changes, or use the reorderDetected flag
  const hasOrderChanged = orderChanged || idsOrderChanged || reorderDetected;
  console.log('Final order changed decision:', hasOrderChanged);

  // Handle deletions
  for (const standard of existingStandards.filter((s) => !formStandardsMap.has(s.id))) {
    try {
      await deleteStandard(standard)
      operationResults.value.push({
        operation: `Deleted standard: ${standard.name}`,
        status: 'success',
      })
      // Add delay after deletion to prevent deadlocks
      await delay(300);
    } catch (error) {
      operationResults.value.push({
        operation: `Delete standard: ${standard.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Handle name updates and additions first
  const nameUpdatePromises = [];
  const additionPromises = [];

  // Handle name updates
  for (const [id, standard] of formStandardsMap) {
    if (!id) continue
    const existing = existingStandardsMap.get(id)

    // Check if name has changed
    const nameChanged = existing?.name !== standard.name;

    if (nameChanged) {
      const promise = (async () => {
        try {
          await updateStandard(id, standard, boardId)
          operationResults.value.push({
            operation: `Updated standard: ${existing?.name} → ${standard.name}`,
            status: 'success',
          })
        } catch (error) {
          operationResults.value.push({
            operation: `Update standard: ${standard.name}`,
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      })();
      nameUpdatePromises.push(promise);
    }
  }

  // Handle additions
  for (const standard of validFormStandards.filter((s) => !s.id)) {
    const promise = (async () => {
      try {
        await createStandard(standard, boardId)
        operationResults.value.push({
          operation: `Added standard: ${standard.name} (sequence: ${standard.sequence_number})`,
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: `Add standard: ${standard.name}`,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    })();
    additionPromises.push(promise);
  }

  // Wait for all name updates and additions to complete
  if (nameUpdatePromises.length > 0 || additionPromises.length > 0) {
    await Promise.all([...nameUpdatePromises, ...additionPromises]);
    // Add delay after updates and additions before reordering
    await delay(500);
  }

  // Now handle reordering - must be done after all other operations
  // Get the latest standards with their IDs (including newly created ones)
  const { data: updatedStandards } = await axiosInstance.get(`/standards/board/${boardId}`);
  console.log('Updated standards from API:', updatedStandards);

  // Create a map of standard IDs to their current positions
  const standardIdToPositionMap = new Map(
    updatedStandards.map((s: { id: number; sequence_number: number }) => [s.id, s.sequence_number])
  );

  // Create a map of standard IDs to their names for logging
  const standardIdToNameMap = new Map(
    updatedStandards.map((s: { id: number; name: string }) => [s.id, s.name])
  );

  // Find standards that have moved from their original position
  const movedStandards = [];

  // Map form standards to their IDs and desired positions
  for (let i = 0; i < validFormStandards.length; i++) {
    const standard = validFormStandards[i];
    let standardId = standard.id;

    // If it's a new standard, find its ID from the updated standards
    if (!standardId) {
      const matchingStandard = updatedStandards.find(
        (s: { name: string }) => s.name.toLowerCase().trim() === standard.name.toLowerCase().trim()
      );
      if (matchingStandard) {
        standardId = matchingStandard.id;
      }
    }

    if (standardId) {
      const desiredPosition = i + 1; // 1-based position
      const currentPosition = standardIdToPositionMap.get(standardId) || 0;

      if (currentPosition !== desiredPosition) {
        movedStandards.push({
          id: standardId,
          name: standardIdToNameMap.get(standardId) || standard.name,
          fromPosition: currentPosition,
          toPosition: desiredPosition
        });
      }
    }
  }

  console.log('Standards that need reordering:', movedStandards);

  // If no standards have moved, we're done
  if (movedStandards.length === 0) {
    // If we detected an order change earlier but no standards need reordering now,
    // it might be because the form standards already have the correct sequence numbers.
    // In this case, we should force a reorder based on the form standards.
    if (hasOrderChanged) {
      console.log('Order change detected but no standards need reordering. Forcing reorder based on form standards.');

      // Create reorder requests for all standards based on their position in the form
      for (let i = 0; i < validFormStandards.length; i++) {
        const standard = validFormStandards[i];
        if (standard.id) {
          const desiredPosition = i + 1; // 1-based position
          const currentPosition = standardIdToPositionMap.get(standard.id) || 0;

          // If reordering was detected, force reordering even if positions match
          if (reorderDetected || currentPosition !== desiredPosition) {
            movedStandards.push({
              id: standard.id,
              name: standard.name,
              fromPosition: currentPosition,
              toPosition: desiredPosition
            });
          }
        }
      }

      console.log('Forced standards reordering:', movedStandards);

      if (movedStandards.length === 0) {
        console.log('No standards need reordering after force check');
        return;
      }
    } else {
      console.log('No standards need reordering');
      return;
    }
  }

  // Process all reorder requests with a 50ms delay between them
  // This allows the backend to handle any potential deadlocks
  for (const standard of movedStandards) {
    try {
      console.log(`Reordering standard ${standard.name} from position ${standard.fromPosition} to ${standard.toPosition}`);

      await reorderStandard(standard.id, standard.toPosition, Number(boardId));

      operationResults.value.push({
        operation: `Reordered standard: ${standard.name} (position: ${standard.fromPosition} → ${standard.toPosition})`,
        status: 'success',
      });

      // Add a 50ms delay between reorder requests
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

const handleSubjectChanges = async (
  formSubjects: SubjectFormData[],
  existingSubjects: ExistingItem[],
  boardId: number,
): Promise<void> => {
  const validFormSubjects = formSubjects.filter((s) => s.name.trim())
  const formSubjectsMap = new Map(validFormSubjects.map((s) => [s.id, s]))
  const existingSubjectsMap = new Map(existingSubjects.map((s) => [s.id, s]))

  // Handle deletions
  for (const subject of existingSubjects.filter((s) => !formSubjectsMap.has(s.id))) {
    try {
      await deleteSubject(subject)
      operationResults.value.push({
        operation: `Deleted subject: ${subject.name}`,
        status: 'success',
      })
    } catch (error) {
      operationResults.value.push({
        operation: `Delete subject: ${subject.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // Handle updates
  for (const [id, subject] of formSubjectsMap) {
    if (!id) continue
    const existing = existingSubjectsMap.get(id)
    if (existing?.name !== subject.name) {
      try {
        await updateSubject(id, subject, boardId)
        operationResults.value.push({
          operation: `Updated subject: ${existing?.name} → ${subject.name}`,
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: `Update subject: ${subject.name}`,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }
  }

  // Handle additions
  for (const subject of validFormSubjects.filter((s) => !s.id)) {
    try {
      await createSubject(subject, boardId)
      operationResults.value.push({
        operation: `Added subject: ${subject.name}`,
        status: 'success',
      })
    } catch (error) {
      operationResults.value.push({
        operation: `Add subject: ${subject.name}`,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}

const handleSubmit = async (formData: BoardFormSubmitData): Promise<void> => {
  try {
    isSubmitting.value = true // Show loading spinner
    operationResults.value = [] // Reset results

    // Log the received form data
    console.log('Received form data:', {
      standards: formData.standards.map(s => ({ id: s.id, name: s.name, sequence: s.sequence_number })),
      changes: formData.changes
    });

    // Check if there's a reordering change
    const hasReorderingChange = formData.changes ?
      formData.changes.some((change: Change) =>
        change.entity === 'standard' && change.message === 'Standards reordered'
      ) : false;

    if (hasReorderingChange) {
      console.log('Reordering change detected in form data');
    }

    // Check if board details have changed
    const boardResponse = await axiosInstance.get<BoardApiResponse>(`/boards/${route.params.id}`)
    const currentBoard = boardResponse.data
    const boardChanged =
      currentBoard.name !== formData.board.name ||
      currentBoard.abbreviation !== formData.board.abbreviation

    // Update board only if changed
    let boardId = parseInt(route.params.id as string)
    if (boardChanged) {
      try {
        const board = await updateBoard(formData)
        boardId = board.id
        operationResults.value.push({
          operation: 'Updated board details',
          status: 'success',
        })
      } catch (error) {
        operationResults.value.push({
          operation: 'Update board details',
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to update board',
        })
      }
    }

    // Get existing items from the board data
    // The API already returns all related data in the correct order
    const existingMediums = currentBoard.instruction_mediums.map((m: InstructionMedium) => ({
      id: m.id,
      board_id: boardId,
      instruction_medium: m.instruction_medium
    }))

    const existingStandards = currentBoard.standards.map((s: Standard) => ({
      id: s.id,
      board_id: boardId,
      name: s.name,
      sequence_number: s.sequence_number
    }))

    // Log existing standards for comparison
    console.log('Existing standards:', existingStandards.map(s => ({ id: s.id, name: s.name, sequence: s.sequence_number })));

    const existingSubjects = currentBoard.subjects.map((s: Subject) => ({
      id: s.id,
      board_id: boardId,
      name: s.name
    }))

    // Ensure standards have proper sequence numbers based on their current order
    formData.standards.forEach((standard, index) => {
      if (standard.name.trim()) {
        standard.sequence_number = index + 1;
      }
    });

    // Compare and only process changed items
    const mediumsChanged = (() => {
      const formMediumNames = formData.mediums.map((m) => m.name.toLowerCase().trim()).sort()
      const existingMediumNames = existingMediums
        .map((m) => m.instruction_medium?.toLowerCase().trim())
        .sort()
      return JSON.stringify(formMediumNames) !== JSON.stringify(existingMediumNames)
    })()

    // Force standardsChanged to true if there's a reordering change
    const standardsChanged = hasReorderingChange || (() => {
      // Check if standards have changed in name, order, or if any have been added/removed
      if (formData.standards.filter(s => s.name.trim()).length !== existingStandards.length) {
        console.log('Standards changed: count mismatch');
        return true;
      }

      // Check for name or sequence changes
      for (let i = 0; i < formData.standards.length; i++) {
        const formStandard = formData.standards[i];
        if (!formStandard.name.trim()) continue;

        // If this is a new standard (no ID), then standards have changed
        if (!formStandard.id) {
          console.log('Standards changed: new standard detected');
          return true;
        }

        // Find the existing standard with the same ID
        const existingStandard = existingStandards.find(s => s.id === formStandard.id);
        if (!existingStandard) {
          console.log('Standards changed: existing standard not found');
          return true;
        }

        // Check if name or sequence has changed
        if (existingStandard.name.toLowerCase().trim() !== formStandard.name.toLowerCase().trim()) {
          console.log('Standards changed: name changed');
          return true;
        }

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
    })()

    const subjectsChanged = (() => {
      const formSubjectNames = formData.subjects.map((s) => s.name.toLowerCase().trim()).sort()
      const existingSubjectNames = existingSubjects.map((s) => s.name?.toLowerCase().trim()).sort()
      return JSON.stringify(formSubjectNames) !== JSON.stringify(existingSubjectNames)
    })()

    console.log('Changes detected:', {
      boardChanged,
      mediumsChanged,
      standardsChanged,
      subjectsChanged,
      hasReorderingChange
    })

    // Only process items that have changed
    const changePromises = []
    if (mediumsChanged) {
      // Map existing mediums to form mediums by name to preserve IDs
      const updatedMediums = formData.mediums.map((formMedium) => {
        const existingMedium = existingMediums.find(
          (em) =>
            em.instruction_medium?.toLowerCase().trim() === formMedium.name.toLowerCase().trim(),
        )
        return existingMedium ? { ...formMedium, id: existingMedium.id } : formMedium
      })
      changePromises.push(handleMediumChanges(updatedMediums, existingMediums, boardId))
    }

    // If standards have changed or there's a reordering change, handle standard changes
    if (standardsChanged) {
      // Create a modified version of formData.standards with a flag indicating if reordering was detected
      const standardsWithReorderFlag = formData.standards.map(s => ({
        ...s,
        _reorderDetected: hasReorderingChange
      }));

      changePromises.push(handleStandardChanges(standardsWithReorderFlag, existingStandards, boardId))
    }

    if (subjectsChanged)
      changePromises.push(handleSubjectChanges(formData.subjects, existingSubjects, boardId))

    if (changePromises.length > 0) {
      await Promise.all(changePromises)
    }

    // Show results modal
    const modalElement = document.getElementById('operationResultModal')
    if (modalElement) {
      const resultModal = new bootstrap.Modal(modalElement)
      resultModal.show()
    }
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
