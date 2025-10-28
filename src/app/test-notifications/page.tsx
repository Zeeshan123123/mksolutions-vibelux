'use client';

import { useState } from 'react';

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Test data
  const [emailTo, setEmailTo] = useState('your-email@example.com');
  const [phoneTo, setPhoneTo] = useState('+1234567890');

  const testEmail = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'email',
          to: emailTo,
          subject: 'Test Email from Vibelux',
          html: '<h1>Hello!</h1><p>This is a <strong>test email</strong> from your notification system.</p>',
          text: 'Hello! This is a test email from your notification system.',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to send email');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSMS = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'sms',
          to: phoneTo,
          message: 'Test SMS from Vibelux notification system. If you received this, SMS is working!',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to send SMS');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testCriticalAlert = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'critical',
          to: {
            email: emailTo,
            phone: phoneTo,
          },
          title: 'Test Critical Alert',
          message: 'This is a test critical alert. It should send both email and SMS.',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to send critical alert');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testRateLimit = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const results = [];
      
      // Send 5 emails rapidly to test rate limiting
      for (let i = 0; i < 5; i++) {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'email',
            to: emailTo,
            subject: `Rate Limit Test ${i + 1}`,
            text: `This is test email ${i + 1} for rate limiting.`,
          }),
        });
        type Result = {
            attempt: number;
            success: boolean;
            data: any;
            };

        const results: Result[] = [];

        const data = await response.json();
        results.push({ attempt: i + 1, success: response.ok, data });
      }

      setResult({ message: 'Sent 5 emails', results });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          🧪 Test Notification System
        </h1>

        {/* Input Fields */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (with country code)
              </label>
              <input
                type="tel"
                value={phoneTo}
                onChange={(e) => setPhoneTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
              />
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Run Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testEmail}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              📧 Test Email
            </button>

            <button
              onClick={testSMS}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              📱 Test SMS
            </button>

            <button
              onClick={testCriticalAlert}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              🚨 Test Critical Alert
            </button>

            <button
              onClick={testRateLimit}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ⏱️ Test Rate Limit
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 font-medium">⏳ Sending notification...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-2">✅ Success</h3>
            <pre className="bg-white p-4 rounded border border-green-200 overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="text-yellow-800 font-semibold mb-2">📝 Instructions</h3>
          <ul className="text-yellow-700 space-y-2 text-sm">
            <li>1. Update your email and phone number above</li>
            <li>2. Make sure your .env.local has all required API keys</li>
            <li>3. Click any test button to send a notification</li>
            <li>4. Check the results below</li>
            <li>5. Test rate limit will send 5 emails rapidly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}