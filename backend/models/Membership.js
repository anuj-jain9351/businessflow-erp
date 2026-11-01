import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['Company Owner', 'Admin', 'Project Manager', 'Finance Manager', 'Employee', 'Client'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'invited', 'suspended'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Compound index to ensure a user cannot have multiple memberships in the same company
membershipSchema.index({ companyId: 1, userId: 1 }, { unique: true });

const Membership = mongoose.model('Membership', membershipSchema);
export default Membership;