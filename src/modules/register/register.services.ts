import databaseService from '~/database/database.services'
import Register from './register.schema'
import { ObjectId } from 'mongodb'
import { env } from '~/config/environment'

class RegisterService {
  async registerEvent(id: string, user_id: string) {
    const result = await databaseService.registers.insertOne(
      new Register({
        _id: new ObjectId(),
        event_id: new ObjectId(id),
        visitor_id: new ObjectId(user_id),
        status_check_in: false,
        qr_code: ''
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
    return await databaseService.registers
      .aggregate([
        {
          $match: {
            visitor_id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'events',
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
            'event._id': 0,
            'event_operator._id': 0,
            'event.capacity': 0,
            'event.description': 0,
            'event.event_operator_id': 0,
            'event.category': 0,
            'event.type_event': 0,
            'event.status': 0,
            'event.ticket_price': 0,
            'event.time_start': 0,
            'event.time_end': 0,
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
  }
}

const registerService = new RegisterService()
export default registerService
