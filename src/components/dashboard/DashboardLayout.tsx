import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  HiCalendar, 
  HiStar, 
  HiHeart, 
  HiUser, 
  HiBell 
} from 'react-icons/hi'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navItems = [
    { to: '/dashboard', label: 'My Reservations', icon: HiCalendar },
    { to: '/dashboard/reviews', label: 'My Reviews', icon: HiStar },
    { to: '/dashboard/favorites', label: 'Favorites', icon: HiHeart },
    { to: '/dashboard/notifications', label: 'Notifications', icon: HiBell },
    { to: '/dashboard/profile', label: 'Profile', icon: HiUser },
  ]

  return (
    <div className="min-h-screen py-12 mt-22 bg-gradient-dark" >
      <div className="mt-20 container-luxury">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky card top-24">
              <h2 className="mb-6 text-h3 text-gradient-gold">Dashboard</h2>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
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
