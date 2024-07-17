import databaseService from '~/database/database.services'
import { FormEvent } from './form.schema'
import { ObjectId } from 'mongodb'
import { EventQuestionType } from './form.enum'
import { capitalize } from '~/utils/capitalize'

class FormService {
  async createFormEvent(id: string, type: EventQuestionType) {
    return await databaseService.forms.insertOne(
      new FormEvent({
        _id: new ObjectId(),
        event_id: new ObjectId(id),
        type
      })
    )
  }

  async getFormEventByIdEndType(id: ObjectId, type: EventQuestionType) {
    return await databaseService.forms.findOne({ event_id: id, type: type })
  }
}

const formService = new FormService()
export default formService
