const billingRoute = require('express').Router();

const { handleCreateBilling, handleGetAllBillings } = require('../controllers/billingContrtoller');
// controller
const { isLoggedIn } = require('../middlewire/auth');



billingRoute.post('/create', isLoggedIn, handleCreateBilling)
billingRoute.get('/', handleGetAllBillings)



module.exports = billingRoute