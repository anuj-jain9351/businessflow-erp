import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Please select a client for this project'],
  },
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  budget: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
    default: 'planning',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
export default Project;