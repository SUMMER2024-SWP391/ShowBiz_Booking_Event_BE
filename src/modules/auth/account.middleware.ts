import { checkSchema } from 'express-validator'
import { EventStatus } from '~/constants/enums'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'
import { EVENT_MESSAGES } from '../user/user.messages'

export const confirmEventValidator = validate(
  checkSchema(
    {
      // check status phải là 1 trong các giá trị của EventStatus
      status: {
        custom: {
          options: (value) => {
            if (![EventStatus.APPROVED, EventStatus.REJECTED].includes(value))
              throw new Error(EVENT_MESSAGES.INVALID_EVENT_STATUS)
            return true
          }
        }
      }
    },
    ['body']
  )
)
