import { log } from 'console'
import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

export async function sendEmail(email: string, verify_token: string) {
  log('\nSending email to', email + '...\n')
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  await transporter.sendMail(
    {
      from: `${process.env.EMAIL_USER}`,
      to: `${email}`,
      subject: '[Booking-event] Please Verify Your Email 🔑 🎉',
      html: `<body style="font-family: Arial, sans-serif;
            margin: 30px 0;
            padding: 0;
            background-color: #ffffff;">
          <div class="email-container" style="max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border: 1px solid #dddddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
              <div class="email-header" 
                    style="background-color: #4CAF50;
                    color: white;
                    padding: 20px;
                    text-align: center;">
                  <h2>Email verification</h2>
              </div>
              <div class="email-content" style="padding: 20px">
                  <p style= "color: black; line-height: 1.6">Hi ${email},<br>
                  Thanks for getting started with our [Booking event web]!<br>
                  We need a little more information to complete your registration, including a confirmation of your email address.<br>
                  Click below to confirm your email address:</p>
                  <br>
                  <button style="
                    position: relative;
                    padding: 10px 22px;
                    border-radius: 6px;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    background-color: #ff942b;
                    text-decoration: none;
                    transition: all 0.2s ease;">
                    <a style="text-decoration: none; color: white" href="${env.DB_HOST}:${env.PORT}/users/verify-email?token=${verify_token}">Verify Email Address</a>
                  </button>
              </div>
          </div>
      </body>
      `
    },
    (error) => {
      if (error) {
        console.log(error)
        throw new Error('Error sending email')
      }
    }
  )
}
