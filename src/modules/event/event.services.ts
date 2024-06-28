import databaseService from '~/database/database.services'
import { EventRequestBody } from './event.requests'
import { ObjectId } from 'mongodb'
import Event from './event.schema'
import { env } from '~/config/environment'
import { EventStatus } from '~/constants/enums'
import { omit } from 'lodash'
import { EventReponse } from './event.response'

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

  async getAllEventListApproved() {
    return await databaseService.events.countDocuments({
      status: EventStatus.APPROVED
    })
  }

  async getEventList({ limit, page }: { limit: number; page: number }) {
    const [events, total, event] = await Promise.all([
      databaseService.events
        .aggregate([
          {
            $match: {
              status: EventStatus.APPROVED
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
          { $skip: page * limit - limit },
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
        .aggregate([
          {
            $match: {
              status: EventStatus.APPROVED
            }
          },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          { $count: 'total' }
        ])
        .toArray(),
      this.getAllEventListApproved()
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
      this.getAllEventListApproved()
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
      .aggregate<EventReponse>([
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

  async getEventByDateAndLocation(date_event: string, location: string) {
    return await databaseService.events
      .aggregate([
        {
          $match: {
            date_event: date_event,
            location: location
          }
        }
      ])
      .toArray()
  }

  async getEventListOperator(id: string) {
    return await databaseService.events
      .find(
        { event_operator_id: new ObjectId(id) },
        {
          projection: {
            name: 1,
            capacity: 1,
            location: 1,
            status: 1,
            _id: 1,
            ticket_price: 1
          }
        }
      )
      .toArray()
  }

  async checkEventExist(id: string) {
    const result = await databaseService.events.findOne({ _id: new ObjectId(id) })
    return result
  }

  async getListRegisterEvent(event_operator_id: ObjectId) {
    return await databaseService.events
      .aggregate([
        {
          $match: {
            event_operator_id: event_operator_id
          }
        },
        {
          $lookup: {
            from: env.DB_COLLECTION_REGISTERS,
            localField: '_id',
            foreignField: 'event_id',
            as: 'registrations'
          }
        },
        {
          $addFields: {
            total_visitor: { $size: '$registrations' }
          }
        },
        {
          $addFields: {
            limit: {
              $concat: [{ $toString: '$total_visitor' }, ' / ', { $toString: '$capacity' }]
            }
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            capacity: 1,
            description: 1,
            date_event: 1,
            time_start: 1,
            time_end: 1,
            location: 1,
            total_visitor: 1,
            limit: 1
          }
        }
      ])
      .toArray()
  }

  async checkPayment(event_id: string) {
    const event = await databaseService.events.findOne({ _id: new ObjectId(event_id) })

    return (event?.ticket_price as number) > 0 ? true : false
  }

  async cancelEvent(visitor_id: string, event_id: string) {
    await databaseService.registers.deleteOne({
      visitor_id: new ObjectId(visitor_id),
      event_id: new ObjectId(event_id)
    })
  }
}

const eventService = new EventService()
export default eventService
