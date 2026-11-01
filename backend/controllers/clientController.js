import Client from '../models/Client.js';

// @desc    Create a new Client for current tenant
// @route   POST /api/clients
// @access  Private (Company Owner, Admin, Project Manager)
export const createClient = async (req, res) => {
  try {
    const { name, email, phone, companyName, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Client name and email are required' });
    }

    const client = await Client.create({
      companyId: req.companyId, // Attached automatically by authorizeCompany middleware!
      name,
      email,
      phone,
      companyName,
      address,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      client,
    });
  } catch (error) {
    console.error('Create Client Error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating client', error: error.message });
  }
};

// @desc    Get all clients for current tenant
// @route   GET /api/clients
// @access  Private (All active workspace members)
export const getClients = async (req, res) => {
  try {
    // 🔒 STRICT MULTI-TENANCY FILTER: Only fetch clients matching current tenant companyId
    const clients = await Client.find({ companyId: req.companyId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error('Get Clients Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching clients', error: error.message });
  }
};