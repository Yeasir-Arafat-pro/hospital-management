// models/departmentModel.js

const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Department name must be at least 2 characters'],
    maxlength: [50, 'Department name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true    // soft-delete or temporary disable
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { select: 'name email role' }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON:   { virtuals: true },
  toObject: { virtuals: true }
});

// Text index for fast search by name
departmentSchema.index({ name: 'text' });
departmentSchema.plugin(autopopulate);
module.exports = mongoose.model('Department', departmentSchema);
