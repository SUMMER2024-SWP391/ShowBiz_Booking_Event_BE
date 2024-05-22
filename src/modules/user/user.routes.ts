import { Router } from 'express'
import { loginController, oauthController, registerController } from '~/modules/user/user.controllers'
import { loginValidator, registerValidator } from '~/modules/user/user.middlewares'
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

/**
 * * Description: OAuth with Google
 * Path: /oauth/login
 * Method: GET
 * Query: { code: string }
 */
usersRouter.get('/oauth/google', wrapAsync(oauthController))

export default usersRouter
