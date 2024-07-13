import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import {
  addNewQuestionController,
  createFormQuestionController,
  deleteQuestionByIdController,
  getFormController,
  getFormFeedbackController,
  handleCheckFormController,
  updateFormQuestionController
} from './form.controller'
import { accessTokenValidator, isUserRole } from '../user/user.middlewares'
import { UserRole } from '~/constants/enums'
import { createFormQuestionMiddleware, updateFormQuestionMiddleware } from './form.middlewares'
import { isHasFormRegister, registerEventValidator } from '../event/event.middlewares'
import { registerEventWithNoFormNoPaymentController } from '../event/event.controllers'

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
 * Description : get form question register
 * Path : /question/:id/:type (id là event id
 * route này sẽ handle 3 trường hợp là
 * I. ko có form mà có payment
 * II ko có form và cũng ko có payment
 * III nếu có form thì trả về form
 */
formRouter.get('/question/register/:id', wrapAsync(getFormController))

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

formRouter.get(
  '/get/question/feedback/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.Visitor, UserRole.EventOperator, UserRole.Admin])),
  wrapAsync(getFormFeedbackController)
)

formRouter.post('/question/update/feed-back/:id', wrapAsync(addNewQuestionController))

formRouter.delete('/question/delete/feed-back/:id', wrapAsync(deleteQuestionByIdController))

export default formRouter
