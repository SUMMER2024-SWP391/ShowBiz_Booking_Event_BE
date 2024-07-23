import { Request, Response } from 'express'
import userService from '../user/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { confirmEventReqBody, createAccountReqBody, updateAccountReqBody } from './account.request'
import { EVENT_MESSAGES, USER_MESSAGES } from '../user/user.messages'
import { StatusCodes } from 'http-status-codes'
import { ErrorWithStatus } from '~/models/Errors'
import { UserRole } from '~/constants/enums'
import eventService from '../event/event.services'

export const createAccountController = async (
  req: Request<ParamsDictionary, any, createAccountReqBody>,
  res: Response
) => {
  const result = await userService.createAccount(req.body)

  return res.json({ message: USER_MESSAGES.CREATE_ACCOUNT_SUCCESS, result })
}

// Update account dành cho admin by id
export const updateAccountController = async (
  req: Request<ParamsDictionary, any, updateAccountReqBody>,
  res: Response
) => {
  const { id } = req.params
  const result = await userService.updateAccountById(id, req.body)

  return res.json({ message: USER_MESSAGES.UPDATE_ACCOUNT_SUCCESS, result })
}

export const getUserByIdController = async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await userService.findUserById(id)

  return res.json({ message: USER_MESSAGES.GET_USER_BY_ID_SUCCESS, user })
}

export const getAccountController = async (req: Request, res: Response) => {
  const { role } = req.query
  const result = await userService.getAccount(role as UserRole)

  return res.json({
    message: USER_MESSAGES.GET_ACCOUNT_SUCCESS,
    data: { users: result }
  })
}

export const deleteAccountController = async (req: Request, res: Response) => {
  const { id } = req.params
  const role = await userService.getRole(id)
  const result = await userService.deleteAccountById(id)

  // KHÔNG CHO XOÁ ADMIN ACCOUNT
  if (role === UserRole.Admin) {
    throw new ErrorWithStatus({
      message: 'CANNOT_DELETE_ADMIN_ACCOUNT',
      status: StatusCodes.UNAUTHORIZED
    })
  }

  return res.json({ message: 'DELETE_ACCOUNT_SUCCESS', result })
}

export const approveEventController = async (
  req: Request<ParamsDictionary, any, confirmEventReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { status } = req.body
  const result = await userService.approveEvent(id, status as any)
  // const template = tem
  return res.json({ message: 'APPROVE_EVENT_SUCCESS', result })
}

export const getPendingEventListController = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5
  const page = Number(req.query.page) ? Number(req.query.page) : 1
  const { events, total, sum_page } = await eventService.getPendingEventList({ limit, page })

  return res.json({
    message: EVENT_MESSAGES.GET_EVENT_LIST_SUCCESS,
    data: {
      events,
      total_events: total,
      sum_page
    }
  })
}
