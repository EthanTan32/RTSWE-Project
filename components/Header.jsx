'use client'

import SignInButton from '@/components/SignInButton'
import UserProfile from '@/components/UserProfile'

export default function Header() {
  // Only render auth components if Supabase is configured
  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasSupabase) {
    return null
  }

  return (
    <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom" style={{ minHeight: '50px' }}>
      <UserProfile />
      <SignInButton />
    </div>
  )
}