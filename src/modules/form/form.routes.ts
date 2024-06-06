import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { createFormQuestionController, getFormRegisterController } from './form.controller'
import { accessTokenValidator, isUserRole } from '../user/user.middlewares'
import { UserRole } from '~/constants/enums'
import { createFormQuestionMiddleware } from './form.middlewares'

const formRouter = Router()

/**
 * description : create form resiger or feedback
 * path : /new-form/:id id ở đây là event id
 * body : {
 *  question[]
 *  type : register || feedback
 * }
 *
 */

formRouter.post(
  '/new/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator, UserRole.Admin])),
  //   createFormQuestionMiddleware,
  wrapAsync(createFormQuestionController)
)

/**
 * description : get form event list register
 * path : /question-register/:id
 *
 */
formRouter.get('/question-register/:id', wrapAsync(getFormRegisterController))

export default formRouter
