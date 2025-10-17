'use client';

export default function TestSentry() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sentry Test Page</h1>
      <button
        onClick={() => {
          throw new Error('Test Sentry Error - It works! 🎉');
        }}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Trigger Test Error
      </button>
    </div>
  );
}