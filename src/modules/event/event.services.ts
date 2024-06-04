import databaseService from '~/database/database.services'
import { EventRequestBody } from './event.requests'
import { ObjectId } from 'mongodb'
import Event from './event.schema'
import { env } from '~/config/environment'
import { EventStatus } from '~/constants/enums'
import { time } from 'console'
import { add } from 'lodash'

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
              from: env.DB_COLLECTION_USERS,
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
              event_operator: {
                password: 0,
                created_at: 0,
                role: 0,
                status: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                date_of_birth: 0,
                point: 0
              }
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

  async getPendingEventList({ limit, page }: { limit: number; page: number }) {
    const [events, total, event] = await Promise.all([
      databaseService.events
        .aggregate([
          { $match: { status: EventStatus.PENDING } },
          {
            $lookup: {
              from: env.DB_COLLECTION_USERS,
              localField: 'event_operator_id',
              foreignField: '_id',
              as: 'event_operator'
            }
          },
          {
            $project: {
              status: 0,
              description: 0,
              image: 0,
              date_event: 0,
              type_event: 0,
              category: 0,
              time_start: 0,
              time_end: 0,
              address: 0,
              event_operator_id: 0,
              event_operator: {
                password: 0,
                created_at: 0,
                role: 0,
                status: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                date_of_birth: 0,
                point: 0,
                verify_status: 0,
                avatar: 0,
                phone_number: 0,
                updated_at: 0,
                email: 0
              }
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
      await databaseService.events
        .aggregate([{ $skip: (page - 1) * limit }, { $limit: limit }, { $count: 'total' }])
        .toArray(),
      this.getAllEventList()
    ])
    const sum_page = Math.ceil(event / limit)

    return { events, total: total[0].total, sum_page }
  }

  async handleStatusEvent(id: string, status: EventStatus) {
    const result = await databaseService.events.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { status: status }
      }
    )
    return result
  }

  async getEventById(id: string) {
    const result = await databaseService.events
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $lookup: {
            from: env.DB_COLLECTION_USERS,
            localField: 'event_operator_id',
            foreignField: '_id',
            as: 'event_operator'
          }
        },
        {
          $addFields: {
            event_operator: {
              $arrayElemAt: ['$event_operator', 0]
            }
          }
        },
        {
          $project: {
            event_operator_id: 0,
            event_operator: {
              password: 0,
              created_at: 0,
              role: 0,
              status: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              date_of_birth: 0,
              point: 0
            }
          }
        }
      ])
      .toArray()
    return result[0]
  }
}

const eventService = new EventService()
export default eventService
