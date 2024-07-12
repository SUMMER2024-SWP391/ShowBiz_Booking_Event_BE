import { Router } from 'express'
import { getTicketDetailController } from './register.controller'
import { wrapAsync } from '~/utils/handler'

const registerRoutes = Router()

registerRoutes.get('/ticket-detail/:id', wrapAsync(getTicketDetailController))

export default registerRoutes
