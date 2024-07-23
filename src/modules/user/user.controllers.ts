import { NextFunction, Request, Response } from 'express'
import {
  ChangePasswordReqBody,
  EventOperatorRegisterReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqBody
} from '~/modules/user/user.requests'
import { ParamsDictionary } from 'express-serve-static-core'
import userService from '~/modules/user/user.services'
import { EVENT_OPERATOR_MESSAGES, USER_MESSAGES } from '~/modules/user/user.messages'
import { ObjectId } from 'mongodb'
import User from '~/modules/user/user.schema'
import { UserRole, UserStatus } from '~/constants/enums'
import { env } from '~/config/environment'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'
import { hashPassword } from '~/utils/crypto'
import registerService from '../register/register.services'
import checkingStaffServices from '../checking_staff/checking_staff.services'
import eventService from '../event/event.services'
import { sendEmail } from '../sendMail/sendMailService'
import { templateRegisterAccountSuccess } from '~/constants/template-mail'
import { CheckInBody } from '../event_operator/event_operator.requests'
import { isErrorUnauthhoriztionn } from '~/utils/common'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login({
    user_id: user_id.toString(),
    status: user.status as UserStatus,
    role: user.role as UserRole
  })

  const listEvent = await checkingStaffServices.listEventOfStaff(user_id.toString())
  return res.json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    data: {
      result,
      user: {
        user_id: user_id.toString(),
        user_name: user?.user_name,
        role: user.role as UserRole,
        verify: user?.status
      },
      listEvent
    }
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const result = await userService.oauth(code as string)
  // if (isErrorUnauthhoriztionn(result)) {
  //   const urlRedirect = `${env.CLIENT_REDIRECT_LOGIN_GOOGLE_ERROR}?error=${result.message}`
  //   return res.redirect(urlRedirect)
  // }
  const listEvent = await checkingStaffServices.listEventOfStaff(String(result?.user_id))
  const urlRedirect = `${env.CLIENT_REDIRECT_CALLBACK}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}&verify=${result.status}&role=${result.user_role}&user_id=${result.user_id}&user_name=${result.user_name}&isStaff=${listEvent.length != 0 ? 'true' : 'false'}`
  console.log(listEvent.length)
  return res.redirect(urlRedirect)
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  await userService.register(req.body)

  return res.json({
    message: USER_MESSAGES.REGISTER_SUCCESS
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)

  return res.json(result)
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await userService.findUserById(user_id)

  if (!user) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.USER_NOT_FOUND,
      status: StatusCodes.NOT_FOUND
    })
  }

  if (user.status === UserStatus.VERIFIED && user.email_verify_token === '') {
    return res.json({ message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
  }

  if (user.email_verify_token !== req.query?.token) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: StatusCodes.BAD_REQUEST
    })
  }

  await userService.verifyEmail(user_id)
  return res.redirect(env.CLIENT_REDIRECT_VERIFY_SUCCESS as string)
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
  return res.json(result)
}

export const registerEventOperatorController = async (
  req: Request<ParamsDictionary, any, EventOperatorRegisterReqBody>,
  res: Response
) => {
  const user = await userService.registerEventOperator(req.body)
  const template = templateRegisterAccountSuccess(user as User)
  await sendEmail(template)

  return res.json({ message: USER_MESSAGES.CREATE_EVENT_OPERATOR_SUCCESS })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { _id } = req.user as User
  const result = await userService.forgotPassword((_id as ObjectId).toString())

  return res.json(result)
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.getMe(user_id)

  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    data: {
      user: result
    }
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { body } = req
  const result = await userService.updateMe(user_id, body)

  return res.json({ message: USER_MESSAGES.UPDATE_ME_SUCCESS, result })
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  const { forgot_password_token } = req.query
  const urlRedirect = `${env.CLIENT_REDIRECT_RESET_PASSWORD}?token=${forgot_password_token}`
  // console.log('🚀 ~ urlRedirect:', urlRedirect)

  return res.redirect(urlRedirect)
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const user = await userService.findUserById(user_id)
  const password = req.body.password
  if (hashPassword(password) === user.password) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.PASSWORD_ALREADY_EXISTED,
      status: StatusCodes.BAD_REQUEST
    })
  }
  const result = await userService.resetPassword(user_id, password)

  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await userService.changePassword(user_id, req.body.password)

  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  const { user_id, status } = req.decoded_refresh_token as TokenPayload
  const result = await userService.refreshToken({ refresh_token, user_id, status })

  return res.json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
    data: result
  })
}

export const getListRegisterEventController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await registerService.getListRegisterEventByUserId(user_id)

  return res.json({
    message: USER_MESSAGES.GET_LIST_REGISTER_EVENT_SUCCESS,
    data: {
      events: result
    }
  })
}

export const checkInController = async (req: Request<ParamsDictionary, any, CheckInBody>, res: Response) => {
  const { eventId } = req.params
  const { otp_check_in } = req.body
  const result = await registerService.checkIn(eventId, otp_check_in)

  return res.json(result)
}

export const searchEventController = async (req: Request, res: Response) => {
  const { eventName } = req.query
  const result = await eventService.searchEvent(eventName as string)

  return res.json(result)
}

export const getListVisitorController = async (req: Request, res: Response) => {
  const result = await userService.getListVisitor()
  console.log(result)

  return res.json({
    message: USER_MESSAGES.GET_LIST_VISITOR_EVENT_SUCCESS,
    data: result
  })
}

export const getListEventOperatorController = async (req: Request, res: Response) => {
  const result = await userService.getListEventOperator()

  return res.json({
    message: USER_MESSAGES.GET_LIST_EVENT_OPERATOR_EVENT_SUCCESS,
    data: result
  })
}

export const getListCheckingStaffController = async (req: Request, res: Response) => {
  const result = await userService.getListCheckingStaff()

  return res.json({
    message: USER_MESSAGES.GET_LIST_CHEKCING_STAFF_EVENT_SUCCESS,
    data: result
  })
}
export const cancelEventRequestController = async (req: Request, res: Response) => {
  const { eventId } = req.params
  const result = await eventService.cancelEventRequest(eventId)

  return res.json(result)
}

export const getTicketByIdController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await registerService.getTicketById(id)
  const [user, event] = await Promise.all([
    userService.findUserById(String(result?.visitor_id)),
    eventService.getEventById(String(result?.event_id))
  ])

  const ticket = { ...result, user, event }
  return res.json({
    message: USER_MESSAGES.GET_TICKET_SUCCESS,
    data: {
      ticket
    }
  })
}

export const listRegisteredVisistorController = async (req: Request, res: Response) => {
  const { eventId } = req.params
  const result = await registerService.getListRegisteredVisistorByEventOperator(eventId)
  return res.json({
    message: EVENT_OPERATOR_MESSAGES.GET_LIST_REGISTERED_VISITOR_SUCCESS,
    data: result
  })
}
