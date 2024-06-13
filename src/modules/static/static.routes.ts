import { Router } from 'express'
import { wrapAsync } from '~/utils/handler'
import { serveImageEventController } from './static.controller'

const staticRouter = Router()

staticRouter.get('/events/:filename', wrapAsync(serveImageEventController))

export default staticRouter
