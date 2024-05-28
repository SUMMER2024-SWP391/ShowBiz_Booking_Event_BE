import { Router } from 'express'
import { accessTokenValidator, createNewUserValidator, updateAccValidator } from '../user/user.middlewares'
import { checkRoleAdmin } from './auth.middleware'
import { wrapAsync } from '~/utils/handler'
import { createAccountController, updateAccountController } from './accounts.controller'

const adminsRouter = Router()
// ROUTE này chỉ dành cho Admin
adminsRouter.post(
  '/',
  accessTokenValidator,
  wrapAsync(checkRoleAdmin),
  createNewUserValidator,
  wrapAsync(createAccountController)
)

adminsRouter.patch('/:id', accessTokenValidator, checkRoleAdmin, updateAccValidator, wrapAsync(updateAccountController))

export default adminsRouter
