import Invoice from '../models/Invoice.js';

// @desc Get all invoices for company
export const getInvoices = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const invoices = await Invoice.find({ companyId }).populate('clientId', 'name email companyName');
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create a new invoice
export const createInvoice = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const { clientId, invoiceNumber, amount, dueDate, status } = req.body;

    const invoice = await Invoice.create({
      companyId,
      clientId,
      invoiceNumber,
      amount,
      dueDate,
      status
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};