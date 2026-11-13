import React, { useEffect, useState } from 'react';
import { FolderKanban, Plus, Trash2, DollarSign, Calendar, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    clientId: '',
    status: 'in-progress'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      setProjects(response.data.projects || response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
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
      console.error('Error fetching clients for dropdown:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/projects', formData);
      setShowModal(false);
      setFormData({ name: '', description: '', budget: '', clientId: '', status: 'in-progress' });
      fetchProjects(); // Refresh list
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await API.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      
      {/* Top Header */}
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
              <FolderKanban className="text-cyan-400" /> Project Management
            </h1>
            <p className="text-sm text-slate-400">Track and monitor your workspace projects & budgets</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus size={18} /> Add New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-20 text-cyan-400 font-semibold">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <FolderKanban size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-1">No projects found</h3>
          <p className="text-sm text-slate-500 mb-4">Start by creating your first project workspace.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="text-cyan-400 hover:underline font-medium text-sm"
          >
            + Create Project Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                    project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    project.status === 'in-progress' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {project.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {project.status}
                  </span>
                  <button 
                    onClick={() => handleDeleteProject(project._id)}
                    className="text-slate-500 hover:text-red-400 transition p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{project.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{project.description || 'No description provided.'}</p>

                <div className="space-y-3 text-sm border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 text-xs flex items-center gap-1"><DollarSign size={14} /> Budget</span>
                    <span className="font-bold text-emerald-400">${project.budget?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 text-xs">Client</span>
                    <span className="font-medium text-slate-200">{project.clientId?.name || 'Assigned Client'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create New Project</h3>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">{error}</div>}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  value={formData.name} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="SaaS ERP Development"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows="2"
                  value={formData.description} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="Brief overview of the project..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Budget ($)</label>
                <input 
                  type="number" 
                  name="budget" 
                  required
                  value={formData.budget} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="50000"
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
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>{client.name} ({client.companyName || 'Indep'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}