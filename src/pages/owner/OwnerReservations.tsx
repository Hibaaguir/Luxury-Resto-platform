import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ownerService } from '@/services/ownerService'
import { reservationService } from '@/services/reservationService'
import { OwnerDashboardLayout } from '@/components/owner/OwnerDashboardLayout'
import { Button } from '@/components/common/Button'
import {
  HiCalendar,
  HiUsers,
  HiPhone,
  HiMail,
  HiCheckCircle,
  HiXCircle,
  HiClock,
} from 'react-icons/hi'
import { motion } from 'framer-motion'

export function OwnerReservations() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'pending'>('today')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (user?.id) {
      loadRestaurants()
    }
  }, [user])

  useEffect(() => {
    if (selectedRestaurant) {
      loadReservations()
    }
  }, [selectedRestaurant, filter, selectedDate])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const data = await ownerService.getOwnerRestaurants(user!.id)
      setRestaurants(data)
      if (data.length > 0) {
        setSelectedRestaurant(data[0])
      }
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReservations = async () => {
    try {
      setLoading(true)
      let filters: any = {}

      if (filter === 'today') {
        filters.date = new Date().toISOString().split('T')[0]
      } else if (filter === 'pending') {
        filters.status = 'pending'
      }

      const data = await ownerService.getRestaurantReservations(
        selectedRestaurant.id,
        filters
      )

      // Filter for upcoming if needed
      let filteredData = data
      if (filter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0]
        filteredData = data.filter(
          (r: any) => r.reservation_date >= today && r.status !== 'cancelled'
        )
      }

      setReservations(filteredData)
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (reservationId: string, status: string) => {
    try {
      await reservationService.updateReservationStatus(reservationId, status)
      loadReservations()
    } catch (error: any) {
      alert(error.message || 'Failed to update reservation')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-forest/20 text-forest-light border-forest'
      case 'pending':
        return 'bg-primary/20 text-primary border-primary'
      case 'cancelled':
        return 'bg-rose-900/20 text-rose-300 border-rose-700'
      case 'completed':
        return 'bg-taupe/20 text-champagne border-taupe'
      default:
        return 'bg-taupe/20 text-champagne border-taupe'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const groupedReservations = reservations.reduce((acc: any, reservation: any) => {
    const date = reservation.reservation_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(reservation)
    return acc
  }, {})

  return (
    <OwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Reservations</h1>
            <p className="text-champagne/70">Manage your restaurant bookings</p>
          </div>

          {/* Restaurant Selector */}
          {restaurants.length > 1 && (
            <select
              value={selectedRestaurant?.id || ''}
              onChange={(e) => {
                const restaurant = restaurants.find((r) => r.id === e.target.value)
                setSelectedRestaurant(restaurant)
              }}
              className="max-w-xs input"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {(['today', 'upcoming', 'pending', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-luxury font-semibold whitespace-nowrap transition-all ${
                  filter === f
                    ? 'bg-primary text-charcoal'
                    : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setFilter('all')
            }}
            className="input"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="card bg-primary/10 border-primary/30">
            <p className="mb-1 text-sm text-champagne/70">Total Today</p>
            <p className="text-3xl font-bold text-champagne">
              {reservations.filter((r) => r.reservation_date === new Date().toISOString().split('T')[0]).length}
            </p>
          </div>
          <div className="card bg-forest/10 border-forest/30">
            <p className="mb-1 text-sm text-champagne/70">Confirmed</p>
            <p className="text-3xl font-bold text-champagne">
              {reservations.filter((r) => r.status === 'confirmed').length}
            </p>
          </div>
          <div className="card bg-rose-900/10 border-rose-700/30">
            <p className="mb-1 text-sm text-champagne/70">Pending</p>
            <p className="text-3xl font-bold text-champagne">
              {reservations.filter((r) => r.status === 'pending').length}
            </p>
          </div>
          <div className="card bg-taupe/10 border-taupe/30">
            <p className="mb-1 text-sm text-champagne/70">Total</p>
            <p className="text-3xl font-bold text-champagne">{reservations.length}</p>
          </div>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : Object.keys(groupedReservations).length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">📅</div>
            <h3 className="mb-2 text-h3 text-champagne">No Reservations Found</h3>
            <p className="text-champagne/70">
              {filter === 'today'
                ? 'No reservations for today'
                : filter === 'pending'
                ? 'No pending reservations'
                : 'No reservations found'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedReservations)
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, dateReservations]: [string, any]) => (
                <div key={date}>
                  <h2 className="flex items-center gap-2 mb-4 text-h3 text-champagne">
                    <HiCalendar className="text-primary" />
                    {formatDate(date)}
                    <span className="text-base font-normal text-champagne/50">
                      ({dateReservations.length}{' '}
                      {dateReservations.length === 1 ? 'reservation' : 'reservations'})
                    </span>
                  </h2>

                  <div className="space-y-4">
                    {dateReservations
                      .sort((a: any, b: any) =>
                        a.reservation_time.localeCompare(b.reservation_time)
                      )
                      .map((reservation: any) => (
                        <motion.div
                          key={reservation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="transition-all card hover:border-primary/30"
                        >
                          <div className="flex flex-col gap-6 lg:flex-row">
                            {/* Reservation Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-2">
                                    <HiClock className="text-primary" />
                                    <span className="text-xl font-bold text-champagne">
                                      {reservation.reservation_time}
                                    </span>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                        reservation.status
                                      )}`}
                                    >
                                      {reservation.status.charAt(0).toUpperCase() +
                                        reservation.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mb-2 text-champagne/70">
                                    <HiUsers />
                                    <span>
                                      {reservation.number_of_people} guests • Table{' '}
                                      {reservation.restaurant_tables?.table_number}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Customer Info */}
                              <div className="grid grid-cols-1 gap-4 p-4 rounded-lg md:grid-cols-2 bg-charcoal-light">
                                <div>
                                  <p className="mb-1 text-sm text-champagne/70">
                                    Customer Name
                                  </p>
                                  <p className="font-semibold text-champagne">
                                    {reservation.users?.full_name || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-sm text-champagne/70">Email</p>
                                  <div className="flex items-center gap-2">
                                    <HiMail className="text-primary" />
                                    <a
                                      href={`mailto:${reservation.users?.email}`}
                                      className="transition-colors text-champagne hover:text-primary"
                                    >
                                      {reservation.users?.email}
                                    </a>
                                  </div>
                                </div>
                                {reservation.users?.phone && (
                                  <div>
                                    <p className="mb-1 text-sm text-champagne/70">Phone</p>
                                    <div className="flex items-center gap-2">
                                      <HiPhone className="text-primary" />
                                      <a
                                        href={`tel:${reservation.users.phone}`}
                                        className="transition-colors text-champagne hover:text-primary"
                                      >
                                        {reservation.users.phone}
                                      </a>
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <p className="mb-1 text-sm text-champagne/70">
                                    Confirmation Code
                                  </p>
                                  <p className="font-mono font-bold text-primary">
                                    {reservation.confirmation_code}
                                  </p>
                                </div>
                              </div>

                              {/* Special Requests */}
                              {reservation.special_requests && (
                                <div className="p-3 mt-4 border rounded-lg bg-primary/10 border-primary/30">
                                  <p className="mb-1 text-xs text-champagne/70">
                                    Special Requests
                                  </p>
                                  <p className="text-sm text-champagne">
                                    {reservation.special_requests}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 lg:flex-col lg:w-48">
                              {reservation.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() =>
                                      handleUpdateStatus(reservation.id, 'confirmed')
                                    }
                                    className="flex items-center justify-center w-full h-full gap-2 lg:w-full"
                                    size="sm"
                                  >
                                    <HiCheckCircle className="mr-2" />
                                    Confirm
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleUpdateStatus(reservation.id, 'cancelled')
                                    }
                                    variant="outline"
                                    className="flex items-center justify-center w-full h-full gap-2 lg:w-full text-rose-300 border-rose-700 hover:bg-rose-900/20"
                                    size="sm"
                                  >
                                    <HiXCircle className="mr-2" />
                                    Decline
                                  </Button>
                                </>
                              )}
                              {reservation.status === 'confirmed' && (
                                <>
                                  <Button
                                    onClick={() =>
                                      handleUpdateStatus(reservation.id, 'completed')
                                    }
                                    className="flex items-center justify-center w-full h-full gap-2lg:w-full"
                                    size="sm"
                                  >
                                    <HiCheckCircle className="mr-2" />
                                    Complete
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleUpdateStatus(reservation.id, 'cancelled')
                                    }
                                    variant="outline"
                                    className="flex items-center justify-center w-full h-full gap-2 lg:w-full text-rose-300 border-rose-700 hover:bg-rose-900/20"
                                    size="sm"
                                  >
                                    <HiXCircle className="mr-2" />
                                    Cancel
                                  </Button>
                                </>
                              )}
                              {(reservation.status === 'cancelled' ||
                                reservation.status === 'completed') && (
                                <span className="py-2 text-sm text-center text-champagne/70">
                                  No actions available
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </OwnerDashboardLayout>
  )
}
