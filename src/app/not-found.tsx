import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-8xl font-bold text-gray-700 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Return Home
          </Link>
          <div className="text-sm">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mr-4">
              Dashboard
            </Link>
            <Link href="/design" className="text-blue-400 hover:text-blue-300 mr-4">
              Design
            </Link>
            <Link href="/calculators" className="text-blue-400 hover:text-blue-300">
              Calculators
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}