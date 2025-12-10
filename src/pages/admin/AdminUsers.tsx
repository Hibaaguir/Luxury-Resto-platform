import { useState, useEffect } from 'react'
import { adminService } from '@/services/adminService'
import { AdminDashboardLayout } from '@/components/admin/AdminDashboardLayout'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import {
  HiSearch,
  HiPencil,
  HiTrash,
  HiUser,
  HiOfficeBuilding,
  HiShieldCheck,
  HiX,
} from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'

export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [newRole, setNewRole] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user)
    setNewRole(user.role)
    setShowEditModal(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      setUpdating(true)
      await adminService.updateUserRole(selectedUser.id, newRole)
      setShowEditModal(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      alert(error.message || 'Failed to update user role')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      await adminService.deleteUser(userId)
      loadUsers()
    } catch (error: any) {
      alert(error.message || 'Failed to delete user')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <HiShieldCheck className="text-rose-300" />
      case 'restaurant_owner':
        return <HiOfficeBuilding className="text-primary" />
      default:
        return <HiUser className="text-champagne" />
    }
  }

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-rose-900/20 text-rose-300 border-rose-700',
      restaurant_owner: 'bg-primary/20 text-primary border-primary',
      customer: 'bg-taupe/20 text-champagne border-taupe',
    }
    return badges[role as keyof typeof badges] || badges.customer
  }

  const roleStats = {
    all: users.length,
    customer: users.filter((u) => u.role === 'customer').length,
    restaurant_owner: users.filter((u) => u.role === 'restaurant_owner').length,
    admin: users.filter((u) => u.role === 'admin').length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-display text-gradient-gold">User Management</h1>
          <p className="text-champagne/70">Manage all platform users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card bg-primary/10 border-primary/30">
            <p className="mb-1 text-sm text-champagne/70">Total Users</p>
            <p className="text-3xl font-bold text-champagne">{roleStats.all}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Customers</p>
            <p className="text-3xl font-bold text-champagne">{roleStats.customer}</p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Owners</p>
            <p className="text-3xl font-bold text-champagne">
              {roleStats.restaurant_owner}
            </p>
          </div>
          <div className="card">
            <p className="mb-1 text-sm text-champagne/70">Admins</p>
            <p className="text-3xl font-bold text-champagne">{roleStats.admin}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <HiSearch className="absolute text-xl -translate-y-1/2 left-4 top-1/2 text-champagne/50" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 input"
              />
            </div>

            {/* Role Filter */}
            <div className="flex gap-2">
              {(['all', 'customer', 'restaurant_owner', 'admin'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    roleFilter === role
                      ? 'bg-primary text-charcoal'
                      : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
                  }`}
                >
                  {role === 'all'
                    ? 'All'
                    : role === 'restaurant_owner'
                    ? 'Owners'
                    : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">👥</div>
            <h3 className="mb-2 text-h3 text-champagne">No Users Found</h3>
            <p className="text-champagne/70">
              {searchQuery || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No users in the system yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-taupe/20">
                    <th className="p-4 text-sm font-semibold text-left text-champagne/70">
                      User
                    </th>
                    <th className="p-4 text-sm font-semibold text-left text-champagne/70">
                      Role
                    </th>
                    <th className="p-4 text-sm font-semibold text-left text-champagne/70">
                      Contact
                    </th>
                    <th className="p-4 text-sm font-semibold text-left text-champagne/70">
                      Activity
                    </th>
                    <th className="p-4 text-sm font-semibold text-left text-champagne/70">
                      Joined
                    </th>
                    <th className="p-4 text-sm font-semibold text-right text-champagne/70">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="transition-colors border-b border-taupe/10 hover:bg-taupe/5"
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-primary/20">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <p className="font-semibold text-champagne">
                              {user.full_name || 'N/A'}
                            </p>
                            <p className="text-sm text-champagne/50">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role === 'restaurant_owner'
                            ? 'Owner'
                            : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <p className="text-sm text-champagne">
                          {user.phone || 'No phone'}
                        </p>
                      </td>

                      {/* Activity */}
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-champagne">
                            {user.reservations?.[0]?.count || 0} reservations
                          </p>
                          <p className="text-champagne/50">
                            {user.reviews?.[0]?.count || 0} reviews
                          </p>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4">
                        <p className="text-sm text-champagne">
                          {formatDate(user.created_at)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 transition-colors text-champagne hover:text-primary"
                            title="Edit Role"
                          >
                            <HiPencil className="text-lg" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(user.id, user.full_name || user.email)
                            }
                            className="p-2 transition-colors text-champagne hover:text-rose-300"
                            title="Delete User"
                          >
                            <HiTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            <div className="p-4 border-t border-taupe/20">
              <p className="text-sm text-champagne/70">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        <AnimatePresence>
          {showEditModal && selectedUser && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEditModal(false)}
                className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm"
              />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-md card"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h2 text-gradient-gold">Edit User Role</h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="transition-colors text-champagne hover:text-primary"
                    >
                      <HiX className="text-2xl" />
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="p-4 mb-6 rounded-lg bg-charcoal-light">
                    <p className="mb-1 font-semibold text-champagne">
                      {selectedUser.full_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-champagne/70">{selectedUser.email}</p>
                    <p className="mt-2 text-xs text-champagne/50">
                      Current role:{' '}
                      <span className="font-semibold text-primary">
                        {selectedUser.role}
                      </span>
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div className="mb-6">
                    <label className="block mb-3 text-sm font-medium text-champagne">
                      Select New Role
                    </label>
                    <div className="space-y-2">
                      {['customer', 'restaurant_owner', 'admin'].map((role) => (
                        <button
                          key={role}
                          onClick={() => setNewRole(role)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            newRole === role
                              ? 'border-primary bg-primary/10'
                              : 'border-taupe/20 hover:border-taupe/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {getRoleIcon(role)}
                            <div>
                              <p className="font-semibold text-champagne">
                                {role === 'restaurant_owner'
                                  ? 'Restaurant Owner'
                                  : role.charAt(0).toUpperCase() + role.slice(1)}
                              </p>
                              <p className="text-xs text-champagne/50">
                                {role === 'admin'
                                  ? 'Full system access'
                                  : role === 'restaurant_owner'
                                  ? 'Can manage restaurants'
                                  : 'Standard user access'}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Warning */}
                  {newRole === 'admin' && (
                    <div className="p-4 mb-6 border rounded-lg bg-rose-900/20 border-rose-700">
                      <p className="text-sm text-rose-300">
                        ⚠️ Admin users have full access to all system features. Use with
                        caution.
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      onClick={handleUpdateRole}
                      loading={updating}
                      disabled={newRole === selectedUser.role}
                      className="flex-1"
                    >
                      Update Role
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminDashboardLayout>
  )
}
