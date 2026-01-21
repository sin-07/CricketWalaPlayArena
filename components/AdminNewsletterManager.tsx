'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Send,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Clock,
  TrendingUp,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
}

interface Newsletter {
  _id: string;
  title: string;
  subject: string;
  content: string;
  sentAt?: string;
  sentTo: number;
  status: 'draft' | 'sent' | 'failed';
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

export default function AdminNewsletterManager() {
  const [activeSection, setActiveSection] = useState<'compose' | 'subscribers' | 'history'>('compose');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Newsletter form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    content: '',
  });

  // Expanded newsletter preview
  const [expandedNewsletter, setExpandedNewsletter] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
    fetchNewsletterHistory();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/newsletter/admin?active=false', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setSubscribers(data.data.subscribers);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsletterHistory = async () => {
    try {
      const response = await fetch('/api/newsletter/history', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setNewsletters(data.data.newsletters);
      }
    } catch (error) {
      console.error('Failed to fetch newsletter history:', error);
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.content) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (stats.active === 0) {
      setMessage({ type: 'error', text: 'No active subscribers to send to' });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this newsletter to ${stats.active} subscribers?`
    );
    
    if (!confirmed) return;

    setSending(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Newsletter sent to ${data.data.sent} subscribers! (${data.data.failed} failed)`,
        });
        setFormData({ title: '', subject: '', content: '' });
        fetchNewsletterHistory();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send newsletter' });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteSubscriber = async (email: string) => {
    const confirmed = window.confirm(`Remove ${email} from subscribers?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/newsletter/admin?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Subscriber removed' });
        fetchSubscribers();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove subscriber' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Subscribers</p>
              <p className="text-3xl font-bold">{stats.active}</p>
            </div>
            <Users className="w-10 h-10 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Newsletters Sent</p>
              <p className="text-3xl font-bold">{newsletters.filter(n => n.status === 'sent').length}</p>
            </div>
            <Mail className="w-10 h-10 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Subscribers</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </motion.div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {[
          { key: 'compose', label: 'Compose', icon: FileText },
          { key: 'subscribers', label: 'Subscribers', icon: Users },
          { key: 'history', label: 'History', icon: Clock },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key as typeof activeSection)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
              activeSection === key
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Message Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="flex-1">{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Section */}
      {activeSection === 'compose' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600" />
            Compose Newsletter
          </h3>

          <form onSubmit={handleSendNewsletter} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Newsletter Title (internal reference)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., January Special Offer"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., 🏏 50% Off on Weekend Bookings!"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Newsletter Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your newsletter content here...

Example:
🎉 Exciting News!

We're offering a special 50% discount on all weekend bookings!

📅 Valid: This weekend only
💰 Use code: WEEKEND50
🏏 Available for all sports

Don't miss out on this amazing offer. Book your slot now!"
                rows={10}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Will be sent to <span className="font-semibold text-green-600">{stats.active}</span> active subscribers
              </p>
              <button
                type="submit"
                disabled={sending || stats.active === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Newsletter
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Subscribers Section */}
      {activeSection === 'subscribers' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Subscribers ({stats.total})
            </h3>
            <button
              onClick={fetchSubscribers}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No subscribers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Subscribed</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-gray-800">{subscriber.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            subscriber.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {subscriber.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Unsubscribed
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(subscriber.subscribedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(subscriber.email)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* History Section */}
      {activeSection === 'history' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Newsletter History
          </h3>

          {newsletters.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No newsletters sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newsletters.map((newsletter) => (
                <div
                  key={newsletter._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedNewsletter(
                        expandedNewsletter === newsletter._id ? null : newsletter._id
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          newsletter.status === 'sent'
                            ? 'bg-green-100 text-green-600'
                            : newsletter.status === 'failed'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {newsletter.status === 'sent' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : newsletter.status === 'failed' ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{newsletter.title}</h4>
                        <p className="text-sm text-gray-500">
                          {newsletter.sentAt
                            ? `Sent to ${newsletter.sentTo} subscribers on ${formatDate(newsletter.sentAt)}`
                            : `Created on ${formatDate(newsletter.createdAt)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          newsletter.status === 'sent'
                            ? 'bg-green-100 text-green-700'
                            : newsletter.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                      </span>
                      {expandedNewsletter === newsletter._id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedNewsletter === newsletter._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-4 bg-gray-50">
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Subject:</strong> {newsletter.subject}
                          </p>
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {newsletter.content}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
