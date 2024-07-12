import { Router } from 'express'
import { getListUserRegisterController, getTicketDetailController } from './register.controller'
import { wrapAsync } from '~/utils/handler'

const registerRoutes = Router()

registerRoutes.get('/ticket-detail/:id', wrapAsync(getTicketDetailController))

registerRoutes.get('/list-user-register/:id', wrapAsync(getListUserRegisterController))

export default registerRoutes
