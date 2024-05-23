import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JsonWebTokenError } from 'jsonwebtoken'
import { USER_MESSAGES } from '~/modules/user/user.messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { capitalize } from './capitalize'

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: StatusCodes.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: StatusCodes.UNAUTHORIZED
    })
  }
}
