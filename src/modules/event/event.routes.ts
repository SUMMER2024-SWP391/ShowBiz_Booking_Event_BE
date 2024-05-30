import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator, verifiedUserValidator } from '../user/user.middlewares'
import { createEventValidator, paginationValidator } from './event.middlewares'
import {
  createEventController,
  getEventByIdController,
  getEventListController,
  handleStatusEventController
} from './event.controllers'

const eventsRouter = Router()

/**
 * * Description: Create new event
 * Path: /
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

/**
 * * Description: Get event list(pagination)
 * Path: /
 * Method: GET
 * Query: { page: number, limit: number }
 */
eventsRouter.get('/', paginationValidator, wrapAsync(getEventListController))

/**
 * * Description: Accept or reject event
 * Path: /
 * Method: post
 * body: { status }
 */
eventsRouter.post('/:idEvent', wrapAsync(handleStatusEventController))

eventsRouter.get('/:idEvent', wrapAsync(getEventByIdController))

export default eventsRouter
