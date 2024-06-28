import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator, isUserRole } from '../user/user.middlewares'
import {
  cancelEventValidator,
  checkRegisteredEvent,
  createEventValidator,
  paginationValidator,
  registerEventValidator
} from './event.middlewares'
import {
  answerFeedbackEventController,
  cancelEventController,
  createEventController,
  getEventByIdController,
  getEventListController,
  getEventListOperatorController,
  getTicketByEventIdController,
  handleStatusEventController,
  registerEventController,
  registerEventWithNoFormNoPaymentController
} from './event.controllers'
import { UserRole } from '~/constants/enums'

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
eventsRouter.post('/', accessTokenValidator, createEventValidator, wrapAsync(createEventController))

/**
 * * Description: Get event list(pagination)
 * Path: /
 * Method: GET
 * Query: { page: number, limit: number }
 */
eventsRouter.get('/', paginationValidator, wrapAsync(getEventListController))

/**
 * * Description: Accept or reject event
 * Path: /:idEvent
 * Method: POST
 * Body: { status }
 */
eventsRouter.post('/:idEvent', wrapAsync(handleStatusEventController))

eventsRouter.get('/:idEvent', wrapAsync(getEventByIdController))

/**
 * * Description: Register event
 * Path : /register-event/:id  (id là eventId)
 * Method: POST
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body: RegisterEventReqBody
 */
eventsRouter.post(
  '/register-event/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.Visitor])),
  wrapAsync(registerEventValidator),
  wrapAsync(registerEventController)
)

eventsRouter.get(
  '/list-event/event-operator',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  wrapAsync(getEventListOperatorController)
)

/**
 * * Description: answer feedback question
 * Path: /feedback-event/:id
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: FeedbackEventReqBody
 */
eventsRouter.post(
  '/feedback-event/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.Visitor])),
  wrapAsync(answerFeedbackEventController)
)

eventsRouter.get('/ticket/:id', accessTokenValidator, wrapAsync(getTicketByEventIdController))

/**
 * Description: Cancel event
 *  Path: /cancel-event/:id
 *  Method: Post
 *  Header: { Authorization: Bearer <access_token> }
 */
eventsRouter.post(
  '/cancel-event/:id',
  accessTokenValidator,
  isUserRole([UserRole.Visitor]),
  cancelEventValidator,
  wrapAsync(cancelEventController)
)

eventsRouter.post(
  '/register-event/no-payment-no-form/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.Visitor])),
  wrapAsync(registerEventValidator),
  wrapAsync(registerEventWithNoFormNoPaymentController)
)

export default eventsRouter
