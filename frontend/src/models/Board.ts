export interface Country {
  id: number
  name: string
}

export interface State {
  id: number
  name: string
  country_id: number
}

export interface City {
  id: number
  name: string
  state_id: number
}

export interface Address {
  id: number
  street: string
  city_id: number
  postal_code: string
  created_at: Date
  updated_at: Date
  // Include related data
  city?: City
  state?: State
  country?: Country
}

export interface MediumOfInstruction {
  id: number
  instruction_medium: string
  board_id: number
  created_at: Date
  updated_at: Date
}

export interface Standard {
  id: number
  name: string
  board_id: number
  created_at: Date
  updated_at: Date
}

export interface Subject {
  id: number
  name: string
  board_id: number
  created_at: Date
  updated_at: Date
}

export interface Board {
  id: number
  name: string
  abbreviation?: string
  address_id: number
  created_at: Date
  updated_at: Date
  // Include related data
  address?: Address
  mediums?: MediumOfInstruction[]
  standards?: Standard[]
  subjects?: Subject[]
}

// DTOs for creating/updating
export interface CreateAddressDto {
  street: string
  postal_code: string
  city_id: number
}

export interface CreateBoardDto {
  name: string
  abbreviation?: string
  address_id: number
}

export interface CreateInstructionMediumDto {
  name: string
  board_id: number
}

export interface CreateStandardDto {
  name: string
  board_id: number
  sequence_number: number
}

export interface CreateSubjectDto {
  name: string
  board_id: number
}

// Update DTOs
export interface UpdateAddressDto {
  street?: string
  postal_code?: string
  city_id?: number
}

export interface UpdateBoardDto {
  name?: string
  abbreviation?: string
  address_id?: number
}

export interface UpdateInstructionMediumDto {
  name?: string
  board_id?: number
}

export interface UpdateStandardDto {
  name?: string
  board_id?: number
}

export interface UpdateSubjectDto {
  name?: string
  board_id?: number
}

// Board Management DTOs (simplified for consolidated endpoint)
export interface BoardManagementAddressDto {
  street: string;
  postal_code: string;
  city_id: number;
}

export interface BoardManagementBoardDto {
  name: string;
  abbreviation?: string;
}

export interface BoardManagementInstructionMediumDto {
  name: string;
}

export interface BoardManagementStandardDto {
  name: string;
}

export interface BoardManagementSubjectDto {
  name: string;
}

export interface CreateBoardManagementDto {
  address: BoardManagementAddressDto;
  board: BoardManagementBoardDto;
  instructionMediums: BoardManagementInstructionMediumDto[];
  standards: BoardManagementStandardDto[];
  subjects: BoardManagementSubjectDto[];
}

export interface BoardManagementResponse {
  board: Board
  address: Address
  instruction_mediums: MediumOfInstruction[]
  standards: Standard[]
  subjects: Subject[]
}
