import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { OwnerRoute } from '@/components/common/OwnerRoute'
import { AdminRoute } from '@/components/common/AdminRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { Home } from '@/pages/customer/Home'
import { RestaurantList } from '@/pages/customer/RestaurantList'
import { RestaurantDetail } from '@/pages/customer/RestaurantDetail'
import { ReservationFlow } from '@/pages/customer/ReservationFlow'
import { MyReservations } from '@/pages/dashboard/MyReservations'
import { MyReviews } from '@/pages/dashboard/MyReviews'
import { MyFavorites } from '@/pages/dashboard/MyFavorites'
import { Notifications } from '@/pages/dashboard/Notifications'
import { Profile } from '@/pages/dashboard/Profile'
import { OwnerDashboard } from '@/pages/owner/OwnerDashboard'
import { OwnerReservations } from '@/pages/owner/OwnerReservations'
import { OwnerMenus } from '@/pages/owner/OwnerMenus'
import { OwnerTables } from '@/pages/owner/OwnerTables'
import { OwnerAnalytics } from '@/pages/owner/OwnerAnalytics'
import { OwnerSettings } from '@/pages/owner/OwnerSettings'
import { OwnerReviews } from '@/pages/owner/OwnerReviews'
import { AdminUsers } from '@/pages/admin/AdminUsers'
import { AdminRestaurants } from '@/pages/admin/AdminRestaurants'
import { AdminReservations } from '@/pages/admin/AdminReservations'
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { BecomeOwner } from '@/pages/customer/BecomeOwner'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Public routes with layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/restaurants" element={<Layout><RestaurantList /></Layout>} />
          <Route path="/restaurants/:id" element={<Layout><RestaurantDetail /></Layout>} />

          {/* Protected reservation route */}
          <Route
            path="/restaurants/:id/reserve"
            element={
              <ProtectedRoute>
                <ReservationFlow />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/restaurants"
            element={
              <AdminRoute>
                <AdminRestaurants />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reservations"
            element={
              <AdminRoute>
                <AdminReservations />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            }
          />

          {/* Customer Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyReservations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reviews"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyReviews />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/favorites"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyFavorites />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/become-owner"
            element={
              <ProtectedRoute>
                <Layout>
                  <BecomeOwner />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Owner Dashboard routes - NOW PROTECTED! */}
          <Route
            path="/owner"
            element={
              <OwnerRoute>
                <Layout>
                  <OwnerDashboard />
                </Layout>
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/reservations"
            element={
              <OwnerRoute>
                <Layout>
                  <OwnerReservations />
                </Layout>
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/menus"
            element={
              <OwnerRoute>
                <Layout>
                  <OwnerMenus />
                </Layout>
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/tables"
            element={
              <OwnerRoute>
                <Layout>
                  <OwnerTables />
                </Layout>
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/analytics"
            element={
              <OwnerRoute>
                <Layout>
                  <OwnerAnalytics />
                </Layout>
              </OwnerRoute>
            }
          />
          <Route
            path="/owner/settings"
            element={
              <OwnerRoute>
                <Layout>
                  <OwnerSettings />
                </Layout>
              </OwnerRoute>
            }
          />
          <Route
  path="/owner/reviews"
  element={
    <OwnerRoute>
      <Layout>
        <OwnerReviews />
      </Layout>
    </OwnerRoute>
  }
/>

          {/* 404 */}
          <Route
            path="*"
            element={
              <Layout>
                <div className="py-20 text-center container-luxury">
                  <h1 className="mb-4 text-display text-champagne">404</h1>
                  <p className="mb-8 text-champagne/70">Page not found</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </Layout>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
