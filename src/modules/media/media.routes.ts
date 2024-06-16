import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { deleteImageEventController, updateImageEventController, uploadImageEventController } from './media.controllers'

const mediaRouter = Router()

mediaRouter.post('/event', wrapAsync(uploadImageEventController))

mediaRouter.delete('/event/:id', wrapAsync(deleteImageEventController))

mediaRouter.post('/events/update/:id', wrapAsync(updateImageEventController))

export default mediaRouter
