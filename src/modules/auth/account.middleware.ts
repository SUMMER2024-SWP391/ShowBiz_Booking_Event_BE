import { checkSchema } from 'express-validator'
import { EventStatus } from '~/constants/enums'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const eventStatus = numberEnumToArray(EventStatus)

export const confirmEventValidator = validate(
  checkSchema(
    {
      status: {
        in: ['body'],
        isInt: true,
        toInt: true,
        isIn: {
          options: [eventStatus]
        }
      }
    },
    ['body']
  )
)
