import { ObjectId } from 'mongodb'
import { EventQuestionType } from './form.enum'

type FormEventType = {
  _id?: ObjectId
  event_id: ObjectId
  type: EventQuestionType
}

export class FormEvent {
  _id?: ObjectId
  event_id: ObjectId
  type: EventQuestionType

  constructor(data: FormEventType) {
    this._id = data._id
    this.event_id = data.event_id
    this.type = data.type
  }
}
