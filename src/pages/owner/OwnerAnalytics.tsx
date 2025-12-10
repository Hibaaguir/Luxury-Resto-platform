import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ownerService } from '@/services/ownerService'
import { OwnerDashboardLayout } from '@/components/owner/OwnerDashboardLayout'
import {
  HiTrendingUp,
  HiCalendar,
  HiStar,
  HiUsers,
  HiClock,
} from 'react-icons/hi'
import { motion } from 'framer-motion'

export function OwnerAnalytics() {
  const { user } = useAuth()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadRestaurants()
    }
  }, [user])

  useEffect(() => {
    if (selectedRestaurant) {
      loadAnalytics()
    }
  }, [selectedRestaurant])

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

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await ownerService.getRestaurantAnalytics(selectedRestaurant.id)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Analytics</h1>
            <p className="text-champagne/70">Track your restaurant performance</p>
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : (
          <>
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
                    <HiCalendar className="text-2xl text-primary" />
                  </div>
                  <HiTrendingUp className="text-xl text-forest-light" />
                </div>
                <p className="mb-1 text-sm text-champagne/70">Total Reservations</p>
                <p className="text-4xl font-bold text-champagne">
                  {analytics?.totalReservations || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card bg-gradient-to-br from-forest/10 to-transparent border-forest/30"
              >
                <div className="p-3 mb-3 rounded-lg bg-forest/20 w-fit">
                  <HiClock className="text-2xl text-forest-light" />
                </div>
                <p className="mb-1 text-sm text-champagne/70">This Month</p>
                <p className="text-4xl font-bold text-champagne">
                  {analytics?.thisMonthReservations || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card bg-gradient-to-br from-rose-900/10 to-transparent border-rose-700/30"
              >
                <div className="p-3 mb-3 rounded-lg bg-rose-900/20 w-fit">
                  <HiStar className="text-2xl text-primary" />
                </div>
                <p className="mb-1 text-sm text-champagne/70">Average Rating</p>
                <p className="text-4xl font-bold text-champagne">
                  {analytics?.averageRating.toFixed(1) || '0.0'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card bg-gradient-to-br from-taupe/10 to-transparent border-taupe/30"
              >
                <div className="p-3 mb-3 rounded-lg bg-taupe/20 w-fit">
                  <HiUsers className="text-2xl text-primary" />
                </div>
                <p className="mb-1 text-sm text-champagne/70">Total Reviews</p>
                <p className="text-4xl font-bold text-champagne">
                  {analytics?.totalReviews || 0}
                </p>
              </motion.div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Reservations Overview */}
              <div className="card">
                <h2 className="mb-6 text-h2 text-champagne">Reservations Overview</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal-light">
                    <span className="text-champagne/70">Today</span>
                    <span className="text-2xl font-bold text-primary">
                      {analytics?.todayReservations || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal-light">
                    <span className="text-champagne/70">Upcoming</span>
                    <span className="text-2xl font-bold text-forest-light">
                      {analytics?.upcomingReservations || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal-light">
                    <span className="text-champagne/70">This Month</span>
                    <span className="text-2xl font-bold text-champagne">
                      {analytics?.thisMonthReservations || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal-light">
                    <span className="text-champagne/70">All Time</span>
                    <span className="text-2xl font-bold text-champagne">
                      {analytics?.totalReservations || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Engagement */}
              <div className="card">
                <h2 className="mb-6 text-h2 text-champagne">Customer Engagement</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal-light">
                    <div>
                      <p className="mb-1 font-semibold text-champagne">Average Rating</p>
                      <p className="text-sm text-champagne/70">Based on customer reviews</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiStar className="text-2xl text-primary" />
                      <span className="text-2xl font-bold text-primary">
                        {analytics?.averageRating.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal-light">
                    <div>
                      <p className="mb-1 font-semibold text-champagne">Total Reviews</p>
                      <p className="text-sm text-champagne/70">Customer feedback</p>
                    </div>
                    <span className="text-2xl font-bold text-champagne">
                      {analytics?.totalReviews || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-charcoal-light">
                    <div>
                      <p className="mb-1 font-semibold text-champagne">Favorites</p>
                      <p className="text-sm text-champagne/70">Saved by customers</p>
                    </div>
                    <span className="text-2xl font-bold text-champagne">
                      {analytics?.totalFavorites || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="card">
              <h2 className="mb-6 text-h2 text-champagne">Performance Insights</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="p-6 text-center border rounded-lg bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
                  <div className="mb-2 text-5xl font-bold text-primary">
                    {analytics?.totalReservations > 0
                      ? Math.round(
                          (analytics.upcomingReservations / analytics.totalReservations) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-champagne/70">Upcoming Rate</p>
                  <p className="mt-2 text-xs text-champagne">
                    {analytics?.upcomingReservations} upcoming out of{' '}
                    {analytics?.totalReservations} total
                  </p>
                </div>

                <div className="p-6 text-center border rounded-lg bg-gradient-to-br from-forest/10 to-transparent border-forest/30">
                  <div className="mb-2 text-5xl font-bold text-forest-light">
                    {analytics?.averageRating > 0
                      ? Math.round((analytics.averageRating / 5) * 100)
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-champagne/70">Rating Score</p>
                  <p className="mt-2 text-xs text-champagne">
                    {analytics?.averageRating.toFixed(1)} out of 5.0 stars
                  </p>
                </div>

                <div className="p-6 text-center border rounded-lg bg-gradient-to-br from-rose-900/10 to-transparent border-rose-700/30">
                  <div className="mb-2 text-5xl font-bold text-primary">
                    {analytics?.totalReservations > 0 && analytics?.totalReviews > 0
                      ? Math.round(
                          (analytics.totalReviews / analytics.totalReservations) * 100
                        )
                      : 0}
                    %
                  </div>
                  <p className="text-sm text-champagne/70">Review Rate</p>
                  <p className="mt-2 text-xs text-champagne">
                    {analytics?.totalReviews} reviews from {analytics?.totalReservations}{' '}
                    reservations
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </OwnerDashboardLayout>
  )
}
