import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'
import { FORM_MESSAGE } from './form.messages'

export const createFormQuestionMiddleware = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: (value) => {
            if (!value) {
              throw new Error(FORM_MESSAGE.EVENT_ID_IS_REQUIRED)
            }

            if (!ObjectId.isValid(value)) {
              throw new Error(FORM_MESSAGE.EVENT_ID_IS_INVALID)
            }

            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)
