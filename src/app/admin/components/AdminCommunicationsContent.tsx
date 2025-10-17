'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Mail, MessageSquare, Tag, ArrowRight } from 'lucide-react'

export function AdminCommunicationsContent() {
  const communicationLinks = [
    { title: 'Email Management', href: '/admin/email', icon: Mail, description: 'Email templates and campaigns' },
    { title: 'Support Tickets', href: '/admin/support', icon: MessageSquare, description: 'Customer support system' },
    { title: 'Promo Codes', href: '/admin/promo-codes', icon: Tag, description: 'Promotional campaigns' }
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {communicationLinks.map((link) => {
        const Icon = link.icon
        return (
          <Link key={link.title} href={link.href}>
            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-pink-900/30 rounded-lg mb-3">
                    <Icon className="w-8 h-8 text-pink-400" />
                  </div>
                  <CardTitle className="text-white text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}