'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { NotificationCenter } from '@/components/marketplace/NotificationCenter'

export function SiteHeader() {
  const { isSignedIn, userId } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <>
      {/* Desktop Header - Google Material Design 3 inspired */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 sm:h-24 items-center px-4 sm:px-6 lg:px-8">
          <div className="mr-8 sm:mr-12 flex items-center">
            <Link className="flex items-center" href="/">
              <Image
                src="/vibelux-logo.png"
                alt="VibeLux"
                width={200}
                height={60}
                className="h-14 sm:h-16 w-auto"
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center space-x-8">
            {isSignedIn && (
              <nav className="flex items-center space-x-2">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-lg font-medium px-6 py-3 h-12 hover:bg-gray-100">Dashboard</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-lg font-medium px-6 py-3 h-12 hover:bg-gray-100 inline-flex items-center gap-2">
                      Explore
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel>Core</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/design/advanced">Designer</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/calculators">Calculators</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/fixtures">Fixtures</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/spectrum">Spectrum Builder</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Learn & Compare</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/features">All Features</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pricing">Pricing</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/marketplace">Marketplace</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href="/designs/my-designs">
                  <Button variant="ghost" className="text-lg font-medium px-6 py-3 h-12 hover:bg-gray-100">My Designs</Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="ghost" className="relative text-lg font-medium px-6 py-3 h-12 hover:bg-gray-100">
                    Marketplace
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                  </Button>
                </Link>
              </nav>
            )}
            
            <div className="ml-auto flex items-center space-x-6">
              {isSignedIn ? (
                <>
                  <NotificationCenter />
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="text-lg font-medium px-6 py-3 h-12 hover:bg-gray-100">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold px-8 py-3 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <Link href="/sign-up">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex flex-1 justify-end items-center space-x-2">
            {isSignedIn && (
              <>
                <NotificationCenter />
                <UserButton afterSignOutUrl="/" />
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 space-y-2">
              {isSignedIn ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/design/advanced" 
                    className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Designer
                  </Link>
                  <Link 
                    href="/calculators" 
                    className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Calculators
                  </Link>
                  <Link 
                    href="/features" 
                    className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    All Features
                  </Link>
                  <Link 
                    href="/designs/my-designs" 
                    className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Designs
                  </Link>
                  <Link 
                    href="/marketplace" 
                    className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Recipes
                  </Link>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}