import { Router } from 'express'
import { accessTokenValidator, createNewUserValidator, updateAccValidator } from '../user/user.middlewares'
import { checkRoleAdmin } from './auth.middleware'
import { wrapAsync } from '~/utils/handler'
import {
  approveEventController,
  createAccountController,
  deleteAccountController,
  getAccountController,
  getPendingEventListController,
  getUserByIdController,
  updateAccountController
} from './accounts.controller'
import { filterMiddleware } from '~/errors/common.middlewares'
import { updateAccountReqBody } from './account.request'
import { confirmEventValidator } from './account.middleware'
import { paginationValidator } from '../event/event.middlewares'

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
  wrapAsync(checkRoleAdmin),
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
adminsRouter.get('/:id', accessTokenValidator, wrapAsync(checkRoleAdmin), wrapAsync(getUserByIdController))

/**
 ** Description: Get all account
 * Method: GET
 * Headers: { Authorization: 'Bearer <access_token>' }
 */
adminsRouter.get('/', accessTokenValidator, wrapAsync(checkRoleAdmin), wrapAsync(getAccountController))

/**
 ** Description: Delete account by id
 * Method: DELETE
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Params: :id
 */
adminsRouter.delete('/:id', accessTokenValidator, wrapAsync(checkRoleAdmin), wrapAsync(deleteAccountController))

/**
 ** Description: Admin confirm event
 * Method: PATCH
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Params: :id
 */
adminsRouter.patch(
  '/confirm-event/:id',
  accessTokenValidator,
  wrapAsync(checkRoleAdmin),
  confirmEventValidator,
  wrapAsync(approveEventController)
)

/**
 * * Description: Get event list with status pending
 * Path: /
 * Method: GET
 * Query: { page: number, limit: number }
 */
adminsRouter.get(
  '/get-all/pending-list',
  accessTokenValidator,
  wrapAsync(checkRoleAdmin),
  paginationValidator,
  wrapAsync(getPendingEventListController)
)

export default adminsRouter
