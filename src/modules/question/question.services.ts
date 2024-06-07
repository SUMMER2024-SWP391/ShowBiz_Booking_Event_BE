import { ObjectId } from 'mongodb'
import databaseService from '~/database/database.services'

class QuestionService {
  async createNewListQuestion(idForm: ObjectId, questionList: string[]) {
    //import question list to db , mỗi câu hỏi là 1 document
    return await databaseService.questions.insertMany(
      questionList.map((question) => ({
        _id: new ObjectId(),
        description: question,
        form_id: idForm
      }))
    )
  }

  async getListQuestion(id: ObjectId) {
    return await databaseService.questions
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
  }
}

const questionService = new QuestionService()
export default questionService
