export type UserRole = 'customer' | 'restaurant_owner' | 'admin'

export type PriceRange = '€' | '€€' | '€€€' | '€€€€'

export type RestaurantStatus = 'pending' | 'approved' | 'rejected' | 'active'

export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export type RequestStatus = 'pending' | 'approved' | 'rejected'

export type TableShape = 'circle' | 'square' | 'rectangle'

export type NotificationType = 'reservation_new' | 'reservation_cancelled' | 'review' | 'system'

export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'halal' | 'kosher'

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  profile_picture?: string
  role: UserRole
  is_verified: boolean
  preferences?: {
    dietary?: string[]
    allergies?: string[]
  }
  created_at: string
  updated_at: string
}

export interface Restaurant {
  id: string
  owner_id: string
  name: string
  description: string
  cuisine_type: string[]
  country: string
  city: string
  address: string
  latitude?: number
  longitude?: number
  phone: string
  email: string
  website?: string
  average_rating: number
  price_range: PriceRange
  operational_status: RestaurantStatus
  opening_hours?: Record<string, { open: string; close: string; closed?: boolean }>
  verification_documents?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface RestaurantImage {
  id: string
  restaurant_id: string
  image_url: string
  caption?: string
  is_cover_image: boolean
  order: number
  created_at: string
}

export interface Menu {
  id: string
  restaurant_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  menu_id: string
  name: string
  description?: string
  price: number
  allergens?: string[]
  dietary_tags?: DietaryTag[]
  image_url?: string
  created_at: string
}

export interface RestaurantTable {
  id: string
  restaurant_id: string
  table_number: number
  capacity: number
  position_x?: number
  position_y?: number
  shape: TableShape
  is_available: boolean
  created_at: string
}

export interface Reservation {
  id: string
  user_id: string
  restaurant_id: string
  table_id: string
  reservation_date: string
  reservation_time: string
  number_of_people: number
  special_requests?: string
  status: ReservationStatus
  confirmation_code: string
  created_at: string
  updated_at: string
}

export interface RestaurantRequest {
  id: string
  user_id: string
  restaurant_data: Record<string, any>
  documents?: Record<string, any>
  status: RequestStatus
  rejection_reason?: string
  admin_notes?: string
  created_at: string
  reviewed_at?: string
  reviewed_by?: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  related_id?: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  user_id: string
  restaurant_id: string
  rating: number
  title: string
  comment?: string
  images?: string[]
  created_at: string
}

export interface AdminAction {
  id: string
  admin_id: string
  target_id: string
  action_type: string
  reason?: string
  created_at: string
}
