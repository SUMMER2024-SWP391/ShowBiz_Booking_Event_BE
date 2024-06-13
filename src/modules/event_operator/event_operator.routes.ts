import { accessTokenValidator, isUserRole } from './../user/user.middlewares'
import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import {
  assignCheckingStaffValidator,
  loginValidator,
  registerEventOperatorValidator
} from './event_operator.middlewares'
import {
  assignCheckingStaffController,
  getListRegisterEventController,
  loginController,
  registerEventOperatorController
} from './event_operator.controllers'
import { UserRole } from '~/constants/enums'

const eOperatorRouter = Router()

/**
 * * Description: Register a new event_operator
 * Path: /register
 * Method: POST
 * Request: { name: string, email: string, password: string, confirm_password: string }
 */
eOperatorRouter.post('/register', registerEventOperatorValidator, wrapAsync(registerEventOperatorController))

/**
 * * Description: Login by directly event_operator
 * Path: /login
 * Method: POST
 * Request: { email: string, password: string }
 */
eOperatorRouter.post('/login', loginValidator, wrapAsync(loginController))

/**
 * * Description: Assign cheking staff
 * Path: /assign-checking-staff
 * Method: POST
 * Request: { email: string}
 */
eOperatorRouter.post(
  '/assign-checking-staff',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  assignCheckingStaffValidator,
  wrapAsync(assignCheckingStaffController)
)

/**
 * * Description: get list-event
 * Path: /list-event
 * Method: GET
 * Header: { authorization: Bearer <access_token> }
 */

eOperatorRouter.get(
  '/list-event',
  accessTokenValidator,
  isUserRole([UserRole.EventOperator]),
  wrapAsync(getListRegisterEventController)
)
export default eOperatorRouter
