import { NextFunction, Request, Response } from 'express'
import {
  EventOperatorRegisterReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqBody
} from '~/modules/user/user.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import userService from '~/modules/user/user.services'
import { USER_MESSAGES } from '~/modules/user/user.messages'
import { ObjectId } from 'mongodb'
import User from '~/modules/user/user.schema'
import { UserRole, UserStatus } from '~/constants/enums'
import { env } from '~/config/environment'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({
    user_id: user_id.toString(),
    status: user.status as UserStatus,
    role: user.role as UserRole
  })

  return res.json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    data: {
      result,
      user: {
        user_id: user_id.toString(),
        user_name: user?.user_name,
        role: user.role as UserRole,
        verify: user?.status
      }
    }
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await userService.oauth(code as string)
  const urlRedirect = `${env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.status}&role=${result.user_role}&user_id=${result.user_id}&user_name=${result.user_name}`

  return res.redirect(urlRedirect)
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)

  return res.json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)

  return res.json({ result })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await userService.findUserById(user_id)
  if (!user) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.USER_NOT_FOUND,
      status: StatusCodes.NOT_FOUND // 404
    })
  }

  if (user.status === UserStatus.VERIFIED && user.email_verify_token === '') {
    return res.json({ message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
  }

  if (user.email_verify_token !== req.query?.token) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: StatusCodes.BAD_REQUEST // 400
    })
  }

  const result = await userService.verifyEmail(user_id)

  return res.json({ message: USER_MESSAGES.EMAIL_VERIFIED, result })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.findUserById(user_id)

  if (!user) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.USER_NOT_FOUND,
      status: StatusCodes.NOT_FOUND
    })
  }

  if (user.status === UserStatus.BANNED) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.USER_BANNED,
      status: StatusCodes.UNAUTHORIZED
    })
  }

  const result = await userService.resendVerifyEmail(user_id, user.email)

  return res.json({ result })
}

export const registerEventOperatorController = async (
  req: Request<ParamsDictionary, any, EventOperatorRegisterReqBody>,
  res: Response
) => {
  await userService.registerEventOperator(req.body)

  return res.json({ message: USER_MESSAGES.CREATE_EVENT_OPERATOR_SUCCESS })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { _id } = req.user as User
  const result = await userService.forgotPassword((_id as ObjectId).toString())

  return res.json({ result })
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.getMe(user_id)

  return res.json(result)
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await userService.updateMe(user_id, body)

  return res.json({
    message: USER_MESSAGES.UPDATE_ME_SUCCESS,
    result
  })
}
