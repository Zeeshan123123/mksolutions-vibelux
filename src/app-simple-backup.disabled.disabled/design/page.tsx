export default function DesignPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎨 Design Studio</h1>
          <p className="text-gray-400 mb-8">
            Professional horticultural design tools and 3D visualization
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🔥 2D Design Tool</h3>
              <p className="text-gray-400 mb-4">Quick fixture placement and calculations</p>
              <div className="text-green-400 font-semibold">Available Now</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">⚡ Advanced 3D Studio</h3>
              <p className="text-gray-400 mb-4">Full 3D visualization and CAD import</p>
              <a href="/design/advanced" className="text-purple-400 font-semibold hover:text-purple-300">
                Launch Advanced Designer →
              </a>
            </div>
          </div>
          
          <div className="bg-purple-900/20 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">🚀 Test Mode Active</h2>
            <p className="text-gray-300">All design tools accessible without authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}