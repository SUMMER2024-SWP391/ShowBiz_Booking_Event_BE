import { checkSchema } from 'express-validator'
import { EventStatus } from '~/constants/enums'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const eventStatus = numberEnumToArray(EventStatus)

export const confirmEventValidator = validate(
  checkSchema(
    {
      // check status phải là 1 trong các giá trị của EventStatus
      status: {
        in: ['body'],
        isInt: true,
        toInt: true,
        isIn: { options: [eventStatus] }
      }
    },
    ['body']
  )
)
