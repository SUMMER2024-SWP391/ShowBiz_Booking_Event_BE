import { checkSchema } from 'express-validator'
import { EventTypeEnum, LocationType } from '~/constants/enums'
import { validate } from '~/utils/validation'
import { REGEX_DATE, REGEX_TIME } from '~/constants/regex'
import eventService from './event.services'
import { EVENT_MESSAGES } from '../user/user.messages'
import { Event, compareTimes, convertTimeToMinutes, isDateOneWeekLater, isTimeConflict } from '~/utils/common'
import { NextFunction, Request, Response } from 'express'
import { TokenPayload } from '../user/user.requests'
import registerService from '../register/register.services'
import { StatusCodes } from 'http-status-codes'
import { ErrorWithStatus } from '~/models/Errors'

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
            const result = await eventService.getAllEventList()

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

export const registerrEventValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { id } = req.params
  const checkRegistered = await registerService.checkRegistered(id, user_id)
  if (checkRegistered) {
    throw new ErrorWithStatus({ message: EVENT_MESSAGES.YOU_REGISTERED_THIS_EVENT, status: StatusCodes.BAD_REQUEST })
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
