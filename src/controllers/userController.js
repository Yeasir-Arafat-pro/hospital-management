// controllers/userController.js
 
const createErrors = require('http-errors');
const jwt          = require('jsonwebtoken');
const bcrypt       = require('bcryptjs'); 
const User         = require('../models/usersModel');
const { successResponse } = require('./responseController');
const { createJSONwebToken } = require('../helper/createJsonWebtoken');
const { clientUrl, jwtSecret } = require('../secret');
const { emailWithNodeMailer }   = require('../helper/email');
 
// GET /api/users
const handleGetAllUsers = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const page   = parseInt(req.query.page, 10)  || 1;
    const limit  = parseInt(req.query.limit, 10);
    const regex  = new RegExp(search, 'i');


  
    const filter = { isBanned: false, role: { $ne: 'admin' },
      $or: [
        { name:  { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } }
      ]
    };

    const users = await User.find(filter, '-password')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!users.length) throw createErrors(404, 'No users found');

    const total = await User.countDocuments(filter);

    return successResponse(res, {
      statusCode: 200,
      message: 'Users fetched successfully',
      payload: {
        users,
        pagination: {
          totalPages:   Math.ceil(total / limit),
          currentPage:  page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage:     page * limit < total ? page + 1 : null
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const handleGetUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, '-password')
      .orFail(() => createErrors(404, 'User not found'));
    return successResponse(res, {
      statusCode: 200,
      message: 'User fetched successfully',
      payload: { user }
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
const handleDeleteUserById = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
      .orFail(() => createErrors(404, 'User not found or already deleted'));
    return successResponse(res, {
      statusCode: 200,
      message: 'User deleted successfully',
      payload: { user }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/register
const handleProcessRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, role } = req.body;
    const image = req.file?.path;
    if (!image) throw createErrors(400, 'Profile image is required');

    if (await User.exists({ email })) {
      throw createErrors(409, 'Email already in use');
    }

    const token = createJSONwebToken(
      { name, email, password, phone, address, role, image },
      'userToken',
      '5m'
    );

    const emailData = {
      email,
      subject: 'Activate Your Hospital Account',
      html: `<h2>Hello ${name}</h2>
             <p>Click <a href="${clientUrl}/api/users/activate/${token}">here</a> to activate.</p>`
    };

    try {
      await emailWithNodeMailer(emailData);
    } catch (e) {
      throw createErrors(500, 'Failed to send activation email');
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Check your email to activate account',
      payload: { token }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/activate/:token
const handleActivateUserAccount = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) throw createErrors(400, 'Activation token is required');

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch {
      throw createErrors(400, 'Invalid or expired token');
    }

    if (await User.exists({ email: decoded.email })) {
      throw createErrors(409, 'Account already activated');
    }

    const user = await User.create(decoded);
    return successResponse(res, {
      statusCode: 201,
      message: 'Account activated successfully',
      payload: { user }
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id
const handleUpdateUserById = async (req, res, next) => {
  try {
    const updates = {};
    ['name','phone','address','role','image'].forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (!Object.keys(updates).length) {
      throw createErrors(400, 'No valid fields provided');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' }
    ).orFail(() => createErrors(404, 'User not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'User updated successfully',
      payload: { user }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleGetAllUsers,
  handleGetUserById,
  handleDeleteUserById,
  handleProcessRegister,
  handleActivateUserAccount,
  handleUpdateUserById
};
