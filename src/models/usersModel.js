// models/userModel.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { defaultImagePath } = require('../secret');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [31, 'Name cannot exceed 31 characters']
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: v => /^\S+@\S+\.\S+$/.test(v),
      message: props => `${props.value} is not a valid email`
    }
  },
  password: {
    type: String,
    required: [true, 'User password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    set: v => bcrypt.hashSync(v, bcrypt.genSaltSync(10))
  },
  image: {
    type: String,
    default: defaultImagePath
  },
  address: {
    type: String,
    required: [true, 'User address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'User phone is required'],
    trim: true,
    validate: {
      validator: v => /^\+?[0-9]{7,15}$/.test(v),
      message: props => `${props.value} is not a valid phone number`
    }
  },
  role: {
    type: String,
    enum: ['admin', 'receptionist', 'doctor'],
    default: 'receptionist',
    required: true
  },
  isBanned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON:   { virtuals: false },
  toObject: { virtuals: false }
});

module.exports = mongoose.model('User', userSchema);
