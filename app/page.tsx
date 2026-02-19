'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      router.push('/dashboard')
    }
  }

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={loginWithGoogle}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
      >
        Sign in with Google
      </button>
    </div>
  )
}
