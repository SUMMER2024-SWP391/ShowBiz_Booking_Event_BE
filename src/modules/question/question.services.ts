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

  async getListQuestion(id: ObjectId) {
    const listQuestion = await databaseService.questions
      .find(
        {
          form_id: id
        },
        {
          projection: {
            form_id: 0
          }
        }
      )
      .toArray()
    return listQuestion
  }
}

const questionService = new QuestionService()
export default questionService
