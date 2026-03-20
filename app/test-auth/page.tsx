'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useEffect, useState } from 'react';

export default function TestAuthPage() {
  const { user, loading } = useAuth();
  const [cookies, setCookies] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    // Check cookies (won't show httpOnly cookies)
    setCookies(document.cookie);

    // Test API call
    fetch('/api/auth/me', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setApiResponse(data))
      .catch(err => setApiResponse({ error: err.message }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test Page</h1>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Auth Context State:</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Browser Cookies:</h2>
          <p className="text-sm text-gray-600 mb-2">(httpOnly cookies won't show here)</p>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {cookies || 'No cookies found'}
          </pre>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">/api/auth/me Response:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <h3 className="font-bold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open DevTools (F12)</li>
            <li>Go to Application tab → Cookies → http://localhost:3000</li>
            <li>Look for 'auth-token' cookie</li>
            <li>Check the Console tab for any errors</li>
            <li>If auth-token exists but user is null, there's a token verification issue</li>
            <li>If auth-token doesn't exist, login again at <a href="/auth/login" className="text-blue-600 underline">/auth/login</a></li>
          </ol>
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href="/auth/login"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Go to Login
          </a>
          <a
            href="/account"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
          >
            Go to Account
          </a>
        </div>
      </div>
    </div>
  );
}
