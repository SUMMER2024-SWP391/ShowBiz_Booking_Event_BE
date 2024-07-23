import { accessTokenValidator, isUserRole } from './../user/user.middlewares'
import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import {
  assignCheckingStaffValidator,
  checkInValidator,
  isValidEvent,
  isValidEventOperator,
  loginValidator,
  registerEventOperatorValidator
} from './event_operator.middlewares'
import {
  assignCheckingStaffController,
  listCheckingStaffController,
  loginController,
  registerEventOperatorController,
  unassignCheckingStaffController
} from './event_operator.controllers'
import { UserRole } from '~/constants/enums'
import {
  cancelEventRequestController,
  checkInController,
  listRegisteredVisistorController,
} from '../user/user.controllers'

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
 * * Description: get list checking staff
 * Path: /list-checking-staff/:eventId
 * Method: GET
 * Request: {}
 */
eOperatorRouter.get(
  '/event/:eventId/list-checking-staff',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  wrapAsync(listCheckingStaffController)
)

/**
 * * Description: unassign checking staff
 * Path: /unassign-checking-staff
 * Method: DELETE
 * Request: { email: string}
 */
eOperatorRouter.delete(
  '/event/:eventId/unassign-checking-staff/:checkingStaffId',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  wrapAsync(unassignCheckingStaffController)
)

/**
 * * Description: Check in event by OTP
 * Path: /
 * Method: GET
 * Header: { authorization: Bearer <access_token> }
 */
eOperatorRouter.post(
  '/checking-staff/check-in/:eventId',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator, UserRole.Visitor])),
  checkInValidator,
  wrapAsync(checkInController)
)

/**
 * * Description: Delete create event request
 * Path: /
 * Method: DELETE
 * Header: { authorization: Bearer <access_token> }
 */
eOperatorRouter.patch(
  '/event/:eventId',
  accessTokenValidator,
  isUserRole([UserRole.EventOperator]),
  wrapAsync(isValidEventOperator), // check if event operator is the owner of the event
  wrapAsync(isValidEvent), // pending thì cho cancel
  wrapAsync(cancelEventRequestController)
)

/**
 * * Description: get list registered visistor
 * Path: /list-registered-visitor/:eventId
 * Method: GET
 * Header: { authorization: Bearer <access_token> }
 */
eOperatorRouter.get(
  '/list-registered-visitor/:eventId',
  accessTokenValidator,
  isUserRole([UserRole.EventOperator]),
  wrapAsync(isValidEventOperator), // check if event operator is the owner of the event
  wrapAsync(listRegisteredVisistorController)
)

export default eOperatorRouter
