export interface Board {
  id: number
  name: string
  abbreviation?: string
}

export interface BoardDetails {
  id: number
  name: string
  abbreviation: string
  address_id?: number
  address?: {
    id: number
    city_id: number
    postal_code: string
    street: string
    created_at: string
    updated_at: string
    city: {
      id: number
      state_id: number
      name: string
    }
    state: {
      id: number
      country_id: number
      name: string
    }
    country: {
      id: number
      name: string
    }
  }
  mediums: Array<{
    id: number
    board_id: number
    instruction_medium: string
    created_at: string
    updated_at: string
  }>
  standards: Array<{
    id: number
    board_id: number
    name: string
    created_at: string
    updated_at: string
  }>
  subjects: Array<{
    id: number
    board_id: number
    name: string
    created_at: string
    updated_at: string
  }>
}
