import Project from '../models/Project.js';
import Client from '../models/Client.js';

// @desc    Create a new Project
// @route   POST /api/projects
// @access  Private (Company Owner, Admin, Project Manager)
export const createProject = async (req, res) => {
  try {
    const { clientId, name, description, budget, status, startDate, endDate, assignedMembers } = req.body;

    if (!clientId || !name) {
      return res.status(400).json({ success: false, message: 'Client ID and Project Name are required' });
    }

    const clientExists = await Client.findOne({ _id: clientId, companyId: req.companyId });
    if (!clientExists) {
      return res.status(404).json({ success: false, message: 'Client not found in your company workspace' });
    }

    const project = await Project.create({
      companyId: req.companyId,
      clientId,
      name,
      description,
      budget,
      status: status || 'planning',
      startDate,
      endDate,
      assignedMembers: assignedMembers || [],
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating project', error: error.message });
  }
};

// @desc    Get all projects for current tenant
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ companyId: req.companyId })
      .populate('clientId', 'name email companyName')
      .populate('createdBy', 'name email')
      .populate('assignedMembers', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching projects' });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    })
      .populate('clientId', 'name email phone companyName')
      .populate('createdBy', 'name email')
      .populate('assignedMembers', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error('Get Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching project details' });
  }
};

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private (Company Owner, Admin, Project Manager)
export const updateProject = async (req, res) => {
  try {
    let project = await Project.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // If clientId is being updated, verify client exists in company
    if (req.body.clientId) {
      const clientExists = await Client.findOne({ _id: req.body.clientId, companyId: req.companyId });
      if (!clientExists) {
        return res.status(404).json({ success: false, message: 'New client not found in your company workspace' });
      }
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project,
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating project' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Company Owner, Admin)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project removed successfully',
    });
  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting project' });
  }
};