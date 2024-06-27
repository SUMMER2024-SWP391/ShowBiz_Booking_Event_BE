import { ObjectId } from 'mongodb'

type PaymentZaloType = {
  _id?: ObjectId
  apptransid: string
  amount: string
  date: Date
  reigster_id: ObjectId
}

export class PaymentZalo {
  _id?: ObjectId
  apptransid: string
  amount: string
  date: Date
  register_id: ObjectId

  constructor(data: PaymentZaloType) {
    ;(this._id = data._id), (this.apptransid = data.apptransid)
    this.amount = data.amount
    this.date = data.date
    this.register_id = data.reigster_id
  }
}
