import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { confirmPasswordSchema, nameSchema, passwordSchema } from '../user/user.middlewares'
import { EVENT_MESSAGES, USER_MESSAGES } from '../user/user.messages'
import databaseService from '~/database/database.services'
import { hashPassword } from '~/utils/crypto'
import eventOperatorService from './event_operator.services'
import eventService from '../event/event.services'
import userService from '../user/user.services'
import { UserRole } from '~/constants/enums'
import { canCheckIn, isToday } from '~/utils/common'

export const registerEventOperatorValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await eventOperatorService.checkEmailExist(value)
            if (isExistEmail) throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTED)

            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (email, { req }) => {
            const user = await databaseService.event_operators.findOne({
              email,
              password: hashPassword(req.body.password)
            })

            if (!user) throw new Error(USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            req.user = user

            return true
          }
        }
      },
      password: {
        notEmpty: { errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED },
        isLength: {
          options: { min: 6, max: 50 },
          errorMessage: USER_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const assignCheckingStaffValidator = validate(
  checkSchema(
    {
      event_id: {
        notEmpty: { errorMessage: EVENT_MESSAGES.EVENT_ID_IS_REQUIRED },
        isMongoId: { errorMessage: EVENT_MESSAGES.EVENT_ID_IS_INVALID },
        custom: {
          options: async (value) => {
            const isExistEvent = await eventService.checkEventExist(value)
            if (!isExistEvent) throw new Error(EVENT_MESSAGES.EVENT_NOT_FOUND)

            return true
          }
        }
      },
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.getUserByEmail(value)
            if (!user) throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
            if (user.role !== UserRole.Visitor && user.role !== UserRole.CheckingStaff)
              throw new Error(USER_MESSAGES.ROLE_IS_NOT_VISITOR_OR_CHECKING_STAFF)
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const checkInValidator = validate(
  checkSchema(
    {
      otp_check_in: {
        custom: {
          options: async (value, { req }) => {
            const { otp_check_in } = req.body
            const result = await databaseService.registers.findOne({ otp_check_in })

            if (!result) throw new Error('WRONG_OTP_CHECK_IN')

            if (result.status_check_in) throw new Error('ALREADY_CHECKED_IN')

            const event = await eventService.getEventById(result.event_id.toString())
            console.log('🚀 ~ event:', event)

            // người checkin chỉ có thể check in trước 30 phút so với thời gian bắt đầu của event
            if (!isToday(event.date_event)) {
              throw new Error('The event does not occur today!')
            }

            // chỉ được check in trước 30 phút so với thời gian bắt đầu của event
            if (canCheckIn(event.time_start)) {
              throw new Error('You can only check in 30 minutes before the event starts!')
            }
              
            return true
          }
        }
      }
    },
    ['params']
  )
)
