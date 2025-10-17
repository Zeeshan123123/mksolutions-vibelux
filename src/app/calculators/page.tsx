'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CalculatorsRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/calculators-advanced')
  }, [router])
  return null
}