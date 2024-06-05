import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'

import formService from './form.services'
import { CreateFormReqBody } from './form.request'
import questionService from '../question/question.services'
import { ObjectId } from 'mongodb'

export const createFormQuestionController = async (
  req: Request<ParamsDictionary, any, CreateFormReqBody>,
  res: Response
) => {
  const { id } = req.params
  const { type, questions } = req.body
  const formEvent = await formService.createFormEvent(id, type)
  const listQuestion = await questionService.createNewListQuestion(formEvent?._id as ObjectId, questions)
  res.json({
    listQuestion
  })
}
