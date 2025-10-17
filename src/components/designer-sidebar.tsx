'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Lightbulb,
  Calculator,
  Package,
  Settings,
  FileText,
  BarChart3,
  Zap,
  DollarSign,
} from 'lucide-react'

const menuItems = [
  {
    title: 'Design',
    items: [
      { title: 'New Design', href: '/design', icon: Lightbulb },
      { title: 'Advanced Design', href: '/design/advanced', icon: Zap },
      { title: 'My Projects', href: '/projects', icon: FileText },
    ],
  },
  {
    title: 'Tools',
    items: [
      { title: 'Calculators', href: '/calculators', icon: Calculator },
      { title: 'Fixtures', href: '/fixtures', icon: Package },
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
      { title: 'ROI Calculator', href: '/roi', icon: DollarSign },
    ],
  },
  {
    title: 'Settings',
    items: [
      { title: 'Preferences', href: '/settings', icon: Settings },
    ],
  },
]

export function DesignerSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center space-x-2 px-4 py-2">
          <span className="font-bold text-xl">VibeLux</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}