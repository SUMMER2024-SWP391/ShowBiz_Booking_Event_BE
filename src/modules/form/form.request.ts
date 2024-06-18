import { EventQuestionType } from './form.enum'

export interface CreateFormReqBody {
  questions: string[]
  type: EventQuestionType
}

export interface UpdateFormQuestionReqBody {
  questions: Array<{
    _id: string
    description: string
  }>
  type: EventQuestionType
}
