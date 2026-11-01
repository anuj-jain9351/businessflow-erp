import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true, // Tenant isolation speedup ke liye index essential hai
  },
  name: {
    type: String,
    required: [true, 'Please add a client name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add a client email'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  companyName: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'lead'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Client = mongoose.model('Client', clientSchema);
export default Client;