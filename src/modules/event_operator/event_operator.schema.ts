import { ObjectId } from 'mongodb'

interface EventOperatorType {
  _id?: ObjectId
  email: string
  password: string
  name: string
  created_at?: Date
}

export default class EventOperator {
  _id?: ObjectId
  email: string
  password: string
  name: string
  created_at?: Date

  constructor({ _id, email, password, created_at, name }: EventOperatorType) {
    this._id = _id || new ObjectId()
    this.email = email
    this.password = password
    this.name = name || ''
    this.created_at = created_at || new Date()
  }
}
