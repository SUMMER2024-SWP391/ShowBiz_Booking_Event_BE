import { ObjectId } from 'mongodb'
import { EventStatus, EventTypeEnum, LocationType } from '~/constants/enums'

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
  qr_code: string
  event_operator_id: ObjectId
  address: string
}

export interface Pagination {
  limit: string
  page: string
}

export interface HandleStatusEventReqBody {
  status: EventStatus.APPROVED | EventStatus.REJECTED
}
