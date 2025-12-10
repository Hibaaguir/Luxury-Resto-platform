// Fallback storage using cookies
export const cookieStorage = {
  getItem: (key: string) => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === key) {
        return decodeURIComponent(value)
      }
    }
    return null
  },
  
  setItem: (key: string, value: string) => {
    // Set cookie with 7 day expiration
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    console.log(`🍪 Cookie set: ${key}`)
  },
  
  removeItem: (key: string) => {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    console.log(`🗑️ Cookie removed: ${key}`)
  },
}
