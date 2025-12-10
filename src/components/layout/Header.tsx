import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { HiMenu, HiX, HiUser, HiBell, HiLogout, HiOfficeBuilding, HiCalendar, HiShieldCheck } from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }
  const { unreadCount } = useRealtimeNotifications()

  // Check for restaurant_owner or admin role
  const isOwner = profile?.role === 'restaurant_owner'
  // Check for admin role (add after isOwner check)
  const isAdmin = profile?.role === 'admin'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-charcoal/95 backdrop-blur-md border-taupe/20">
      <nav className="py-4 container-luxury">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-serif text-2xl font-bold text-gradient-gold">
            LuxeDine
          </Link>

          {/* Desktop Navigation */}
          <div className="items-center hidden gap-8 md:flex">
            <Link
              to="/restaurants"
              className="transition-colors text-champagne hover:text-primary"
            >
              Restaurants
            </Link>
            {user && !isOwner && (
              <Link
                to="/dashboard"
                className="transition-colors text-champagne hover:text-primary"
              >
                My Reservations
              </Link>
              
            )}
            {profile?.role === 'customer' && (
  <Link
    to="/become-owner"
    className="font-semibold transition-colors text-champagne hover:text-primary"
  >
    List Your Restaurant
  </Link>
)}
            {isOwner && (
              <Link
                to="/owner"
                className="transition-colors text-champagne hover:text-primary"
              >
                Owner Dashboard
              </Link>
            )}
          </div>

          {/* Auth Section */}
          <div className="items-center hidden gap-4 md:flex">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 transition-all border rounded-luxury border-taupe/30 hover:border-primary/50"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20">
                    {isOwner ? (
                      <HiOfficeBuilding className="text-primary" />
                    ) : (
                      <HiUser className="text-primary" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="block text-sm text-champagne">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    {isOwner && (
                      <span className="text-xs text-primary">Restaurant Owner</span>
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileMenuOpen(false)}
                      />

                      {/* Menu */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 z-50 w-64 mt-2 overflow-hidden border bg-charcoal border-taupe/30 rounded-luxury shadow-luxury"
                      >
                        <div className="p-4 border-b border-taupe/20">
                          <p className="font-semibold text-champagne">{user.email}</p>
                          <p className="text-sm capitalize text-champagne/60">
                            {profile?.role === 'restaurant_owner' ? 'Restaurant Owner' : profile?.role || 'Customer'}
                          </p>
                        </div>

                        <div className="p-2">
                          {isAdmin && (
                              <Link
                                to="/admin"
                                className="flex items-center gap-3 px-4 py-3 transition-all transition-colors rounded-lg text-champagne hover:text-primary hover:bg-primary/10"
                              >
                                <HiShieldCheck className="text-lg" />
                                <span>Admin Planel</span>
                              </Link>
                            )}
                          {isOwner ? (
                            <>
                              {/* Owner Section */}
                              <div className="mb-2">
                                <p className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-champagne/50">
                                  Restaurant Management
                                </p>
                                <Link
                                  to="/owner"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
                                >
                                  <HiOfficeBuilding className="text-lg" />
                                  <span>Dashboard</span>
                                </Link>
                                <Link
                                  to="/owner/reservations"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
                                >
                                  <HiCalendar className="text-lg" />
                                  <span>Reservations</span>
                                </Link>
                                <Link
                                  to="/owner/settings"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
                                >
                                  <HiOfficeBuilding className="text-lg" />
                                  <span>Restaurant Settings</span>
                                </Link>
                              </div>

                              {/* Divider */}
                              <div className="my-2 border-t border-taupe/20"></div>

                              {/* Personal Section */}
                              <div>
                                <p className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-champagne/50">
                                  Personal
                                </p>
                                <Link
                                  to="/dashboard/profile"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
                                >
                                  <HiUser className="text-lg" />
                                  <span>My Profile</span>
                                </Link>
                                <Link
                                  to="/dashboard/notifications"
                                  onClick={() => setProfileMenuOpen(false)}
                                  className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
                                >
                                  <HiBell className="text-lg" />
                                  <span>Notifications</span>
                                </Link>
                              </div>
                            </>
                          ) : (
                            <>
                              <Link
                                to="/dashboard"
                                onClick={() => setProfileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
                              >
                                <HiUser className="text-lg" />
                                <span>Dashboard</span>
                              </Link>
                              <Link
  to="/dashboard/notifications"
  onClick={() => setProfileMenuOpen(false)}
  className="relative flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
>
  <HiBell className="text-lg" />
  <span>Notifications</span>
  {unreadCount > 0 && (
    <span className="absolute right-4 px-2 py-0.5 bg-primary text-charcoal rounded-full text-xs font-bold">
      {unreadCount}
    </span>
  )}
</Link>
                              <Link
                                to="/dashboard/profile"
                                onClick={() => setProfileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
                              >
                                <HiUser className="text-lg" />
                                <span>Profile</span>
                              </Link>
                            </>
                          )}
                        </div>

                        <div className="p-2 border-t border-taupe/20">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center w-full gap-3 px-4 py-3 transition-all rounded-lg text-rose-300 hover:bg-rose-900/20"
                          >
                            <HiLogout className="text-lg" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')}>Get Started</Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-2xl md:hidden text-champagne"
          >
            {mobileMenuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 mt-4 border-t md:hidden border-taupe/20"
            >
              <div className="flex flex-col gap-4">
                <Link
                  to="/restaurants"
                  className="transition-colors text-champagne hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Restaurants
                </Link>
                {user ? (
                  <>
                  {isAdmin && (
                          <>
                            <div className="my-2 border-t border-taupe/20"></div>
                            <div>
                              <p className="px-4 py-2 text-xs font-semibold tracking-wider uppercase text-champagne/50">
                                Administration
                              </p>
                              <Link
                                to="/admin"
                                onClick={() => setProfileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
                              >
                                <HiShieldCheck className="text-lg" />
                                <span>Admin Panel</span>
                              </Link>
                            </div>
                          </>
                        )}
                    {isOwner && (
                      <>
                        <p className="mt-2 text-xs font-semibold tracking-wider uppercase text-champagne/50">
                          Restaurant Management
                        </p>
                        <Link
                          to="/owner"
                          className="transition-colors text-champagne hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Owner Dashboard
                        </Link>
                        <Link
                          to="/owner/reservations"
                          className="transition-colors text-champagne hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Manage Reservations
                        </Link>
                        <Link
                          to="/owner/settings"
                          className="transition-colors text-champagne hover:text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Restaurant Settings
                        </Link>
                        <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-champagne/50">
                          Personal
                        </p>
                      </>
                    )}
                    {!isOwner && (
                      <Link
                        to="/dashboard"
                        className="transition-colors text-champagne hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to="/dashboard/profile"
                      className="transition-colors text-champagne hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {isOwner ? 'My Profile' : 'Profile'}
                    </Link>
                    <Link
  to="/dashboard/notifications"
  onClick={() => setProfileMenuOpen(false)}
  className="relative flex items-center gap-3 px-4 py-3 transition-all rounded-lg text-champagne hover:bg-primary/10 hover:text-primary"
>
  <HiBell className="text-lg" />
  <span>Notifications</span>
  {unreadCount > 0 && (
    <span className="absolute right-4 px-2 py-0.5 bg-primary text-charcoal rounded-full text-xs font-bold">
      {unreadCount}
    </span>
  )}
</Link>
                    <button
                      onClick={handleSignOut}
                      className="text-left transition-colors text-rose-300 hover:text-rose-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                    <Button onClick={() => navigate('/register')}>Get Started</Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
