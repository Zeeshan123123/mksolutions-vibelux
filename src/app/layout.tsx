import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

// Clerk
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VibeLux - Advanced Controlled Environment Agriculture Platform",
  description:
    "Complete CEA platform with AI-powered design, energy optimization, and facility automation.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VibeLux",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VibeLux" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body
        className={`${inter.className} overscroll-none`}
        suppressHydrationWarning
      >
        {/* ✅ Single top-level ClerkProvider */}
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
          {/* Optional loading UI while Clerk bootstraps */}
          <ClerkLoading>
            <div className="min-h-screen bg-gray-950 animate-pulse" />
          </ClerkLoading>

          <ClerkLoaded>
            <Providers>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <ServiceWorkerRegistration />
                <Suspense
                  fallback={
                    <div className="min-h-screen bg-gray-950 animate-pulse" />
                  }
                >
                  <main className="flex-1">{children}</main>
                </Suspense>
                <Toaster />
              </ThemeProvider>
            </Providers>
          </ClerkLoaded>
        </ClerkProvider>
      </body>
    </html>
  );
}
