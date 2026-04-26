export type UserRole = "guest" | "host" | "admin"

export type ListingStatus =
  | "pending"
  | "active"
  | "rejected"
  | "inactive"

export type ListingType = "pg" | "room" | "flat" | "hostel"

export type RequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"

export type GenderPreference = "male" | "female" | "any"

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  is_primary: boolean
  created_at: string
}

export interface Amenity {
  id: string
  listing_id: string
  name: string
}

export interface Listing {
  id: string
  host_id: string
  title: string
  description?: string
  type: ListingType
  address: string
  city: string
  locality?: string
  latitude?: number
  longitude?: number
  price_per_month: number
  security_deposit: number
  available_from?: string
  status: ListingStatus
  is_furnished: boolean
  gender_preference: GenderPreference
  max_occupancy: number
  created_at: string
  updated_at: string

  // Relations
  listing_images?: ListingImage[]
  amenities?: Amenity[]
  profiles?: Profile
}

export interface StayRequest {
  id: string
  listing_id: string
  guest_id: string
  host_id: string
  message?: string
  move_in_date?: string
  duration_months: number
  status: RequestStatus
  rejection_reason?: string
  created_at: string
  updated_at: string

  // Relations
  listings?: Listing
  profiles?: Profile
}

export interface Review {
  id: string
  listing_id: string
  guest_id: string
  rating: number
  comment?: string
  created_at: string

  // Relations
  profiles?: Profile
}

export interface SearchFilters {
  city?: string
  locality?: string
  type?: ListingType
  min_price?: number
  max_price?: number
  is_furnished?: boolean
  gender_preference?: GenderPreference
  page?: number
}

export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}
