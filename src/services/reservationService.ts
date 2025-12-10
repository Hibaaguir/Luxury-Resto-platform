import { supabase } from '@/config/supabase'
import { Reservation, RestaurantTable } from '@/types/database.types'

export interface AvailabilityCheck {
  date: string
  time: string
  restaurantId: string
}

export const reservationService = {
  // Check if restaurant is open at given date/time
  async checkRestaurantHours(
    restaurantId: string,
    date: string,
    time: string
  ): Promise<{
    isOpen: boolean
    message?: string
    openingTime?: string
    closingTime?: string
  }> {
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('opening_hours')
      .eq('id', restaurantId)
      .single()

    if (error || !restaurant?.opening_hours) {
      return { isOpen: false, message: 'Unable to verify restaurant hours' }
    }

    // Get day of week from date
    const dateObj = new Date(date)
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ]
    const dayName = days[dateObj.getDay()]

    const dayHours = restaurant.opening_hours[dayName]

    // Check if closed
    if (!dayHours || dayHours.closed) {
      return {
        isOpen: false,
        message: `Restaurant is closed on ${
          dayName.charAt(0).toUpperCase() + dayName.slice(1)
        }s`,
      }
    }

    // Check if time is within opening hours
    const reservationTime = time.split(':').map(Number)
    const openTime = dayHours.open.split(':').map(Number)
    const closeTime = dayHours.close.split(':').map(Number)

    const reservationMinutes = reservationTime[0] * 60 + reservationTime[1]
    const openMinutes = openTime[0] * 60 + openTime[1]
    const closeMinutes = closeTime[0] * 60 + closeTime[1]

    if (reservationMinutes < openMinutes || reservationMinutes > closeMinutes) {
      return {
        isOpen: false,
        message: `Restaurant is open from ${dayHours.open} to ${dayHours.close}`,
        openingTime: dayHours.open,
        closingTime: dayHours.close,
      }
    }

    return {
      isOpen: true,
      openingTime: dayHours.open,
      closingTime: dayHours.close,
    }
  },

  // Get available tables for a specific date/time with next available time for occupied ones
  async getAvailableTables(restaurantId: string, date: string, time: string) {
    // First check if restaurant is open
    const hoursCheck = await this.checkRestaurantHours(restaurantId, date, time)
    if (!hoursCheck.isOpen) {
      throw new Error(hoursCheck.message || 'Restaurant is closed at this time')
    }

    // Get all tables for the restaurant
    const { data: tables, error: tablesError } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)

    if (tablesError) throw tablesError

    // Get reservations for that date/time (±2 hours buffer for typical dining duration)
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('table_id, reservation_time')
      .eq('restaurant_id', restaurantId)
      .eq('reservation_date', date)
      .neq('status', 'cancelled')

    if (reservationsError) throw reservationsError

    // Create a map of occupied tables with their reservation times
    const occupiedTables = new Map<string, string>()

    reservations?.forEach((reservation) => {
      const reservationMinutes = this.timeToMinutes(reservation.reservation_time)
      const targetMinutes = this.timeToMinutes(time)

      // Consider table occupied if reservation is within 2 hours before or after
      if (Math.abs(reservationMinutes - targetMinutes) <= 120) {
        occupiedTables.set(reservation.table_id, reservation.reservation_time)
      }
    })

    // Mark tables as occupied and add next available time
    return (
      tables?.map((table) => ({
        ...table,
        isOccupied: occupiedTables.has(table.id),
        nextAvailableTime: occupiedTables.has(table.id)
          ? this.calculateNextAvailableTime(occupiedTables.get(table.id)!)
          : null,
      })) || []
    )
  },

  // Create a reservation with validation
  async createReservation(data: {
    restaurantId: string
    tableId: string
    date: string
    time: string
    numberOfPeople: number
    specialRequests?: string
  }) {
    // Validate opening hours
    const hoursCheck = await this.checkRestaurantHours(
      data.restaurantId,
      data.date,
      data.time
    )
    if (!hoursCheck.isOpen) {
      throw new Error(hoursCheck.message || 'Restaurant is closed at this time')
    }

    // Check if table is available at this time
    const availableTables = await this.getAvailableTables(
      data.restaurantId,
      data.date,
      data.time
    )
    const selectedTable = availableTables.find((t) => t.id === data.tableId)

    if (!selectedTable) {
      throw new Error('Selected table not found')
    }

    if (selectedTable.isOccupied) {
      throw new Error(
        `This table is already reserved. Next available at ${selectedTable.nextAvailableTime}`
      )
    }

    if (selectedTable.capacity < data.numberOfPeople) {
      throw new Error(`This table only seats ${selectedTable.capacity} people`)
    }

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    // Generate confirmation code
    const confirmationCode = this.generateConfirmationCode()

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert([
        {
          user_id: user.user.id,
          restaurant_id: data.restaurantId,
          table_id: data.tableId,
          reservation_date: data.date,
          reservation_time: data.time,
          number_of_people: data.numberOfPeople,
          special_requests: data.specialRequests,
          status: 'pending',
          confirmation_code: confirmationCode,
        },
      ])
      .select(
        `
        *,
        restaurants (name, owner_id),
        users (full_name, email)
      `
      )
      .single()

    if (error) throw error

    // Create notification for restaurant owner with full details
    if (reservation && reservation.restaurants) {
      await this.createReservationNotification(
        reservation.restaurants.owner_id,
        reservation.id,
        reservation.restaurants.name,
        data.date,
        data.time,
        data.numberOfPeople
      )
    }

    return reservation
  },

  // Get user's reservations
  async getUserReservations(
    userId: string,
    filter?: 'upcoming' | 'past' | 'cancelled'
  ) {
    let query = supabase
      .from('reservations')
      .select(
        `
        *,
        restaurants(name, address, city, country, phone, email),
        restaurant_tables(table_number, capacity)
      `
      )
      .eq('user_id', userId)
      .order('reservation_date', { ascending: false })

    const today = new Date().toISOString().split('T')[0]

    if (filter === 'upcoming') {
      query = query.gte('reservation_date', today).neq('status', 'cancelled')
    } else if (filter === 'past') {
      query = query.lt('reservation_date', today)
    } else if (filter === 'cancelled') {
      query = query.eq('status', 'cancelled')
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Get restaurant's reservations
  async getRestaurantReservations(restaurantId: string, date?: string) {
    let query = supabase
      .from('reservations')
      .select(
        `
        *,
        users(full_name, email, phone),
        restaurant_tables(table_number, capacity)
      `
      )
      .eq('restaurant_id', restaurantId)
      .order('reservation_date', { ascending: false })
      .order('reservation_time', { ascending: true })

    if (date) {
      query = query.eq('reservation_date', date)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Cancel reservation
  async cancelReservation(reservationId: string) {
    // Get reservation details first
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select(
        `
        *,
        restaurants (name),
        users (full_name, email)
      `
      )
      .eq('id', reservationId)
      .single()

    if (fetchError) throw fetchError

    // Update status
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'cancelled' })
      .eq('id', reservationId)

    if (error) throw error

    // Send cancellation notification to user
    if (reservation && reservation.restaurants) {
      await this.createCancellationNotification(
        reservation.user_id,
        reservation.id,
        reservation.restaurants.name,
        reservation.reservation_date,
        reservation.reservation_time
      )
    }
  },

  // Update reservation status
  async updateReservationStatus(reservationId: string, status: string) {
    // Get reservation details first
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select(
        `
        *,
        restaurants (name),
        users (full_name, email)
      `
      )
      .eq('id', reservationId)
      .single()

    if (fetchError) throw fetchError

    // Update status
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', reservationId)

    if (error) throw error

    // Send appropriate notification based on status
    if (reservation && reservation.restaurants) {
      if (status === 'confirmed') {
        await this.createConfirmationNotification(
          reservation.user_id,
          reservation.id,
          reservation.restaurants.name,
          reservation.reservation_date,
          reservation.reservation_time,
          reservation.confirmation_code
        )
      } else if (status === 'cancelled') {
        await this.createCancellationNotification(
          reservation.user_id,
          reservation.id,
          reservation.restaurants.name,
          reservation.reservation_date,
          reservation.reservation_time
        )
      }
    }
  },

  // Create notification for new reservation (to owner)
  async createReservationNotification(
    ownerId: string,
    reservationId: string,
    restaurantName: string,
    reservationDate: string,
    reservationTime: string,
    guests: number
  ) {
    try {
      const formattedDate = new Date(reservationDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      const { error } = await supabase.from('notifications').insert([
        {
          user_id: ownerId,
          type: 'reservation_new',
          title: 'New Reservation',
          message: `New reservation for ${guests} ${
            guests === 1 ? 'guest' : 'guests'
          } at ${restaurantName} on ${formattedDate} at ${reservationTime}`,
          related_id: reservationId,
          is_read: false,
        },
      ])

      if (error) {
        console.error('Error creating reservation notification:', error)
      } else {
        console.log('✅ Notification created for owner:', ownerId)
      }
    } catch (error) {
      console.error('Error creating reservation notification:', error)
    }
  },

  // Create notification for reservation confirmation (to customer)
  async createConfirmationNotification(
    userId: string,
    reservationId: string,
    restaurantName: string,
    reservationDate: string,
    reservationTime: string,
    confirmationCode: string
  ) {
    try {
      const formattedDate = new Date(reservationDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      const { error } = await supabase.from('notifications').insert([
        {
          user_id: userId,
          type: 'reservation_confirmed',
          title: 'Reservation Confirmed! 🎉',
          message: `Your reservation at ${restaurantName} on ${formattedDate} at ${reservationTime} has been confirmed. Confirmation code: ${confirmationCode}`,
          related_id: reservationId,
          is_read: false,
        },
      ])

      if (error) {
        console.error('Error creating confirmation notification:', error)
      } else {
        console.log('✅ Confirmation notification sent to user:', userId)
      }
    } catch (error) {
      console.error('Error creating confirmation notification:', error)
    }
  },

  // Create notification for reservation cancellation (to customer)
  async createCancellationNotification(
    userId: string,
    reservationId: string,
    restaurantName: string,
    reservationDate: string,
    reservationTime: string
  ) {
    try {
      const formattedDate = new Date(reservationDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

      const { error } = await supabase.from('notifications').insert([
        {
          user_id: userId,
          type: 'reservation_cancelled',
          title: 'Reservation Cancelled',
          message: `Your reservation at ${restaurantName} on ${formattedDate} at ${reservationTime} has been cancelled.`,
          related_id: reservationId,
          is_read: false,
        },
      ])

      if (error) {
        console.error('Error creating cancellation notification:', error)
      } else {
        console.log('✅ Cancellation notification sent to user:', userId)
      }
    } catch (error) {
      console.error('Error creating cancellation notification:', error)
    }
  },

  // Helper: Generate confirmation code
  generateConfirmationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  },

  // Helper: Convert time string to minutes
  timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  },

  // Helper: Calculate next available time (adds 2 hours to reservation time)
  calculateNextAvailableTime(reservationTime: string): string {
    const minutes = this.timeToMinutes(reservationTime)
    const nextMinutes = minutes + 120 // 2 hours later
    const hours = Math.floor(nextMinutes / 60)
    const mins = nextMinutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`
  },

  // Helper: Add hours to time string
  addHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(h + hours, m, 0, 0)
    return date.toTimeString().substring(0, 5)
  },

  // Helper: Subtract hours from time string
  subtractHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(h - hours, m, 0, 0)
    return date.toTimeString().substring(0, 5)
  },
}
