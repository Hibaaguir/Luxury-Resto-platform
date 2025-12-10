import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout'
import { HiUsers, HiOfficeBuilding, HiCalendar, HiStar, HiTrendingUp } from 'react-icons/hi'
import { motion } from 'framer-motion'

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [statsData, activityData] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getRecentActivity(10),
      ])
      setStats(statsData)
      setActivity(activityData)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-display text-gradient-gold">System Overview</h1>
          <p className="text-champagne/70">Monitor and manage your platform</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/30"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <HiUsers className="text-2xl text-primary" />
              </div>
              <HiTrendingUp className="text-xl text-forest-light" />
            </div>
            <p className="mb-1 text-sm text-champagne/70">Total Users</p>
            <p className="text-4xl font-bold text-champagne">{stats?.totalUsers || 0}</p>
            <p className="mt-2 text-xs text-champagne/50">
              {stats?.customerCount} customers • {stats?.ownerCount} owners
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-forest/10 to-transparent border-forest/30"
          >
            <div className="p-3 mb-3 rounded-lg bg-forest/20 w-fit">
              <HiOfficeBuilding className="text-2xl text-forest-light" />
            </div>
            <p className="mb-1 text-sm text-champagne/70">Restaurants</p>
            <p className="text-4xl font-bold text-champagne">
              {stats?.totalRestaurants || 0}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-rose-900/10 to-transparent border-rose-700/30"
          >
            <div className="p-3 mb-3 rounded-lg bg-rose-900/20 w-fit">
              <HiCalendar className="text-2xl text-primary" />
            </div>
            <p className="mb-1 text-sm text-champagne/70">Reservations</p>
            <p className="text-4xl font-bold text-champagne">
              {stats?.totalReservations || 0}
            </p>
            <p className="mt-2 text-xs text-champagne/50">
              {stats?.pendingReservations} pending
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-taupe/10 to-transparent border-taupe/30"
          >
            <div className="p-3 mb-3 rounded-lg bg-taupe/20 w-fit">
              <HiStar className="text-2xl text-primary" />
            </div>
            <p className="mb-1 text-sm text-champagne/70">Total Reviews</p>
            <p className="text-4xl font-bold text-champagne">{stats?.totalReviews || 0}</p>
          </motion.div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Today</p>
            <p className="text-3xl font-bold text-champagne">
              {stats?.todayReservations || 0}
            </p>
            <p className="text-xs text-champagne/50">reservations</p>
          </div>

          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">This Month</p>
            <p className="text-3xl font-bold text-champagne">
              {stats?.thisMonthReservations || 0}
            </p>
            <p className="text-xs text-champagne/50">reservations</p>
          </div>

          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Pending</p>
            <p className="text-3xl font-bold text-champagne">
              {stats?.pendingReservations || 0}
            </p>
            <p className="text-xs text-champagne/50">need attention</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Reservations */}
          <div className="card">
            <h2 className="mb-4 text-h2 text-champagne">Recent Reservations</h2>
            <div className="space-y-3">
              {activity?.reservations?.slice(0, 5).map((reservation: any) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-charcoal-light"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-champagne">
                      {reservation.users?.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm truncate text-champagne/70">
                      {reservation.restaurants?.name}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        reservation.status === 'confirmed'
                          ? 'bg-forest/20 text-forest-light'
                          : reservation.status === 'pending'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-rose-900/20 text-rose-300'
                      }`}
                    >
                      {reservation.status}
                    </span>
                    <p className="mt-1 text-xs text-champagne/50">
                      {formatDate(reservation.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="card">
            <h2 className="mb-4 text-h2 text-champagne">Recent Reviews</h2>
            <div className="space-y-3">
              {activity?.reviews?.slice(0, 5).map((review: any) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-charcoal-light"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-champagne">
                      {review.users?.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm truncate text-champagne/70">
                      {review.restaurants?.name}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="flex justify-end gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <HiStar key={i} className="text-sm text-primary" />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-champagne/50">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
