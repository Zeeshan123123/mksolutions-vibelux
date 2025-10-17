export default function EnergyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">⚡ Energy Management</h1>
          <p className="text-gray-400 mb-8">
            Comprehensive energy optimization and monitoring for cultivation facilities
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">📊 Energy Monitoring</h3>
              <p className="text-gray-400 mb-4">Real-time energy tracking and analytics</p>
              <div className="text-green-400 font-semibold">Available Now</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🎯 Optimization</h3>
              <p className="text-gray-400 mb-4">AI-powered energy optimization</p>
              <div className="text-green-400 font-semibold">Available Now</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">💰 Savings Tracking</h3>
              <p className="text-gray-400 mb-4">Monitor and report energy savings</p>
              <div className="text-green-400 font-semibold">Available Now</div>
            </div>
          </div>
          
          <div className="bg-yellow-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">🚀 Test Mode Active</h2>
            <p className="text-gray-300">Energy management tools accessible without authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}