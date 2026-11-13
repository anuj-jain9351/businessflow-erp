import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

// @desc    Get dashboard metrics and statistics for current tenant
// @route   GET /api/dashboard/stats
// @access  Private (All active company members)
export const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.companyId;

    // 1. Total Clients count
    const totalClients = await Client.countDocuments({ companyId });

    // 2. Project Statistics
    const projects = await Project.find({ companyId });
    const totalProjects = projects.length;
    
    // Calculate total budget across all company projects
    const totalBudget = projects.reduce((acc, proj) => acc + (proj.budget || 0), 0);

    // Group projects by status (planning, in-progress, completed, etc.)
    const projectStatusBreakdown = projects.reduce((acc, proj) => {
      acc[proj.status] = (acc[proj.status] || 0) + 1;
      return acc;
    }, {});

    // 3. Task Statistics
    const tasks = await Task.find({ companyId });
    const totalTasks = tasks.length;

    // Group tasks by status (todo, in-progress, review, completed)
    const taskStatusBreakdown = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    // Group tasks by priority (low, medium, high, urgent)
    const taskPriorityBreakdown = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        clients: {
          total: totalClients,
        },
        projects: {
          total: totalProjects,
          totalBudget,
          statusBreakdown: projectStatusBreakdown,
        },
        tasks: {
          total: totalTasks,
          statusBreakdown: taskStatusBreakdown,
          priorityBreakdown: taskPriorityBreakdown,
        },
      },
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching dashboard statistics', 
      error: error.message 
    });
  }
};