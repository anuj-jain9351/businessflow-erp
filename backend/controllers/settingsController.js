import Company from '../models/Company.js';
import User from '../models/User.js';

// @desc    Get current company & user settings
// @route   GET /api/settings
export const getSettings = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID header is missing' });
    }

    const company = await Company.findById(companyId);
    const user = await User.findById(req.user._id).select('-passwordHash');

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company workspace not found' });
    }

    res.status(200).json({ success: true, company, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update company & user settings
// @route   PUT /api/settings
export const updateSettings = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const { companyName, userName, currency, taxRate, timezone } = req.body;

    // Company update fields prepare karo
    const companyUpdates = {};
    if (companyName) companyUpdates.name = companyName;
    if (currency) companyUpdates['settings.currency'] = currency;
    if (taxRate !== undefined) companyUpdates['settings.taxRate'] = Number(taxRate);
    if (timezone) companyUpdates['settings.timezone'] = timezone;

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $set: companyUpdates },
      { new: true, runValidators: true }
    );

    const updatedUser = userName
      ? await User.findByIdAndUpdate(
          req.user._id,
          { name: userName },
          { new: true, runValidators: true }
        ).select('-passwordHash')
      : await User.findById(req.user._id).select('-passwordHash');

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      company: updatedCompany,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};