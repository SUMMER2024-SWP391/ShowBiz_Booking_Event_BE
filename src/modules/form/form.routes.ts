import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { createFormQuestionController, getFormRegisterController } from './form.controller'
import { accessTokenValidator, isUserRole } from '../user/user.middlewares'
import { UserRole } from '~/constants/enums'

const formRouter = Router()

/**
 * Description: Create form register or feedback
 * Path : /new-form/:id id ở đây là event id
 * Body : {
 *  question[]
 *  type : register || feedback
 * }
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
