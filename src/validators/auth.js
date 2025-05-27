const {body} = require('express-validator');

const validateUserRagistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({min:3,max:31})
        .withMessage('Name should be at-least 3-31 characters long'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Unvalid email.'),

    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password is required')
        .isLength({min:4})
        .withMessage('Password should be at-least 4 characters long')
        .matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{4,16}$/)
        .withMessage('Password should be Number, Letter & special charecter'),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone is required')
        .isLength({min:8})
        .withMessage('Phone should be at-least 8 characters long'),

    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required')
        .isLength({min:3})
        .withMessage('Address should be at-least 3 characters long'),


    
    body('image')
        .custom((value, {req})=>{
            if (!req.file || !req.file.buffer) {

                throw new Error('User image is required')

            }
            return true;
        })
        .withMessage('User image is required')

];


module.exports = {validateUserRagistration}
