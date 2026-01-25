'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SuperAdminSetup() {
  const [setupSecret, setSetupSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [superAdminExists, setSuperAdminExists] = useState<boolean | null>(null);

  const checkSuperAdmin = async () => {
    try {
      const response = await fetch('/api/superadmin/setup');
      const data = await response.json();
      setSuperAdminExists(data.superAdminExists);
    } catch (error) {
      console.error('Error checking super admin:', error);
    }
  };

  const handleSetup = async () => {
    if (!setupSecret) {
      setMessage({ type: 'error', text: 'Please enter the setup secret' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/superadmin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setupSecret }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Super Admin created successfully! Username: ar2' });
        setSuperAdminExists(true);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create super admin' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during setup' });
    } finally {
      setLoading(false);
    }
  };

  // Check on mount
  useState(() => {
    checkSuperAdmin();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">Super Admin Setup</h1>
        <p className="text-purple-200 text-center mb-6">
          Initialize the super admin account for Cricket Box
        </p>

        {superAdminExists === true && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <p className="text-yellow-300 text-sm text-center">
              ⚠️ Super Admin already exists. You can login with the existing credentials.
            </p>
          </div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Setup Secret Key
            </label>
            <Input
              type="password"
              value={setupSecret}
              onChange={(e) => setSetupSecret(e.target.value)}
              placeholder="Enter setup secret..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Default: cricket-box-superadmin-2025
            </p>
          </div>

          <Button
            onClick={handleSetup}
            disabled={loading || superAdminExists === true}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Create Super Admin
              </>
            )}
          </Button>

          <div className="text-center">
            <a
              href="/admin/login"
              className="text-purple-300 hover:text-purple-200 text-sm underline"
            >
              Go to Admin Login
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-black/20 rounded-xl">
          <h3 className="text-purple-200 font-semibold mb-2">Super Admin Credentials:</h3>
          <p className="text-gray-300 text-sm">Username: <span className="text-white font-mono">ar2</span></p>
          <p className="text-gray-300 text-sm">Password: <span className="text-white font-mono">A2r@2025</span></p>
        </div>
      </motion.div>
    </div>
  );
}
