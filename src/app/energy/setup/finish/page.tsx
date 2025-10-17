'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function EnergySetupFinish() {
  const params = useSearchParams()
  const facilityId = params.get('facilityId')
  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-xl mx-auto text-center">
        <CardHeader>
          <CardTitle>Setup Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Your baseline is saved. You can now view analytics and start optimization.</p>
          <div className="flex gap-3 justify-center">
            <Link href={`/energy-dashboard?facilityId=${facilityId || ''}`}><Button>Go to Dashboard</Button></Link>
            <Link href="/pricing/revenue-sharing/simulator"><Button variant="outline">Savings Simulator</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


