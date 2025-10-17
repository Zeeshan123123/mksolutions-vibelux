/**
 * Lightweight zone registry for energy features.
 * In production, replace with database-backed zone metadata.
 */

export interface ZoneInfo {
  id: string
  name: string
  schedule: string // e.g. '12/12', '18/6', '24/0', 'N/A'
}

/**
 * Return minimal zone info. For now, we use a static fallback
 * aligned with the zones exposed in /api/energy/zones.
 */
export function getZoneInfo(_facilityId: string, zoneId: string): ZoneInfo | null {
  const zones: ZoneInfo[] = [
    { id: 'zone-1', name: 'Flower Room 1', schedule: '12/12' },
    { id: 'zone-2', name: 'Flower Room 2', schedule: '12/12' },
    { id: 'zone-3', name: 'Veg Room 1', schedule: '18/6' },
    { id: 'zone-4', name: 'Veg Room 2', schedule: '18/6' },
    { id: 'zone-5', name: 'Clone Room', schedule: '24/0' },
    { id: 'zone-6', name: 'Dry Room', schedule: 'N/A' },
  ]
  return zones.find(z => z.id === zoneId) || null
}

export function isFloweringZone(info: ZoneInfo | null): boolean {
  if (!info) return false
  if (info.schedule === '12/12') return true
  return /flower/i.test(info.name)
}


