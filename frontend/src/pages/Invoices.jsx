import React, { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, Calendar, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
    clientId: '',
    amount: '',
    dueDate: '',
    status: 'pending',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchWorkspaceCurrency();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await API.get('/invoices');
      setInvoices(response.data.invoices || response.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await API.get('/clients');
      setClients(response.data.clients || response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchWorkspaceCurrency = async () => {
    try {
      const { data } = await API.get('/settings');
      if (data.company?.settings?.currency) {
        setCurrency(data.company.settings.currency);
      }
    } catch (err) {
      console.error('Error fetching currency:', err);
    }
  };

  const currencySymbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$';

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/invoices', {
        ...formData,
        amount: Number(formData.amount),
      });
      setShowModal(false);
      setFormData({
        invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        clientId: '',
        amount: '',
        dueDate: '',
        status: 'pending',
      });
      fetchInvoices();
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await API.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* Header */}
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
              <FileText className="text-cyan-400" /> Invoice Management
            </h1>
            <p className="text-sm text-slate-400">Track billings, payments, and client invoices</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="text-center py-20 text-cyan-400 font-semibold">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-1">No invoices found</h3>
          <p className="text-sm text-slate-500 mb-4">Create your first invoice to start tracking revenue.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-cyan-400 hover:underline font-medium text-sm"
          >
            + Create Invoice Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {invoices.map((inv) => (
            <div
              key={inv._id}
              className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                      inv.status === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : inv.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {inv.status === 'paid' ? (
                      <CheckCircle2 size={12} />
                    ) : inv.status === 'overdue' ? (
                      <AlertCircle size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {inv.status}
                  </span>
                  <button
                    onClick={() => handleDeleteInvoice(inv._id)}
                    className="text-slate-500 hover:text-red-400 transition p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{inv.invoiceNumber}</h3>
                <p className="text-xs text-cyan-400 font-medium mb-4">
                  {inv.clientId?.name || 'Client Workspace'}
                  {inv.clientId?.companyName ? ` (${inv.clientId.companyName})` : ''}
                </p>

                <div className="space-y-3 text-sm border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 text-xs">Amount</span>
                    <span className="font-bold text-emerald-400">
                      {currencySymbol}
                      {inv.amount?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Calendar size={14} /> Due Date
                    </span>
                    <span className="text-xs text-slate-400">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create New Invoice</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  name="invoiceNumber"
                  required
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Select Client</label>
                <select
                  name="clientId"
                  required
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-cyan-500/20 transition"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}