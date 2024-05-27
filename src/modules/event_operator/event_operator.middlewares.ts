import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { confirmPasswordSchema, nameSchema, passwordSchema } from '../user/user.middlewares'
import { USER_MESSAGES } from '../user/user.messages'
import databaseService from '~/database/database.services'
import { hashPassword } from '~/utils/crypto'
import eventOperatorService from './event_operator.services'

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
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)
