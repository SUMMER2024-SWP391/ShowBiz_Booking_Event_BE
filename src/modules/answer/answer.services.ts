import databaseService from '~/database/database.services'
import Answer from './answer.schema'
import { ObjectId } from 'mongodb'

class AnswerService {
  async createListAnswer(user_id: string, answers: Pick<Answer, 'question_id' | 'description'>[]) {
    for (let i = 0; i < answers.length; i++) {
      const answer = await databaseService.answers.insertOne(
        new Answer({
          _id: new ObjectId(),
          visitor_id: new ObjectId(user_id),
          description: answers[i].description,
          question_id: new ObjectId(answers[i].question_id)
        })
      )
    }
  }
}

const answerService = new AnswerService()
export default answerService
