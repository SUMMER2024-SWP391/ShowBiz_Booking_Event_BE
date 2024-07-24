import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { accessTokenValidator, isUserRole } from '../user/user.middlewares'
import {
  cancelEventValidator,
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
  getEventListEventStaffController,
  getEventListOperatorController,
  getStatisticalDataController,
  getTicketByEventIdController,
  handleStatusCheckEventController,
  handleStatusEventController,
  registerEventController,
  registerEventHasFormNoPaymentController,
  registerEventWithNoFormNoPaymentController,
  searchEventController
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
eventsRouter.post(
  '/',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  createEventValidator,
  wrapAsync(createEventController)
)

/**
 * * Description: Get event list(pagination)
 * Path: /
 * Method: GET
 * Query: { page: number, limit: number }
 */
eventsRouter.get('/', wrapAsync(getEventListController))

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
  wrapAsync(handleStatusCheckEventController),
  wrapAsync(answerFeedbackEventController)
)

eventsRouter.get('/ticket/:id', accessTokenValidator, wrapAsync(getTicketByEventIdController))

/**
 * Description: Cancel event
 *  Path: /cancel-event/:id
 *  Method: Post
 *  Header: { Authorization: Bearer <access_token> }
 * query : {idRegister : string}
 */
eventsRouter.post(
  '/cancel-event/:id',
  accessTokenValidator,
  isUserRole([UserRole.Visitor]),
  cancelEventValidator,
  wrapAsync(cancelEventController)
)

//xử lý ko form ko payment là route này
eventsRouter.post(
  '/register-event/no-payment-no-form/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.Visitor])),
  wrapAsync(registerEventValidator),
  wrapAsync(registerEventWithNoFormNoPaymentController)
)
//xử lý có form mà  ko có payment là route này
eventsRouter.post(
  '/register-event/no-payment/has-form/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.Visitor])),
  wrapAsync(registerEventValidator),
  wrapAsync(registerEventHasFormNoPaymentController)
)

/**
 * * Description: Get statistical data of events
 * Path: /statistical
 * Method: GET
 * Header: { Authorization: Bearer <access_token> }
 */
eventsRouter.get(
  '/data/statistical',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.Admin, UserRole.EventOperator])),
  wrapAsync(getStatisticalDataController)
)

/**
 * * Description: Search event based on name and description
 * Path: /search/:keyword
 * Method: GET
 */
eventsRouter.get('/search/:keyword', wrapAsync(searchEventController))

eventsRouter.get('/staff/list', accessTokenValidator, wrapAsync(getEventListEventStaffController))

export default eventsRouter
