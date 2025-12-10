import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { notificationService } from '@/services/notificationService'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/common/Button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiBell,
  HiCheckCircle,
  HiX,
  HiCalendar,
  HiStar,
  HiExclamationCircle,
  HiInformationCircle,
} from 'react-icons/hi'

export function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (user?.id) {
      loadNotifications()
    }
  }, [user])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationService.getUserNotifications(user!.id)
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
    } catch (error: any) {
      alert(error.message || 'Failed to mark as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user!.id)
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })))
    } catch (error: any) {
      alert(error.message || 'Failed to mark all as read')
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      setNotifications(notifications.filter((n) => n.id !== notificationId))
    } catch (error: any) {
      alert(error.message || 'Failed to delete notification')
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation_new':
      case 'reservation_confirmed':
        return <HiCalendar className="text-2xl text-primary" />
      case 'reservation_cancelled':
        return <HiExclamationCircle className="text-2xl text-rose-300" />
      case 'review':
        return <HiStar className="text-2xl text-primary" />
      case 'system':
        return <HiInformationCircle className="text-2xl text-forest-light" />
      default:
        return <HiBell className="text-2xl text-champagne" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-display text-gradient-gold">Notifications</h1>
            <p className="text-champagne/70">
              Stay updated with your reservations and activities
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" className='flex items-center justify-center h-full gap-2' onClick={handleMarkAllAsRead}>
              <HiCheckCircle className="mr-2 " />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-luxury font-semibold transition-all ${
              filter === 'all'
                ? 'bg-primary text-charcoal'
                : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-2 rounded-luxury font-semibold transition-all ${
              filter === 'unread'
                ? 'bg-primary text-charcoal'
                : 'bg-taupe/20 text-champagne hover:bg-taupe/40'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-20 text-center card">
            <div className="mb-4 text-6xl">🔔</div>
            <h3 className="mb-2 text-h3 text-champagne">
              {filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
            </h3>
            <p className="text-champagne/70">
              {filter === 'unread'
                ? "You've read all your notifications"
                : "You don't have any notifications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`card hover:border-primary/30 transition-all ${
                    !notification.is_read
                      ? 'border-primary/20 bg-primary/5'
                      : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          !notification.is_read
                            ? 'bg-primary/20'
                            : 'bg-taupe/20'
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-champagne">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="inline-block w-2 h-2 ml-2 rounded-full bg-primary"></span>
                          )}
                        </h4>
                        <span className="text-sm text-champagne/50 whitespace-nowrap">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="mb-3 text-champagne/80">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-sm font-semibold transition-colors text-primary hover:text-primary/80"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-sm font-semibold transition-colors text-rose-300 hover:text-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="flex-shrink-0 transition-colors text-champagne/50 hover:text-rose-300"
                    >
                      <HiX className="text-xl" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
