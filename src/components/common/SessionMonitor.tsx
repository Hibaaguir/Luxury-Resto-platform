import { useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function SessionMonitor() {
  const { signOut } = useAuth()

  useEffect(() => {
    // Check session health every 30 seconds
    const interval = setInterval(async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session check failed:', error)
          // Sign out if session is invalid
          await signOut()
        } else if (session) {
          console.log('✅ Session healthy')
        }
      } catch (error) {
        console.error('💥 Session monitor error:', error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [signOut])

  return null // This component doesn't render anything
}
