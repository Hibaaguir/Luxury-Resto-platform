import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout'
import { Button } from '@/components/common/Button'
import {
  HiCalendar,
  HiUsers,
  HiClock,
  HiPhone,
  HiMail,
  HiOfficeBuilding,
} from 'react-icons/hi'
import { motion } from 'framer-motion'

export function AdminReservations() {
  const [reservations, setReservations] = useState<any[]>([])
  const [filteredReservations, setFilteredReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    loadReservations()
  }, [])

  useEffect(() => {
    filterReservations()
  }, [reservations, statusFilter, selectedDate])

  const loadReservations = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllReservations({ limit: 100 })
      setReservations(data)
    } catch (error) {
      console.error('Error loading reservations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReservations = () => {
    let filtered = [...reservations]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter((r) => r.reservation_date === selectedDate)
    }

    setFilteredReservations(filtered)
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

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
    completed: reservations.filter((r) => r.status === 'completed').length,
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-display text-gradient-gold">
            Reservation Management
          </h1>
          <p className="text-champagne/70">Monitor all platform reservations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="card bg-primary/10 border-primary/30">
            <p className="mb-1 text-sm text-champagne/70">Total</p>
            <p className="text-3xl font-bold text-champagne">{stats.total}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Pending</p>
            <p className="text-3xl font-bold text-champagne">{stats.pending}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Confirmed</p>
            <p className="text-3xl font-bold text-champagne">{stats.confirmed}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Completed</p>
            <p className="text-3xl font-bold text-champagne">{stats.completed}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Cancelled</p>
            <p className="text-3xl font-bold text-champagne">{stats.cancelled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                      statusFilter === status
                        ? 'bg-primary text-charcoal'
                        : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>

            {/* Date Filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">📅</div>
            <h3 className="mb-2 text-h3 text-champagne">No Reservations Found</h3>
            <p className="text-champagne/70">
              {statusFilter !== 'all' || selectedDate
                ? 'Try adjusting your filters'
                : 'No reservations in the system yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="transition-all card hover:border-primary/30"
              >
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* Main Info */}
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
                        <div className="flex items-center gap-2 text-champagne/70">
                          <HiCalendar />
                          <span>{formatDate(reservation.reservation_date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Restaurant & Customer Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Restaurant */}
                      <div className="p-3 rounded-lg bg-charcoal-light">
                        <div className="flex items-center gap-2 mb-2">
                          <HiOfficeBuilding className="text-primary" />
                          <p className="text-sm text-champagne/70">Restaurant</p>
                        </div>
                        <p className="font-semibold text-champagne">
                          {reservation.restaurants?.name}
                        </p>
                        <p className="text-sm text-champagne/50">
                          {reservation.restaurants?.city}
                        </p>
                      </div>

                      {/* Customer */}
                      <div className="p-3 rounded-lg bg-charcoal-light">
                        <div className="flex items-center gap-2 mb-2">
                          <HiUsers className="text-primary" />
                          <p className="text-sm text-champagne/70">Customer</p>
                        </div>
                        <p className="font-semibold text-champagne">
                          {reservation.users?.full_name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-champagne/50">
                          <HiMail className="text-xs" />
                          <span className="truncate">{reservation.users?.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="flex items-center gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-2 text-champagne/70">
                        <HiUsers />
                        <span>{reservation.number_of_people} guests</span>
                      </div>
                      <div className="text-champagne/70">
                        Table {reservation.restaurant_tables?.table_number}
                      </div>
                      <div className="font-mono text-xs text-primary">
                        {reservation.confirmation_code}
                      </div>
                    </div>

                    {/* Special Requests */}
                    {reservation.special_requests && (
                      <div className="p-3 mt-3 border rounded-lg bg-primary/10 border-primary/30">
                        <p className="mb-1 text-xs text-champagne/70">
                          Special Requests
                        </p>
                        <p className="text-sm text-champagne">
                          {reservation.special_requests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Results Info */}
        {!loading && (
          <div className="card">
            <p className="text-sm text-champagne/70">
              Showing {filteredReservations.length} of {reservations.length}{' '}
              reservations
            </p>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
