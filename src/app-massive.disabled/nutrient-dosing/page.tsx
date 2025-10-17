'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NutrientDosingRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to consolidated calculators hub with plant science category
    router.replace('/calculators?category=plant-science')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-400">Taking you to the nutrient dosing calculator in our plant science tools</p>
      </div>
    </div>
  )
}