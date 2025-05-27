const { handleCreatePatient, handleGetAllPatients, handleDeletePatientById, handleGetPatientById, handleUpdatePatientById } = require('../controllers/patientController');



const patientRoute = require('express').Router();


patientRoute.delete('/:id', handleDeletePatientById)
patientRoute.put('/:id', handleUpdatePatientById)
patientRoute.get('/:id', handleGetPatientById)
patientRoute.post('/create', handleCreatePatient)
patientRoute.get('/', handleGetAllPatients)



module.exports = patientRoute