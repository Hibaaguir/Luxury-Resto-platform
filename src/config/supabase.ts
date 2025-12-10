import { createClient } from '@supabase/supabase-js'
import { cookieStorage } from './cookieStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Test localStorage availability
function testLocalStorage() {
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    const result = localStorage.getItem(testKey)
    localStorage.removeItem(testKey)
    
    if (result === 'test') {
      console.log('✅ localStorage is working')
      return true
    } else {
      console.error('❌ localStorage read/write failed')
      return false
    }
  } catch (error) {
    console.error('❌ localStorage is blocked:', error)
    return false
  }
}

// Run test
const localStorageWorks = testLocalStorage()

// Enhanced storage with verification
const customStorage = {
  getItem: (key: string) => {
    try {
      const item = window.localStorage.getItem(key)
      console.log(`📦 Get [${key}]:`, item ? 'exists' : 'null')
      return item
    } catch (error) {
      console.error(`❌ Error reading [${key}]:`, error)
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value)
      
      // Verify it was actually saved
      const verified = window.localStorage.getItem(key)
      if (verified === value) {
        console.log(`✅ Saved [${key}]: ${value.substring(0, 50)}...`)
      } else {
        console.error(`❌ Failed to verify save [${key}]`)
      }
    } catch (error) {
      console.error(`❌ Error saving [${key}]:`, error)
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key)
      console.log(`🗑️ Removed [${key}]`)
    } catch (error) {
      console.error(`❌ Error removing [${key}]:`, error)
    }
  },
}

const storage = localStorageWorks ? customStorage : cookieStorage

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: storage,
    storageKey: 'sb-luxedine-auth',
    flowType: 'implicit',
  },
  global: {
    headers: {
      'x-application-name': 'luxedine',
    },
  },
})

console.log('🔧 Supabase initialized (localStorage:', localStorageWorks ? 'OK' : 'BLOCKED', ')')

// Alert user if localStorage is blocked
if (!localStorageWorks) {
  console.error('⚠️ WARNING: localStorage is not working! Sessions will not persist.')
  alert('Warning: Your browser is blocking local storage. You may need to:\n1. Exit private/incognito mode\n2. Check browser settings\n3. Disable extensions that clear storage')
}
