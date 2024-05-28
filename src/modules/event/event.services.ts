import databaseService from '~/database/database.services'
import { EventRequestBody } from './event.requests'
import { ObjectId } from 'mongodb'
import Event from './event.schema'
import { env } from '~/config/environment'

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

  async getAllEventList() {
    return await databaseService.events.countDocuments()
  }

  async getEventList({ limit, page }: { limit: number; page: number }) {
    const [events, total, event] = await Promise.all([
      databaseService.events
        .aggregate([
          {
            $lookup: {
              from: env.DB_COLLECTION_EVENT_OPERATORS,
              localField: 'event_operator_id',
              foreignField: '_id',
              as: 'event_operator'
            }
          },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              event_operator_id: 0,
              event_operator: { password: 0, created_at: 0 }
            }
          }
        ])
        .toArray()
        .then((events) => {
          return events.map((event) => {
            return {
              ...event,
              event_operator: event.event_operator[0]
            }
          })
        }),
      databaseService.events
        .aggregate([{ $skip: (page - 1) * limit }, { $limit: limit }, { $count: 'total' }])
        .toArray(),
      this.getAllEventList()
    ])
    const sum_page = Math.ceil(event / limit)

    return { events, total: total[0].total, sum_page }
  }
}

const eventService = new EventService()
export default eventService
