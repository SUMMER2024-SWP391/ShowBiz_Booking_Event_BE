import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { loginValidator, registerEventOperatorValidator } from './event_operator.middlewares'
import { loginController, registerEventOperatorController } from './event_operator.controllers'

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

export default eOperatorRouter
