import { Router } from 'express'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailTokenValidator
} from '~/modules/user/user.middlewares'
import {
  loginController,
  logoutController,
  oauthController,
  registerController,
  resendVerifyEmailController,
  verifyEmailController
} from '~/modules/user/user.controllers'
import { wrapAsync } from '~/utils/handler'

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
 * Request: { name: string, email: string, password: string, confirm_password: string, date_of_birth: string }
 */
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
/*
 * * Description: logout
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
 * * Description: verify email
 * Path: /verify-email
 * Method: GET
 * body: {email_verify_token: string}
 */
usersRouter.get('/verify-email', verifyEmailTokenValidator, wrapAsync(verifyEmailController))

/**
 * * Description: Resend email verification
 * Path: /resend-verify-email
 * Method: POST
 * body: {email: string}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendVerifyEmailController))

export default usersRouter
