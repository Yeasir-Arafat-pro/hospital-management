const createErrors = require('http-errors')

const data = require('../data');
const User = require('../models/usersModel');
const { successResponse } = require('./responseController');

const seedUserData = async (req, res, next) => { 
   try {
    await User.deleteMany()
    const users = await User.insertMany(data.users)

    if (!users) {
        throw createErrors(403, 'no seed data found')
    }

    successResponse(res, {
        statusCode: 200,
        message: 'Seed Data Insert Successfully',
        payload: users
    })
    
   } catch (error) {
       
       next(error)
    }
}

const handlePing = (req, res, next) => {
   try {
     const ping = new Date().toISOString()
    console.log('ping', ping)
    successResponse(res, {
        statusCode: 200,
        message: 'Seed Data Insert Successfully',
        payload: {ping}
    })
   } catch (error) {
       next(error)

    
   }
}

module.exports = {seedUserData, handlePing}