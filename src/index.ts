import express from 'express'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import YAML from 'yaml'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { env } from './config/environment'

const file = fs.readFileSync('./swagger-ui.yaml', 'utf8')
const swaggerDocument = YAML.parse(file)

const app = express()
const PORT = env.PORT
databaseService.connect()

app.use(express.json())

// All routes
app.use('/users', usersRouter)

app.use(defaultErrorHandler)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(PORT, () => {
  console.log(`🚀 SHOWBIZ BOOKING EVENT - Server is running at ${env.DB_HOST}:${PORT}  🚀`)
})
