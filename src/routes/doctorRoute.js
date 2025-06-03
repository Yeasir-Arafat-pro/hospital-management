const { handleCreateDoctor, handleGetAllDoctors, handleUpdateDoctorById, handleGetDoctorById } = require('../controllers/doctorController');

const doctorRoute = require('express').Router();





doctorRoute.patch('/:id', handleUpdateDoctorById)
doctorRoute.post('/create', handleCreateDoctor)
doctorRoute.get('/:id', handleGetDoctorById)
doctorRoute.get('/', handleGetAllDoctors)



module.exports = doctorRoute