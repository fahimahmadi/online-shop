import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import { handle_404, handleErrors } from './middlewares/errors.js';
import { sendEmail, verifyEmailTemplate } from './utils/emails.js';
import usersRouter from './routers/users.js';
import { con2db } from './utils/db.js';

/* ------------------ Others ------------------ */
dotenv.config({ path: `.env.${process.env.NODE_ENV}`})

/* ---------------- create app ---------------- */
const app = express();

/* ---------------- middlewares --------------- */
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

/* ------------------ routers ----------------- */
app.use('/api/users', usersRouter);
app.get("/sendemail", async function(req, res, next) {
    try {
        
        await sendEmail(
          "a.fahimahmadi@gmail.com",
          "Verify Your Account 🔎",
          verifyEmailTemplate("Fahim Ahmadi", "34082394203498230948230493248")
        );

        res.send("got your request")
    } catch (error) {
        next(error)
    }
})

/* -------------- error handlers -------------- */
app.use(handle_404());
app.use(handleErrors());

/* --------------- start server --------------- */
const startServer = async()=>{
    try {
      /* ------------ database connection ----------- */
      console.log("connecting to db...");
      await con2db();

      /* ------------------- port ------------------- */
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, ()=> console.log(`✅ Server is running on: ${process.env.BASE_URL}:${PORT}`));

    } catch (error) {
      console.error("❌ Failed to start the server:", error.message);
      process.exit(1); // Exit the process if the database connection fails
    }
}

startServer();