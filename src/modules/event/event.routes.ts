import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator, verifiedUserValidator } from '../user/user.middlewares'
import { createEventValidator } from './event.middlewares'
import { createEventController } from './event.controllers'

const eventsRouter = Router()

/**
 * * Description: Create new event
 * Path: /create
 * Method: POST
 * Query: { code: string }
 */
eventsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createEventValidator,
  wrapAsync(createEventController)
)

export default eventsRouter
