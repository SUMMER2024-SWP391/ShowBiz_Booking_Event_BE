import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import formService from './form.services'
import { CreateFormReqBody, UpdateFormQuestionReqBody } from './form.request'
import questionService from '../question/question.services'
import { ObjectId } from 'mongodb'
import { FORM_MESSAGE } from './form.messages'
import eventService from '../event/event.services'
import { capitalize } from '~/utils/capitalize'
import { EventQuestionType } from './form.enum'
import { EventStatus } from '~/constants/enums'
import { checkActionOfEventOperatorValid } from '~/utils/common'

export const createFormQuestionController = async (
  req: Request<ParamsDictionary, any, CreateFormReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { type, questions } = req.body
  const formEvent = await formService.createFormEvent(id, capitalize(type.toLowerCase()) as EventQuestionType)
  const listQuestion = await questionService.createNewListQuestion(formEvent.insertedId as ObjectId, questions)

  return res.json({
    message: FORM_MESSAGE.CREATE_FORM_REGISTER_SUCCESS,
    data: {
      question: listQuestion
    }
  })
}

export const getFormController = async (req: Request, res: Response) => {
  const { id } = req.params
  const event = await eventService.getEventById(id)
  const formDocument = await formService.getFormEventByIdEndType(new ObjectId(event._id), EventQuestionType.REGISTER)
  const formQuestion = await questionService.getListQuestion(formDocument?._id as ObjectId)

  return res.json({
    message: FORM_MESSAGE.GET_FORM_REGISTER_SUCCESS,
    data: {
      formQuestion: formQuestion
    }
  })
}

export const updateFormQuestionController = async (
  req: Request<ParamsDictionary, any, UpdateFormQuestionReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { questions, type } = req.body
  //lấy form theo id và type
  const formDocument = await formService.getFormEventByIdEndType(new ObjectId(id), type)
  //thao tác update form
  await questionService.updateListQuestion(formDocument?._id as ObjectId, questions)
  res.json({
    message: FORM_MESSAGE.UPDATE_FORM_REGISTER_SUCCESS
  })
}

export const handleCheckFormController = async (req: Request, res: Response) => {
  const { id } = req.params //lấy id từ params
  //lấy event theo id
  const event = await eventService.getEventById(id)
  //lấy form theo id event
  const [formRegister, formFeedback] = await Promise.all([
    formService.getFormEventByIdEndType(new ObjectId(id), EventQuestionType.REGISTER),
    formService.getFormEventByIdEndType(new ObjectId(id), EventQuestionType.FEEDBACK)
  ])

  const action = checkActionOfEventOperatorValid(
    event.status as EventStatus,
    Boolean(formRegister),
    Boolean(formFeedback)
  )
  res.json({
    message: FORM_MESSAGE.CHECK_SUCCESS,
    data: {
      action
    }
  })
}
