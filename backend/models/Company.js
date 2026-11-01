import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Please add a unique URL slug'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  settings: {
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 18 }, // GST default percentage
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  status: {
    type: String,
    enum: ['active', 'past-due', 'cancelled', 'trial'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const Company = mongoose.model('Company', companySchema);
export default Company;