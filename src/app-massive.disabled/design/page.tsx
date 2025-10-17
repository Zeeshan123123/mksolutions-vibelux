export default function DesignPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">VibeLux Design Studio</h1>
        <p className="text-gray-400 mb-8">
          Professional horticultural lighting design tools
        </p>
        <div className="space-y-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Advanced Designer</h3>
            <p className="text-gray-400 mb-4">Professional lighting layout tools with 3D visualization</p>
            <a
              href="/design/advanced"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Launch Designer
            </a>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Quick Design</h3>
            <p className="text-gray-400 mb-4">Simple room layouts and fixture placement</p>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors">
              Coming Soon
            </button>
          </div>
          <div className="mt-8">
            <a
              href="/"
              className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}