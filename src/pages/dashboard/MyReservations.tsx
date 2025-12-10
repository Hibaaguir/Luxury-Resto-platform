import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { reservationService } from '@/services/reservationService'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ReservationCard } from '@/components/dashboard/ReservationCard'
import { Button } from '@/components/common/Button'
import { useNavigate } from 'react-router-dom'

type FilterType = 'all' | 'upcoming' | 'past' | 'cancelled'

export function MyReservations() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('upcoming')

  useEffect(() => {
    if (user?.id) {
      loadReservations()
    }
  }, [user, filter])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const data = await reservationService.getUserReservations(
        user!.id,
        filter === 'all' ? undefined : filter
      )
      setReservations(data)
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return

    try {
      await reservationService.cancelReservation(reservationId)
      loadReservations()
    } catch (error: any) {
      alert(error.message || 'Failed to cancel reservation')
    }
  }

  const handleWriteReview = (restaurantId: string) => {
    navigate(`/restaurants/${restaurantId}/review`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">My Reservations</h1>
            <p className="text-champagne/70">Manage your restaurant bookings</p>
          </div>
          <Button onClick={() => navigate('/restaurants')}>
            Browse Restaurants
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 pb-2 overflow-x-auto">
          {(['all', 'upcoming', 'past', 'cancelled'] as FilterType[]).map((f) => (
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

        {/* Reservations List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">📅</div>
            <h3 className="mb-2 text-h3 text-champagne">No Reservations Found</h3>
            <p className="mb-6 text-champagne/70">
              {filter === 'upcoming'
                ? "You don't have any upcoming reservations"
                : filter === 'past'
                ? "You don't have any past reservations"
                : filter === 'cancelled'
                ? "You don't have any cancelled reservations"
                : "You haven't made any reservations yet"}
            </p>
            <Button onClick={() => navigate('/restaurants')}>
              Find a Restaurant
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancelReservation}
                onReview={handleWriteReview}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
