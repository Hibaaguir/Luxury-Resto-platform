import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/services/userService'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { HiUser, HiMail, HiPhone, HiStar, HiCalendar, HiHeart } from 'react-icons/hi'
import { motion } from 'framer-motion'

export function Profile() {
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  // Form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (user?.id) {
      loadProfile()
      loadStats()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await userService.getProfile(user!.id)
      setProfile(data)
      setFullName(data.full_name || '')
      setPhone(data.phone || '')
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await userService.getUserStats(user!.id)
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      await userService.updateProfile(user!.id, {
        full_name: fullName,
        phone: phone,
      })
      alert('Profile updated successfully!')
      loadProfile()
    } catch (error: any) {
      alert(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="mb-2 text-display text-gradient-gold">My Profile</h1>
          <p className="text-champagne/70">Manage your account settings</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <HiCalendar className="text-2xl text-primary" />
                <p className="text-sm text-champagne/70">Total Reservations</p>
              </div>
              <p className="text-4xl font-bold text-champagne">
                {stats.totalReservations}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card bg-gradient-to-br from-forest/10 to-transparent border-forest/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <HiCalendar className="text-2xl text-forest-light" />
                <p className="text-sm text-champagne/70">Upcoming</p>
              </div>
              <p className="text-4xl font-bold text-champagne">
                {stats.upcomingReservations}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card bg-gradient-to-br from-rose-900/10 to-transparent border-rose-700/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <HiStar className="text-2xl text-primary" />
                <p className="text-sm text-champagne/70">Reviews</p>
              </div>
              <p className="text-4xl font-bold text-champagne">
                {stats.totalReviews}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card bg-gradient-to-br from-taupe/10 to-transparent border-taupe/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <HiHeart className="text-2xl text-primary" />
                <p className="text-sm text-champagne/70">Favorites</p>
              </div>
              <p className="text-4xl font-bold text-champagne">
                {stats.totalFavorites}
              </p>
            </motion.div>
          </div>
        )}

        {/* Profile Information */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="mb-6 text-h2 text-champagne">Personal Information</h2>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  icon={<HiUser />}
                />

                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  icon={<HiMail />}
                  helperText="Email cannot be changed"
                />

                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  icon={<HiPhone />}
                />

                <div className="flex gap-4">
                  <Button type="submit" loading={saving} className="flex-1">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFullName(profile.full_name || '')
                      setPhone(profile.phone || '')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="mb-4 text-h3 text-champagne">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-sm text-champagne/70">Member Since</p>
                  <p className="font-semibold text-champagne">
                    {new Date(profile?.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-champagne/70">Account Type</p>
                  <p className="font-semibold capitalize text-champagne">
                    {profile?.role || 'Customer'}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-champagne/70">Status</p>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-forest/20 text-forest-light">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <div className="card border-rose-700/30">
              <h3 className="mb-4 text-h3 text-champagne">Danger Zone</h3>
              <p className="mb-4 text-sm text-champagne/70">
                Sign out of your account
              </p>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full text-rose-300 border-rose-700 hover:bg-rose-900/20"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
