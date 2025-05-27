// models/patientModel.js

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [64, 'Name cannot exceed 64 characters']
  },
  dob: {
    type: Date
  },
  age: {
    type: Number,
    required: [true, 'Patient age is required'],
    min: [0, 'Age cannot be negative']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  contact: {
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: v => /^\+?[0-9]{7,15}$/.test(v),
        message: props => `${props.value} is not a valid phone number`
      }
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: v => /^\S+@\S+\.\S+$/.test(v),
        message: props => `${props.value} is not a valid email address`
      }
    }
  },
  address: {
    street:    { type: String, trim: true },
    city:      { type: String, trim: true },
    postalCode:{ type: String, trim: true },
    country:   { type: String, trim: true }
  },
  emergencyContact: {
    name:     { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: v => /^\+?[0-9]{7,15}$/.test(v),
        message: props => `${props.value} is not a valid phone number`
      }
    }
  },
  isFollowUp: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to calculate age from dob if needed
patientSchema.virtual('calculatedAge').get(function() {
  if (!this.dob) return null;
  const diff = Date.now() - this.dob.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

patientSchema.index({ name: 'text', 'contact.phone': 1, 'contact.email': 1 });

module.exports = mongoose.model('Patient', patientSchema);
