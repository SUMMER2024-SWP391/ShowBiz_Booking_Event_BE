import databaseService from '~/database/database.services'
import { EventRequestBody } from './event.requests'
import { ObjectId } from 'mongodb'
import Event from './event.schema';

class EventService {
  async createEvent(user_id: string, body: EventRequestBody) {
    const id = new ObjectId()
    const { name, capacity, ticket_price, type_event, location, date_event, time_end, time_start } = body

    const result = await databaseService.events.insertOne(
      new Event({
        _id: id,
        name,
        capacity,
        ticket_price,
        type_event,
        location,
        date_event,
        time_start,
        time_end,
        event_operator_id: new ObjectId(user_id),
        status: 1
      })
    )
  }
}

const eventService = new EventService()
export default eventService
