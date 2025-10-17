import { notFound, redirect } from 'next/navigation';

interface CatchAllPageProps {
  params: {
    catchall: string[];
  };
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const resolvedParams = await params;
  const path = '/' + resolvedParams.catchall.join('/');
  
  // Route mapping for existing pages
  const routeMap: Record<string, string> = {
    '/calculators': '/calculators',
    '/design': '/design', 
    '/design/advanced': '/design/advanced',
    '/dashboard': '/dashboard',
    '/features': '/features',
    '/sign-in': '/sign-in',
    '/sign-up': '/sign-up',
    '/fixtures': '/fixtures',
    '/operations': '/operations',
    '/marketplace': '/marketplace',
    '/test-route': '/test-route'
  };

  // If this is a known route that should exist, try to render its content
  if (routeMap[path]) {
    // For now, render a basic page that works
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">VibeLux - {path}</h1>
          <p className="text-gray-400 mb-8">
            Professional horticultural platform - Route: {path}
          </p>
          <div className="space-y-4">
            <a
              href="/"
              className="block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Return to Homepage
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-8">
            This is a temporary fallback page while we resolve routing issues.
          </p>
        </div>
      </div>
    );
  }

  // Unknown route - return 404
  notFound();
}

// Tell Next.js this route can be generated statically
export const dynamic = 'force-static';
export const dynamicParams = true;