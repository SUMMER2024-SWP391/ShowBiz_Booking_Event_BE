import databaseService from '~/database/database.services'
import { FormEvent } from './form.schema'
import { ObjectId } from 'mongodb'
import { EventQuestionType } from './form.enum'

class FormService {
  async createFormEvent(id: string, type: EventQuestionType) {
    const result = await databaseService.forms.insertOne(
      new FormEvent({
        _id: new ObjectId(),
        event_id: new ObjectId(id),
        type
      })
    )

    const formEvent = await this.getFormEventById(result.insertedId)
    return formEvent
  }

  async getFormEventById(id: ObjectId) {
    return await databaseService.forms.findOne({
      event_id: id
    })
  }
}

const formService = new FormService()
export default formService
