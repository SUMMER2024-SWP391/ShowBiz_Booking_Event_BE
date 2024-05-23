import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '../user/user.requests'
import eventService from './event.services'
import { EventRequestBody } from './event.requests'

export const createEventController = async (req: Request<ParamsDictionary, any, EventRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  console.log('🚀 ~ user_id:', user_id)
  const result = await eventService.createEvent(user_id, req.body)

  return res.json({ message: 'Create event successfully', data: req.body })
}
