import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { HydrationProtector } from '@/components/HydrationProtector'
import { MobileLayoutWrapper } from '@/components/MobileLayoutWrapper'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DesignerSidebar } from '@/components/designer-sidebar'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import { RoleProvider } from '@/contexts/RoleContext'
import { CartProvider } from '@/contexts/CartContext'
import { CartErrorBoundary } from '@/components/CartErrorBoundary'
import { ClientOnly } from '@/components/ClientOnly'
import { NotificationProvider } from '@/components/ui/NotificationSystem'
import SafeScripts from '@/components/SafeScripts'
import { ComingSoonOverlay } from '@/components/ComingSoonOverlay'
import Script from 'next/script'
import NextTopLoader from 'nextjs-toploader'
import type { Viewport } from 'next'
import { NonceInjector } from './nonce-injector'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

// Remove server-side header access that breaks build
// Design route detection moved to client-side
function getIsDesignRoute() {
  return false; // Default to false, client will handle design route detection
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://vibelux.ai'),
  title: "VibeLux - The Complete CEA Platform: From Design to Harvest to Market",
  description: "The world's first truly end-to-end controlled environment agriculture platform. AI-powered design with intelligent energy optimization to reduce operational costs. Complete facility automation, recipe monetization, and marketplace integration.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/vibelux-icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/vibelux-icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/vibelux-icon-48.png', sizes: '48x48', type: 'image/png' }
    ],
    shortcut: ['/vibelux-icon-48.png'],
    apple: [
      { url: '/vibelux-apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  alternates: {
    canonical: 'https://vibelux.ai',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vibelux.ai',
    siteName: 'VibeLux',
    title: 'VibeLux - The Complete CEA Platform: From Design to Harvest to Market',
    description: 'The world\'s first truly end-to-end controlled environment agriculture platform with intelligent energy optimization to reduce operational costs.',
    images: [
      {
        url: '/vibelux-og-image.png',
        width: 1200,
        height: 630,
        alt: 'VibeLux Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@vibelux',
    creator: '@vibelux',
    title: 'VibeLux - The Complete CEA Platform: From Design to Harvest to Market',
    description: 'AI-powered agricultural platform with intelligent energy optimization to reduce operational costs',
    images: ['/vibelux-og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
  keywords: [
    'horticultural lighting',
    'led grow lights',
    'ppfd calculator',
    'dli calculator',
    'grow room design',
    'cultivation management',
    'energy optimization',
    'cannabis cultivation',
    'indoor farming',
    'greenhouse automation',
    'inventory management',
    'compliance software',
    'agricultural technology'
  ]
};

// Environment check for coming soon mode
const COMING_SOON_MODE = false; // Disabled - show full application

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesignRoute = getIsDesignRoute();

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="VibeLux" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="msapplication-TileColor" content="#8b5cf6" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="application-name" content="VibeLux" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="apple-touch-startup-image" href="/apple-touch-startup-image.png" />
        </head>
        <body className={`${inter.className} overscroll-none`} suppressHydrationWarning>
          <NextTopLoader 
            color="#8b5cf6"
            showSpinner={false}
            height={3}
          />
          <NonceInjector>
            <HydrationProtector>
              <MobileLayoutWrapper>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  enableSystem
                  disableTransitionOnChange
                >
                  <AuthProvider>
                    <SubscriptionProvider>
                      <RoleProvider>
                        <ClientOnly>
                          <CartErrorBoundary>
                            <CartProvider>
                              <AccessibilityProvider>
                                <NotificationProvider>
                                  <Suspense>
                          {isDesignRoute ? (
                            <SidebarProvider>
                              <DesignerSidebar />
                              <SidebarInset>
                                <SiteHeader />
                                <main className="flex-1 overflow-y-auto">
                                  {children}
                                </main>
                              </SidebarInset>
                            </SidebarProvider>
                          ) : (
                            <>
                              <SiteHeader />
                              <main className="flex-1">
                                {children}
                              </main>
                            </>
                          )}
                                  </Suspense>
                                  <Toaster />
                                  {COMING_SOON_MODE && <ComingSoonOverlay />}
                                </NotificationProvider>
                              </AccessibilityProvider>
                            </CartProvider>
                          </CartErrorBoundary>
                        </ClientOnly>
                      </RoleProvider>
                    </SubscriptionProvider>
                  </AuthProvider>
                </ThemeProvider>
              </MobileLayoutWrapper>
            </HydrationProtector>
          </NonceInjector>
          <SafeScripts />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}