// models/billingModel.js

const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0 },
  quantity:    { type: Number, default: 1, min: 1 }
}, { _id: false });

const billingSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: [true, 'Invoice number is required'],
    trim: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment reference is required']
  },
  lineItems: {
    type: [lineItemSchema],
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one line item is required'
    }
  },
  subTotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending','paid','cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash','card','insurance','online'],
    default: 'cash'
  },
  paidAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster lookup
billingSchema.index({ invoiceNo: 1 });
billingSchema.index({ patient: 1, appointment: 1 });

module.exports = mongoose.model('Billing', billingSchema);
