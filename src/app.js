const express = require('express')
const cors = require('cors')
const createErrors = require('http-errors')
const xssClean = require('xss-clean')
const rateLimit = require('express-rate-limit')
const cookies = require('cookie-parser')
const { errorResponse, successResponse } = require('./controllers/responseController')
const seedRouter = require('./routes/seedRoute')
const userRouter = require('./routes/userRoute')
const patientRoute = require('./routes/patientRoute')
const departmentRoute = require('./routes/departmentRoute')
const authRouter = require('./routes/authRoute')
const doctorRoute = require('./routes/doctorRoute')
const appointmentRoute = require('./routes/appointmentRoute')
const billingRoute = require('./routes/billingRoute')
const roomRoute = require('./routes/roomRoute')




const app = express()
app.use(cookies())
app.use(xssClean())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const rateLimiter = rateLimit({
    windowMs: 1*60*1000,
    max: 20,
    message: 'Too many request from this IP. please try agian later'
});

app.use(rateLimiter)

app.use(cors({
  origin: "http://localhost:5001", // তোমার ফ্রন্টএন্ডের URL
  origin: "http://localhost:5173", // তোমার ফ্রন্টএন্ডের URL
  credentials: true  // এটা না দিলে cookie পাঠাবে না
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  next();
});

app.use('/api/seed', seedRouter)
app.use('/api/users', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/patient', patientRoute)
app.use('/api/doctor', doctorRoute)
app.use('/api/department', departmentRoute)
app.use('/api/appointment', appointmentRoute)
app.use('/api/billing', billingRoute)
app.use('/api/room', roomRoute)



app.use((req,res,next)=>{
    next(createErrors(404, '404 route not found'));
})

app.use((err, req, res, next)=>{
    return errorResponse(res, {
        statusCode:err.status,
        message: err.message
    })
})



module.exports = app