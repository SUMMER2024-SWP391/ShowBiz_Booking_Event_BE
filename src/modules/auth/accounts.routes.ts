import { Router } from 'express'
import { accessTokenValidator, createNewUserValidator } from '../user/user.middlewares'
import { checkRoleAdmin } from './auth.middleware'
import { wrapAsync } from '~/utils/handler'
import { createAccountController } from './accounts.controller'

const adminsRouter = Router()
// ROUTE này chỉ dành cho Admin
adminsRouter.post(
  '/',
  accessTokenValidator,
  wrapAsync(checkRoleAdmin),
  createNewUserValidator,
  wrapAsync(createAccountController)
)

export default adminsRouter
