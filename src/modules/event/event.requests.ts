import { ObjectId } from 'mongodb'
import { EventStatus, EventTypeEnum, LocationType } from '~/constants/enums'
import Answer from '../answer/answer.schema'

export interface EventRequestBody {
  name: string
  capacity: number
  ticket_price: number
  description?: string
  type_event: EventTypeEnum
  date_event: string
  time_start: string
  time_end: string
  location: LocationType
  image: string
  qr_code?: string
  event_operator_id: ObjectId
  address: string
  speaker_name: string
  sponsor_name: string
  is_required_form_register: boolean
  speaker_mail: string
  sponsor_mail: string
}

export interface Pagination {
  limit: string
  page: string
}

export interface HandleStatusEventReqBody {
  status: EventStatus.APPROVED | EventStatus.REJECTED
}

export interface RegisterEventReqBody {
  answers: Pick<Answer, 'question_id' | 'description'>[]
}

export interface FeedbackEventReqBody {
  answers: Pick<Answer, 'question_id' | 'description'>[]
}
