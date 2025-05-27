// controllers/doctorController.js

const createErrors      = require('http-errors');
const { successResponse } = require('./responseController');
const { findWithId }    = require('../services/findItem');
const Doctor            = require('../models/doctorModel');
const Department        = require('../models/departmentModel');
const Appointment       = require('../models/appointmentModel');

// GET /api/doctors
const handleGetAllDoctors = async (req, res, next) => {
  try {
    const search       = req.query.search     || '';
    const departmentId = req.query.department || null;
    const specialty    = req.query.specialty  || '';
    const sortBy    = req.query.sortBy  || 'createdAt';
    const sortOrder = req.query.sortOrder || 'asc';
    const page         = parseInt(req.query.page, 10)  || 1;
    const limit        = parseInt(req.query.limit, 10) || '';
    const regex        = new RegExp(search, 'i');

    const filter = { isActive: true };
    if (search)       filter.name      = { $regex: regex };
    if (specialty)    filter.specialty = { $regex: new RegExp(specialty, 'i') };
    if (departmentId) filter.department = departmentId;

    const doctors = await Doctor.find(filter)
      .populate('department', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

    if (!doctors.length) {
      throw createErrors(404, 'No doctors found');
    }

    const totalCount = await Doctor.countDocuments(filter);

    return successResponse(res, {
      statusCode: 200,
      message: 'Doctors fetched successfully',
      payload: {
        doctors,
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

// GET /api/doctors/:id
const handleGetDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('department', 'name')
      .orFail(() => createErrors(404, 'Doctor not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Doctor fetched successfully',
      payload: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/doctors
const handleCreateDoctor = async (req, res, next) => {
  try {
    const { name, specialty, department, availability, offDates } = req.body;

    if (!name || !specialty || !department || !Array.isArray(availability) || !availability.length) {
      throw createErrors(400, 'Name, specialty, department and at least one availability slot are required');
    }
    
    await findWithId(Department, department);

    const doctor = await Doctor.create({ name, specialty, department, availability, offDates });

    return successResponse(res, {
      statusCode: 201,
      message: 'Doctor created successfully',
      payload: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/doctors/:id
const handleUpdateDoctorById = async (req, res, next) => {
  try {
    const updates = {};
    ['name','specialty','department','availability','offDates','isActive']
      .forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

    if (updates.department) {
      await findWithId(Department, updates.department);
    }

    if (!Object.keys(updates).length) {
      throw createErrors(400, 'No valid fields provided for update');
    }

    // availability change: ensure no conflicting appointments
    if (updates.availability) {
      const existingAppts = await Appointment.find({
        doctor: req.params.id,
        status: { $in: ['scheduled'] }
      });
      // (You may add logic here to check time conflicts)
    }

    const updated = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).orFail(() => createErrors(404, 'Doctor not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Doctor updated successfully',
      payload: { doctor: updated }
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/doctors/:id
const handleDeleteDoctorById = async (req, res, next) => {
  try {
    const doctor = await findWithId(Doctor, req.params.id);

    if (!doctor.isActive) {
      throw createErrors(404, 'Doctor not found or already deactivated');
    }

    doctor.isActive = false;
    await doctor.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Doctor deactivated successfully',
      payload: { doctor }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetAllDoctors,
  handleGetDoctorById,
  handleCreateDoctor,
  handleUpdateDoctorById,
  handleDeleteDoctorById
};
