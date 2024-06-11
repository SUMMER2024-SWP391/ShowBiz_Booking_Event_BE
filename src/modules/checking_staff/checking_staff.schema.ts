import { ObjectId } from 'mongodb'

interface CheckingStaffType {
  _id?: ObjectId
  user_id: ObjectId
  event_id: ObjectId
}

export default class CheckingStaff {
  _id?: ObjectId
  user_id: ObjectId
  event_id: ObjectId

  constructor({ _id, user_id, event_id }: CheckingStaffType) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.event_id = event_id
  }
}
