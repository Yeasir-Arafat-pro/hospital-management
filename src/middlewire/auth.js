const createError = require('http-errors')
var jwt = require('jsonwebtoken');

//keepyoursecretKey
const isLoggedIn = async (req, res, next) => {

    try {

        
    // is access token
    const token = req.cookies.accessToken
  
    
    if (!token) {
        throw createError(404, 'access token not found. Please login')
    }
    // decode jwt token
    const decode = jwt.verify(token, 'accessToken')
    //is decode
    if (!decode) {
        throw createError(404,'you are not logged in, please login first')    
    }
req.user = decode.user
    
next()

    // next mid
    } catch (error) {
        return next(error)
    }


}

const isLoggedOut = async (req, res, next) => {

    try {
            // is access token

            
    const token = req.cookies.accessToken

    if (token) {
        try {
            const decode = jwt.verify(token, 'accessToken')
            if (decode) {
                throw createError(404, 'User already logged in')                
            }
        } catch (error) {
            throw error
        }
    }
   
    
next()

    // next mid
    } catch (error) {
        return next(error)
    }

}

const isAdmin = async (req, res, next) => {

    try {

        const user = req.user
        if (!user.isAdmin) {
            throw createError(403, 'forbidden. you are must be admin for this access resource')
        }
        

    next()

    // next mid
    } catch (error) {
        return next(error)
    }

}

module.exports = {isLoggedIn, isLoggedOut, isAdmin}

