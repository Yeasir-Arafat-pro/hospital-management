const departmentRoute = require('express').Router();

// controller
const { handleCreateDepartment, handleGetAllDepartments } = require('../controllers/departmnetController');
const { isLoggedIn } = require('../middlewire/auth');



departmentRoute.post('/create', isLoggedIn, handleCreateDepartment)
departmentRoute.get('/', handleGetAllDepartments)



module.exports = departmentRoute