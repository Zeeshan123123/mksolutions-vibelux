'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Database, Settings, Wrench, AlertTriangle, Shield, Clock, ArrowRight } from 'lucide-react'
import { BackupManager } from './BackupManager'
import { CloudUploadManager } from '@/components/CloudUploadManager'

export function AdminSystemContent() {
  const systemLinks = [
    { title: 'Backup Management', href: '/admin/backups', icon: Database, description: 'Database backups and recovery' },
    { title: 'Automation Rules', href: '/admin/automation', icon: Clock, description: 'Automated workflows' },
    { title: 'Debug Tools', href: '/admin/debug', icon: Wrench, description: 'System diagnostics' },
    { title: 'System Settings', href: '/admin/settings', icon: Shield, description: 'Global configuration' },
    { title: 'Staging Environment', href: '/admin/staging', icon: Settings, description: 'Test environment management' }
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {systemLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.title} href={link.href}>
                <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-base">{link.title}</CardTitle>
                        <CardDescription className="text-xs">{link.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
      <div>
        <BackupManager />
        <div className="mt-6">
          <CloudUploadManager />
        </div>
      </div>
    </div>
  )
}