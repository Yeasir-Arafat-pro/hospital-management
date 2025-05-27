// controllers/medicalRecordController.js

const createErrors      = require('http-errors');
const { successResponse } = require('./responseController');
const { findWithId }    = require('../services/findItem');
const MedicalRecord     = require('../models/medicalRecordModel');
const Appointment       = require('../models/appointmentModel');
const Patient           = require('../models/patientModel');
const Doctor            = require('../models/doctorModel');

// GET /api/records
const handleGetAllMedicalRecords = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const filter = {}; // could add patient or doctor filters

    const records = await MedicalRecord.find(filter)
      .populate('appointment', 'datetime status')
      .populate('patient', 'name')
      .populate('doctor', 'name specialty')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (!records.length) {
      throw createErrors(404, 'No medical records found');
    }

    const total = await MedicalRecord.countDocuments(filter);
    return successResponse(res, {
      statusCode: 200,
      message: 'Medical records fetched successfully',
      payload: {
        records,
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

// GET /api/records/:id
const handleGetMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('appointment', 'datetime status')
      .populate('patient', 'name')
      .populate('doctor', 'name specialty')
      .orFail(() => createErrors(404, 'Medical record not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Medical record fetched successfully',
      payload: { record }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/records
const handleCreateMedicalRecord = async (req, res, next) => {
  try {
    const { appointment, patient, doctor, diagnosis, prescription, advice, followUpDate } = req.body;

    if (!appointment || !patient || !doctor || !diagnosis || !Array.isArray(prescription) || !prescription.length) {
      throw createErrors(400, 'appointment, patient, doctor, diagnosis and prescription are required');
    }

    await findWithId(Appointment, appointment);
    await findWithId(Patient, patient);
    await findWithId(Doctor, doctor);

    const newRecord = await MedicalRecord.create({
      appointment, patient, doctor, diagnosis, prescription, advice, followUpDate
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Medical record created successfully',
      payload: { record: newRecord }
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/records/:id
const handleUpdateMedicalRecordById = async (req, res, next) => {
  try {
    const updates = {};
    ['diagnosis','prescription','advice','followUpDate']
      .forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

    if (!Object.keys(updates).length) {
      throw createErrors(400, 'No valid fields provided for update');
    }

    const updated = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).orFail(() => createErrors(404, 'Medical record not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Medical record updated successfully',
      payload: { record: updated }
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/records/:id
const handleDeleteMedicalRecordById = async (req, res, next) => {
  try {
    const deleted = await MedicalRecord.findByIdAndDelete(req.params.id)
      .orFail(() => createErrors(404, 'Medical record not found'));

    return successResponse(res, {
      statusCode: 200,
      message: 'Medical record deleted successfully',
      payload: { record: deleted }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleGetAllMedicalRecords,
  handleGetMedicalRecordById,
  handleCreateMedicalRecord,
  handleUpdateMedicalRecordById,
  handleDeleteMedicalRecordById
};
