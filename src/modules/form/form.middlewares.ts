import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'
import { FORM_MESSAGE } from './form.messages'
import databaseService from '~/database/database.services'
import { EventStatus } from '~/constants/enums'
import { EventQuestionType } from './form.enum'
import eventService from '../event/event.services'
import { NextFunction, Request, Response } from 'express'
import { canCreateFeedBack, isBeforeToday } from '~/utils/common'
import { EVENT_MESSAGES } from '../user/user.messages'


export const createFormQuestionMiddleware = validate(
  checkSchema(
    {
      id: {
        custom: {
          options: (value) => {
            if (!value) throw new Error(FORM_MESSAGE.EVENT_ID_IS_REQUIRED)
            if (!ObjectId.isValid(value)) throw new Error(FORM_MESSAGE.EVENT_ID_IS_INVALID)

            return true
          }
        }
      },
      type: {
        isIn: {
          options: [[EventQuestionType.REGISTER, EventQuestionType.FEEDBACK]],
          errorMessage: FORM_MESSAGE.TYPE_IS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const id = req?.params?.id
            const result = await databaseService.forms.findOne({ event_eventId: new ObjectId(id), type: value })
            if (result) throw new Error(FORM_MESSAGE.FORM_IS_EXIST)
            
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

export const checkTimeEventMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const event = await eventService.findEventById(id)

  if (!event) throw new Error(EVENT_MESSAGES.EVENT_NOT_FOUND)
    
  if (event.status !== EventStatus.APPROVED) throw new Error('EVENT_IS_NOT_APPROVED')

  if (!isBeforeToday(event.date_event)) throw new Error('Cannot create form as the deadline has passed!')
  
  if (!canCreateFeedBack(event.time_end)) throw new Error(EVENT_MESSAGES.CANNOT_FEEDBACK)


  next()
}
