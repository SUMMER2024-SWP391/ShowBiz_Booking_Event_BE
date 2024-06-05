import { ObjectId } from 'mongodb'
import Question from './question.schema'
import databaseService from '~/database/database.services'

class QuestionService {
  async createNewListQuestion(idForm: ObjectId, questionList: string[]) {
    //import question list to db , mỗi câu hỏi là 1 document
    const result = await databaseService.questions.insertMany(
      questionList.map((question) => ({
        _id: new ObjectId(),
        description: question,
        form_id: idForm
      }))
    )

    return result
  }
}

const questionService = new QuestionService()
export default questionService
