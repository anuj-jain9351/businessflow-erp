import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Building, Shield, User, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Settings() {
  const [formData, setFormData] = useState({
    companyName: '',
    userName: '',
    email: '',
    currency: 'INR',
    taxRate: 18,
    timezone: 'Asia/Kolkata',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      if (data.success) {
        setFormData({
          companyName: data.company?.name || '',
          userName: data.user?.name || '',
          email: data.user?.email || '',
          currency: data.company?.settings?.currency || 'INR',
          taxRate: data.company?.settings?.taxRate ?? 18,
          timezone: data.company?.settings?.timezone || 'Asia/Kolkata',
        });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await API.put('/settings', {
        companyName: formData.companyName,
        userName: formData.userName,
        currency: formData.currency,
        taxRate: formData.taxRate,
        timezone: formData.timezone,
      });

      if (data.success) {
        setMessage({ type: 'success', text: 'Workspace & profile settings updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update settings',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center font-semibold">
        Loading workspace settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <SettingsIcon className="text-cyan-400" /> Workspace Settings
            </h1>
            <p className="text-sm text-slate-400">Manage tenant preferences, billing defaults & profile</p>
          </div>
        </div>
      </div>

      {message.text && (
        <div
          className={`max-w-2xl mb-6 p-4 rounded-2xl text-sm font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="max-w-2xl bg-slate-900/60 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Company Profile */}
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Building size={18} className="text-cyan-400" /> Company Workspace
            </h3>
            <p className="text-xs text-slate-400 mb-4">Organization details & regional defaults</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Workspace Name</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Default Tax (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Timezone</label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <User size={18} className="text-cyan-400" /> Account Profile
            </h3>
            <p className="text-xs text-slate-400 mb-4">Your personal administrator details</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="userName"
                  required
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email (Read-only)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Multi-Tenant Info */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Shield size={18} className="text-cyan-400" /> Multi-Tenant Isolation
            </h3>
            <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Tenant Header Key:</span>
                <span className="text-cyan-400 font-mono">x-company-id</span>
              </div>
              <div className="flex justify-between">
                <span>Active Workspace ID:</span>
                <span className="text-emerald-400 font-mono truncate max-w-[220px]">
                  {localStorage.getItem('companyId') || 'Not Set'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-cyan-500/20 transition"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}