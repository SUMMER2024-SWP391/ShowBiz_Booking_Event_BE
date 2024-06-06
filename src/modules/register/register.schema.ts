import { ObjectId } from 'mongodb'

type RegisterType = {
  _id?: ObjectId
  event_id: ObjectId
  visitor_id: ObjectId
  status_check_in: boolean
}

export default class Register {
  _id?: ObjectId
  event_id: ObjectId
  visitor_id: ObjectId
  status_check_in: boolean

  constructor(data: RegisterType) {
    this._id = data._id
    this.event_id = data.event_id
    this.visitor_id = data.visitor_id
    this.status_check_in = data.status_check_in
  }
}
