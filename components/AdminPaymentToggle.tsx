'use client';

import React, { useState, useEffect } from 'react';
import { Power, PowerOff, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentSettingsData {
  paymentsEnabled: boolean;
  disabledReason?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export default function AdminPaymentToggle() {
  const [settings, setSettings] = useState<PaymentSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<boolean | null>(null);
  const [disabledReason, setDisabledReason] = useState('');

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payment-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings({
          paymentsEnabled: data.paymentsEnabled,
          disabledReason: data.disabledReason,
          lastUpdatedBy: data.lastUpdatedBy,
          lastUpdatedAt: data.lastUpdatedAt,
        });
        setDisabledReason(data.disabledReason || '');
      } else {
        setError('Failed to fetch payment settings');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch settings error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle toggle click
  const handleToggleClick = (newStatus: boolean) => {
    setPendingAction(newStatus);
    setShowConfirmModal(true);
  };

  // Confirm and update settings
  const confirmUpdate = async () => {
    if (pendingAction === null) return;

    setShowConfirmModal(false);
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentsEnabled: pendingAction,
          disabledReason: !pendingAction ? disabledReason : '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings({
          paymentsEnabled: data.paymentsEnabled,
          disabledReason: data.disabledReason,
          lastUpdatedBy: data.lastUpdatedBy,
          lastUpdatedAt: data.lastUpdatedAt,
        });
        if (pendingAction) {
          setDisabledReason('');
        }
      } else {
        setError(data.error || 'Failed to update payment settings');
      }
    } catch (err) {
      setError('Error updating settings');
      console.error('Update settings error:', err);
    } finally {
      setUpdating(false);
      setPendingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          <span className="text-gray-600">Loading payment settings...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Power className="w-5 h-5 text-green-600" />
              Payment Gateway Control
            </h3>
            <button
              onClick={fetchSettings}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Status Display */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <div className="flex items-center gap-2">
                {settings?.paymentsEnabled ? (
                  <>
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-lg font-semibold text-green-600">Payments Enabled</span>
                  </>
                ) : (
                  <>
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    <span className="text-lg font-semibold text-red-600">Payments Disabled</span>
                  </>
                )}
              </div>
            </div>

            {/* Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleClick(true)}
                disabled={updating || settings?.paymentsEnabled}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  settings?.paymentsEnabled
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                Enable
              </button>
              <button
                onClick={() => handleToggleClick(false)}
                disabled={updating || !settings?.paymentsEnabled}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                  !settings?.paymentsEnabled
                    ? 'bg-red-100 text-red-700 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <PowerOff className="w-4 h-4" />
                Disable
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className={`p-4 rounded-lg ${settings?.paymentsEnabled ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            {settings?.paymentsEnabled ? (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Payment System Active</p>
                  <p className="text-sm text-green-700 mt-1">
                    Users can complete bookings and make online payments for both Main Turf and Practice Turf.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Payment System Disabled</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Users attempting to pay will be redirected to a maintenance page. No new online payments will be processed.
                  </p>
                  {settings?.disabledReason && (
                    <p className="text-sm text-amber-600 mt-2">
                      <strong>Reason:</strong> {settings.disabledReason}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Last Updated Info */}
          {settings?.lastUpdatedAt && (
            <p className="text-xs text-gray-400 mt-4 text-right">
              Last updated: {new Date(settings.lastUpdatedAt).toLocaleString()}
              {settings.lastUpdatedBy && ` by ${settings.lastUpdatedBy}`}
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className={`p-6 ${pendingAction ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-3">
                  {pendingAction ? (
                    <Power className="w-8 h-8 text-green-600" />
                  ) : (
                    <PowerOff className="w-8 h-8 text-red-600" />
                  )}
                  <h3 className={`text-xl font-bold ${pendingAction ? 'text-green-800' : 'text-red-800'}`}>
                    {pendingAction ? 'Enable Payments?' : 'Disable Payments?'}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  {pendingAction
                    ? 'This will enable the payment gateway. Users will be able to complete online bookings.'
                    : 'This will disable the payment gateway. Users will see a maintenance page when trying to pay.'}
                </p>

                {!pendingAction && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for disabling (optional)
                    </label>
                    <input
                      type="text"
                      value={disabledReason}
                      onChange={(e) => setDisabledReason(e.target.value)}
                      placeholder="e.g., Server maintenance, Technical issue"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setPendingAction(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUpdate}
                    disabled={updating}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                      pendingAction
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {updating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Confirm'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
