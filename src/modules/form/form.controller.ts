import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import formService from './form.services'
import { CreateFormReqBody } from './form.request'
import questionService from '../question/question.services'
import { ObjectId } from 'mongodb'
import { FORM_MESSAGE } from './form.messages'
import eventService from '../event/event.services'
import { capitalize } from '~/utils/capitalize'
import { EventQuestionType } from './form.enum'

export const createFormQuestionController = async (
  req: Request<ParamsDictionary, any, CreateFormReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { type, questions } = req.body
  const formEvent = await formService.createFormEvent(id, capitalize(type.toLowerCase()) as EventQuestionType)
  const listQuestion = await questionService.createNewListQuestion(formEvent?._id as ObjectId, questions)

  return res.json({
    message: FORM_MESSAGE.CREATE_FORM_REGISTER_SUCCESS,
    data: {
      question: listQuestion
    }
  })
}

export const getFormController = async (req: Request, res: Response) => {
  const { id, type } = req.params
  const event = await eventService.getEventById(id)
  const formDocument = await formService.getFormEventByIdEndType(
    new ObjectId(event._id),
    capitalize(type.toLowerCase()) as EventQuestionType
  )
  const formQuestion = await questionService.getListQuestion(formDocument?._id as ObjectId)

  return res.json({
    message: FORM_MESSAGE.GET_FORM_REGISTER_SUCCESS,
    data: {
      formQuestion: formQuestion
    }
  })
}
