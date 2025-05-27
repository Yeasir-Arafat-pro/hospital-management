const createError = require('http-errors')
const cookies = require('cookie-parser')
const bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');
const User = require('../models/usersModel');
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
const { createJSONwebToken } = require('../helper/createJsonWebtoken');
const { clientUrl, NODE_ENV } = require('../secret');

const handleLogin = async (req, res, next) => {

    try {
        // email, password req.body
        const{email, password} = req.body
        
        //isExists
        const user = await User.findOne({email})
        if (!user) {
            throw createError(404, 'user does not exists with this email, please register first')
        }
        
        //compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            throw createError(404, 'Email & Password does not match')
        }
        
        //isBanned
        if (user.isBanned) {
            throw createError(404, 'You are banned, please contact authority')
        }
        const accessToken =  createJSONwebToken({user},'accessToken', '2h')
        const refreshToken =  createJSONwebToken({user},'refreshToken', '7d')
        
        
        console.log('accesstoken', accessToken);
        
        
        res.cookie("accessToken", accessToken, {
            maxAge: 2 * 60 * 60 * 1000, // 2 hours
            httpOnly: NODE_ENV === 'production' ? true : false, // XSS আক্রমণ প্রতিরোধ (সাধারণত true রাখা ভালো)
            secure: NODE_ENV === 'production' ? true : false, // Production এ HTTPS বাধ্যতামূলক
            sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // Cross-site জন্য 'none'
           //// domain: NODE_ENV === 'production' ? '.onrender.com' : 'localhost' // ডোমেইন স্পেসিফাই করুন
        });
        
        //sameSite: 'none' ব্যবহার করলে অবশ্যই secure: true দিতে হবে
        //লোকাল ডেভেলপমেন্টে (http://localhost) secure: false রাখতে হলে sameSite: 'lax' ব্যবহার করুন
        
        //token cookie
        
        //  res.cookie("accessToken", accessToken, {
            //     maxAge: 2*60*60*1000, //2 hours
            //     httpOnly: false,
            //     secure: false,
            //     sameSite: 'lax'
            //  })
            
            //create refresh token
            
            //set cookie
            res.cookie("refreshToken", refreshToken, {
                 maxAge:  24 * 60 * 60 * 1000,
                httpOnly: NODE_ENV === 'production' ? true : false, // XSS আক্রমণ প্রতিরোধ (সাধারণত true রাখা ভালো)
                secure: NODE_ENV === 'production' ? true : false, // Production এ HTTPS বাধ্যতামূলক
                sameSite: NODE_ENV === 'production' ? 'None' : 'Lax', // Cross-site জন্য 'none'
              ////  domain: NODE_ENV === 'production' ? '.onrender.com' : 'localhost' // ডোমেইন স্পেসিফাই করুন
            })
            
            //  res.cookie("refreshToken", refreshToken, {
                //     maxAge: 7*24*60*60*1000, // 7days
                //     httpOnly: true,
                //     //secure: true,
                //     sameSite: 'lax'
                //  })
                
                const userWithoutPassword = user.toObject()
                delete userWithoutPassword.password;
                
                console.log('asdsf', email);
                console.log(userWithoutPassword);
                
        successResponse(res, {
            statusCode: 200,
            message: "user loggedin successfully",
            payload: {userWithoutPassword }
        })
    } catch (error) {
        console.error('login error: ', error)
        next(error)
    }
}

const handleLogout= async (req, res, next) => {

    try {

         res.clearCookie("accessToken")
         res.clearCookie("refreshToken")
        successResponse(res, {
            statusCode: 200,
            message: "user logged out successfully",
            payload: { }
        })
    } catch (error) {
        next(error)
    }
}

const handleRefreshToken = async (req, res, next) => {

    try {
     
       const oldRefreshToken =  req.cookies.refreshToken

      const decodeToken = jwt.verify(oldRefreshToken, 'refreshToken')
      if (!decodeToken) {
        throw createError(404, 'refresh token not found')
      }

      const user = decodeToken.user
       
        //create json web token (jwt)
         const accessToken =  createJSONwebToken({user},'accessToken', '10m')
        //set cookie
         res.cookie("accessToken", accessToken, {
            maxAge: 1*60*1000, //1 min
            httpOnly: true,
            //secure: true,
            sameSite: 'none'
         })
        successResponse(res, {
            statusCode: 200,
            message: "Acces token generate successfully",
        payload: {user}
        })
    } catch (error) {
        next(error)
    }
}

const handleProtectedRoute = async (req, res, next) => {

    try {
     
       const Token =  req.cookies.accessToken

      const decodeToken = jwt.verify(Token, 'accessToken')

      if (!decodeToken) {
        throw createError(404, 'Invalid access token. Please login again')
      }

        successResponse(res, {
            statusCode: 200,
            message: "Protected Resources access successfully"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {handleLogin, handleLogout, handleRefreshToken, handleProtectedRoute}