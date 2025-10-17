export default function NoAuthTest() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🔓 No Auth Test</h1>
        <p className="text-gray-400">This page should load without authentication</p>
        <p className="text-green-400 mt-2">✅ Routes are being built correctly!</p>
      </div>
    </div>
  );
}