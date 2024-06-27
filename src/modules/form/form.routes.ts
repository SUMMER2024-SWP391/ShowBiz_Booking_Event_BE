import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import {
  createFormQuestionController,
  getFormController,
  handleCheckFormController,
  updateFormQuestionController
} from './form.controller'
import { accessTokenValidator, isUserRole } from '../user/user.middlewares'
import { UserRole } from '~/constants/enums'
import { createFormQuestionMiddleware, updateFormQuestionMiddleware } from './form.middlewares'

const formRouter = Router()

/**
 * Description: Create form register or feedback
 * Path : /new-form/:id id ở đây là event id
 * Headers: { Authorization: 'Bearer <access_token>' }
 * Body : {
 *  question[]
 *  type : register || feedback
 * }
 */
formRouter.post(
  '/new/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  createFormQuestionMiddleware,
  wrapAsync(createFormQuestionController)
)

/**
 * Description : get form event list register
 * Path : /question/:id/:type (id là event id, type là Register hoặc Feedback)
 */
formRouter.get('/question/:id/:type', wrapAsync(getFormController))

/**
 * Description: Update form register or feedback
 * Path : /update-form/:id : id ở đây là event id
 * Headers: { Authorization }
 * Body : {UpdateFormQuestionReqBody}
 */
formRouter.post(
  '/update/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  updateFormQuestionMiddleware,
  wrapAsync(updateFormQuestionController)
)
/**
 * Description: Handle check form
 * Path : /handle/check/:id
 * Headers: { Authorization }
 * route này dùng để client check form và handle routing hợp lệ
 * để check event này đã tạo form chưa nếu chưa tạo thì hiển thị create form
 * còn không thì để update
 */

formRouter.get(
  '/handle/check/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  wrapAsync(handleCheckFormController)
)

export default formRouter
