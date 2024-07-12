import { Request, Response } from 'express'
import registerService from './register.services'
import userService from '../user/user.services'
import eventService from '../event/event.services'

export const getTicketDetailController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await registerService.getTicketById(id)
  const [user, event] = await Promise.all([
    userService.findUserById(String(result?.visitor_id)),
    eventService.getEventById(String(result?.event_id))
  ])
  const ticket = { register: result, user, event }
  res.json({
    message: 'Get ticket success',
    data: {
      ticket
    }
  })
}
