import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { createFormQuestionController } from './form.controller'
import { accessTokenValidator, isUserRole } from '../user/user.middlewares'
import { UserRole } from '~/constants/enums'
import { createFormQuestionMiddleware } from './form.middlewares'

const formRouter = Router()

/**
 * description : create form resiger or feedback
 * path : /new-form/:id
 * body : {
 *  question[]
 * type
 * }
 *
 */

formRouter.post(
  '/new/:id',
  accessTokenValidator,
  isUserRole([UserRole.EventOperator]),
  //   createFormQuestionMiddleware,
  wrapAsync(createFormQuestionController)
)

export default formRouter
