// models/medicalRecordModel.js

const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true, trim: true },
  dosage:       { type: String, required: true, trim: true }, // e.g., "500mg"
  frequency:    { type: String, required: true, trim: true }  // e.g., "3 times a day"
}, { _id: false });

const medicalRecordSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment reference is required']
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient reference is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor reference is required']
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true
  },
  prescription: {
    type: [prescriptionItemSchema],
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one prescription item is required'
    }
  },
  advice: {
    type: String,
    trim: true
  },
  followUpDate: Date
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

// index for fast look-up by patient or doctor
medicalRecordSchema.index({ patient: 1, doctor: 1, appointment: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
