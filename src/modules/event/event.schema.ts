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
  category?: EventCategory
  address: string
  status?: EventStatus
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
  address: string
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
    event_operator_id,
    status,
    address
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
    this.category = ticket_price === 0 ? EventCategory.FREE : EventCategory.PAID
    this.status = EventStatus.PENDING
    this.address =
      address || 'Lô E2a-7, Đường D1, Khu Công Nghệ Cao, P.Long Thạnh Mỹ, Tp.Thủ Đức, Hồ Chí Minh City, Vietnam, Trái Đất..'
  }
}
