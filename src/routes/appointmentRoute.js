const appointmentRoute = require('express').Router();

const { handleCreateAppointment, handleGetAllAppointments, handleGetAvailableSlots, handleDeleteAppointmentById, handleUpdateAppointmentById, handleGetAppointmentById } = require('../controllers/appoinmentController');
// controller
const { isLoggedIn } = require('../middlewire/auth');


appointmentRoute.get('/slots', handleGetAvailableSlots);

appointmentRoute.get('/:id', handleGetAppointmentById);
appointmentRoute.put('/:id', handleUpdateAppointmentById);
appointmentRoute.delete('/:id', handleDeleteAppointmentById);
appointmentRoute.post('/create',  handleCreateAppointment)
appointmentRoute.get('/', handleGetAllAppointments)




module.exports = appointmentRoute