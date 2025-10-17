'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tag, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react'

type Promo = {
  id: string
  code: string
  description?: string
  discountPercent?: number
  active?: boolean
  uses?: number
  maxUses?: number
}

export function PromoCodesManager() {
  const [loading, setLoading] = useState(false)
  const [promos, setPromos] = useState<Promo[]>([])

  const refresh = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/promo-codes')
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        const list = Array.isArray(data) ? data : (Array.isArray(data?.promos) ? data.promos : [])
        setPromos(list)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  const toggle = async (id: string) => {
    await fetch(`/api/admin/promo-codes/${encodeURIComponent(id)}/toggle`, { method: 'POST' }).catch(() => null)
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-white">Promo Codes</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
        </div>
        <CardDescription>Enable/disable promotional codes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {promos.length === 0 && (
            <div className="text-sm text-gray-400">{loading ? 'Loading...' : 'No promo codes found'}</div>
          )}
          {promos.map((p) => (
            <div key={p.id} className="p-3 bg-gray-900 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-cyan-900/30 text-cyan-300 font-mono">{p.code}</Badge>
                <span className="text-gray-300 text-sm">{p.description || ''}</span>
                {p.discountPercent != null && (
                  <span className="text-xs text-green-400">{p.discountPercent}% off</span>
                )}
                <span className="text-xs text-gray-500">{p.uses ?? 0}/{p.maxUses ?? '∞'} uses</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => toggle(p.id)}>
                {p.active ? <ToggleRight className="w-4 h-4 mr-1" /> : <ToggleLeft className="w-4 h-4 mr-1" />}
                {p.active ? 'Disable' : 'Enable'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


