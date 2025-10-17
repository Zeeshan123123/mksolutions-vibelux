import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VibeLux - Professional Horticultural Platform",
  description: "Professional horticultural lighting design and calculation tools",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-950">
          {/* Navigation Bar */}
          <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-white">VibeLux</h1>
                <div className="hidden md:flex space-x-6">
                  <a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
                  <a href="/design/advanced" className="text-gray-300 hover:text-white transition-colors">Design</a>
                  <a href="/calculators" className="text-gray-300 hover:text-white transition-colors">Calculators</a>
                  <a href="/operations" className="text-gray-300 hover:text-white transition-colors">Operations</a>
                  <a href="/marketplace" className="text-gray-300 hover:text-white transition-colors">Marketplace</a>
                  <a href="/energy" className="text-gray-300 hover:text-white transition-colors">Energy</a>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                🚀 Live Mode - All Features Available
              </div>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}