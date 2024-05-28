import { Request, Response } from 'express'
import userService from '../user/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { createAccountReqBody, updateAccountReqBody } from './account.request'
import { USER_MESSAGES } from '../user/user.messages'
import { TokenPayload } from '../user/user.requests'
import { StatusCodes } from 'http-status-codes'
import { ErrorWithStatus } from '~/models/Errors'
import { UserRole } from '~/constants/enums'

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
  const result = await userService.getAccount()

  return res.json({ message: USER_MESSAGES.GET_ACCOUNT_SUCCESS, result })
}

export const deleteAccountController = async (req: Request, res: Response) => {
  const { id } = req.params
  const role = await userService.getRole(id)

  // KHÔNG CHO XOÁ ADMIN ACCOUNT
  if (role === UserRole.Admin) {
    throw new ErrorWithStatus({
      message: 'CANNOT_DELETE_ADMIN_ACCOUNT',
      status: StatusCodes.UNAUTHORIZED
    })
  }
  const result = await userService.deleteAccountById(id)

  return res.json({
    message: 'DELETE_ACCOUNT_SUCCESS',
    result
  })
}
