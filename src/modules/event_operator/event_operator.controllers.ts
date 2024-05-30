import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { EventOperatorLoginReqBody, EventOperatorRegisterReqBody } from './event_operator.requests'
import eventOperatorService from './event_operator.services'
import { ObjectId } from 'mongodb'
import { UserRole, UserVerifyStatus } from '~/constants/enums'
import { USER_MESSAGES } from '../user/user.messages'
import { EVENT_OPERATOR_MESSAGES } from './event_operator.messages'

export const registerEventOperatorController = async (
  req: Request<ParamsDictionary, any, EventOperatorRegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await eventOperatorService.register(req.body)

  return res.json({ message: EVENT_OPERATOR_MESSAGES.REGISTER_SUCCESS, data: result })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, EventOperatorLoginReqBody>,
  res: Response
) => {
  const user = req.user
  const user_id = user?._id as ObjectId
  const result = await eventOperatorService.login({
    user_id: user_id.toString(),
    verify_status: user?.verify_status as UserVerifyStatus,
    role: user?.role as UserRole
  })

  return res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}
