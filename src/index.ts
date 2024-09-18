import express, { Request, Response } from 'express'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import YAML from 'yaml'
import usersRouter from './modules/user/user.routes'
import databaseService from './database/database.services'
import { defaultErrorHandler } from './errors/error.middlewares'
import { env } from './config/environment'
import cors from 'cors'
import { corsOption } from './config/cors'
import eventsRouter from './modules/event/event.routes'
import eOperatorRouter from './modules/event_operator/event_operator.routes'
import adminsRouter from './modules/auth/accounts.routes'
import formRouter from './modules/form/form.routes'
import payment from './payment/zalo/server'
import { initFolder } from './utils/file'
import mediaRouter from './modules/media/media.routes'
import staticRouter from './modules/static/static.routes'
import eventService from './modules/event/event.services'
import registerRoutes from './modules/register/register.routes'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { UserRole } from './constants/enums'
import userService from './modules/user/user.services'

initFolder()

const file = fs.readFileSync('./swagger-ui.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

const app = express()

export const users: Array<{ role: UserRole; socket_id: string; user_id: string }> = []

app.use(cors(corsOption))
// Enable CORS
const httpServer = createServer(app)
export const io = new Server(httpServer, {
  cors: corsOption
})
//setting cors for socket.io
io.on('connection', async (socket) => {
  const user_id = socket.handshake.auth._id as string
  const user = await userService.getUserById(user_id)
  if (!user || user.role == UserRole.Visitor) return
  if (users.find((u) => u.user_id === user_id)) return
  users.push({ role: user.role as UserRole, socket_id: socket.id, user_id: user_id })
  console.log(users)
})

const PORT = env.PORT
databaseService.connect()

app.use(express.json())

// All routes - add your routes here
app.use('/users', usersRouter)
app.use('/events', eventsRouter)
app.use('/e-operators', eOperatorRouter)
app.use('/admins', adminsRouter)
app.use('/forms', formRouter)
app.use('/zalo', payment)
app.use('/upload-image', mediaRouter)
app.use('/images', staticRouter)
app.use('/register', registerRoutes)

app.use(defaultErrorHandler)
// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

httpServer.listen(PORT, () => {
  console.log(`🚀 SHOWBIZ BOOKING EVENT - Server is running at ${env.DB_HOST}:${PORT}        🚀`)
  console.log(`🚀 You can test Swagger, which is running at ${env.DB_HOST}:${PORT}/api-docs  🚀`)
})
