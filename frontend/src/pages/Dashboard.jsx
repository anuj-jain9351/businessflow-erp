import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  FileText, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  LogOut,
  Bell,
  Search
} from 'lucide-react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await API.get('/dashboard/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 text-xl font-semibold">
        Loading BusinessFlow Workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-slate-900/60 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="font-bold text-white text-lg">B</span>
            </div>
            <span className="font-bold text-lg tracking-wide text-white">BusinessFlow</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20">
              <LayoutDashboard size={20} /> Dashboard
            </a>
            <a href="/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <Users size={20} /> Clients
            </a>
            <a href="/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <FolderKanban size={20} /> Projects
            </a>
            <a href="/tasks" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <CheckSquare size={20} /> Tasks
            </a>
            <a href="/invoices" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <FileText size={20} /> Invoices
            </a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <Settings size={20} /> Settings
            </a>
          </nav>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition font-medium w-full"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-900/40 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search clients, projects, tasks..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-red from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white">
                AJ
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Anuj Jain</h4>
                <p className="text-xs text-slate-400">Workspace Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 space-y-8">
          
          {/* Top Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Clients */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-sm font-medium">Total Clients</span>
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"><Users size={20} /></div>
              </div>
              <h3 className="text-3xl font-bold text-white">{stats?.clients?.total || 0}</h3>
              <p className="text-xs text-cyan-400 mt-2 font-medium">+2 this month</p>
            </div>

            {/* Revenue / Budget */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-sm font-medium">Total Budget</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><DollarSign size={20} /></div>
              </div>
              <h3 className="text-3xl font-bold text-white">${stats?.projects?.totalBudget?.toLocaleString() || 0}</h3>
              <p className="text-xs text-emerald-400 mt-2 font-medium">Active portfolio value</p>
            </div>

            {/* Active Projects */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-sm font-medium">Active Projects</span>
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><FolderKanban size={20} /></div>
              </div>
              <h3 className="text-3xl font-bold text-white">{stats?.projects?.total || 0}</h3>
              <p className="text-xs text-blue-400 mt-2 font-medium">{stats?.projects?.statusBreakdown?.['in-progress'] || 0} In Progress</p>
            </div>

            {/* Growth Rate */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-sm font-medium">Total Tasks</span>
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl"><TrendingUp size={20} /></div>
              </div>
              <h3 className="text-3xl font-bold text-white">{stats?.tasks?.total || 0}</h3>
              <p className="text-xs text-purple-400 mt-2 font-medium">Workflow items tracked</p>
            </div>
          </div>

          {/* Middle Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue Area Chart Simulation */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Revenue & Project Activity</h3>
                  <p className="text-xs text-slate-400">Performance overview across tenants</p>
                </div>
                <span className="text-xs px-3 py-1 bg-slate-800 text-cyan-400 rounded-full font-medium">Live Analytics</span>
              </div>
              
              {/* SVG Wave Chart UI */}
              <div className="h-64 w-full flex items-end relative">
                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,100 Q 125,20 250,75 T 500,40 L 500,150 L 0,150 Z" fill="url(#grad)" />
                  <path d="M 0,100 Q 125,20 250,75 T 500,40" fill="none" stroke="#06b6d4" strokeWidth="3" />
                </svg>
                <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-slate-500">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                </div>
              </div>
            </div>

            {/* Tasks & Invoices Bar Chart Simulation */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Tasks Breakdown</h3>
                <p className="text-xs text-slate-400 mb-6">Status distribution</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">To Do</span>
                    <span className="text-white font-medium">{stats?.tasks?.statusBreakdown?.['todo'] || 0}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-500 h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">In Progress</span>
                    <span className="text-white font-medium">{stats?.tasks?.statusBreakdown?.['in-progress'] || 0}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Completed</span>
                    <span className="text-white font-medium">{stats?.tasks?.statusBreakdown?.['completed'] || 0}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Total Workflows</span>
                <span className="text-cyan-400 font-bold">{stats?.tasks?.total || 0} Tasks</span>
              </div>
            </div>

          </div>

          {/* Bottom Section: Projects Progress */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Projects Progress & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-200">ERP SaaS Core Architecture</span>
                  <span className="text-cyan-400 font-bold">In Progress</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-200">Client Management Module</span>
                  <span className="text-emerald-400 font-bold">Completed</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}