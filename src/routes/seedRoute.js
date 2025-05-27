const { seedUserData } = require('../controllers/seedController');

const seedRouter = require('express').Router();



seedRouter.get('/users', seedUserData)

module.exports = seedRouter