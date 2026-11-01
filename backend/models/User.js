import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
  },
  isPlatformAdmin: {
    type: Boolean,
    default: false, // SaaS level super admin flag
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'invited'],
    default: 'active',
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;