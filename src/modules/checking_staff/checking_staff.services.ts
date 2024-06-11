import { ObjectId } from 'mongodb'
import databaseService from '~/database/database.services'

class CheckingStaffServices {
  async checkDuplicateCheckingStaff(event_id: ObjectId, user_id: ObjectId) {
    return Boolean(await databaseService.checking_staffs.findOne({ event_id, user_id }))
  }
}

const checkingStaffServices = new CheckingStaffServices()
export default checkingStaffServices
