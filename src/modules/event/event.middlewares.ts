import { checkSchema } from 'express-validator'
import { EventCategory, EventTypeEnum, LocationType } from '~/constants/enums'
import { validate } from '~/utils/validation'
import { REGEX_DATE, REGEX_TIME } from '~/constants/regex'
import eventService from './event.services'
import { EVENT_MESSAGES, USER_MESSAGES } from '../user/user.messages'
import {
  Event,
  canCancelEvent,
  compareTimes,
  convertTimeToMinutes,
  isDateOneWeekLater,
  isTimeConflict
} from '~/utils/common'
import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from '../user/user.requests'
import registerService from '../register/register.services'
import { StatusCodes } from 'http-status-codes'
import { ErrorWithStatus } from '~/models/Errors'
import { getFormController } from '../form/form.controller'
import { config } from '~/config/zalo'
import axios from 'axios'
import databaseService from '~/database/database.services'
import { ObjectId } from 'mongodb'
import { env } from '~/config/environment'
import moment from 'moment'
import CryptoJS from 'crypto-js'

export const createEventValidator = validate(
  checkSchema(
    {
      name: {
        isString: { errorMessage: EVENT_MESSAGES.NAME_MUST_BE_A_STRING },
        notEmpty: { errorMessage: EVENT_MESSAGES.NAME_IS_REQUIRED }
      },
      capacity: {
        isNumeric: { errorMessage: EVENT_MESSAGES.CAPACITY_MUST_BE_A_NUMBER },
        notEmpty: { errorMessage: EVENT_MESSAGES.CAPACITY_IS_REQUIRED }
      },
      ticket_price: {
        isNumeric: { errorMessage: EVENT_MESSAGES.TICKET_PRICE_MUST_BE_A_NUMBER },
        notEmpty: { errorMessage: EVENT_MESSAGES.TICKET_PRICE_IS_REQUIRED }
      },
      type_event: {
        isIn: {
          options: [Object.values(EventTypeEnum)],
          errorMessage: EVENT_MESSAGES.INVALID_TYPE
        }
      },
      date_event: {
        isString: { errorMessage: EVENT_MESSAGES.DATE_EVENT_MUST_BE_A_STRING },
        notEmpty: { errorMessage: EVENT_MESSAGES.DATE_EVENT_IS_REQUIRED },
        custom: {
          options: async (value) => {
            if (!REGEX_DATE.test(value)) throw new Error(EVENT_MESSAGES.INVALID_DATE)

            if (isDateOneWeekLater(value)) throw new Error(EVENT_MESSAGES.DATE_EVENT_MUST_BE_ONE_WEEK_LATER)

            return true
          }
        }
      },
      time_start: {
        isString: { errorMessage: EVENT_MESSAGES.TIME_START_MUST_BE_A_STRING },
        notEmpty: { errorMessage: EVENT_MESSAGES.TIME_START_IS_REQUIRED },
        custom: {
          options: async (value, { req }) => {
            const { date_event, location, time_start } = req.body

            if (!REGEX_TIME.test(value)) throw new Error(EVENT_MESSAGES.TIME_START_MUST_MATCH_FORMAT)

            //! Lấy ra 1 array Event có date_event và location trùng với user nhập
            const result = (await eventService.getEventByDateAndLocation(date_event, location)) as Event[]

            if (isTimeConflict({ time_start, time_end: value }, result)) {
              throw new Error(EVENT_MESSAGES.TIME_CONFLICT)
            }

            return true
          }
        }
      },
      time_end: {
        isString: { errorMessage: EVENT_MESSAGES.TIME_END_MUST_BE_A_STRING },
        notEmpty: { errorMessage: EVENT_MESSAGES.TIME_END_IS_REQUIRED },
        custom: {
          options: async (value, { req }) => {
            if (!REGEX_TIME.test(value)) throw new Error(EVENT_MESSAGES.TIME_END_MUST_MATCH_FORMAT)

            //! Lấy ra date_event, location, time_start để check xem có trùng thời gian với event khác không
            const { date_event, location, time_start } = req.body
            //! Convert to number to compare
            const newTimeStart = convertTimeToMinutes(time_start)
            const newTimeEnd = convertTimeToMinutes(value)

            if (compareTimes(newTimeStart, newTimeEnd)) {
              throw new Error(EVENT_MESSAGES.TIME_END_MUST_GREATER_THAN_TIME_START)
            }

            // check xem trong ngày đó và location đó có event nào khác không
            const result = (await eventService.getEventByDateAndLocation(date_event, location)) as Event[]
            if (isTimeConflict({ time_start, time_end: value }, result)) {
              throw new Error(EVENT_MESSAGES.TIME_CONFLICT)
            }

            return true
          }
        }
      },
      location: {
        isIn: {
          options: [Object.values(LocationType)],
          errorMessage: EVENT_MESSAGES.INVALID_LOCATION
        }
      }
    },
    ['body']
  )
)

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        optional: true,
        isNumeric: true,
        custom: {
          options: async (value) => {
            const num = Number(value)
            if (num > 100 || num < 1) throw new Error(EVENT_MESSAGES.LIMIT_MUST_BE_BETWEEN_1_AND_100)

            return true
          }
        }
      },
      page: {
        optional: true,
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            const result = await eventService.getAllEventListApproved()

            if (num < 1) throw new Error(EVENT_MESSAGES.PAGE_MUST_BE_POSITIVE)
            if (num > Math.ceil(result / Number(req.query?.limit))) throw new Error(EVENT_MESSAGES.INVALID_PAGE)

            return true
          }
        }
      }
    },
    ['query']
  )
)

export const registerEventValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { id } = req.params // eventId
  const checkRegistered = await registerService.checkRegistered(id, user_id)
  if (checkRegistered) {
    throw new ErrorWithStatus({ message: EVENT_MESSAGES.YOU_REGISTERED_THIS_EVENT, status: StatusCodes.CONFLICT })
  }

  const [event, numberUserRegister] = await Promise.all([
    await eventService.getEventById(id),
    await registerService.getNumberPeopleOfEventByEventId(id)
  ])

  if (Number(event.capacity) <= numberUserRegister) {
    next(
      new ErrorWithStatus({
        message: EVENT_MESSAGES.EVENT_IS_FULL,
        status: StatusCodes.LOCKED
      })
    )
  }
  next()
}

export const isHasFormRegister = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params // eventId
  const event = await eventService.getEventById(id)
  // nếu event không có form và không có cả payment(ticket_price = 0 và category = FREE) thì chuyển sang middleware tiếp theo
  if (!event.is_required_form_register) {
    return next()
  } else {
    // nếu event có form thì phải lấy câu trả lời của user
    const { user_id } = req.decoded_authorization as TokenPayload
    // const checkRegistered = await registerService.checkRegistered(id, user_id)
    // if (!checkRegistered) {
    //   throw new ErrorWithStatus({ message: EVENT_MESSAGES.YOU_NOT_REGISTERED_THIS_EVENT, status: StatusCodes.BAD_REQUEST })
    // }
    await getFormController(req, res)
  }

  next()
}

export const cancelEventValidator = validate(
  checkSchema(
    {
      id: {
        notEmpty: { errorMessage: EVENT_MESSAGES.EVENT_ID_IS_REQUIRED },
        isMongoId: { errorMessage: EVENT_MESSAGES.EVENT_ID_IS_INVALID },
        custom: {
          options: async (value, { req }) => {
            const event = await eventService.getEventById(value)
            if (!event) {
              throw new ErrorWithStatus({
                message: EVENT_MESSAGES.EVENT_NOT_FOUND,
                status: StatusCodes.NOT_FOUND
              })
            }

            const { user_id } = req.decoded_authorization as TokenPayload
            const checkVisitor = await registerService.checkRegistered(value, user_id)
            if (!checkVisitor) {
              throw new ErrorWithStatus({
                message: EVENT_MESSAGES.YOU_HAVE_NOT_REGISTERED_THIS_EVENT,
                status: StatusCodes.FORBIDDEN
              })
            }

            if (!canCancelEvent(event.date_event, event.time_start)) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.YOU_CAN_ONLY_CANCEL_BEFORE_48H,
                status: StatusCodes.FORBIDDEN
              })
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)

export const paymentValidator = async (req: Request, res: Response, next: NextFunction) => {}

export const processPayment = async (req: Request, res: Response): Promise<Response> => {
  const id = req.params as any
  const user = req.decoded_authorization as TokenPayload
  const _user = await databaseService.users.findOne({ _id: new ObjectId(user.user_id) })
  const event = await databaseService.events.findOne({ _id: new ObjectId(id) })
  console.log('🚀 ~ event:', event)

  if (event?.ticket_price !== 0 && event?.category === EventCategory.PAID) {
    const embed_data = {
      redirecturl: `${env.DB_HOST}:${env.PORT_FE}`
    }

    const items: any[] = []
    const transID: number = Math.floor(Math.random() * 1000000)

    const order = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
      app_user: _user?.user_name,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: event?.ticket_price,
      callback_url: 'https://b074-1-53-37-194.ngrok-free.app/callback',
      description: `Booking Event - Payment for the order #${transID}`,
      bank_code: '',
      mac: ''
    }

    const data: string =
      config.app_id +
      '|' +
      order.app_trans_id +
      '|' +
      order.app_user +
      '|' +
      order.amount +
      '|' +
      order.app_time +
      '|' +
      order.embed_data +
      '|' +
      order.item
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString()
    try {
      const result = await axios.post(config.endpoint, null, { params: order })
      console.log('🚀 ~ result.data.order_url:', result.data.order_url)

      return res.json({
        message: 'Answer form success',
        data: {
          url: result.data.order_url
        }
      })
    } catch (error) {
      console.log('🚀 ~ error:', error)

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
    }
  }

  return res.redirect(`${env.DB_HOST}:${env.PORT_FE}`) as any
}
