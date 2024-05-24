import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '../user/user.requests'
import eventService from './event.services'
import { EventRequestBody } from './event.requests'
import { EVENT_MESSAGES } from './event.messages'

export const createEventController = async (req: Request<ParamsDictionary, any, EventRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await eventService.createEvent(user_id, req.body)

  return res.json({ message: EVENT_MESSAGES.CREATE_EVENT_SUCCESS, result })
}
