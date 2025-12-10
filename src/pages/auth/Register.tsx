import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { motion } from 'framer-motion'

export function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signUp, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User registered and logged in, redirecting...')
      navigate('/', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setIsSubmitting(true)

    try {
      console.log('📝 Attempting to sign up...')
      await signUp(email, password, fullName)
      console.log('✅ Sign up request complete')
      
      // Wait for auth state to update
      setTimeout(() => {
        console.log('📍 Navigating to home')
        navigate('/', { replace: true })
      }, 1500)
    } catch (err: any) {
      console.error('❌ Registration error:', err)
      setError(err.message || 'Failed to create account')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card"
      >
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-h1 text-gradient-gold">Create Account</h1>
          <p className="text-champagne/70">Join our luxury dining experience</p>
        </div>

        {error && (
          <div className="px-4 py-3 mb-6 text-red-500 border border-red-500 bg-red-500/10 rounded-luxury">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={isSubmitting}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
          />

          <Button 
            type="submit" 
            className="w-full" 
            loading={isSubmitting || authLoading} 
            disabled={isSubmitting || authLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-champagne/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary-light"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
