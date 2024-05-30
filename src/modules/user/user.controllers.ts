import { verify } from 'crypto'
import { NextFunction, Request, Response } from 'express'
import {
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody
} from '~/modules/user/user.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import userService from '~/modules/user/user.services'
import { USER_MESSAGES } from '~/modules/user/user.messages'
import { ObjectId } from 'mongodb'
import User from '~/modules/user/user.schema'
import { UserRole, UserVerifyStatus } from '~/constants/enums'
import { env } from '~/config/environment'
import { find } from 'lodash'
import { Token } from 'node_modules/yaml/dist/parse/cst'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const userInfor = await userService.findUserById(user_id.toString())
  const result = await userService.login({
    user_id: user_id.toString(),
    verify_status: user.verify_status as UserVerifyStatus,
    role: user.role as UserRole
  })

  res.json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    result,
    user: {
      user_id: user_id.toString(),
      user_name: userInfor?.user_name,
      role: UserRole[userInfor?.role as number],
      status: userInfor?.status
    }
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await userService.oauth(code as string)
  const urlRedirect = `${env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.verify_status}`

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
  await userService.logout(refresh_token)

  return res.json({ message: USER_MESSAGES.LOGOUT_SUCCESS })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload

  const result = await userService.verifyEmail(user_id)
  return res.json({ message: USER_MESSAGES.EMAIL_VERIFIED, result })
}
