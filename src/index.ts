import express from 'express'
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

const file = fs.readFileSync('./swagger-ui.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

const app = express()

// Enable CORS
app.use(cors(corsOption))
const PORT = env.PORT
databaseService.connect()

app.use(express.json())

// All routes - add your routes here
app.use('/users', usersRouter)
app.use('/events', eventsRouter)
app.use('/e-operators', eOperatorRouter)
app.use('/admins', adminsRouter)
app.use('/forms/', formRouter)

app.use(defaultErrorHandler)
// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(PORT, () => {
  console.log(`🚀 SHOWBIZ BOOKING EVENT - Server is running at ${env.DB_HOST}:${PORT}        🚀`)
  console.log(`🚀 You can test Swagger, which is running at ${env.DB_HOST}:${PORT}/api-docs  🚀`)
})
