import { ObjectId } from 'mongodb'
import databaseService from '~/database/database.services'

class QuestionService {
  async createNewListQuestion(idForm: ObjectId, questionList: string[]) {
    //import question list to db , mỗi câu hỏi là 1 document
    return await databaseService.questions.insertMany(
      questionList.map((question) => ({
        _id: new ObjectId(),
        description: question,
        form_id: idForm,
        answer: []
      }))
    )
  }

  async getListQuestion(id: ObjectId) {
    return await databaseService.questions.find({ form_id: id }, { projection: { form_id: 0 } }).toArray()
  }

  async updateListQuestion(id: ObjectId, questions: Array<{ _id: string; description: string }>) {
    //update question list
    await Promise.all(
      questions.map(async (question) => {
        await databaseService.questions.updateOne(
          {
            _id: new ObjectId(question._id)
          },
          {
            $set: {
              description: question.description
            }
          }
        )
      })
    )
  }

  async addNewQuestion(idForm: ObjectId, question: string[]) {
    //add new question to form
    return await databaseService.questions.insertMany(
      question.map((question) => ({
        _id: new ObjectId(),
        description: question,
        form_id: idForm,
        answer: []
      }))
    )
  }

  async deleteQuestion(id: string) {
    //delete question by id
    return await databaseService.questions.deleteOne({ _id: new ObjectId(id) })
  }

  async addAnswer(form_id: ObjectId, answer: Array<{ user_name: string; description: string; question_id: string }>) {
    return await Promise.all(
      answer.map(async (answer) => {
        await databaseService.questions.updateOne(
          { _id: new ObjectId(answer.question_id), form_id },
          {
            $push: {
              answer: {
                user_name: answer.user_name,
                description: answer.description
              }
            }
          }
        )
      })
    )
  }

  async updateOneQuestion(id: string, description: string) {
    return await databaseService.questions.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          description
        }
      }
    )
  }
}

const questionService = new QuestionService()
export default questionService
