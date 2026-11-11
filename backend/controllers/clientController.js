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
      companyId: req.companyId, // Attached automatically by authorizeCompany middleware
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

// @desc    Get single client by ID
// @route   GET /api/clients/:id
// @access  Private
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    }).populate('createdBy', 'name email');

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.status(200).json({ success: true, client });
  } catch (error) {
    console.error('Get Client Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching client details' });
  }
};

// @desc    Update client details
// @route   PUT /api/clients/:id
// @access  Private (Company Owner, Admin, Project Manager)
export const updateClient = async (req, res) => {
  try {
    let client = await Client.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client,
    });
  } catch (error) {
    console.error('Update Client Error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating client' });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private (Company Owner, Admin)
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Client removed successfully',
    });
  } catch (error) {
    console.error('Delete Client Error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting client' });
  }
};