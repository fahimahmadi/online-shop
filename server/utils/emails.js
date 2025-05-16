import nodemailer from "nodemailer";
import { createError } from "./errors.js";

export function verifyEmailTemplate(recipient_name, verify_token) {
  const { BASE_URL, PORT, APP, OWNER, ADDRESS } = process.env;
  if (!recipient_name || !verify_token)
    throw new Error(
      "Recipient's Name and token are required to send verification email."
    );

  const verificationLink = `${BASE_URL}:${PORT}/api/users/activate/${verify_token}`;
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Email Verification</title>
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
        }

    .btn {
        background-color: #28a745;
        color: white !important;
        padding: 12px 24px;
        text-decoration: none !important;
        border-radius: 5px;
        display: inline-block;
        margin-top: 20px;
        text-decoration: none;
        }
        
        #verify-link{
            border: 1px solid #888;
            border-radius: 3px;
            background: #FEF3E2;
            padding: 0.5em;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #888888;
        }
        #address{
        display: block;
        margin-top: 0.2em;
        }
        .footer span{
        margin-bottom: 0;   
        }
        </style>
    </head>
    <body>
        <div class="container">
        <h2>Welcome to ${APP || "OnlineShop"}!</h2>
        <p>Hi <strong>${recipient_name}</strong>,</p>
        <p>
            Thank you for registering at our store. To complete your registration,
            please verify your email address by clicking the button below:
        </p>

        <a class="btn" href="${verificationLink}" target="_blank"
            >Verify Email</a
        >
        <p>
            or copy the following link and <code>paste</code> it into the address
            bar of your browser.
        </p>
        <code id="verify-link">${verificationLink}</code>
        <p>If you did not create this account, you can ignore this email.</p>
        <div class="footer">
            <span id="year"></span>
            <span id="site">${OWNER || "John Doe"}</span>. All rights reserved.
            <span id="address">${ADDRESS || "Berlin Germany"}</span>
        </div>
        </div>

        <script>
        const current_year = new Date().getFullYear();
        const site_name = "MyOnlineShop";
        const address = "Düsseldorf, Deutschland";
        document.getElementById("year").textContent = current_year;
        document.getElementById("site").textContent = site_name;
        document.getElementById("address").textContent = address;
        </script>
    </body>
    </html>
         `;
}


/* confirm account activation */
export function confirmAccActivation(recipient_name){
      const { APP, OWNER, ADDRESS } = process.env;
    if (!recipient_name)
    throw new Error(
        "Recipient's Name is required to send confirmation email."
    );
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <title>Account Activation Confirmation</title>
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
                }
                .header {
                    text-align: center;
                    color: #28a745;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #888888;
                    text-align: center;
                }
                .footer span {
                    display: block;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 class="header">🎉 Account Activated Successfully!</h2>
                <p>Hi <strong>${recipient_name}</strong>,</p>
                <p>
                    Your account has been successfully activated. You can now log in and start using our services.
                </p>
                <p>
                    If you have any questions or need assistance, feel free to contact our support team.
                </p>
                <p>Thank you for choosing ${APP || "OnlineShop"}!</p>
                <div class="footer">
                    <span>&copy; ${new Date().getFullYear()} ${OWNER || "John Doe"}. All rights reserved.</span>
                    <span>${ADDRESS || "Berlin, Germany"}</span>
                </div>
            </div>
        </body>
        </html>
    `;
}

export async function sendEmail(email_to, email_subject, email_body) {
  try {
    /* function parameters */
    if(!email_to || !email_subject || !email_body)
        throw new Error("Email's data (to, subject, body) are required!")
    
    // required environment variables
    const {
      MAIL_SERVER_HOST,
      MAIL_SERVER_PORT,
      MAIL_SERVER_USER,
      MAIL_SERVER_PASSWORD,
    } = process.env;
    if (
      !MAIL_SERVER_HOST ||
      !MAIL_SERVER_PORT ||
      !MAIL_SERVER_USER ||
      !MAIL_SERVER_PASSWORD
    ) throw new Error("Missing required mail server environment variables.");

    /* setup nodemailer */
    const transporter = nodemailer.createTransport({
      host: MAIL_SERVER_HOST,
      port: MAIL_SERVER_PORT,
      secure: false,
      auth: {
        user: MAIL_SERVER_USER,
        pass: MAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: MAIL_SERVER_USER,
      to: email_to,
      subject: email_subject,
      html: email_body,
    };

    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);

    if (info.rejected.length !== 0)
      throw createError(500, "Failed to send email.");
    console.log("✅ Email sent:", info.messageId);
  
  } catch (error) {
    error.message = `❌ ${error.message}`;
    console.log(`Error: ${error.message}`);
    throw error;
  }
}
