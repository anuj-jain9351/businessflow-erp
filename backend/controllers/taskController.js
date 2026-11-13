import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Create a new Task
// @route   POST /api/tasks
// @access  Private (Company Owner, Admin, Project Manager)
export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ success: false, message: 'Project ID and Task title are required' });
    }

    // Verify project belongs to current company
    const projectExists = await Project.findOne({ _id: projectId, companyId: req.companyId });
    if (!projectExists) {
      return res.status(404).json({ success: false, message: 'Project not found in your company workspace' });
    }

    const task = await Task.create({
      companyId: req.companyId,
      projectId,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo,
      dueDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating task', error: error.message });
  }
};

// @desc    Get all tasks for current tenant (Optional query: ?projectId=XYZ)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    let query = { companyId: req.companyId };

    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching tasks' });
  }
};

// @desc    Update task status or details
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating task' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task removed successfully',
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting task' });
  }
};   