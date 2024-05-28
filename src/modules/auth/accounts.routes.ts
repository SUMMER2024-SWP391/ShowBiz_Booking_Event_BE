import { Router } from 'express'
import { accessTokenValidator, createNewUserValidator, updateAccValidator } from '../user/user.middlewares'
import { checkRoleAdmin } from './auth.middleware'
import { wrapAsync } from '~/utils/handler'
import { createAccountController, getUserByIdController, updateAccountController } from './accounts.controller'

const adminsRouter = Router()

/**
 ** Description: Create new acc
 * Method: POST
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body: { user_name: string, role: UserRole, birthday: string, phone_number: string, email: string }
 */
adminsRouter.post(
  '/',
  accessTokenValidator,
  wrapAsync(checkRoleAdmin),
  createNewUserValidator,
  wrapAsync(createAccountController)
)

/**
 ** Description: Update account by id
 * Method: PATCH
 * Body: { user_name?: string, role?: UserRole, date_of_birth?: string, phone_number?: string, email?: string }
 */
adminsRouter.patch('/:id', accessTokenValidator, checkRoleAdmin, updateAccValidator, wrapAsync(updateAccountController))

/**
 ** Description: Get user by id
 * Method: GET
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Params: :id
 */
adminsRouter.get('/:id', accessTokenValidator, checkRoleAdmin, wrapAsync(getUserByIdController))

export default adminsRouter
