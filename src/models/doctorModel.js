// models/doctorModel.js

const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'],
    required: true
  },
  fromHour: {
    type: Number,
    min: 0, max: 23,
    required: true
  },
  fromMinute: {
    type: Number,
    min: 0, max: 59,
    required: true
  },
  toHour: {
    type: Number,
    min: 0, max: 23,
    required: true
  },
  toMinute: {
    type: Number,
    min: 0, max: 59,
    required: true
  }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [64, 'Name cannot exceed 64 characters']
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true,
    minlength: [3, 'Specialty must be at least 3 characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  availability: {
    type: [availabilitySchema],
    validate: {
      validator: arr => arr.length > 0,
      message: 'At least one availability slot is required'
    }
  },
  offDates: {
    type: [Date],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

doctorSchema.virtual('readableAvailability').get(function() {
  return this.availability.map(a => {
    const pad = n => n.toString().padStart(2, '0');
    return `${a.day} ${pad(a.fromHour)}:${pad(a.fromMinute)} - ${pad(a.toHour)}:${pad(a.toMinute)}`;
  });
});

doctorSchema.index({ specialty: 1, department: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
