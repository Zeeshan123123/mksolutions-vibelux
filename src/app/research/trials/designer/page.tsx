'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

export default function TrialDesignerPage() {
  const [name, setName] = useState('Two-Light Trial')
  const [crop, setCrop] = useState('Lettuce')
  const [blocks, setBlocks] = useState(2)
  const [replicates, setReplicates] = useState(2)
  const [factor, setFactor] = useState('Light Type')
  const [levelA, setLevelA] = useState('Light A')
  const [levelB, setLevelB] = useState('Light B')

  const [zones, setZones] = useState<string[]>(['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'])
  const [assignment, setAssignment] = useState<Record<string, string>>({})

  const randomize = () => {
    const levels = [levelA, levelB]
    const next: Record<string, string> = {}
    zones.forEach((z, idx) => {
      next[z] = levels[idx % 2]
    })
    setAssignment(next)
    toast({ title: 'Randomized', description: 'Treatments assigned to zones' })
  }

  const saveTrial = async () => {
    try {
      const trial = {
        name,
        crop,
        factor,
        treatments: [
          { name: levelA, factor: 'light', level: levelA },
          { name: levelB, factor: 'light', level: levelB }
        ],
        blocks,
        replicates,
        zones: zones.map((z, i) => ({ id: z, treatment: assignment[z] || (i % 2 ? levelA : levelB) }))
      }
      const res = await fetch('/api/trials/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trial)
      })
      if (!res.ok) throw new Error('Failed to create trial')
      toast({ title: 'Trial Created', description: 'Your growth trial was saved' })
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Trial Designer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400">Trial Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Crop</label>
              <Input value={crop} onChange={(e) => setCrop(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Blocks</label>
              <Input type="number" value={blocks} onChange={(e) => setBlocks(parseInt(e.target.value || '0'))} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Replicates/Block</label>
              <Input type="number" value={replicates} onChange={(e) => setReplicates(parseInt(e.target.value || '0'))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400">Factor</label>
              <Input value={factor} onChange={(e) => setFactor(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Level A</label>
              <Input value={levelA} onChange={(e) => setLevelA(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-400">Level B</label>
              <Input value={levelB} onChange={(e) => setLevelB(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400">Zones</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {zones.map((z) => (
                <div key={z} className="p-3 border border-gray-700 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">{z}</div>
                  <Select value={assignment[z]} onValueChange={(v) => setAssignment({ ...assignment, [z]: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={levelA}>{levelA}</SelectItem>
                      <SelectItem value={levelB}>{levelB}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={randomize} variant="secondary">Randomize</Button>
            <Button onClick={saveTrial}>Save Trial</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


