import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Membership from '../models/Membership.js';

// 1. Authenticate JWT Token (Is user logged in?)
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// 2. Authorize Tenant Access & Roles (Does user belong to this company?)
export const authorizeCompany = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Extract companyId from request headers or query/params
      const companyId = req.headers['x-company-id'] || req.body.companyId || req.query.companyId;

      if (!companyId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Company ID header (x-company-id) or param is missing' 
        });
      }

      // Find membership for this user in this specific company
      const membership = await Membership.findOne({
        userId: req.user._id,
        companyId: companyId,
        status: 'active',
      });

      if (!membership) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied: You are not an active member of this company workspace' 
        });
      }

      // Check Role-Based Access Control (RBAC) if roles are specified
      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return res.status(403).json({ 
          success: false, 
          message: `Forbidden: Role '${membership.role}' does not have permission for this action` 
        });
      }

      // Attach company and membership details to req object for controllers to use
      req.companyId = companyId;
      req.membership = membership;

      next();
    } catch (error) {
      console.error('Company Authorization Error:', error.message);
      return res.status(500).json({ success: false, message: 'Server error during tenant authorization' });
    }
  };
}; 