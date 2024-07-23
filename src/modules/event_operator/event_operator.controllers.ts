import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateCheckingStaffReqBody,
  EventOperatorLoginReqBody,
  EventOperatorRegisterReqBody,
  InviteUserReqBody
} from './event_operator.requests'
import eventOperatorService from './event_operator.services'
import { ObjectId } from 'mongodb'
import { UserRole, UserStatus } from '~/constants/enums'
import { EVENT_OPERATOR_MESSAGES, USER_MESSAGES } from '../user/user.messages'
import checkingStaffServices from '../checking_staff/checking_staff.services'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'
import eventService from '../event/event.services'

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
    status: user?.status as UserStatus,
    role: user?.role as UserRole
  })

  return res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}

export const assignCheckingStaffController = async (
  req: Request<ParamsDictionary, any, CreateCheckingStaffReqBody>,
  res: Response
) => {
  const user = req.user
  const user_id = user?._id as ObjectId
  const event_id = new ObjectId(req.body.event_id)
  const event_operator_id = new ObjectId(req.decoded_authorization?.user_id)

  const checkingEventOwner = await eventOperatorService.checkEventOwner(event_id, event_operator_id)
  if (!checkingEventOwner)
    throw new ErrorWithStatus({
      message: EVENT_OPERATOR_MESSAGES.EVENT_OPERATOR_IS_NOT_OWNER,
      status: StatusCodes.FORBIDDEN
    })

  const checkDuplkicate = await checkingStaffServices.checkDuplicateCheckingStaff(event_id, user_id)
  if (checkDuplkicate)
    throw new ErrorWithStatus({
      message: EVENT_OPERATOR_MESSAGES.CHECKING_STAFF_ALREADY_ASSIGNED,
      status: StatusCodes.CONFLICT
    })

  const result = await eventOperatorService.assignCheckingStaff(event_id, user_id)

  return res.json({ message: EVENT_OPERATOR_MESSAGES.CREATE_CHECKING_STAFF_SUCCESS, data: result })
}

export const listCheckingStaffController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const event_id = new ObjectId(req.params.eventId)
  const event_operator_id = new ObjectId(req.decoded_authorization?.user_id)
  const checkingEventOwner = await eventOperatorService.checkEventOwner(event_id, event_operator_id)
  if (!checkingEventOwner)
    throw new ErrorWithStatus({
      message: EVENT_OPERATOR_MESSAGES.EVENT_OPERATOR_IS_NOT_OWNER,
      status: StatusCodes.FORBIDDEN
    })

  const result = await eventOperatorService.listCheckingStaff(event_id)

  if (!result.length) {
    return res.json({ message: EVENT_OPERATOR_MESSAGES.DOES_NOT_HAVE_CHECKING_STAFF, data: { result: [] } })
  }

  return res.json({ message: EVENT_OPERATOR_MESSAGES.LIST_CHECKING_STAFF_SUCCESS, data: { result } })
}

export const unassignCheckingStaffController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const event_id = new ObjectId(req.params.eventId)
  const checking_staff_id = new ObjectId(req.params.checkingStaffId)
  const event_operator_id = new ObjectId(req.decoded_authorization?.user_id)
  const checkingEventOwner = await eventOperatorService.checkEventOwner(event_id, event_operator_id)
  if (!checkingEventOwner)
    throw new ErrorWithStatus({
      message: EVENT_OPERATOR_MESSAGES.EVENT_OPERATOR_IS_NOT_OWNER,
      status: StatusCodes.FORBIDDEN
    })

  const result = await eventOperatorService.unassignCheckingStaff(event_id, checking_staff_id)

  return res.json({ message: EVENT_OPERATOR_MESSAGES.UNASSIGN_CHECKING_STAFF_SUCCESS, data: result })
}
export const getListRegisterEventController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const event_operator_id = new ObjectId(req.decoded_authorization?.user_id)
  const result = await eventService.getListRegisterEvent(event_operator_id)

  return res.json({ message: EVENT_OPERATOR_MESSAGES.GET_LIST_REGISTER_EVENT_SUCCESS, data: result })
}

export const inviteUserController = async (req: Request<ParamsDictionary, any, InviteUserReqBody>, res: Response) => {
  const { event_id } = req.params
  const { email, user_name } = req.body
  const event = await eventService.getEventById(event_id)
  //ban mail o day
  res.json({
    message: EVENT_OPERATOR_MESSAGES.INVITE_USER_SUCCESS
  })
}
