export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">VibeLux Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Your complete horticultural management platform
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Design Tools</h3>
            <p className="text-gray-400 text-sm mb-3">Professional lighting design suite</p>
            <a href="/design" className="text-purple-400 hover:text-purple-300">Access Tools →</a>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Calculators</h3>
            <p className="text-gray-400 text-sm mb-3">Environmental and lighting calculations</p>
            <a href="/calculators" className="text-blue-400 hover:text-blue-300">View Calculators →</a>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Operations</h3>
            <p className="text-gray-400 text-sm mb-3">Facility management and monitoring</p>
            <span className="text-gray-500 text-sm">Coming Soon</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-gray-400 text-sm mb-3">Performance insights and reporting</p>
            <span className="text-gray-500 text-sm">Coming Soon</span>
          </div>
        </div>
        <div>
          <a
            href="/"
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}