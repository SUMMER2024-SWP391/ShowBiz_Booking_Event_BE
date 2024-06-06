import { env } from '~/config/environment'
import MailTemplate from './mail.type'
import Event from '~/modules/event/event.schema'
import User from '~/modules/user/user.schema'

export const templateVerifyAccount = (email: string, verify_token: string): MailTemplate => {
  return {
    from: `${env.EMAIL_USER}`,
    to: `${email}`,
    subject: '[Booking-Event] Please Verify Your Email 🔑 🎉',
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
  }
}

export const templateRegisterEvent = (event: Event, qrcode: string, user: User): MailTemplate => {
  return {
    from: `${env.EMAIL_USER}`,
    to: `${user.email}`,
    subject: `[Booking-Event] Bạn đã đăng ký ${event.name} thành công 🔑 🎉`,
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
                <div class="ahihi-header" 
                      style="background-color: #4CAF50;
                      color: white;
                      padding: 20px;
                      text-align: center;">
                    <h2>Đăng ký rồi đó ahihi</h2>
                </div>
                <div class="email-content" style="padding: 20px">
                    <p style= "color: black; line-height: 1.6">Hi ${user.email},<br>
                    Cảm ơn ${user.user_name} đã đăng ký tại event tại [Booking event web]!<br>
                    Thông tin về sự kiện:<br>
                    Tên sự kiện: ${event.name}<br>
                    Địa điểm: ${event.location}<br>
                    Thời gian: ${event.date_event}<br>
                    Thời gian : ${event.time_start} - ${event.time_end}<br>
                    </p>
                    <div style="display : flex">
                      <div style="width: 200px,height : 200px">
                        <img src="${qrcode}" alt="QRCode" style="width: 100%; height: 100%">
                      </div>
                    </div>
                    <br>
                </div>
            </div>
        </body>
        `
  }
}
