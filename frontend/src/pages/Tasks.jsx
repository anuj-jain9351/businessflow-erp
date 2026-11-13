import React, { useEffect, useState } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, User, FolderKanban, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    status: 'todo',
    priority: 'medium'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await API.get('/tasks');
      setTasks(response.data.tasks || response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await API.get('/projects');
      setProjects(response.data.projects || response.data);
    } catch (err) {
      console.error('Error fetching projects for dropdown:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/tasks', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', projectId: '', status: 'todo', priority: 'medium' });
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
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
              <CheckSquare className="text-cyan-400" /> Task Management
            </h1>
            <p className="text-sm text-slate-400">Track milestones, workflows, and project assignments</p>
          </div>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus size={18} /> Add New Task
        </button>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="text-center py-20 text-cyan-400 font-semibold">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <CheckSquare size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-1">No tasks found</h3>
          <p className="text-sm text-slate-500 mb-4">Get started by creating your first task workflow.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="text-cyan-400 hover:underline font-medium text-sm"
          >
            + Create Task Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task._id} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                    task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    task.status === 'in-progress' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {task.status === 'completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {task.status}
                  </span>
                  <button 
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-slate-500 hover:text-red-400 transition p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.description || 'No description provided.'}</p>

                <div className="space-y-3 text-sm border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 text-xs flex items-center gap-1"><FolderKanban size={14} /> Project</span>
                    <span className="font-medium text-cyan-400 truncate max-w-[160px]">{task.projectId?.name || 'General'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="text-slate-500 text-xs">Priority</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {task.priority || 'medium'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full p-6 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create New Task</h3>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">{error}</div>}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Task Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  value={formData.title} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                  placeholder="Design database schema"
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
                  placeholder="Details about this task..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Select Project</label>
                <select 
                  name="projectId" 
                  required
                  value={formData.projectId} 
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                  <select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}