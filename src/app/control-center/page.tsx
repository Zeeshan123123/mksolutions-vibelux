import type { Metadata } from 'next'
import { UnifiedControlCenter } from '@/components/UnifiedControlCenter'

export const metadata: Metadata = {
  title: 'Control Center | VibeLux',
  description: 'Unified facility automation and monitoring: climate, lighting, irrigation, logistics, health, and IPM in one place.'
}

export default function ControlCenterPage() {
  return <UnifiedControlCenter />
}
