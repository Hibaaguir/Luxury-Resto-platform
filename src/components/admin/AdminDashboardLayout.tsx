import { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  HiHome,
  HiUsers,
  HiOfficeBuilding,
  HiCalendar,
  HiChartBar,
  HiArrowLeft,
} from 'react-icons/hi'

interface AdminDashboardLayoutProps {
  children: ReactNode
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const navigate = useNavigate()

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: HiHome },
    { to: '/admin/users', label: 'Users', icon: HiUsers },
    { to: '/admin/restaurants', label: 'Restaurants', icon: HiOfficeBuilding },
    { to: '/admin/reservations', label: 'Reservations', icon: HiCalendar },
    { to: '/admin/analytics', label: 'Analytics', icon: HiChartBar },
  ]

  return (
    <div className="min-h-screen py-12 bg-gradient-dark">
      <div className="container-luxury">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 transition-colors text-champagne hover:text-primary"
          >
            <HiArrowLeft />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky card top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-900/20">
                  <span className="text-xl text-rose-300">👑</span>
                </div>
                <h2 className="text-h3 text-gradient-gold">Admin Panel</h2>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary text-charcoal font-semibold'
                          : 'text-champagne hover:bg-taupe/20'
                      }`
                    }
                  >
                    <item.icon className="text-xl" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  )
}
