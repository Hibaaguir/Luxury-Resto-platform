import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ownerService } from '@/services/ownerService'
import { OwnerDashboardLayout } from '@/components/owner/OwnerDashboardLayout'
import { Button } from '@/components/common/Button'
import { useNavigate } from 'react-router-dom'
import {
  HiCalendar,
  HiStar,
  HiHeart,
  HiTrendingUp,
  HiClock,
  HiUsers,
  HiPlus,
  HiChartBar,
  HiMenu,  // Added this
} from 'react-icons/hi'
import { motion } from 'framer-motion'


export function OwnerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
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
      const data = await ownerService.getRestaurantAnalytics(selectedRestaurant.id)
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  if (loading) {
    return (
      <OwnerDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
        </div>
      </OwnerDashboardLayout>
    )
  }

  if (restaurants.length === 0) {
    return (
      <OwnerDashboardLayout>
        <div className="py-20 text-center card">
          <div className="mb-4 text-6xl">🍽️</div>
          <h3 className="mb-2 text-h3 text-champagne">No Restaurants Yet</h3>
          <p className="mb-6 text-champagne/70">
            Create your first restaurant to start managing reservations
          </p>
          <Button onClick={() => navigate('/owner/settings')}>
            <HiPlus className="mr-2" />
            Create Restaurant
          </Button>
        </div>
      </OwnerDashboardLayout>
    )
  }

  return (
    <OwnerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Dashboard</h1>
            <p className="text-champagne/70">Welcome back! Here's your overview</p>
          </div>

          {/* Restaurant Selector */}
          {restaurants.length > 1 && (
            <select
              value={selectedRestaurant?.id || ''}
              onChange={(e) => {
                const restaurant = restaurants.find(r => r.id === e.target.value)
                setSelectedRestaurant(restaurant)
              }}
              className="max-w-xs input"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id} className='bg-charcoal-light text-champagne'>
                  {restaurant.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Stats Grid */}
        {analytics && (
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
              <p className="mb-1 text-sm text-champagne/70">Today's Reservations</p>
              <p className="text-4xl font-bold text-champagne">
                {analytics.todayReservations}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card bg-gradient-to-br from-forest/10 to-transparent border-forest/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-forest/20">
                  <HiClock className="text-2xl text-forest-light" />
                </div>
              </div>
              <p className="mb-1 text-sm text-champagne/70">Upcoming Reservations</p>
              <p className="text-4xl font-bold text-champagne">
                {analytics.upcomingReservations}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card bg-gradient-to-br from-rose-900/10 to-transparent border-rose-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-rose-900/20">
                  <HiStar className="text-2xl text-primary" />
                </div>
              </div>
              <p className="mb-1 text-sm text-champagne/70">Average Rating</p>
              <p className="text-4xl font-bold text-champagne">
                {analytics.averageRating.toFixed(1)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card bg-gradient-to-br from-taupe/10 to-transparent border-taupe/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-lg bg-taupe/20">
                  <HiHeart className="text-2xl text-primary" />
                </div>
              </div>
              <p className="mb-1 text-sm text-champagne/70">Total Favorites</p>
              <p className="text-4xl font-bold text-champagne">
                {analytics.totalFavorites}
              </p>
            </motion.div>
          </div>
        )}

       {/* Quick Actions */}
<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
  <Button
    onClick={() => navigate('/owner/reservations')}
    className="flex items-center justify-center w-full gap-2"
    size="lg"
  >
    <HiCalendar className="mr-2" />
    Manage Reservations
  </Button>
  <Button
    onClick={() => navigate('/owner/menus')}
    variant="outline"
    className="flex items-center justify-center w-full gap-2"
    size="lg"
  >
    <HiMenu className="mr-2" />
    Edit Menus
  </Button>
  <Button
    onClick={() => navigate('/owner/analytics')}
    variant="outline"
    className="flex items-center justify-center w-full gap-2"
    size="lg"
  >
    <HiChartBar className="mr-2" />
    View Analytics
  </Button>
</div>


        {/* Recent Reservations */}
        {analytics?.recentReservations && analytics.recentReservations.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 text-champagne">Recent Reservations</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/owner/reservations')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {analytics.recentReservations.slice(0, 5).map((reservation: any) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 transition-all rounded-lg bg-charcoal-light hover:border hover:border-primary/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <HiUsers className="text-xl text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-champagne">
                        {reservation.reservation_date} at {reservation.reservation_time}
                      </p>
                      <p className="text-sm text-champagne/70">
                        {reservation.number_of_people} guests
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      reservation.status === 'confirmed'
                        ? 'bg-forest/20 text-forest-light'
                        : reservation.status === 'pending'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-rose-900/20 text-rose-300'
                    }`}
                  >
                    {reservation.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restaurant Info Card */}
        <div className="card">
          <h2 className="mb-4 text-h2 text-champagne">Restaurant Information</h2>
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-sm text-champagne/70">Name</p>
                  <p className="text-lg font-semibold text-champagne">
                    {selectedRestaurant.name}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-champagne/70">Location</p>
                  <p className="text-champagne">
                    {selectedRestaurant.city}, {selectedRestaurant.country}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-champagne/70">Cuisine</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRestaurant.cuisine_type?.map((cuisine: string) => (
                      <span
                        key={cuisine}
                        className="px-3 py-1 text-sm rounded-full bg-taupe/20 text-champagne"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => navigate('/owner/settings')}
              >
                Edit Restaurant
              </Button>
            </div>
          </div>
        </div>
      </div>
    </OwnerDashboardLayout>
  )
}
