import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '../user/user.requests'
import eventService from './event.services'
import { EventRequestBody, Pagination } from './event.requests'
import { EVENT_MESSAGES } from './event.messages'

export const createEventController = async (req: Request<ParamsDictionary, any, EventRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await eventService.createEvent(user_id, req.body)

  return res.json({ message: EVENT_MESSAGES.CREATE_EVENT_SUCCESS, result })
}

export const getEventListController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { events, total, sum_page } = await eventService.getEventList({ limit, page })

  return res.json({
    message: EVENT_MESSAGES.GET_EVENT_LIST_SUCCESS,
    events,
    total_events: total,
    sum_page
  })
}
