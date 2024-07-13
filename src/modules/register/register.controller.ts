import { Request, Response } from 'express'
import registerService from './register.services'
import userService from '../user/user.services'
import eventService from '../event/event.services'
import { ObjectId } from 'mongodb'
import databaseService from '~/database/database.services'

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

export const getListUserRegisterController = async (req: Request, res: Response) => {
  const { id } = req.params
  const result = await registerService.getListRegiserPeopleOfOneEvent(id)
  const listUser = []
  for (let i = 0; i < result.length; i++) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(result[i].visitor_id) },
      {
        projection: {
          _id: 1,
          user_name: 1,
          email: 1
        }
      }
    )
    listUser.push({ ...user, status_check_in: result[i].status_check_in })
  }
  res.json({
    message: 'Get list user register success',
    data: {
      listUser
    }
  })
}
