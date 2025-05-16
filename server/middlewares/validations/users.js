import {body} from 'express-validator';
import { User } from '../../models/users.js';
import { validate } from './helper.js';

export const validateRegisterData = [
    body("name")
        .trim()
        .escape()
        .notEmpty().withMessage("Name is required")
        .matches(/^[a-zA-Z\s]+$/).withMessage("Invalid name"),
    body("email")
        .trim()
        .escape()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address")
        .custom(async(value)=>{
            const user = await User.findOne({email: value});
            if(user) throw new Error("This email is already in use")
            return true
        }),
    body("password")
        .trim()
        .escape()
        .notEmpty().withMessage("Password is required")
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,    
        }).withMessage("Password is not strong"),
    
    validate
]