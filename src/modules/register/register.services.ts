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
            from: env.DB_COLLECTION_EVENTS,
            localField: 'event_id',
            foreignField: '_id',
            as: 'event_detail'
          }
        },
        {
          $unwind: '$event_detail'
        },
        {
          $group: {
            _id: '$visitor_id',
            events: {
              $push: {
                eventId: '$event_detail._id',
                eventName: '$event_detail.name',
                date: '$event_detail.date_event',
                participantLimit: '$event_detail.capacity'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            visitor_id: '$visitor_id',
            events: 1
          }
        }
      ])
      .toArray()
  }
}

const registerService = new RegisterService()
export default registerService
