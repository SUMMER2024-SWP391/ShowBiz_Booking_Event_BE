import { ParamSchema, checkSchema } from 'express-validator'
import { USER_MESSAGES } from '~/modules/user/user.messages'
import databaseService from '~/database/database.services'
import { hashPassword } from '~/utils/crypto'
import { validate } from '~/utils/validation'
import { Request, Response, NextFunction } from 'express'
import { TokenPayload } from './user.requests'
import { UserRole, UserStatus } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { capitalize } from '~/utils/capitalize'
import { JsonWebTokenError } from 'jsonwebtoken'
import { env } from '~/config/environment'
import { StatusCodes } from 'http-status-codes'
import { REGEX_FPT_EMAIL, REGEX_PHONE_NUMBER_VIETNAM, SEARCH_NO_SPECIAL_CHARACTERS } from '~/constants/regex'
import userService from './user.services'

export const passwordSchema: ParamSchema = {
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

export const confirmPasswordSchema: ParamSchema = {
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

export const forgotPassWordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: StatusCodes.UNAUTHORIZED
        })
      }

      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        ;(req as Request).decoded_forgot_password_token = decoded_forgot_password_token
        const { user_id } = decoded_forgot_password_token as TokenPayload
        const user = await userService.findUserById(user_id)

        if (!user) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: StatusCodes.NOT_FOUND // 404
          })
        }

        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INCORRECT,
            status: StatusCodes.UNAUTHORIZED // 401
          })
        }
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

export const nameSchema: ParamSchema = {
  notEmpty: { errorMessage: USER_MESSAGES.NAME_IS_REQUIRED },
  isString: { errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING },
  trim: true,
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: USER_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  }
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: { options: { strict: true, strictSeparator: true } },
  errorMessage: USER_MESSAGES.DATE_OF_BIRTH_BE_ISO8601
}

const phoneNumberSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PHONE_NUMBER_IS_REQUIRED
  },
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!REGEX_PHONE_NUMBER_VIETNAM.test(value)) throw new Error(USER_MESSAGES.PHONE_NUMBER_IS_INVALID)

      const isExist = await userService.checkPhoneNumberExist(value)
      if (isExist) throw new Error(USER_MESSAGES.PHONE_NUMBER_ALREADY_EXIST)

      return true
    }
  }
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

            if ([UserStatus.BANNED, UserStatus.DELETE].includes(user?.status as UserStatus))
              throw new ErrorWithStatus({ message: USER_MESSAGES.UNAUTHORIZED, status: StatusCodes.UNAUTHORIZED })

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
      mssv: {
        custom: {
          options: async (value) => {
            const isExistMssv = await userService.checkMssvExist(value)
            if (isExistMssv) throw new Error(USER_MESSAGES.MSSV_ALREADY_EXISTED)

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const createNewUserValidator = validate(
  checkSchema(
    {
      user_name: { notEmpty: { errorMessage: USER_MESSAGES.NAME_IS_REQUIRED } },
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
      phone_number: phoneNumberSchema,
      date_of_birth: dateOfBirthSchema,
      role: {
        notEmpty: { errorMessage: USER_MESSAGES.ROLE_IS_REQUIRED },
        isNumeric: { errorMessage: USER_MESSAGES.ROLE_MUST_BE_A_NUMBER },
        isIn: {
          options: [UserRole],
          errorMessage: USER_MESSAGES.ROLE_MUST_BE_EITHER_VISITOR_STAFF_OR_ADMIN
        }
      }
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

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.decoded_authorization as TokenPayload
  const user = req.decoded_authorization as TokenPayload
  const dataUser = await userService.getUserById(user.user_id)

  //! Chỉ cần một trong hai điều kiện không passed thì nhận định thằng user đó chưa verified account luôn
  if (status !== UserStatus.VERIFIED || dataUser?.email_verify_token !== '') {
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

              const refresh_token = await userService.getRefreshToken(value)

              if (!refresh_token) {
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

export const verifyEmailTokenValidator = validate(
  checkSchema(
    {
      token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: StatusCodes.UNAUTHORIZED
              })
            }

            try {
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOrPublicKey: env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token
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
    ['query']
  )
)

export const updateAccValidator = validate(
  checkSchema({
    user_name: { optional: true },
    role: {
      optional: true,
      isNumeric: true,
      isIn: {
        options: [UserRole],
        errorMessage: USER_MESSAGES.ROLE_MUST_BE_EITHER_VISITOR_STAFF_OR_ADMIN
      }
    },
    date_of_birth: { ...dateOfBirthSchema, optional: true },
    phone_number: { ...phoneNumberSchema, optional: true },
    email: {
      optional: true,
      isEmail: true,
      custom: {
        options: async (value) => {
          const isExistEmail = await userService.checkEmailExist(value)
          if (isExistEmail) throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTED)

          return true
        }
      }
    },
    avatar: { optional: true },
    point: { optional: true },
    verify_status: {
      optional: true,
      isNumeric: true,
      isIn: {
        options: [UserStatus],
        errorMessage: USER_MESSAGES.VERIFY_STATUS_MUST_BE_EITHER_VERIFIED_OR_UNVERIFIED
      }
    },
    password: {
      optional: true,
      ...passwordSchema
    }
  })
)

export const registerEventOperatorMiddleware = validate(
  checkSchema(
    {
      user_name: nameSchema,
      phone_number: phoneNumberSchema,
      email: {
        isEmail: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await userService.checkEmailExist(value)
            if (isExistEmail) throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTED)

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const isUserRole = (arrayRole: UserRole[]) => async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.decoded_authorization?.user_id
  const user = await userService.getUserById(user_id as string)

  if (!arrayRole.includes(user?.role as UserRole)) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.UNAUTHORIZED,
      status: StatusCodes.FORBIDDEN
    })
  }
  next()
}

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USER_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.getUserByEmail(value)
            if (!user) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
              })
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateMeValidator = validate(
  checkSchema(
    {
      user_name: {
        optional: true,
        ...nameSchema
      },
      date_of_birth: {
        optional: true,
        ...dateOfBirthSchema
      }
      // avatar: {
      //   optional: true,
      //   isString: { errorMessage: USER_MESSAGES.IMAGE_URL_MUST_BE_A_STRING },
      //   trim: true,
      //   isLength: {
      //     options: { min: 1, max: 400 },
      //     errorMessage: USER_MESSAGES.IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400
      //   }
      // }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPassWordTokenSchema
    },
    ['query']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPassWordTokenSchema
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            const user = await userService.getUserById(user_id)

            if (!user) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
              })
            }

            if (user.password !== hashPassword(value)) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.OLD_PASSWORD_IS_INCORRECT,
                status: StatusCodes.UNAUTHORIZED
              })
            }
            return true
          }
        }
      },
      password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            if (value === req.body.old_password) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.PASSWORD_MATCHED_OLD_PASSWORD,
                status: StatusCodes.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      confirm_password: confirmPasswordSchema
    },
    ['body']
  )
)

export const searchEventMiddleware = validate(
  checkSchema(
    {
      search: {
        optional: true,
        isString: { errorMessage: USER_MESSAGES.SEARCH_MUST_BE_A_STRING },
        trim: true,
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USER_MESSAGES.SEARCH_LENGTH_MUST_BE_FROM_1_TO_100
        },
        matches: {
          options: SEARCH_NO_SPECIAL_CHARACTERS,
          errorMessage: USER_MESSAGES.SEARCH_NO_SPECIAL_CHARACTERS
        }
      }
    },
    ['query']
  )
)
