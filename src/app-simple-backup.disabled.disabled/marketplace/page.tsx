export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">VibeLux Marketplace</h1>
          <p className="text-gray-400 mb-8">
            Equipment, fixtures, and services for professional cultivation
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🔥 Lighting Equipment</h3>
              <p className="text-gray-400 mb-4">Professional LED fixtures and controls</p>
              <div className="text-green-400 font-semibold">Available Now</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🌱 Growing Supplies</h3>
              <p className="text-gray-400 mb-4">Seeds, nutrients, and growing media</p>
              <div className="text-green-400 font-semibold">Available Now</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">⚙️ Automation Systems</h3>
              <p className="text-gray-400 mb-4">Climate control and monitoring</p>
              <div className="text-green-400 font-semibold">Available Now</div>
            </div>
          </div>
          
          <div className="bg-purple-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">🚀 Test Mode Active</h2>
            <p className="text-gray-300">Marketplace features available without authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}