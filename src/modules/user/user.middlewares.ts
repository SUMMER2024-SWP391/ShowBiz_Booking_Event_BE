import { ParamSchema, checkSchema } from 'express-validator'
import { USER_MESSAGES } from '~/modules/user/user.messages'
import databaseService from '~/database/database.services'
import userService from '~/modules/user/user.services'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validation'
import { Request, Response, NextFunction } from 'express'
import { TokenPayload } from './user.requests'
import { UserVerifyStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'
import { verifyToken } from '~/utils/jwt'
import { capitalize } from '~/utils/capitalize'
import { JsonWebTokenError } from 'jsonwebtoken'
import { env } from '~/config/environment'

const passwordSchema: ParamSchema = {
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

const confirmPasswordSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED },
  isLength: {
    options: { min: 6, max: 50 },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) throw new Error(USER_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)

      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.NAME_IS_REQUIRED },
  isString: { errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING },
  trim: true,
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  },
  errorMessage: USER_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (email, { req }) => {
            const user = await databaseService.users.findOne({
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

export const registerValidator = validate(
  checkSchema(
    {
      user_name: nameSchema,
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await userService.checkEmailExist(value)
            if (isExistEmail) throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTED)

            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: StatusCodes.UNAUTHORIZED
              })
            }

            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOrPublicKey: env.JWT_SECRET_ACCESS_TOKEN as string
              })

              ;(req as Request).decoded_authorization = decoded_authorization
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: StatusCodes.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify_status } = req.decoded_authorization as TokenPayload
  if (verify_status !== UserVerifyStatus.VERIFIED) {
    return next(
      new ErrorWithStatus({
        message: USER_MESSAGES.USER_NOT_VERIFIED,
        status: StatusCodes.FORBIDDEN
      })
    )
  }
  next()
}

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            try {
              const decoded_refresh_token = await verifyToken({
                token: value,
                secretOrPublicKey: env.JWT_SECRET_REFRESH_TOKEN as string
              })
              const refresh_token = await databaseService.refresh_tokens.findOne({
                token: value
              })

              //check xem token này có tồn tại trong db ko ha
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: StatusCodes.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: capitalize((error as JsonWebTokenError).message),
                  status: StatusCodes.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
