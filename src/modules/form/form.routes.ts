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
  isUserRole([UserRole.EventOperator]),
  //   createFormQuestionMiddleware,
  wrapAsync(createFormQuestionController)
)

/**
 * Description: Get form event list register
 * Path : /register/:id
 */
formRouter.get('/register/:id', wrapAsync(getFormRegisterController))

export default formRouter
