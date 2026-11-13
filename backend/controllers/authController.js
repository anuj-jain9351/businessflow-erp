import User from '../models/User.js';
import Company from '../models/Company.js';
import Membership from '../models/Membership.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT Token helper
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user and create initial company workspace
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    // Validation
    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 1. Create User
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    // 2. Generate slug for company (e.g., "My Agency" -> "my-agency")
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    // 3. Create Company Workspace
    const company = await Company.create({
      name: companyName,
      slug,
      ownerId: user._id,
    });

    // 4. Create Membership as 'Company Owner'
    await Membership.create({
      companyId: company._id,
      userId: user._id,
      role: 'Company Owner',
      status: 'active',
    });

    // Generate Token
    const token = generateToken(user._id);

    // 🟢 FIXED: Send correct companyId at the root level so frontend can grab it instantly
    res.status(201).json({
      success: true,
      token,
      companyId: company._id, // <--- Yahan pehle user.companyId tha jo undefined tha
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPlatformAdmin: user.isPlatformAdmin,
      },
      company: {
        id: company._id,
        name: company.name,
        slug: company.slug,
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Find user's active companies/memberships
    const memberships = await Membership.find({ userId: user._id, status: 'active' }).populate('companyId');

    const token = generateToken(user._id);

    // 🟢 FIXED: Automatically extract the first active company's ID as top-level companyId
    const defaultCompanyId = memberships.length > 0 ? memberships[0].companyId._id : null;

    res.status(200).json({
      success: true,
      token,
      companyId: defaultCompanyId, // <--- Yahan root level par companyId add kar diya hai
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPlatformAdmin: user.isPlatformAdmin,
      },
      memberships: memberships.map(m => ({
        companyId: m.companyId._id,
        companyName: m.companyId.name,
        slug: m.companyId.slug,
        role: m.role,
      }))
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};