const mongoose = require('mongoose');
const { mongodbURL, NODE_ENV } = require('../secret');
const localUrl = 'mongodb://localhost:27017/hospitalManagementDB'

const connectDB = async ()=>{
    try {
      const url = NODE_ENV === 'production' ? mongodbURL : localUrl
      await  mongoose.connect(url)
      console.log('✅ db is connected');
      mongoose.connection.on('error', (error)=>{
        console.error('DB connetion error:  ', error)
      })
    } catch (error) {
        console.error('❌ db is not connect:  ', error.toString());
        
    }
}

module.exports = connectDB