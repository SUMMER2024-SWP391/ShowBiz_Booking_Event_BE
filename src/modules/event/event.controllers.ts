import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '../user/user.requests'
import eventService from './event.services'
import {
  EventRequestBody,
  FeedbackEventReqBody,
  HandleStatusEventReqBody,
  Pagination,
  RegisterEventReqBody
} from './event.requests'
import { EVENT_MESSAGES } from '../user/user.messages'
import { EventCategory, EventStatus } from '~/constants/enums'
import answerService from '../answer/answer.services'
import registerService from '../register/register.services'
import Register from '../register/register.schema'
import { templateRegisterEvent } from '~/constants/template-mail'
import Event from './event.schema'
import userService from '../user/user.services'
import User from '../user/user.schema'
import { sendEmail } from '../sendMail/sendMailService'
import { ObjectId } from 'mongodb'
import formService from '../form/form.services'
import { EventQuestionType } from '../form/form.enum'
import questionService from '../question/question.services'
import { QUESTION_REGISTER } from '~/constants/question_register'
import axios from 'axios'

export const createEventController = async (req: Request<ParamsDictionary, any, EventRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await eventService.createEvent(user_id, req.body)
  const formEvent = await formService.createFormEvent(String(result?._id), EventQuestionType.REGISTER)
  await questionService.createNewListQuestion(formEvent.insertedId, QUESTION_REGISTER)

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
      paginate: {
        total_events: total,
        sum_page
      }
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

  //lưu câu trả lời của user vào bảng answers
  const listAnswer = await answerService.createListAnswer(user_id, req.body.answers)

  const _event = await eventService.getEventById(id)
  if (_event.category === EventCategory.PAID) {
    const token = req.headers.authorization?.split(' ')[1]
    const result = await axios<{ message: string; data: { url: string } }>({
      method: 'post',
      url: `http://localhost:4000/zalo/payment/${_event._id}`,
      headers: {
        Authorization: 'Bearer ' + token
      }
    })

    return res.json({
      message: result.data.message,
      data: {
        url: result.data.data.url
      }
    })
  }

  //lưu user đăng ký sự kiện vào bảng register
  const result = await registerService.registerEvent(id, user_id)

  //lưu qr code vào bảng register

  //lấy thông tin event, user để gửi mail
  const event = await eventService.getEventById(id)
  const user = await userService.getUserById(user_id)
  const template = templateRegisterEvent(event as Event, (result as Register).otp_check_in, user as User)
  // console.log(template)
  await sendEmail(template)
  return res.json({
    message: EVENT_MESSAGES.REGISTER_EVENT_SUCCESS,
    data: {
      register: result
    }
  })
}

export const registerEventWithNoFormNoPaymentController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  const result = await registerService.registerEvent(id, user_id)

  //lấy thông tin event, user để gửi mail
  const event = await eventService.getEventById(id)
  const user = await userService.getUserById(user_id)
  const template = templateRegisterEvent(event as Event, (result as Register).otp_check_in, user as User)

  await sendEmail(template)
  res.json({
    message: EVENT_MESSAGES.REGISTER_EVENT_SUCCESS,
    data: {
      register: result
    }
  })
}

export const getEventListOperatorController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await eventService.getEventListOperator(user_id)

  return res.json({
    message: EVENT_MESSAGES.GET_EVENT_LIST_OPERATOR_SUCCESS,
    data: {
      events: result
    }
  })
}

export const answerFeedbackEventController = async (
  req: Request<ParamsDictionary, any, FeedbackEventReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await answerService.createListAnswer(user_id, req.body.answers)

  return res.json({
    message: EVENT_MESSAGES.ANSWER_FEEDBACK_SUCCESS,
    data: {
      feedback: result
    }
  })
}

export const getTicketByEventIdController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const register = await registerService.getRegisterByEventIdAndUserId(id, user_id)

  return res.json({
    message: EVENT_MESSAGES.GET_TICKET_BY_EVENT_ID_SUCCESS,
    data: {
      ticket: register[0]
    }
  })
}

export const cancelEventController = async (req: Request, res: Response) => {
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  const checkPayment = await eventService.checkPayment(id)
  if (checkPayment) {
    return res.json({
      message: EVENT_MESSAGES.EVENT_HAVE_PAYMENT
    })
  }

  await eventService.cancelEvent(user_id, id)

  return res.json({
    message: EVENT_MESSAGES.CANCEL_EVENT_SUCCESS
  })
}

export const registerEventHasFormNoPaymentController = async (
  req: Request<ParamsDictionary, any, RegisterEventReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload

  //lưu câu trả lời của user vào bảng answers
  const listAnswer = await answerService.createListAnswer(user_id, req.body.answers)
  //lưu user đăng ký sự kiện vào bảng register
  const result = await registerService.registerEvent(id, user_id)

  //lưu qr code vào bảng register

  //lấy thông tin event, user để gửi mail
  const event = await eventService.getEventById(id)
  const user = await userService.getUserById(user_id)
  const template = templateRegisterEvent(event as Event, (result as Register).otp_check_in, user as User)
  // console.log(template)
  await sendEmail(template)
  res.json({
    message: EVENT_MESSAGES.REGISTER_EVENT_SUCCESS,
    data: {
      register: result
    }
  })
}
