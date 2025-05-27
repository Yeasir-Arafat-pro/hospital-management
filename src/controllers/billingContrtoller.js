// controllers/billingController.js

const createErrors = require('http-errors');
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
const Billing = require('../models/billingModel');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel');

/**
 * Helper to compute amounts
 */
function computeAmounts({ lineItems, taxPercent = 0, discountAmount = 0 }) {
  const subTotal = lineItems.reduce(
    (sum, item) => sum + item.amount * item.quantity,
    0
  );
  const taxAmount = +(subTotal * (taxPercent / 100)).toFixed(2);
  const totalAmount = +(subTotal + taxAmount - discountAmount).toFixed(2);
  return { subTotal, taxAmount, totalAmount };
}

// Get all bills (with pagination & optional search by invoiceNo)
const handleGetAllBillings = async (req, res, next) => {
  try {
    const search    = req.query.search   || '';
    const page      = parseInt(req.query.page, 10)  || 1;
    const limit     = parseInt(req.query.limit, 10) || 10;
    const regex     = new RegExp(search, 'i');

    const filter = { isActive: true };
    if (search) filter.invoiceNo = { $regex: regex };

    const bills = await Billing.find(filter)
      .populate('patient', 'name contact.phone')
      .populate('appointment', 'datetime status')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!bills.length) {
      throw createErrors(404, 'No billing records found');
    }

    const totalCount = await Billing.countDocuments(filter);

    return successResponse(res, {
      statusCode: 200,
      message: 'Billing records fetched successfully',
      payload: {
        bills,
        pagination: {
          totalPages:   Math.ceil(totalCount / limit),
          currentPage:  page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage:     page * limit < totalCount ? page + 1 : null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single bill by ID
const handleGetBillingById = async (req, res, next) => {
  try {
    const billId = req.params.id;
    const bill = await Billing.findById(billId)
      .populate('patient', 'name contact.phone contact.email')
      .populate('appointment', 'datetime status')
      .orFail(() => createErrors(404, 'Billing not found'));

    if (!bill.isActive) {
      throw createErrors(404, 'Billing not found');
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Billing fetched successfully',
      payload: { bill }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new billing record
const handleCreateBilling = async (req, res, next) => {
  try {
    const {
      invoiceNo,
      patient: patientId,
      appointment: appointmentId,
      lineItems,
      taxPercent,
      discountAmount = 0,
      paymentMethod
    } = req.body;

    if (!invoiceNo || !patientId || !appointmentId || !Array.isArray(lineItems) || !lineItems.length) {
      throw createErrors(400, 'invoiceNo, patient, appointment and at least one lineItem are required');
    }

    // ensure uniqueness
    if (await Billing.exists({ invoiceNo })) {
      throw createErrors(409, 'Invoice number already exists');
    }

    // validate references
    await findWithId(Patient, patientId);
    await findWithId(Appointment, appointmentId);

    // compute amounts
    const { subTotal, taxAmount, totalAmount } = computeAmounts({
      lineItems,
      taxPercent,
      discountAmount
    });

    const newBill = await Billing.create({
      invoiceNo,
      patient: patientId,
      appointment: appointmentId,
      lineItems,
      subTotal,
      taxPercent,
      taxAmount,
      discountAmount,
      totalAmount,
      paymentMethod
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Billing record created successfully',
      payload: { bill: newBill }
    });
  } catch (error) {
    next(error);
  }
};

// Update a billing record
const handleUpdateBillingById = async (req, res, next) => {
  try {
    const billId = req.params.id;
    const updates = {};
    const upFields = [
      'lineItems',
      'taxPercent',
      'discountAmount',
      'status',
      'paymentMethod'
    ];

    upFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (!Object.keys(updates).length) {
      throw createErrors(400, 'No valid fields provided for update');
    }

    const bill = await Billing.findById(billId).orFail(() => createErrors(404, 'Billing not found'));

    // recompute amounts if financial fields changed
    if (updates.lineItems || updates.taxPercent !== undefined || updates.discountAmount !== undefined) {
      const newLineItems    = updates.lineItems || bill.lineItems;
      const newTaxPercent   = updates.taxPercent  !== undefined ? updates.taxPercent  : bill.taxPercent;
      const newDiscountAmt  = updates.discountAmount !== undefined ? updates.discountAmount : bill.discountAmount;
      const { subTotal, taxAmount, totalAmount } = computeAmounts({
        lineItems:      newLineItems,
        taxPercent:     newTaxPercent,
        discountAmount: newDiscountAmt
      });
      updates.subTotal      = subTotal;
      updates.taxAmount     = taxAmount;
      updates.totalAmount   = totalAmount;
    }

    // if marking paid, set paidAt
    if (updates.status === 'paid' && !bill.paidAt) {
      updates.paidAt = new Date();
    }

    const updated = await Billing.findByIdAndUpdate(
      billId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return successResponse(res, {
      statusCode: 200,
      message: 'Billing record updated successfully',
      payload: { bill: updated }
    });
  } catch (error) {
    next(error);
  }
};

// Soft-delete (deactivate) a billing record
const handleDeleteBillingById = async (req, res, next) => {
  try {
    const billId = req.params.id;
    const bill = await Billing.findById(billId).orFail(() => createErrors(404, 'Billing not found'));

    if (!bill.isActive) {
      throw createErrors(404, 'Billing already deactivated');
    }

    bill.isActive = false;
    await bill.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Billing record deactivated successfully',
      payload: { bill }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetAllBillings,
  handleGetBillingById,
  handleCreateBilling,
  handleUpdateBillingById,
  handleDeleteBillingById
};
