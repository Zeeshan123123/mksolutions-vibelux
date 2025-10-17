export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">VibeLux - Simplified</h1>
        <p className="text-gray-400 mb-8">Testing simplified app structure</p>
        <div className="space-y-4">
          <a href="/calculators" className="block bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold">
            Calculators
          </a>
          <a href="/design" className="block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold">
            Design Tools
          </a>
          <a href="/dashboard" className="block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold">
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}