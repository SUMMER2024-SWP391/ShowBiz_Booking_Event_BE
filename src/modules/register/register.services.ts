import databaseService from '~/database/database.services'
import Register from './register.schema'
import { ObjectId } from 'mongodb'

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

    const data = await this.getRegisterEventByIdRegister(result.insertedId)
    return data
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
}

const registerService = new RegisterService()
export default registerService
