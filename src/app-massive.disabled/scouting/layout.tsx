import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Field Scouting - VibeLux',
  description: 'Mobile scouting app for pest and disease detection',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#000000',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VibeLux Scout'
  }
};

export default function ScoutingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950">
      {children}
    </div>
  );
}