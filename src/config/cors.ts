import { StatusCodes } from 'http-status-codes'
import { env } from './environment'

export const corsOption = {
  origin: '*',
  credentials: true, // access-control-allow-credentials:true
  allowedHeaders: ['Content-Type', 'Authorization'], // access-control-allow-headers
  optionSuccessStatus: StatusCodes.OK
}
