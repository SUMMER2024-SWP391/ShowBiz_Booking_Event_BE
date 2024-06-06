import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '../user/user.requests'
import eventService from './event.services'
import { EventRequestBody, HandleStatusEventReqBody, Pagination, RegisterEventReqBody } from './event.requests'
import { EVENT_MESSAGES } from '../user/user.messages'
import { EventStatus } from '~/constants/enums'
import answerService from '../answer/answer.services'
import registerService from '../register/register.services'
import { convertDataToQrCode } from '~/utils/qrCode'
import Register from '../register/register.schema'
import { ObjectId } from 'mongodb'
import { templateRegisterEvent } from '~/constants/template-mail'
import Event from './event.schema'
import userService from '../user/user.services'
import User from '../user/user.schema'
import { sendEmail } from '../sendMail/sendMailService'

export const createEventController = async (req: Request<ParamsDictionary, any, EventRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await eventService.createEvent(user_id, req.body)

  return res.json({ message: EVENT_MESSAGES.CREATE_EVENT_REQUEST_SUCCESS, result })
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

  return res.json({
    message: status == EventStatus.APPROVED ? EVENT_MESSAGES.CREATE_EVENT_SUCCESS : EVENT_MESSAGES.REJECT_EVENT_SUCCESS,
    result
  })
}

export const getEventByIdController = async (req: Request, res: Response) => {
  const { idEvent } = req.params
  const result = await eventService.getEventById(idEvent.toString())

  return res.json({
    message: EVENT_MESSAGES.GET_EVENT_BY_ID_SUCCESS,
    data: {
      event: result
    }
  })
}

export const registerEventController = async (
  req: Request<ParamsDictionary, any, RegisterEventReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const listAnswer = await answerService.createListAnswer(user_id, req.body.answers)
  const result = await registerService.registerEvent(id, user_id)
  const qrCodeURL = await convertDataToQrCode(result as Register)
  const updateQrCode = await registerService.updateQrCode(result?._id as ObjectId, qrCodeURL)
  const event = await eventService.getEventById(id)
  const user = await userService.getUserById(user_id)
  const template = templateRegisterEvent(event as Event, (updateQrCode as Register).qr_code, user as User)
  console.log(template)
  await sendEmail(template)
  res.json({
    message: EVENT_MESSAGES.REGISTER_EVENT_SUCCESS,
    data: {
      register: updateQrCode
    }
  })
}
