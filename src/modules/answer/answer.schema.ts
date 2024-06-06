import { ObjectId } from 'mongodb'

type AnswerType = {
  _id?: ObjectId
  question_id: ObjectId
  description: string
  visitor_id: ObjectId
}

export default class Answer {
  _id?: ObjectId
  question_id: ObjectId
  description: string
  visitor_id: ObjectId

  constructor(data: AnswerType) {
    this._id = data._id
    this.question_id = data.question_id
    this.description = data.description
    this.visitor_id = data.visitor_id
  }
}
