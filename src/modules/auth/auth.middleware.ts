import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from '../user/user.requests'
import userService from '../user/user.services'
import { UserRole } from '~/constants/enums'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'
import { USER_MESSAGES } from '../user/user.messages'

export const checkRoleAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const role = await userService.getRole(user_id)

  if (role !== UserRole.Admin) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.NOT_AN_ADMIN,
      status: StatusCodes.UNAUTHORIZED
    })
  }
  next()
}

export const checkRoleVisitor = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  if ((await userService.getRole(user_id)) !== UserRole.Visitor) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.UNAUTHORIZED,
      status: StatusCodes.UNAUTHORIZED
    })
  }
  next()
}

export const checkRoleStaff = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  if ((await userService.getRole(user_id)) !== UserRole.CheckingStaff) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.UNAUTHORIZED,
      status: StatusCodes.UNAUTHORIZED
    })
  }
  next()
}

export const checkRoleAdminOrStaff = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const role = (await userService.getRole(user_id)) as UserRole
  if ([UserRole.Admin, UserRole.CheckingStaff].includes(role)) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.UNAUTHORIZED,
      status: StatusCodes.UNAUTHORIZED
    })
  }
  next()
}
