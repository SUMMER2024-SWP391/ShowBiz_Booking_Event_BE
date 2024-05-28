import { Router } from 'express'
import { accessTokenValidator, createNewUserValidator, updateAccValidator } from '../user/user.middlewares'
import { checkRoleAdmin } from './auth.middleware'
import { wrapAsync } from '~/utils/handler'
import { createAccountController, getAccountController, getUserByIdController, updateAccountController } from './accounts.controller'
import { filterMiddleware } from '~/errors/common.middlewares'
import { updateAccountReqBody } from './account.request'

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
adminsRouter.patch(
  '/:id',
  accessTokenValidator,
  checkRoleAdmin,
  updateAccValidator,
  filterMiddleware<updateAccountReqBody>([
    'user_name',
    'role',
    'date_of_birth',
    'phone_number',
    'email',
    'avatar',
    'point',
    'verify_status'
  ]),
  wrapAsync(updateAccountController)
)

/**
 ** Description: Get user by id
 * Method: GET
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Params: :id
 */
adminsRouter.get('/:id', accessTokenValidator, checkRoleAdmin, wrapAsync(getUserByIdController))

/**
 * Description: Get all account
 * Method: GET
 * Headers: { Authorization: 'Bearer <access_token>' }
 */
adminsRouter.get('/', accessTokenValidator, checkRoleAdmin, wrapAsync(getAccountController))

export default adminsRouter
