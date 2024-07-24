import { ObjectId } from 'mongodb'

type QuestionType = {
  _id?: ObjectId
  form_id: ObjectId
  description: string
  answer: Array<{ description: string; user_name: string }>
}

export default class Question {
  _id?: ObjectId
  form_id: ObjectId
  description: string
  answer: Array<{ description: string; user_name: string }>
  constructor(data: QuestionType) {
    this._id = data._id
    this.form_id = data.form_id
    this.description = data.description
    this.answer = data.answer
  }
}
