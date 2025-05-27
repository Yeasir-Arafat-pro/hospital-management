// controllers/appointmentController.js

const createErrors = require('http-errors');
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
const Appointment = require('../models/appointmentModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');



const handleGetAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      throw createErrors(400, '`date` query parameter is required in YYYY-MM-DD format');
    }

    // দিনের শুরু ও শেষ টাইমের ISO strings
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd   = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      
    // DB থেকে ঐ দিনে সব বুক করা অ্যাপয়েন্টমেন্টস নিয়ে আস
    const booked = await Appointment.find({
      datetime: { $gte: dayStart, $lt: dayEnd }
    }).select('datetime -_id');

    // বুক করা সময়গুলোকে "HH:MM" ফরম্যাটে নিয়ে আস
    const bookedSet = new Set(
      booked.map(a => {
        const dt = new Date(a.datetime);
         //const fdt = dt.split('T')
        
         const h = dt.getUTCHours().toString().padStart(2, '0');
    const m = dt.getUTCMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      })
    );
    
    // 9:00 AM থেকে 5:00 PM পর্যন্ত ৩০-মিনিটের স্লট তৈরি
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (let min of [0, 30]) {
        const hh = hour.toString().padStart(2, '0');
        const mm = min.toString().padStart(2, '0');
        const time = `${hh}:${mm}`;
        if (!bookedSet.has(time)) {
          slots.push(time);
        }
      }
    }
    // 5:00 PM শেষ স্লট হিসেবে (17:00) যোগ
    if (!bookedSet.has('17:00')) {
      slots.push('17:00');
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Available slots fetched successfully',
      payload: { slots }
    });
  } catch (error) {
    next(error);
  }
};




// Get all appointments (with pagination, optional filter by patient or doctor)
const handleGetAllAppointments = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { patientId, doctorId, status } = req.query;
    
    const filter = {};
    if (patientId) filter.patient = patientId;
    if (doctorId)  filter.doctor  = doctorId;
    if (status)    filter.status  = status;
    
    const appointments = await Appointment.find(filter)
    .populate('patient', 'name contact.phone contact.email')
    .populate('doctor')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ datetime: 1 });
    
    // if (!appointments.length) {
    //   throw createErrors(404, 'No appointments found');
    // }
    //fix appointments 

    
    
    
    const totalCount = await Appointment.countDocuments(filter);
    
    return successResponse(res, {
      statusCode: 200,
      message: 'Appointments fetched successfully',
      payload: {
        appointments,
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

// Get single appointment by ID
const handleGetAppointmentById = async (req, res, next) => {
  try {
    const apptId = req.params.id;
    const appt = await Appointment.findById(apptId)
      .populate('patient', 'name contact.phone contact.email')
      .populate('doctor', 'name specialty');

    if (!appt) {
      throw createErrors(404, 'Appointment not found');
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Appointment fetched successfully',
      payload: { appointment: appt }
    });
  } catch (error) {
    next(error);
  }
};

// Create a new appointment
const handleCreateAppointment = async (req, res, next) => {
  try {
    const { patient: patientId, doctor: doctorId, datetime } = req.body;
    if (!patientId || !doctorId || !datetime) {
      throw createErrors(400, 'patient, doctor and datetime are required');
    }

    // ensure patient & doctor exist
    await findWithId(Patient, patientId);
    await findWithId(Doctor, doctorId);

    // check doctor availability at same datetime
    const conflict = await Appointment.exists({ doctor: doctorId, datetime });
    if (conflict) {
      throw createErrors(409, 'Doctor already has an appointment at this time');
    }

    const newAppt = await Appointment.create({ patient: patientId, doctor: doctorId, datetime });

    return successResponse(res, {
      statusCode: 201,
      message: 'Appointment created successfully',
      payload: { appointment: newAppt }
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment (datetime and/or status)
const handleUpdateAppointmentById = async (req, res, next) => {
  try {
    const apptId = req.params.id;
    const { datetime, status } = req.body;

    if (!datetime && !status) {
      throw createErrors(400, 'At least one of datetime or status is required');
    }

    // if changing datetime, check for conflict
    if (datetime) {
      const appt = await findWithId(Appointment, apptId);
      const conflict = await Appointment.exists({
        doctor: appt.doctor,
        datetime,
        _id: { $ne: apptId }
      });
      if (conflict) {
        throw createErrors(409, 'Doctor has another appointment at the new time');
      }
    }

    const updated = await Appointment.findByIdAndUpdate(
      apptId,
      { $set: { ...(datetime && { datetime }), ...(status && { status }) } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw createErrors(404, 'Appointment not found');
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Appointment updated successfully',
      payload: { appointment: updated }
    });
  } catch (error) {
    next(error);
  }
};

// Delete appointment by ID
const handleDeleteAppointmentById = async (req, res, next) => {
  try {
    const apptId = req.params.id;
    const deleted = await Appointment.findByIdAndDelete(apptId);
    if (!deleted) {
      throw createErrors(404, 'Appointment not found or already deleted');
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Appointment deleted successfully',
      payload: { appointment: deleted }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetAllAppointments,
  handleGetAppointmentById,
  handleCreateAppointment,
  handleUpdateAppointmentById,
  handleDeleteAppointmentById,
  handleGetAvailableSlots
};
