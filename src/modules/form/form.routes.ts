import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import {
  addNewQuestionController,
  createFormQuestionController,
  deleteQuestionByIdController,
  getFormController,
  getFormFeedbackController,
  getListAnswerController,
  handleCheckFormController,
  updateFormQuestionController
} from './form.controller'
import { accessTokenValidator, isUserRole } from '../user/user.middlewares'
import { UserRole } from '~/constants/enums'
import { createFormQuestionMiddleware, updateFormQuestionMiddleware } from './form.middlewares'
import { isValidEventOperatorAndAdmin } from '../event_operator/event_operator.middlewares'

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
  '/get/question/feedback/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.Visitor, UserRole.EventOperator, UserRole.Admin])),
  wrapAsync(getFormFeedbackController)
)

formRouter.post('/question/update/feed-back/:id', wrapAsync(addNewQuestionController))

formRouter.delete('/question/delete/feed-back/:id', wrapAsync(deleteQuestionByIdController))

//id là event id
formRouter.get(
  '/handle/check/has-form-feedback/:id',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator])),
  wrapAsync(handleCheckFormController)
)

/**
 * Description: Get list answer
 * Path: /form/answer/:eventId 
 * Headers: { Authorization }
 * Params: eventId
 * response:
 *  Array{question_id : string, question description : string, answer
    Array<{answer_id : string, description : string}>}
 */
formRouter.get('/answer/:eventId',
  accessTokenValidator,
  wrapAsync(isUserRole([UserRole.EventOperator, UserRole.Admin])),
  wrapAsync(isValidEventOperatorAndAdmin),
  wrapAsync(getListAnswerController)
)

export default formRouter
