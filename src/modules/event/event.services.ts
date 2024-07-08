import databaseService from '~/database/database.services'
import { EventRequestBody } from './event.requests'
import { ObjectId } from 'mongodb'
import Event from './event.schema'
import { env } from '~/config/environment'
import { EventCategory, EventStatus, StatusRegisterEvent, UserRole } from '~/constants/enums'
import { EventReponse } from './event.response'
import dayjs from 'dayjs'
import User from '../user/user.schema'
import { convertToDateEvent } from '~/utils/common'

class EventService {
  async createEvent(user_id: string, body: EventRequestBody) {
    const ticket_price = body.ticket_price
    const result = await databaseService.events.insertOne(
      new Event({
        ...body,
        category: ticket_price == 0 ? EventCategory.FREE : EventCategory.PAID,
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

  async getEventAdminList() {
    const events = await databaseService.events
      .aggregate([
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
      })

    return events
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

  async getListEventApproved() {
    const result = await databaseService.events
      .find({
        status: EventStatus.APPROVED,
        is_required_form_register: true,
        category: EventCategory.PAID
      })
      .toArray()

    return result.filter(
      (event) =>
        dayjs(`${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`, 'DD-MM-YYYY') <=
        dayjs(event.date_event, 'DD-MM-YYYY')
    )
  }

  async checkPayment(event_id: string) {
    const event = await databaseService.events.findOne({ _id: new ObjectId(event_id) })
    const price = event?.ticket_price as number
    const category = event?.category as string
    if (category === 'Free' || price === 0) {
      return false
    }
    return true
  }

  async cancelEvent(visitor_id: string, event_id: string) {
    await databaseService.registers.deleteOne({
      visitor_id: new ObjectId(visitor_id),
      event_id: new ObjectId(event_id)
    })
  }

  async totalCheckInOrNotInMonth(status: boolean, user: User, startOfMonth: Date, endOfMonth: Date) {
    const start = convertToDateEvent(startOfMonth)
    const end = convertToDateEvent(endOfMonth)
    const userID = new ObjectId(user._id)
    const events = await databaseService.events
      .find({
        date_event: { $gte: start, $lte: end },
        ...(user.role !== UserRole.Admin && { event_operator_id: new ObjectId(user._id) })
      })
      .toArray()
    const eventIds = events.map((event) => event._id)
    const totalCheckIn = await databaseService.registers
      .aggregate([
        {
          $match: {
            event_id: { $in: eventIds },
            status_check_in: status
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()
    const totalCheckInCount = totalCheckIn.length > 0 ? totalCheckIn[0].count : 0

    return totalCheckInCount
  }

  async totalRegisterInMonth(user: User, startOfMonth: Date, endOfMonth: Date) {
    const start = convertToDateEvent(startOfMonth)
    const end = convertToDateEvent(endOfMonth)
    const userID = new ObjectId(user._id)
    const events = await databaseService.events
      .find({
        date_event: { $gte: start, $lte: end },
        ...(user.role !== UserRole.Admin && { event_operator_id: new ObjectId(user._id) })
      })
      .toArray()
    const eventIds = events.map((event) => event._id)
    return await databaseService.registers
      .aggregate([
        {
          $match: {
            event_id: { $in: eventIds }
          }
        }
      ])
      .toArray()
  }

  async getEventwithStatusInMonth(user: User, startOfMonth: Date, endOfMonth: Date) {
    const start = convertToDateEvent(startOfMonth)
    const end = convertToDateEvent(endOfMonth)
    return await databaseService.events
      .find({
        date_event: { $gte: start, $lte: end },
        ...(user.role !== UserRole.Admin && { event_operator_id: new ObjectId(user._id) })
      })
      .toArray()
  }

  async getStatisticalData(user: User, startOfMonth: Date, endOfMonth: Date) {
    const role = user.role
    if (role === 'Admin') {
      const [
        totalEvent,
        totalEventPending,
        totalEventApproved,
        totalEventReject,
        totalRegister,
        totalRegisterSuccess,
        totalRegisterCancel,
        totalCheckin,
        totalNotCheckin
      ] = await Promise.all([
        this.getEventwithStatusInMonth(user, startOfMonth, endOfMonth).then((event) => {
          return event.length
        }),
        this.getEventwithStatusInMonth(user, startOfMonth, endOfMonth).then((event) => {
          return event.filter((item) => item.status === EventStatus.PENDING).length
        }),
        this.getEventwithStatusInMonth(user, startOfMonth, endOfMonth).then((event) => {
          return event.filter((item) => item.status === EventStatus.APPROVED).length
        }),
        this.getEventwithStatusInMonth(user, startOfMonth, endOfMonth).then((event) => {
          return event.filter((item) => item.status === EventStatus.REJECTED).length
        }),
        this.totalRegisterInMonth(user, startOfMonth, endOfMonth).then((event) => {
          const totalRegister = event.length
          return totalRegister
        }),
        this.totalRegisterInMonth(user, startOfMonth, endOfMonth).then((event) => {
          const totalSuccessRegister = event.filter(
            (item) => item.status_register === StatusRegisterEvent.SUCCESS
          ).length
          return totalSuccessRegister
        }),
        this.totalRegisterInMonth(user, startOfMonth, endOfMonth).then((event) => {
          const totalCancelRegister = event.filter((item) => item.status_register === StatusRegisterEvent.CANCEL).length
          return totalCancelRegister
        }),
        this.totalCheckInOrNotInMonth(true, user, startOfMonth, endOfMonth),
        this.totalCheckInOrNotInMonth(false, user, startOfMonth, endOfMonth)
      ])
      return {
        totalEvent,
        totalEventPending,
        totalEventApproved,
        totalEventReject,
        totalRegister,
        totalRegisterSuccess,
        totalRegisterCancel,
        totalCheckin,
        totalNotCheckin
      }
    } else {
      const [
        totalEvent,
        totalEventPending,
        totalEventApproved,
        totalEventReject,
        totalRegister,
        totalSuccessRegister,
        totalCancelRegister,
        totalCheckin,
        totalNotCheckin
      ] = await Promise.all([
        this.getEventwithStatusInMonth(user, startOfMonth, endOfMonth).then((event) => {
          return event.length
        }),
        this.getEventwithStatusInMonth(user, startOfMonth, endOfMonth).then((event) => {
          return event.filter((item) => item.status === EventStatus.PENDING).length
        }),
        this.getEventwithStatusInMonth(user, startOfMonth, endOfMonth).then((event) => {
          return event.filter((item) => item.status === EventStatus.APPROVED).length
        }),
        this.getEventwithStatusInMonth(user, startOfMonth, endOfMonth).then((event) => {
          return event.filter((item) => item.status === EventStatus.REJECTED).length
        }),
        this.totalRegisterInMonth(user, startOfMonth, endOfMonth).then((event) => {
          const totalRegister = event.length
          return totalRegister
        }),
        this.totalRegisterInMonth(user, startOfMonth, endOfMonth).then((event) => {
          const totalSuccessRegister = event.filter(
            (item) => item.status_register === StatusRegisterEvent.SUCCESS
          ).length
          return totalSuccessRegister
        }),
        this.totalRegisterInMonth(user, startOfMonth, endOfMonth).then((event) => {
          const totalCancelRegister = event.filter((item) => item.status_register === StatusRegisterEvent.CANCEL).length
          return totalCancelRegister
        }),
        this.totalCheckInOrNotInMonth(true, user, startOfMonth, endOfMonth),
        this.totalCheckInOrNotInMonth(false, user, startOfMonth, endOfMonth)
      ])
      return {
        totalEvent,
        totalEventPending,
        totalEventApproved,
        totalEventReject,
        totalRegister,
        totalSuccessRegister,
        totalCancelRegister,
        totalCheckin,
        totalNotCheckin
      }
    }
  }

  async searchEvent(eventName: string) {
    return await databaseService.events
      .aggregate([
        {
          $match: {
            name: { $regex: eventName, $options: 'i' }
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            date_event: 1,
            time_start: 1,
            time_end: 1,
            location: 1,
            ticket_price: 1,
            category: 1
          }
        }
      ])
      .toArray()
  }

  async cancelEventRequest(eventId: string) {
    await databaseService.events.updateOne({ _id: new ObjectId(eventId) }, { $set: { status: EventStatus.CANCELED } })
    return { message: 'Cancel event request successfully!' }
  }

  async getEventList({ limit, page }: { limit: number; page: number }) {
    const [events, total, event] = await Promise.all([
      databaseService.events
        .aggregate([
          { $match: { status: EventStatus.APPROVED } },
          {
            $lookup: {
              from: env.DB_COLLECTION_USERS,
              localField: 'event_operator_id',
              foreignField: '_id',
              as: 'event_operator'
            }
          },
          //skip , limit
          { $skip: page * limit - limit },
          { $limit: limit },
          {
            $project: {
              status: 0,
              description: 0,
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
}

const eventService = new EventService()
export default eventService
