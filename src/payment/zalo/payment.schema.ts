import { ObjectId } from 'mongodb'

type PaymentZaloType = {
  _id?: ObjectId
  apptransid: string
  date: Date
  reigster_id: ObjectId
  return_code: number
}

export class PaymentZalo {
  _id?: ObjectId
  apptransid: string
  date: Date
  register_id: ObjectId
  return_code: number

  constructor(data: PaymentZaloType) {
    ;(this._id = data._id), (this.apptransid = data.apptransid)
    this.date = data.date
    this.register_id = data.reigster_id
    this.return_code = data.return_code
  }
}
