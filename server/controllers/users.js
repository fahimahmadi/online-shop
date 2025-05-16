import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {User, VToken } from "../models/users.js";
import { confirmAccActivation, sendEmail, verifyEmailTemplate } from "../utils/emails.js";
import { createError } from '../utils/errors.js';

export const register = async(req, res, next) => {
    try {
        const {name, email, password} = req.body;
        const new_user = new User({name, email, password});
        const new_token = new VToken({
            userId: new_user._id,
            token: `${new_user._id}.${crypto.randomBytes(32).toString("hex")}`,
        })

        if(new_user && new_token){
            /* Email verification */
            const email_to = email;
            const email_subject = "Verify Your Account 🔎";
            const email_body = verifyEmailTemplate(name, new_token.token);
            await sendEmail(email_to, email_subject, email_body)
            
            /* create new_user and Vtoken */
            await new_user.save();
            await new_token.save();

            res.status(201).json({
                message: "user registered successfully",
                user: new_user,
                token: new_token
            });
        }
    } catch (error) {
        next(error)
    }
}
/* --------------------- . -------------------- */

export const activateAccount = async(req, res, next) => {
    const {FE_BASE_URL, APP} = process.env;
    try {
      const token_param = req.params.token;
      if (!token_param) throw createError(400, "Activation token is required");
      /* evaluate given token */
      const activation_token = await VToken.findOne({ token: token_param });
      if (!activation_token) throw createError(400, "Invalid activation token");

      /* find related user */
      const user = await User.findById(activation_token.userId);
      if (!user) throw createError(400, "Token is not valid anymore");

      /* activate user */
      user.isActive = true;
      await user.save();

      /* delete activation token */
      await VToken.findByIdAndDelete(activation_token._id);

      /* email about activation done */
      const email_to = user.email;
      const email_subject = "Your Account Activated Successfully 🎉";
      const email_body = confirmAccActivation(user.name);
      await sendEmail(email_to, email_subject, email_body);

      /* send HTML response */
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>Account Activated</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    background-color: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0px 0px 10px #cccccc;
                    text-align: center;
                }
                .header {
                    color: #28a745;
                }
                .button {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #28a745;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #888888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="header">🎉 Account Activated Successfully!</h1>
                <p>Hi <strong>${user.name}</strong>,</p>
                <p>Your account has been successfully activated. You can now log in and start using our services.</p>
                <a href="${FE_BASE_URL}/login" class="button">Go to Login</a>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} ${
                        APP || "OnlineShop"}. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
        console.log(FE_BASE_URL)
      res.status(200).send(htmlResponse);
    } catch (error) {
        next(error)
    }
}
/* --------------------- . -------------------- */

export const login = async(req, res, next) => {
    try {
        const { email, password } = req.body;
        const { JWT_SECRET, NODE_ENV } = process.env;

        /* looking for user */
        const user = await User.findOne({email, isActive: true});
        if(!user) throw createError(401, "Invalid credentials provided")

        /* compare password */
        if(!await user.comparePassword(password))
            throw createError(401, "Invalid credentials provided")


        /* create jwt */
        const token = jwt.sign(user.getUserPayload(), JWT_SECRET, { expiresIn: '1d'})

        /* setup cookie on response */
        res.status(200).cookie("jwt", token, {
            httpOnly: true,
            secure: NODE_ENV === "production",
            expiresIn: new Date(Date.now() + 1000*60*60*24)
        }).json({ 
            message: "logged in successfully",
            user: user.getUserPayload()
        });

    } catch (error) {
        next(error)
    }
}



export const example = async(req, res, next) => {
    try {
        
    } catch (error) {
        next(error)
    }
}


