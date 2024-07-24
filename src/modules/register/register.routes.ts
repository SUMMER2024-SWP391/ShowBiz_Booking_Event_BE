import { Router } from 'express'
import { getListUserRegisterController, getTicketDetailController } from './register.controller'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator } from '../user/user.middlewares'

const registerRoutes = Router()

registerRoutes.get('/ticket-detail/:id', wrapAsync(getTicketDetailController))

registerRoutes.get('/list-user/registed/:id', accessTokenValidator, wrapAsync(getListUserRegisterController))

export default registerRoutes
