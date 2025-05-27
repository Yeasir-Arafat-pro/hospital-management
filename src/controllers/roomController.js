// controllers/roomController.js

const createErrors      = require('http-errors');
const { successResponse } = require('./responseController');
const { findWithId }    = require('../services/findItem');
const Room              = require('../models/roomModel');
const Patient           = require('../models/patientModel');

// GET /api/rooms
const handleGetAllRooms = async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page, 10)  || 1;
    const limit  = parseInt(req.query.limit, 10) || 0;
    const filter = {}; // you can filter by isAvailable, ward, etc.

    const rooms = await Room.find(filter)
      .populate('patient')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!rooms.length) {
      throw createErrors(404, 'No rooms found');
    }

    const total = await Room.countDocuments(filter);
    return successResponse(res, {
      statusCode: 200,
      message: 'Rooms fetched successfully',
      payload: {
        rooms,
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

// GET /api/rooms/:id
const handleGetRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('patient', 'name contact.phone')
      .orFail(() => createErrors(404, 'Room not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Room fetched successfully',
      payload: { room }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/rooms
const handleCreateRoom = async (req, res, next) => {
  try {
    const { ward, roomNumber, bedNumber } = req.body;
    if (!ward || !roomNumber || !bedNumber) {
      throw createErrors(400, 'Ward, roomNumber and bedNumber are required');
    }

    // enforce uniqueness via index
    if (await Room.exists({ ward, roomNumber, bedNumber })) {
      throw createErrors(409, 'This bed already exists');
    }

    const newRoom = await Room.create({ ward, roomNumber, bedNumber });
    return successResponse(res, {
      statusCode: 201,
      message: 'Room created successfully',
      payload: { room: newRoom }
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/rooms/:id
const handleUpdateRoomById = async (req, res, next) => {
  try {
    const updates = {};
    ['ward','roomNumber','bedNumber','isAvailable','admittedAt','dischargedAt','patient']
      .forEach(f => {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      });

    if (updates.patient) {
      // assigning a patient reserves the bed
      updates.isAvailable = false;
      updates.admittedAt = updates.admittedAt || new Date();
    }
    if (updates.dischargedAt) {
      // discharge frees the bed
      updates.isAvailable = true;
      updates.patient = null;
      updates.admittedAt = null
    }

    if (!Object.keys(updates).length) {
      throw createErrors(400, 'No valid fields provided for update');
    }

    const updated = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).orFail(() => createErrors(404, 'Room not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Room updated successfully',
      payload: { room: updated }
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/rooms/:id
const handleDeleteRoomById = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id)
      .orFail(() => createErrors(404, 'Room not found or already deleted'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Room deleted successfully',
      payload: { room }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleGetAllRooms,
  handleGetRoomById,
  handleCreateRoom,
  handleUpdateRoomById,
  handleDeleteRoomById
};
