'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function EnergySavingsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to consolidated energy hub with savings tab
    router.replace('/energy?tab=savings')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-400">Taking you to the energy savings dashboard</p>
      </div>
    </div>
  )
}