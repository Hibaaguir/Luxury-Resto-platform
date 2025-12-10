import { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { 
  HiHome,
  HiCalendar, 
  HiMenu as HiMenuIcon,
  HiChartBar,
  HiCog,
  HiTable,
  HiArrowLeft,
  HiStar
} from 'react-icons/hi'
import { Button } from '@/components/common/Button'

interface OwnerDashboardLayoutProps {
  children: ReactNode
}

export function OwnerDashboardLayout({ children }: OwnerDashboardLayoutProps) {
  const navigate = useNavigate()
  
  const navItems = [
  { to: '/owner', label: 'Overview', icon: HiHome },
  { to: '/owner/reservations', label: 'Reservations', icon: HiCalendar },
  { to: '/owner/reviews', label: 'Reviews', icon: HiStar },
  { to: '/owner/menus', label: 'Menus', icon: HiMenuIcon },
  { to: '/owner/tables', label: 'Tables', icon: HiTable },
  { to: '/owner/analytics', label: 'Analytics', icon: HiChartBar },
  { to: '/owner/settings', label: 'Settings', icon: HiCog },
]


  return (
    <div className="min-h-screen py-12 mt-20 bg-gradient-dark">
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
              <h2 className="mb-6 text-h3 text-gradient-gold">Owner Dashboard</h2>
              
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/owner'}
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
