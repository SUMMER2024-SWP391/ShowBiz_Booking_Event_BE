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
 * Header: { Authorization: Bearer <access_token> }
 * Body: { name: string, capacity: number, type_event: EventTypeEnum,
 *         date_event: string, time_start: string, time_end: string,
 *         location: LocationType, } -> rest of the fields are optional
 */
eventsRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createEventValidator,
  wrapAsync(createEventController)
)

export default eventsRouter
