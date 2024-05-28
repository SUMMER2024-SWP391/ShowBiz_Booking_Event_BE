import { Request, Response } from 'express'
import userService from '../user/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { createAccountReqBody, updateAccountReqBody } from './account.request'
import { USER_MESSAGES } from '../user/user.messages'

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
