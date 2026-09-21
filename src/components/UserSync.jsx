import { useEffect } from 'react'
import { useAuth } from '@clerk/react'

export default function UserSync() {
  const { isSignedIn, getToken } = useAuth()

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn) return

      try {
        const token = await getToken()

        if (!token) {
          console.error('No Clerk session token available')
          return
        }

        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sync user')
        }

        console.log('User synced successfully:', data)
      } catch (error) {
        console.error('User sync failed:', error)
      }
    }

    syncUser()
  }, [isSignedIn, getToken])

  return null
}