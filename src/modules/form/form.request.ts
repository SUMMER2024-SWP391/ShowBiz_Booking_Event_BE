import Question from '../question/question.schema'
import { EventQuestionType } from './form.enum'

export interface CreateFormReqBody {
  questions: string[]
  type: EventQuestionType
}
