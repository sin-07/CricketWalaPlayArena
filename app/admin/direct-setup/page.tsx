'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DirectSetup() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<any[]>([]);

  const createSuperAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/direct-setup', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      if (data.success) {
        checkAdmins();
      }
    } catch (error) {
      setResult({ success: false, error: 'Failed to create super admin' });
    } finally {
      setLoading(false);
    }
  };

  const checkAdmins = async () => {
    try {
      const response = await fetch('/api/admin/direct-setup');
      const data = await response.json();
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Failed to fetch admins');
    }
  };

  useEffect(() => {
    checkAdmins();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Super Admin Direct Setup</h1>
        
        <div className="mb-6">
          <Button onClick={createSuperAdmin} disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create/Update Super Admin (A2r)'}
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded mb-6 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded mb-6">
          <h3 className="font-bold mb-2">Credentials:</h3>
          <p><strong>Username:</strong> A2r</p>
          <p><strong>Password:</strong> A2r@2025</p>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">Existing Admins in Database:</h3>
          <Button onClick={checkAdmins} variant="outline" size="sm">Refresh</Button>
          {admins.length > 0 ? (
            <div className="mt-2 space-y-2">
              {admins.map((admin, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded border">
                  <p><strong>Username:</strong> {admin.username}</p>
                  <p><strong>Role:</strong> {admin.role}</p>
                  <p><strong>Active:</strong> {admin.isActive ? '✅ Yes' : '❌ No'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-gray-500">No admins found</p>
          )}
        </div>

        <div className="text-center">
          <a href="/admin/login" className="text-blue-600 hover:underline">
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  );
}
