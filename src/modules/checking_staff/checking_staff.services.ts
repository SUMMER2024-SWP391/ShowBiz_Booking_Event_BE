import { ObjectId } from 'mongodb'
import databaseService from '~/database/database.services'
import eventService from '../event/event.services'
import CheckingStaff from './checking_staff.schema'
import { EventStatus } from '~/constants/enums'

class CheckingStaffServices {
  async checkDuplicateCheckingStaff(event_id: ObjectId, user_id: ObjectId) {
    return Boolean(await databaseService.checking_staffs.findOne({ event_id, user_id }))
  }

  async listEventOfStaff(id: string) {
    const listEvent = await databaseService.checking_staffs
      .find({
        user_id: new ObjectId(id)
      })
      .toArray()

    const result: CheckingStaff[] = []

    for (let i = 0; i < listEvent.length; i++) {
      const event = await eventService.getEventById(listEvent[i].event_id.toString())
      const nowDate = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`
      if (new Date(nowDate) < new Date(event.category) || event.status === EventStatus.APPROVED) {
        result.push(listEvent[i])
      }
    }

    return result
  }
}

const checkingStaffServices = new CheckingStaffServices()
export default checkingStaffServices
