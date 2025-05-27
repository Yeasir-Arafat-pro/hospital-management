// models/roomModel.js

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  ward: {
    type: String,
    required: [true, 'Ward is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  bedNumber: {
    type: String,
    required: [true, 'Bed number is required'],
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    default: null
  },
  admittedAt: {
    type: Date
  },
  dischargedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON:   { virtuals: false },
  toObject: { virtuals: false }
});

// ensure unique bed within room+ward
roomSchema.index({ ward:1, roomNumber:1, bedNumber:1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room