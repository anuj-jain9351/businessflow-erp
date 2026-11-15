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
const [allData, setAllData] = useState({ clients: [], projects: [], tasks: [], invoices: [] });
const [searchQuery, setSearchQuery] = useState('');
const [showNotifications, setShowNotifications] = useState(false);


  useEffect(() => {
    fetchDashboardStats();

  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [statsRes, clientsRes, projectsRes, tasksRes, invoicesRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/clients').catch(() => ({ data: [] })),
        API.get('/projects').catch(() => ({ data: [] })),
        API.get('/tasks').catch(() => ({ data: [] })),
        API.get('/invoices').catch(() => ({ data: [] })),
      ]);

      setStats(statsRes.data.stats);

      const clients = clientsRes.data.clients || clientsRes.data || [];
      const projects = projectsRes.data.projects || projectsRes.data || [];
      const tasks = tasksRes.data.tasks || tasksRes.data || [];
      const invoices = invoicesRes.data.invoices || invoicesRes.data || [];

      setAllData({ clients, projects, tasks, invoices });
    
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

  // 1. Live Search Filter (Clients, Projects, Tasks)
const q = searchQuery.trim().toLowerCase();
const searchResults = q
  ? [
      ...allData.clients
        .filter((c) => c.name?.toLowerCase().includes(q) || c.companyName?.toLowerCase().includes(q))
        .map((c) => ({ id: c._id, title: c.name, type: 'Client', path: '/clients' })),
      ...allData.projects
        .filter((p) => p.name?.toLowerCase().includes(q))
        .map((p) => ({ id: p._id, title: p.name, type: 'Project', path: '/projects' })),
      ...allData.tasks
        .filter((t) => t.title?.toLowerCase().includes(q))
        .map((t) => ({ id: t._id, title: t.title, type: 'Task', path: '/tasks' })),
    ]
  : [];

// 2. Dynamic Notifications (Pending/Overdue Invoices + Pending Tasks)
const notifications = [
  ...allData.invoices
    .filter((inv) => inv.status === 'overdue' || inv.status === 'pending')
    .map((inv) => ({
      id: inv._id,
      text: `Invoice ${inv.invoiceNumber} is ${inv.status}`,
      path: '/invoices',
    })),
  ...allData.tasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 3)
    .map((t) => ({
      id: t._id,
      text: `Pending Task: ${t.title}`,
      path: '/tasks',
    })),
];



const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const currentMonth = new Date().getMonth();

const chartData = Array.from({ length: 6 }, (_, i) => {
  const monthIndex = (currentMonth - 5 + i + 12) % 12;
  const total = allData.invoices
    .filter((inv) => {
      const date = new Date(inv.createdAt || inv.dueDate);
      return date.getMonth() === monthIndex;
    })
    .reduce((sum, inv) => sum + (inv.amount || 0), 0);

  return { label: monthsList[monthIndex], value: total };
});

// SVG coordinates (0 to 500 width, 20 to 130 height)
const maxVal = Math.max(...chartData.map((d) => d.value), 100);
const points = chartData.map((d, idx) => {
  const x = (idx / (chartData.length - 1)) * 500;
  const y = 130 - (d.value / maxVal) * 100; 
  return { x, y, ...d };
});

const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
const areaPath = `${linePath} L 500,150 L 0,150 Z`;


const dynamicProjects = allData.projects.slice(0, 4);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 bg-white border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 p-6  flex-col justify-between hidden md:flex">
        <div>

          {/* Logo / Brand */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl  from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <span className="font-bold text-white text-lg">B</span>
            </div>
            <span className="font-bold text-lg tracking-widetext-slate-900 dark:text-white">BusinessFlow</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20">
              <LayoutDashboard size={20} /> Dashboard
            </a>
            <a href="/clients" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <Users size={20} /> Clients
            </a>
            <a href="/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <FolderKanban size={20} /> Projects
            </a>
            <a href="/tasks" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <CheckSquare size={20} /> Tasks
            </a>
            <a href="/invoices" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
              <FileText size={20} /> Invoices
            </a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition">
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
        <header className="h-20 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-900/40 backdrop-blur sticky top-0 z-20">
  
  {/* Global Search Bar with Live Dropdown */}
  <div className="flex items-center gap-4 w-96 relative">
    <div className="relative w-full">
      <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search clients, projects, tasks..."
        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
      />
    </div>

    {/* Search Dropdown */}
    {searchQuery && (
      <div className="absolute top-12 left-0 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-30">
        {searchResults.length === 0 ? (
          <div className="p-3 text-xs text-slate-400 text-center">No matching results found</div>
        ) : (
          searchResults.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => {
                setSearchQuery('');
                navigate(item.path);
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-800 flex justify-between items-center border-b border-slate-800/60 last:border-none transition"
            >
              <span className="text-sm text-slate-200 truncate">{item.title}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                {item.type}
              </span>
            </button>
          ))
        )}
      </div>
    )}
  </div>

  {/* Right Section: Notification Bell + Profile */}
  <div className="flex items-center gap-4 relative">
    <button
      onClick={() => setShowNotifications(!showNotifications)}
      className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 transition"
    >
      <Bell size={20} />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center">
          {notifications.length}
        </span>
      )}
    </button>

    {/* Notification Dropdown */}
    {showNotifications && (
      <div className="absolute top-12 right-44 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-30">
        <div className="px-4 py-2.5 border-b border-slate-800 text-xs font-semibold text-slate-300">
          Workspace Alerts ({notifications.length})
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-xs text-slate-500 text-center">All caught up! No pending alerts.</div>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  setShowNotifications(false);
                  navigate(n.path);
                }}
                className="w-full px-4 py-3 text-left text-xs text-slate-300 hover:bg-slate-800 border-b border-slate-800/50 last:border-none transition block"
              >
                {n.text}
              </button>
            ))}
          </div>
        )}
      </div>
    )}

    <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
      <div className="w-10 h-10 rounded-full  from-cyan-500 to-blue-500 flex items-center justify-center font-bold text-white">
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
            

{/* Dynamic Revenue Area Chart */}
<div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h3 className="text-lg font-bold text-white">Revenue & Project Activity</h3>
      <p className="text-xs text-slate-400">6-Month Invoice Revenue Overview</p>
    </div>
    <span className="text-xs px-3 py-1 bg-slate-800 text-cyan-400 rounded-full font-medium">
      Live Data
    </span>
  </div>

  {/* Dynamic SVG Chart UI */}
  <div className="h-64 w-full flex flex-col justify-between relative">
    <svg className="w-full h-48 overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Filled Area & Line */}
      <path d={areaPath} fill="url(#grad)" />
      <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="3" />

      {/* Data Points (Dots) */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="5"
          fill="#0f172a"
          stroke="#06b6d4"
          strokeWidth="2.5"
        >
          <title>{`${p.label}: ₹${p.value.toLocaleString()}`}</title>
        </circle>
      ))}
    </svg>

    {/* Dynamic Months & Values */}
    <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
      {points.map((p, i) => (
        <div key={i} className="text-center">
          <span className="block font-medium text-slate-300">{p.label}</span>
          <span className="text-[10px] text-cyan-400">₹{p.value.toLocaleString()}</span>
        </div>
      ))}
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

 {/* Bottom Section: Dynamic Projects Progress */}
<div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-bold text-white">Projects Progress & Status</h3>
    <span className="text-xs text-slate-400">{allData.projects.length} Total Projects</span>
  </div>

  {allData.projects.length === 0 ? (
    <div className="text-center py-6 text-xs text-slate-500">No projects found. Create one to track progress!</div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {dynamicProjects.map((proj) => {


        const status = proj.status || 'todo';
        const progressWidth = status === 'completed' ? '100%' : status === 'in-progress' ? '60%' : '25%';
        const statusColor = status === 'completed' ? 'bg-emerald-500' : status === 'in-progress' ? 'bg-cyan-500' : 'bg-amber-500';
        const textColor = status === 'completed' ? 'text-emerald-400' : status === 'in-progress' ? 'text-cyan-400' : 'text-amber-400';

        return (
          <div key={proj._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-200 truncate " title={proj.name}>
                {proj.name}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>
                {status}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${statusColor}`} 
                style={{ width: progressWidth }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>
        </div>
      </main>

    </div>
  );
}