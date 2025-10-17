export default function CalculatorsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">VibeLux Calculators</h1>
        <p className="text-gray-400 mb-8">
          Professional horticultural calculation tools
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">VPD Calculator</h3>
              <p className="text-gray-400 text-sm">Vapor Pressure Deficit optimization</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">DLI Calculator</h3>
              <p className="text-gray-400 text-sm">Daily Light Integral planning</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">PPFD Calculator</h3>
              <p className="text-gray-400 text-sm">Photosynthetic photon flux density</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Energy Calculator</h3>
              <p className="text-gray-400 text-sm">Operating cost analysis</p>
            </div>
          </div>
          <div className="mt-8">
            <a
              href="/"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}