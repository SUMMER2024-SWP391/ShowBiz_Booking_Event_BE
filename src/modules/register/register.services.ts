import databaseService from '~/database/database.services'
import Register from './register.schema'
import { ObjectId } from 'mongodb'
import otpGenerator from 'otp-generator'
import Event from '../event/event.schema'
import { StatusRegisterEvent } from '~/constants/enums'
import { env } from '~/config/environment'

class RegisterService {
  async registerEvent(id: string, user_id: string) {
    const otp = otpGenerator.generate(8, {
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: true,
      digits: true
    })

    const date = `${new Date().getMinutes() + 'm'}-${new Date().getHours() + 'h'}-${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`

    const result = await databaseService.registers.insertOne(
      new Register({
        _id: new ObjectId(),
        event_id: new ObjectId(id),
        visitor_id: new ObjectId(user_id),
        status_check_in: false,
        otp_check_in: otp,
        time_register: date,
        status_register: StatusRegisterEvent.SUCCESS
      })
    )

    return await this.getRegisterEventByIdRegister(result.insertedId)
  }

  async getRegisterEventByIdRegister(id: ObjectId) {
    return await databaseService.registers.findOne({ _id: id })
  }

  async updateQrCode(id: ObjectId, qrCodeURL: string) {
    const result = await databaseService.registers.updateOne(
      {
        _id: id
      },
      {
        $set: {
          qr_code: qrCodeURL
        }
      }
    )
    const data = await this.getRegisterEventByIdRegister(id)
    return data
  }

  async getListRegisterEventByUserId(user_id: string) {
    const result = await databaseService.registers
      .aggregate([
        {
          $match: {
            visitor_id: new ObjectId(user_id),
            status_register: StatusRegisterEvent.SUCCESS
          }
        },
        {
          $lookup: {
            from: env.DB_COLLECTION_EVENTS,
            localField: 'event_id',
            foreignField: '_id',
            as: 'event'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'event.event_operator_id',
            foreignField: '_id',
            as: 'event_operator'
          }
        },
        {
          $project: {
            event_id: 0,
            visitor_id: 0,
            'event_operator._id': 0,
            'event.capacity': 0,
            'event.description': 0,
            'event.event_operator_id': 0,
            'event.category': 0,
            'event.type_event': 0,
            'event.updated_at': 0,
            'event_operator.password': 0,
            'event_operator.email': 0,
            'event_operator.role': 0,
            'event_operator.status': 0,
            'event_operator.email_verify_token': 0,
            'event_operator.forgot_password_token': 0,
            'event_operator.point': 0,
            'event_operator.created_at': 0,
            'event_operator.updated_at': 0
          }
        }
      ])
      .toArray()

    return result
  }

  async checkRegistered(event_id: string, visitor_id: string) {
    return await databaseService.registers.findOne({
      event_id: new ObjectId(event_id),
      visitor_id: new ObjectId(visitor_id),
      status_register: StatusRegisterEvent.SUCCESS
    })
  }

  async getRegisterByEventIdAndUserId(event_id: string, visitor_id: string) {
    return await databaseService.registers.findOne(
      {
        event_id: new ObjectId(event_id),
        visitor_id: new ObjectId(visitor_id),
        status_register: StatusRegisterEvent.SUCCESS
      },
      {
        projection: {
          _id: 1,
          status_check_in: 1,
          otp_check_in: 1,
          time_register: 1,
          status_register: 1
        }
      }
    )
  }

  async checkIn(eventId: string, otp_check_in: string) {
    await databaseService.registers.findOneAndUpdate(
      { event_id: new ObjectId(eventId), otp_check_in },
      { $set: { status_check_in: true } }
    )

    return { message: 'Check in success' }
  }

  async findRegisterByOtp(otp_check_in: string) {
    return await databaseService.registers.findOne({ otp_check_in })
  }

  async getNumberPeopleOfEventByEventId(id: string) {
    const number = await databaseService.registers.countDocuments({
      event_id: new ObjectId(id)
    })

    return number
  }

  async getListRegiserPeople(eventList: Event[]) {
    const result: Register[] = []
    for (let i = 0; i < eventList.length; i++) {
      const register = await databaseService.registers
        .find({
          event_id: eventList[i]._id,
          status_register: StatusRegisterEvent.SUCCESS
        })
        .toArray()
      result.concat(register)
    }

    return result
  }

  async getNumberMemberRegister(event_id: ObjectId) {
    return await databaseService.registers.countDocuments({ event_id: new ObjectId(event_id) })
  }

  async getTicketById(id: string) {
    return await databaseService.registers.findOne({ _id: new ObjectId(id) })
  }

  async getListRegiserPeopleOfOneEvent(event_id: string) {
    return await databaseService.registers
      .find({
        event_id: new ObjectId(event_id),
        status_register: StatusRegisterEvent.SUCCESS
      })
      .toArray()
  }
  async getListRegisteredVisistorByEventOperator(event_id: string) {
    const result = await databaseService.registers
      .aggregate([
        {
          $match: {
            event_id: new ObjectId(event_id),
            status_register: { $in: [StatusRegisterEvent.SUCCESS, StatusRegisterEvent.CANCEL] }
          }
        },
        {
          $lookup: {
            from: env.DB_COLLECTION_USERS,
            localField: 'visitor_id',
            foreignField: '_id',
            as: 'visitor'
          }
        },
        {
          $unwind: '$visitor' // Tách các phần tử của mảng visitor thành các tài liệu riêng biệt
        },
        {
          $sort: {
            status_register: -1 // "registered" trước "cancel"
          }
        },
        {
          $group: {
            _id: '$visitor._id',
            user_name: { $first: '$visitor.user_name' },
            status_register: { $first: '$status_register' }
          }
        },
        {
          $project: {
            _id: 1,
            user_name: 1,
            status_register: 1
          }
        }
      ])
      .toArray()

    return result
  }

  async checkCancelEvent(event_id: string, visitor_id: string) {
    return await databaseService.registers
      .find({
        visitor_id: new ObjectId(visitor_id),
        event_id: new ObjectId(event_id),
        status_register: StatusRegisterEvent.CANCEL
      })
      .toArray()
  }

  async isRegisteredEvent(event_id: ObjectId, visitor_id: ObjectId) {
    return Boolean(
      await databaseService.registers.findOne({
        event_id,
        visitor_id
      })
    )
  }
}

const registerService = new RegisterService()
export default registerService
