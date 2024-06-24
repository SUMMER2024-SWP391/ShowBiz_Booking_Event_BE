import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'
import { FORM_MESSAGE } from './form.messages'
import databaseService from '~/database/database.services'
import { EventStatus } from '~/constants/enums'
import { EventQuestionType } from './form.enum'

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
      },
      type: {
        custom: {
          options: async (value, { req }) => {
            const id = req?.params?.id
            const result = await databaseService.forms.findOne({ event_id: new ObjectId(id), type: value })
            if (result) {
              throw new Error(FORM_MESSAGE.FORM_IS_EXIST)
            }
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)

export const updateFormQuestionMiddleware = validate(
  checkSchema(
    {
      type: {
        custom: {
          options: async (value, { req }) => {
            const id = req?.params?.id
            const result = await databaseService.forms.findOne({ event_id: new ObjectId(id), type: value })
            if (!result) {
              throw new Error(FORM_MESSAGE.FORM_IS_NOT_EXIST)
            }

            const event = await databaseService.events.findOne({ _id: new ObjectId(id) })
            //khi event đã mở rồi thì không thể update form register được
            if ([EventStatus.APPROVED].includes(event?.status as EventStatus) && value === EventQuestionType.REGISTER) {
              throw new Error(FORM_MESSAGE.CAN_NOT_UPDATE_FORM_REGISTER_WHEN_EVENT_OPENED)
            }

            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)
