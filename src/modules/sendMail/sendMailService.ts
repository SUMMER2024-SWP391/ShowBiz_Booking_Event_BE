import nodemailer from 'nodemailer'
import { env } from '~/config/environment'
import MailTemplate from '~/constants/mail.type'

export async function sendEmail(templateMail: MailTemplate) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD
    }
  })

  await transporter.sendMail(templateMail, (error) => {
    if (error) {
      console.log(error)
      throw new Error('Error sending email')
    }
  })
}
