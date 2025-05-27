// controllers/patientController.js

const createErrors = require('http-errors');
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
const Patient = require('../models/patientModel');

// GET /api/patients
const handleGetAllPatients = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const page   = parseInt(req.query.page, 10)  || 1;
    const limit  = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt'; 
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const regex  = new RegExp('.*' + search+ '.*', 'i');

    const filter = {
      isDeleted: false,
      $or: [
        { name:            { $regex: regex } },
        { 'contact.phone': { $regex: regex } },
        { 'contact.email': { $regex: regex } }
      ]
    };

    const patients = await Patient.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })

    if (!patients.length) {
      throw createErrors(404, 'No patients found');
    }

    const total = await Patient.countDocuments(filter);

    return successResponse(res, {
      statusCode: 200,
      message: 'Patients fetched successfully',
      payload: {
        patients,
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

// GET /api/patients/:id
const handleGetPatientById = async (req, res, next) => {
  try {
    const patient = await findWithId(Patient, req.params.id);
    if (patient.isDeleted) {
      throw createErrors(404, 'Patient not found');
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Patient fetched successfully',
      payload: { patient }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/patients
const handleCreatePatient = async (req, res, next) => {
  try {
    const { name, age, dob, gender, contact, address, emergencyContact, isFollowUp } = req.body;
    if (!name || age == null) {
      throw createErrors(400, 'Name and age are required');
    }

    const newPatient = await Patient.create({
      name,
      age,
      dob,
      gender,
      contact,
      address,
      emergencyContact,
      isFollowUp
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Patient created successfully',
      payload: { patient: newPatient }
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/patients/:id
const handleUpdatePatientById = async (req, res, next) => {
  try {
    const updates = {};
    ['name','age','dob','gender','contact','address','emergencyContact','isFollowUp']
      .forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

    if (!Object.keys(updates).length) {
      throw createErrors(400, 'No valid fields provided for update');
    }

    const updated = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated || updated.isDeleted) {
      throw createErrors(404, 'Patient not found');
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Patient updated successfully',
      payload: { patient: updated }
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/patients/:id
const handleDeletePatientById = async (req, res, next) => {
  try {
    const patient = await findWithId(Patient, req.params.id);
    if (patient.isDeleted) {
      throw createErrors(404, 'Patient not found or already deleted');
    }
    patient.isDeleted = true;
    await patient.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Patient deleted successfully',
      payload: { patient }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleGetAllPatients,
  handleGetPatientById,
  handleCreatePatient,
  handleUpdatePatientById,
  handleDeletePatientById
};
