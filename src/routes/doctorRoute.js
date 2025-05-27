const { handleCreateDoctor, handleGetAllDoctors } = require('../controllers/doctorController');

const doctorRoute = require('express').Router();





doctorRoute.post('/create', handleCreateDoctor)
doctorRoute.get('/', handleGetAllDoctors)



module.exports = doctorRoute