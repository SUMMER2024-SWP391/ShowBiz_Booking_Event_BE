import { ObjectId } from 'mongodb'
import { StatusRegisterEvent } from '~/constants/enums'

type RegisterType = {
  _id?: ObjectId
  event_id: ObjectId
  visitor_id: ObjectId
  status_check_in: boolean
  otp_check_in: string
  time_register: string
  status_register: StatusRegisterEvent
}

export default class Register {
  _id?: ObjectId
  event_id: ObjectId
  visitor_id: ObjectId
  status_check_in: boolean
  otp_check_in: string
  time_register: string
  status_register: StatusRegisterEvent

  constructor(data: RegisterType) {
    this._id = data._id
    this.event_id = data.event_id
    this.visitor_id = data.visitor_id
    this.status_check_in = data.status_check_in
    this.otp_check_in = data.otp_check_in || ''
    this.time_register = data.time_register
    this.status_register = data.status_register
  }
}
