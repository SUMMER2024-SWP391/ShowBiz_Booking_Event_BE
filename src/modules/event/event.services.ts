import databaseService from '~/database/database.services'
import { EventRequestBody } from './event.requests'
import { ObjectId } from 'mongodb'
import Event from './event.schema'

class EventService {
  async createEvent(user_id: string, body: EventRequestBody) {
    const result = await databaseService.events.insertOne(
      new Event({
        ...body,
        event_operator_id: new ObjectId(user_id)
      })
    )

    return await databaseService.events.findOne({ _id: result.insertedId })
  }
}

const eventService = new EventService()
export default eventService
