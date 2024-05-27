import { ObjectId } from 'mongodb'
import { EventCategory, EventStatus, EventTypeEnum, LocationType } from '~/constants/enums'

interface EventType {
  _id?: ObjectId
  name: string
  capacity: number
  ticket_price?: number
  description?: string
  type_event: EventTypeEnum
  date_event: string
  time_start: string
  time_end: string
  location: LocationType
  event_operator_id: ObjectId
  image?: string
  qr_code?: string
  category?: EventCategory
  status: EventCategory
}

export default class Event {
  _id?: ObjectId
  name: string
  capacity: number
  ticket_price: number
  description: string
  type_event: EventTypeEnum
  date_event: string
  time_start: string
  time_end: string
  location: LocationType
  event_operator_id: ObjectId
  image: string
  qr_code: string
  category: EventCategory
  status: EventStatus

  constructor({
    _id,
    name,
    capacity,
    ticket_price,
    description,
    type_event,
    date_event,
    time_start,
    time_end,
    location,
    image,
    qr_code,
    event_operator_id
  }: EventType) {
    this._id = _id
    this.name = name
    this.capacity = capacity
    this.ticket_price = ticket_price || 0
    this.description = description || ''
    this.type_event = type_event
    this.date_event = date_event
    this.time_start = time_start
    this.time_end = time_end
    this.location = location
    this.event_operator_id = event_operator_id
    this.image = image || ''
    this.qr_code = qr_code || ''
    this.category = ticket_price === 0 ? EventCategory.FREE : EventCategory.PAID
    this.status = EventStatus.PENDING
  }
}
