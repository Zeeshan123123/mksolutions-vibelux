import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About VibeLux - Leading Horticultural Lighting Design Platform | Blake Lange',
  description: 'Learn about VibeLux and founder Blake Lange\'s mission to revolutionize controlled environment agriculture through intelligent lighting design. Industry leader with 15+ awards.',
  keywords: 'Blake Lange, VibeLux founder, horticultural lighting expert, controlled environment agriculture, CEA technology, LED grow lights, agricultural innovation, 40 Under 40',
  openGraph: {
    title: 'About VibeLux - Revolutionizing Agricultural Lighting',
    description: 'Meet Blake Lange, founder of VibeLux, and discover how we\'re empowering growers worldwide with professional-grade lighting design tools.',
    images: [
      {
        url: '/founder/blake-profile.webp',
        width: 1200,
        height: 630,
        alt: 'Blake Lange - VibeLux Founder & CEO',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About VibeLux - Leading Horticultural Lighting Platform',
    description: 'Discover the story behind VibeLux and how we\'re transforming agriculture through innovative lighting solutions.',
    images: ['/founder/blake-profile.webp'],
  },
  alternates: {
    canonical: 'https://vibelux.com/about',
  },
};