import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout'
import { Button } from '@/components/common/Button'
import {
  HiSearch,
  HiOfficeBuilding,
  HiCheckCircle,
  HiXCircle,
  HiEye,
  HiClock,
  HiTrash,
} from 'react-icons/hi'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export function AdminRestaurants() {
  const navigate = useNavigate()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all')

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllRestaurants()
      setRestaurants(data)
    } catch (error) {
      console.error('Error loading restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (restaurantId: string) => {
    if (!confirm('Approve this restaurant?')) return

    try {
      await adminService.updateRestaurantStatus(restaurantId, 'active')
      loadRestaurants()
      alert('Restaurant approved successfully!')
    } catch (error) {
      console.error('Error approving restaurant:', error)
      alert('Failed to approve restaurant')
    }
  }

  const handleReject = async (restaurantId: string) => {
    const reason = prompt('Enter rejection reason (optional):')
    
    try {
      await adminService.updateRestaurantStatus(restaurantId, 'rejected')
      loadRestaurants()
      alert('Restaurant rejected')
    } catch (error) {
      console.error('Error rejecting restaurant:', error)
      alert('Failed to reject restaurant')
    }
  }

  const handleDelete = async (restaurantId: string) => {
    if (!confirm('Permanently delete this restaurant? This cannot be undone!')) return

    try {
      await adminService.deleteRestaurant(restaurantId)
      loadRestaurants()
      alert('Restaurant deleted')
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      alert('Failed to delete restaurant')
    }
  }

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const pendingCount = restaurants.filter((r) => r.status === 'pending').length
  const activeCount = restaurants.filter((r) => r.status === 'active').length
  const rejectedCount = restaurants.filter((r) => r.status === 'rejected').length

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
          <h1 className="mb-2 text-display text-gradient-gold">Restaurant Management</h1>
          <p className="text-champagne/70">Manage and approve restaurant listings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="card bg-gradient-to-br from-taupe/10 to-transparent">
            <p className="mb-1 text-sm text-champagne/70">Total Restaurants</p>
            <p className="text-3xl font-bold text-champagne">{restaurants.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-primary/10 to-transparent">
            <p className="mb-1 text-sm text-champagne/70">Pending Approval</p>
            <p className="text-3xl font-bold text-primary">{pendingCount}</p>
          </div>
          <div className="card bg-gradient-to-br from-forest/10 to-transparent">
            <p className="mb-1 text-sm text-champagne/70">Active</p>
            <p className="text-3xl font-bold text-forest-light">{activeCount}</p>
          </div>
          <div className="card bg-gradient-to-br from-rose-900/10 to-transparent">
            <p className="mb-1 text-sm text-champagne/70">Rejected</p>
            <p className="text-3xl font-bold text-rose-300">{rejectedCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <HiSearch className="absolute text-xl transform -translate-y-1/2 left-4 top-1/2 text-champagne/50" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 input"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(['all', 'pending', 'active', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                    statusFilter === status
                      ? 'bg-primary text-charcoal'
                      : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Restaurants Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-taupe/20">
                  <th className="px-4 py-3 text-sm font-semibold text-left text-champagne">
                    Restaurant
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-champagne">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-champagne">
                    Location
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-champagne">
                    Status
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-left text-champagne">
                    Created
                  </th>
                  <th className="px-4 py-3 text-sm font-semibold text-right text-champagne">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <HiOfficeBuilding className="mx-auto mb-3 text-4xl text-champagne/30" />
                      <p className="text-champagne/70">No restaurants found</p>
                    </td>
                  </tr>
                ) : (
                  filteredRestaurants.map((restaurant) => (
                    <motion.tr
                      key={restaurant.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="transition-colors border-b border-taupe/10 hover:bg-taupe/5"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-primary/20">
                            <HiOfficeBuilding className="text-xl text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-champagne">{restaurant.name}</p>
                            <p className="text-sm text-champagne/60">
                              {restaurant.cuisine_type?.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-champagne">
                          {restaurant.users?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-champagne/60">
                          {restaurant.users?.email}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-champagne">{restaurant.city}</p>
                        <p className="text-sm text-champagne/60">{restaurant.country}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            restaurant.status === 'pending'
                              ? 'bg-primary/20 text-primary'
                              : restaurant.status === 'active'
                              ? 'bg-forest/20 text-forest-light'
                              : 'bg-rose-900/20 text-rose-300'
                          }`}
                        >
                          {restaurant.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-champagne/70">
                        {new Date(restaurant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                            className="p-2 transition-colors rounded-lg text-champagne/70 hover:bg-taupe/20 hover:text-primary"
                            title="View Details"
                          >
                            <HiEye className="text-xl" />
                          </button>

                          {restaurant.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(restaurant.id)}
                                className="p-2 transition-colors rounded-lg text-forest-light hover:bg-forest/20"
                                title="Approve"
                              >
                                <HiCheckCircle className="text-xl" />
                              </button>
                              <button
                                onClick={() => handleReject(restaurant.id)}
                                className="p-2 transition-colors rounded-lg text-rose-300 hover:bg-rose-900/20"
                                title="Reject"
                              >
                                <HiXCircle className="text-xl" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(restaurant.id)}
                            className="p-2 transition-colors rounded-lg text-rose-300 hover:bg-rose-900/20"
                            title="Delete"
                          >
                            <HiTrash className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
