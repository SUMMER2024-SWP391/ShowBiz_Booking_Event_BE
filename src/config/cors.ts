import { StatusCodes } from 'http-status-codes'
import { env } from 'process'

export const corsOption = {
  origin: env.PRODUCTION_FRONTEND_URL || 'localhost:3000',
  credentials: true, // access-control-allow-credentials:true
  allowedHeaders: ['Content-Type', 'Authorization'], // access-control-allow-headers
  optionSuccessStatus: StatusCodes.OK
}
