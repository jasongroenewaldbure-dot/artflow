import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
import ArtistDashboard from './dashboard/ArtistDashboard'
import CollectorDashboard from './dashboard/CollectorDashboard'

type User = { 
  id: string
  email: string
  role: 'artist' | 'collector' | 'both'
  name?: string
  password_set?: boolean
  profile_completed?: boolean
}

export default function Dashboard() {
  const [me, setMe] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('No user found')

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, role, password_set, profile_completed')
          .eq('user_id', user.id)
          .single()

        if (profileError) {
          // Profile doesn't exist or incomplete
          if (profileError.code === 'PGRST116') {
            setMe(null)
            return
          }
          throw profileError
        }

        // Check if profile is complete
        const isProfileComplete = profile.role && profile.password_set && profile.profile_completed

        setMe({
          id: user.id,
          email: user.email || '',
          role: profile.role || 'collector',
          name: profile.display_name || user.email || 'User',
          password_set: profile.password_set || false,
          profile_completed: isProfileComplete
        })
      } catch (error) {
        console.error('Error fetching user:', error)
        setMe(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  // Redirect to start if no user
  if (!loading && !me) {
    return <Navigate to="/start" replace />
  }

  // Redirect to onboarding if profile incomplete
  if (!loading && me && (!me.profile_completed || !me.password_set)) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div style={{ padding: 24 }}>
      <Helmet>
        <title>Dashboard | Force Lite</title>
      </Helmet>
      {loading ? (
        <div>Loading…</div>
      ) : me?.role === 'artist' ? (
        <ArtistDashboard />
      ) : (
        <CollectorDashboard />
      )}
    </div>
  )
}
