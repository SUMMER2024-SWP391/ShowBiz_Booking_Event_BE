import { Router } from 'express'
import {
  accessTokenValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  isUserRole,
  loginValidator,
  refreshTokenValidator,
  registerEventOperatorMiddleware,
  registerValidator,
  resetPasswordValidator,
  searchEventMiddleware,
  updateMeValidator,
  verifiedUserValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordTokenValidator
} from '~/modules/user/user.middlewares'
import {
  loginController,
  logoutController,
  oauthController,
  registerController,
  resendVerifyEmailController,
  registerEventOperatorController,
  verifyEmailController,
  forgotPasswordController,
  getMeController,
  updateMeController,
  verifyForgotPasswordTokenController,
  resetPasswordController,
  changePasswordController,
  refreshTokenController,
  getListRegisterEventController,
  searchEventController,
  getListVisitorController,
  getListEventOperatorController,
  getListCheckingStaffController,
  getTicketByIdController
} from '~/modules/user/user.controllers'
import { wrapAsync } from '~/utils/handler'
import { UserRole } from '~/constants/enums'
import { filterMiddleware } from './common.middlewares'
import { UpdateMeReqBody } from './user.requests'

const usersRouter = Router()

usersRouter.get('/', (req, res) => {
  res.json({ message: 'helloooooo cc' })
})

/**
 * * Description: Login by directly register account
 * Path: /login
 * Method: POST
 * Request: { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapAsync(loginController))

/**
 * * Description: Register a new user
 * Path: /register
 * Method: POST
 * Request: { name: string, email: string, password: string, confirm_password: string, date_of_birth: string, phone_number : string }
 */
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/*
 * * Description: Logout
 * Path: /logout
 * Method: POST
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body: { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*
 * * Description: OAuth with Google
 * Path: /oauth/login
 * Method: GET
 * Query: { code: string }
 */
usersRouter.get('/oauth/google', wrapAsync(oauthController))

/**
 * * Description: Verify email
 * Path: /verify-email
 * Method: GET
 * Body: { email_verify_token: string }
 */
usersRouter.get('/verify-email', verifyEmailTokenValidator, wrapAsync(verifyEmailController))

/**
 * * Description: Resend email verification
 * Path: /resend-verify-email
 * Method: POST
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body: { email: string }
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendVerifyEmailController))

/** 
 * * Description: Register event operator
 * Path: /register-event-operator
 * Method: POST
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body: {
      user_name: string,
      email: string,
      password: string,
      confirm_password: string,
      phone_number: string }
 */
usersRouter.post(
  '/register-event-operator',
  accessTokenValidator,
  isUserRole([UserRole.Admin]),
  registerEventOperatorMiddleware,
  wrapAsync(registerEventOperatorController)
)

/**
 * * Description: forgot password
 * Path: /forgot-password
 * Method: POST
 * Body: { email: string }
 */
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/**
 * * Description: Verify forgot password
 * Path: /verify-forgot-password-token
 * Method: GET
 * Query: { forgot_password_token: string }
 */
usersRouter.get(
  '/verify-forgot-password-token',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)

/**
 * Description: Reset password
 * Path: /reset-password
 * Method: POST
 * Body: { forgot_password_token: string, new_password: string, confirm_new_password: string }
 */
usersRouter.post('/reset-password', resetPasswordValidator, wrapAsync(resetPasswordController))

/**
 * * Description: Change password
 * Path: /change-password
 * Method: POST
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body: { old_password: string, new_password: string, confirm_new_password: string }
 */
usersRouter.post(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapAsync(changePasswordController)
)

/**
 * * Description: User get themselves information
 * Path: /me
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

/**
 * * Description: Update my profile
 * Path: /me
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token> }
 * Body: UserSchema
 */
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>(['user_name', 'date_of_birth', 'avatar', 'password']),
  wrapAsync(updateMeController)
)

/**
 * * Description: refresh token
 * Path: /refresh-token
 * Method: POST
 * Body: { refresh_token: string }
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

/**
 * * Description: Get all register event
 * Path: /list-register-event
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
usersRouter.get('/list-register-event', accessTokenValidator, wrapAsync(getListRegisterEventController))

/**
 * * Description: search event
 * Path: /search-event
 * Method: GET
 * Query: { keyword: string }
 */
usersRouter.get('/search-event', searchEventMiddleware, wrapAsync(searchEventController))

/**
 * Description: List visitor
 * Path: /list-visitor
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */

usersRouter.get(
  '/list-visitor',
  accessTokenValidator,
  isUserRole([UserRole.Admin]),
  wrapAsync(getListVisitorController)
)
/**
 * Description: List visitor
 * Path: /list-visitor
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */

usersRouter.get(
  '/list-event-operator',
  accessTokenValidator,
  isUserRole([UserRole.Admin]),
  wrapAsync(getListEventOperatorController)
)
/**
 * Description: List visitor
 * Path: /list-visitor
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */

usersRouter.get(
  '/list-checking-staff',
  accessTokenValidator,
  isUserRole([UserRole.Admin]),
  wrapAsync(getListCheckingStaffController)
)

usersRouter.get('/user/ticket/:id', accessTokenValidator, wrapAsync(getTicketByIdController))

export default usersRouter
