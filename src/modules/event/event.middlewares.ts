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
        isString: { errorMessage: 'Name must be a string' },
        notEmpty: { errorMessage: 'Name is required' }
      },
      capacity: {
        isNumeric: { errorMessage: 'Capacity must be a number' },
        notEmpty: { errorMessage: 'Capacity is required' }
      },
      ticket_price: {
        isNumeric: { errorMessage: 'Ticket price must be a number' },
        notEmpty: { errorMessage: 'Ticket is required' }
      },
      type_event: {
        isIn: {
          options: [EventTypeEnum],
          errorMessage: EVENT_MESSAGES.INVALID_TYPE
        }
      },
      date_event: {
        isString: { errorMessage: 'Date event must be a string' },
        notEmpty: { errorMessage: 'Date event is required' },
        custom: {
          options: (value) => {
            if (!REGEX_DATE.test(value)) throw new Error('Date event must be in the format DD-MM-YYYY')
            if (new Date(value) < new Date()) throw new Error('Date event must be in the future')
            return true
          }
        }
      },
      time_start: {
        isString: { errorMessage: 'Time start must be a string' },
        notEmpty: { errorMessage: 'Time start is required' },
        custom: {
          options: (value) => {
            if (!REGEX_TIME.test(value)) throw new Error('Time start must be in the format hh:mm:ss')
            if (new Date(value) < new Date()) throw new Error('Time start must be in the future')

            return true
          }
        }
      },
      time_end: {
        isString: { errorMessage: 'Time end must be a string' },
        notEmpty: { errorMessage: 'Time end is required' },
        custom: {
          options: (value, { req }) => {
            if (!REGEX_TIME.test(value)) throw new Error('Time start must be in the format hh:mm:ss')
            if (new Date(value) < new Date(req.body.time_start)) throw new Error('Time end must be after time start')

            return true
          }
        }
      },
      location: {
        isIn: {
          options: [LocationType],
          errorMessage: 'Invalid location'
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
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
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
