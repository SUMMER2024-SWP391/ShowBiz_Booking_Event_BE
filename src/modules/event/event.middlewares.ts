import { checkSchema } from 'express-validator'
import { EventTypeEnum, LocationType } from '~/constants/enums'
import { validate } from '~/utils/validation'
import { REGEX_DATE, REGEX_TIME } from '~/constants/regex'
import eventService from './event.services'
import { EVENT_MESSAGES } from '../user/user.messages'

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
          options: [EventTypeEnum],
          errorMessage: EVENT_MESSAGES.INVALID_TYPE
        }
      },
      date_event: {
        isString: { errorMessage: EVENT_MESSAGES.DATE_EVENT_MUST_BE_A_STRING },
        notEmpty: { errorMessage: EVENT_MESSAGES.DATE_EVENT_IS_REQUIRED },
        custom: {
          options: (value) => {
            if (!REGEX_DATE.test(value)) throw new Error(EVENT_MESSAGES.INVALID_DATE)
            if (new Date(value) < new Date()) throw new Error(EVENT_MESSAGES.DATE_EVENT_MUST_BE_IN_THE_FUTURE)

            return true
          }
        }
      },
      time_start: {
        isString: { errorMessage: EVENT_MESSAGES.TIME_START_MUST_BE_A_STRING },
        notEmpty: { errorMessage: EVENT_MESSAGES.TIME_START_IS_REQUIRED },
        custom: {
          options: (value) => {
            if (!REGEX_TIME.test(value)) throw new Error(EVENT_MESSAGES.TIME_START_MUST_MATCH_FORMAT)
            if (new Date(value) < new Date()) throw new Error(EVENT_MESSAGES.TIME_START_MUST_BE_IN_THE_FUTURE)

            return true
          }
        }
      },
      time_end: {
        isString: { errorMessage: EVENT_MESSAGES.TIME_END_MUST_BE_A_STRING },
        notEmpty: { errorMessage: EVENT_MESSAGES.TIME_END_IS_REQUIRED },
        custom: {
          options: (value, { req }) => {
            if (!REGEX_TIME.test(value)) throw new Error(EVENT_MESSAGES.TIME_END_MUST_MATCH_FORMAT)
            if (new Date(value) < new Date(req.body.time_start))
              throw new Error(EVENT_MESSAGES.TIME_END_MUST_BE_IN_THE_FUTURE)

            return true
          }
        }
      },
      location: {
        isIn: {
          options: [LocationType],
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
