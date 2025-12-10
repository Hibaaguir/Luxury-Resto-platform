import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout'
import {
  HiTrendingUp,
  HiTrendingDown,
  HiUsers,
  HiOfficeBuilding,
  HiCalendar,
  HiStar,
  HiCurrencyDollar,
} from 'react-icons/hi'
import { motion } from 'framer-motion'

export function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [statsData, usersData, reservationsData, restaurantsData] =
        await Promise.all([
          adminService.getSystemStats(),
          adminService.getAllUsers(),
          adminService.getAllReservations(),
          adminService.getAllRestaurants(),
        ])

      setStats(statsData)
      setUsers(usersData)
      setReservations(reservationsData)
      setRestaurants(restaurantsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate growth metrics
  const calculateGrowth = (data: any[], dateField: string) => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    const currentMonth = data.filter(
      (item) => new Date(item[dateField]) >= lastMonth
    ).length
    const previousMonth = data.filter(
      (item) =>
        new Date(item[dateField]) >= twoMonthsAgo &&
        new Date(item[dateField]) < lastMonth
    ).length

    if (previousMonth === 0) return 100
    return ((currentMonth - previousMonth) / previousMonth) * 100
  }

  // Get top performing restaurants
  const getTopRestaurants = () => {
    return restaurants
      .map((r) => ({
        ...r,
        reservationCount: r.reservations?.[0]?.count || 0,
        reviewCount: r.reviews?.[0]?.count || 0,
      }))
      .sort((a, b) => b.reservationCount - a.reservationCount)
      .slice(0, 5)
  }

  // Get reservation trends by day
  const getReservationTrends = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map((date) => ({
      date,
      count: reservations.filter((r) => r.reservation_date === date).length,
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    }))
  }

  // Get status distribution
  const getStatusDistribution = () => {
    const statuses = ['pending', 'confirmed', 'cancelled', 'completed']
    return statuses.map((status) => ({
      status,
      count: reservations.filter((r) => r.status === status).length,
      percentage:
        reservations.length > 0
          ? (
              (reservations.filter((r) => r.status === status).length /
                reservations.length) *
              100
            ).toFixed(1)
          : 0,
    }))
  }

  // Calculate revenue estimate (based on average meal price)
  const estimateRevenue = () => {
    const priceMap: { [key: string]: number } = {
      '€': 15,
      '€€': 30,
      '€€€': 60,
      '€€€€': 120,
    }

    return restaurants.reduce((total, restaurant) => {
      const avgPrice = priceMap[restaurant.price_range] || 30
      const reservationCount = restaurant.reservations?.[0]?.count || 0
      return total + avgPrice * reservationCount
    }, 0)
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

  const userGrowth = calculateGrowth(users, 'created_at')
  const reservationGrowth = calculateGrowth(reservations, 'created_at')
  const restaurantGrowth = calculateGrowth(restaurants, 'created_at')
  const topRestaurants = getTopRestaurants()
  const reservationTrends = getReservationTrends()
  const statusDistribution = getStatusDistribution()
  const estimatedRevenue = estimateRevenue()

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Analytics</h1>
            <p className="text-champagne/70">Platform performance insights</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-primary text-charcoal'
                    : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-primary/20">
                <HiUsers className="text-2xl text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 ${
                  userGrowth >= 0 ? 'text-forest-light' : 'text-rose-300'
                }`}
              >
                {userGrowth >= 0 ? <HiTrendingUp /> : <HiTrendingDown />}
                <span className="text-sm font-bold">
                  {Math.abs(userGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-champagne/70">Total Users</p>
            <p className="text-3xl font-bold text-champagne">{stats?.totalUsers}</p>
            <p className="mt-1 text-xs text-champagne/50">vs last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-forest/10 to-transparent border-forest/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-forest/20">
                <HiOfficeBuilding className="text-2xl text-forest-light" />
              </div>
              <div
                className={`flex items-center gap-1 ${
                  restaurantGrowth >= 0 ? 'text-forest-light' : 'text-rose-300'
                }`}
              >
                {restaurantGrowth >= 0 ? <HiTrendingUp /> : <HiTrendingDown />}
                <span className="text-sm font-bold">
                  {Math.abs(restaurantGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-champagne/70">Restaurants</p>
            <p className="text-3xl font-bold text-champagne">
              {stats?.totalRestaurants}
            </p>
            <p className="mt-1 text-xs text-champagne/50">vs last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-rose-900/10 to-transparent border-rose-700/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 rounded-lg bg-rose-900/20">
                <HiCalendar className="text-2xl text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 ${
                  reservationGrowth >= 0 ? 'text-forest-light' : 'text-rose-300'
                }`}
              >
                {reservationGrowth >= 0 ? <HiTrendingUp /> : <HiTrendingDown />}
                <span className="text-sm font-bold">
                  {Math.abs(reservationGrowth).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-sm text-champagne/70">Reservations</p>
            <p className="text-3xl font-bold text-champagne">
              {stats?.totalReservations}
            </p>
            <p className="mt-1 text-xs text-champagne/50">vs last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-taupe/10 to-transparent border-taupe/30"
          >
            <div className="p-3 mb-2 rounded-lg bg-taupe/20 w-fit">
              <HiCurrencyDollar className="text-2xl text-primary" />
            </div>
            <p className="text-sm text-champagne/70">Est. Revenue</p>
            <p className="text-3xl font-bold text-champagne">
              €{(estimatedRevenue / 1000).toFixed(1)}K
            </p>
            <p className="mt-1 text-xs text-champagne/50">based on bookings</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Reservation Trends */}
          <div className="card">
            <h2 className="mb-6 text-h2 text-champagne">
              Reservation Trends (Last 7 Days)
            </h2>
            <div className="space-y-3">
              {reservationTrends.map((day, index) => {
                const maxCount = Math.max(...reservationTrends.map((d) => d.count))
                const percentage =
                  maxCount > 0 ? (day.count / maxCount) * 100 : 0

                return (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-champagne">
                        {day.label}
                      </span>
                      <span className="text-champagne/70">{day.count} bookings</span>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="h-3 rounded-full bg-gradient-to-r from-primary to-forest-light"
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="card">
            <h2 className="mb-6 text-h2 text-champagne">Reservation Status</h2>
            <div className="space-y-4">
              {statusDistribution.map((item, index) => {
                const colors = {
                  confirmed: 'bg-forest-light',
                  pending: 'bg-primary',
                  cancelled: 'bg-rose-300',
                  completed: 'bg-taupe',
                }

                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded ${
                            colors[item.status as keyof typeof colors]
                          }`}
                        />
                        <span className="font-semibold capitalize text-champagne">
                          {item.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-champagne">
                          {item.count}
                        </span>
                        <span className="ml-2 text-sm text-champagne/50">
                          ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className={`h-2 ${
                        colors[item.status as keyof typeof colors]
                      } rounded-full opacity-50`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Top Performing Restaurants */}
        <div className="card">
          <h2 className="mb-6 text-h2 text-champagne">Top Performing Restaurants</h2>
          <div className="space-y-4">
            {topRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 transition-colors rounded-lg bg-charcoal-light hover:bg-taupe/10"
              >
                {/* Rank */}
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-primary/20">
                  <span className="text-lg font-bold text-primary">
                    #{index + 1}
                  </span>
                </div>

                {/* Restaurant Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-champagne">
                    {restaurant.name}
                  </p>
                  <p className="text-sm text-champagne/70">
                    {restaurant.city} • {restaurant.price_range}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="font-bold text-champagne">
                      {restaurant.reservationCount}
                    </p>
                    <p className="text-xs text-champagne/50">reservations</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-champagne">
                      {restaurant.reviewCount}
                    </p>
                    <p className="text-xs text-champagne/50">reviews</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <HiStar className="text-primary" />
                    <span className="font-bold text-champagne">
                      {(restaurant.average_rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="card">
            <p className="mb-2 text-sm text-champagne/70">Average Rating</p>
            <div className="flex items-center gap-2">
              <HiStar className="text-2xl text-primary" />
              <p className="text-3xl font-bold text-champagne">
                {restaurants.length > 0
                  ? (
                      restaurants.reduce(
                        (sum, r) => sum + (r.average_rating || 0),
                        0
                      ) / restaurants.length
                    ).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <p className="mt-2 text-xs text-champagne/50">across all restaurants</p>
          </div>

          <div className="card">
            <p className="mb-2 text-sm text-champagne/70">Active Users</p>
            <p className="text-3xl font-bold text-champagne">
              {users.filter((u) => {
                const lastMonth = new Date()
                lastMonth.setMonth(lastMonth.getMonth() - 1)
                return new Date(u.created_at) >= lastMonth
              }).length}
            </p>
            <p className="mt-2 text-xs text-champagne/50">joined this month</p>
          </div>

          <div className="card">
            <p className="mb-2 text-sm text-champagne/70">Conversion Rate</p>
            <p className="text-3xl font-bold text-champagne">
              {stats?.totalUsers > 0
                ? ((stats.totalReservations / stats.totalUsers) * 100).toFixed(1)
                : 0}
              %
            </p>
            <p className="mt-2 text-xs text-champagne/50">
              reservations per user
            </p>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
