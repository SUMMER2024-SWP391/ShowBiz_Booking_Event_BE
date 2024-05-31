import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '../user/user.requests'
import eventService from './event.services'
import { EventRequestBody, HandleStatusEventReqBody, Pagination } from './event.requests'
import { EVENT_MESSAGES } from '../user/user.messages'
import { EventStatus } from '~/constants/enums'

export const createEventController = async (req: Request<ParamsDictionary, any, EventRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await eventService.createEvent(user_id, req.body)

  return res.json({ message: EVENT_MESSAGES.CREATE_EVENT_SUCCESS, result })
}

export const getEventListController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const limit = Number(req.query.limit) ? Number(req.query.limit) : 5
  const page = Number(req.query.page) ? Number(req.query.page) : 1
  const { events, total, sum_page } = await eventService.getEventList({ limit, page })

  return res.json({
    message: EVENT_MESSAGES.GET_EVENT_LIST_SUCCESS,
    data: {
      events,
      total_events: total,
      sum_page
    }
  })
}

export const handleStatusEventController = async (
  req: Request<ParamsDictionary, any, HandleStatusEventReqBody>,
  res: Response
) => {
  const { status } = req.body
  const { idEvent } = req.params

  const result = eventService.handleStatusEvent(idEvent, status as EventStatus)
  res.json({
    message: status == EventStatus.APPROVED ? EVENT_MESSAGES.CREATE_EVENT_SUCCESS : EVENT_MESSAGES.REJECT_EVENT_SUCCESS,
    result
  })
}

export const getEventByIdController = async (req: Request, res: Response) => {
  const { idEvent } = req.params
  const result = await eventService.getEventById(idEvent.toString())
  res.json({
    message: EVENT_MESSAGES.GET_EVENT_BY_ID_SUCCESS,
    data: {
      event: result
    }
  })
}
