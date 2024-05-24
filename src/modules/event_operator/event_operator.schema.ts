import { ObjectId } from 'mongodb'

interface EventOperatorType {
  _id?: ObjectId
  email: string
  password: string
  name: string
  create_at?: Date
}

export default class EventOperator {
  _id?: ObjectId
  email: string
  password: string
  name: string
  create_at?: Date

  constructor({ _id, email, password, create_at, name }: EventOperatorType) {
    this._id = _id || new ObjectId()
    this.email = email
    this.password = password
    this.name = name || ''
    this.create_at = create_at || new Date()
  }
}
