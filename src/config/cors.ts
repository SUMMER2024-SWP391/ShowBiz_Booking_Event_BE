import { StatusCodes } from 'http-status-codes'
import { env } from 'process'

export const corsOption = {
  origin: `${env.DB_HOST}:${env.PORT_FE}` || process.env.PRODUCTION_FRONTEND_URL,
  credentials: true, // access-control-allow-credentials:true
  allowedHeaders: ['Content-Type', 'Authorization'], // access-control-allow-headers
  optionSuccessStatus: StatusCodes.OK
}
