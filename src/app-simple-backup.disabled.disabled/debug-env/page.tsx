export default function DebugEnv() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ? 'SET' : 'UNSET',
    hasMiddleware: 'Check console for middleware logs'
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">🔍 Environment Debug</h1>
      <pre className="bg-gray-800 p-4 rounded text-sm">
        {JSON.stringify(envVars, null, 2)}
      </pre>
      <p className="mt-4 text-gray-400">
        This page should load without authentication if middleware is properly disabled.
      </p>
    </div>
  );
}