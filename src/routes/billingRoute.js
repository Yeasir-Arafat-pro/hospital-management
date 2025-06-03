const billingRoute = require('express').Router();

const { handleCreateBilling, handleGetAllBillings, handleGetBillingById, handleUpdateBillingById, handleDeleteBillingById } = require('../controllers/billingContrtoller');
// controller
const { isLoggedIn } = require('../middlewire/auth');



billingRoute.put('/edit/:id', handleUpdateBillingById)
billingRoute.delete('/:id',  handleDeleteBillingById)
billingRoute.get('/:id',  handleGetBillingById)
billingRoute.post('/create', handleCreateBilling)
billingRoute.get('/', handleGetAllBillings)



module.exports = billingRoute