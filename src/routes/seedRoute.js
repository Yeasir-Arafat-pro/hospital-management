const { seedUserData, handlePing } = require('../controllers/seedController');

const seedRouter = require('express').Router();



seedRouter.get('/users', seedUserData)
seedRouter.get('/ping', handlePing)

module.exports = seedRouter