import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserRole, UserVerifyStatus } from '~/constants/enums'

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refresh_token: string
}
export interface VerifyEmailReqBody {
  email_verify_token: string
}
export interface RegisterReqBody {
  user_name: string
  email: string
  phone_number?: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  type: TokenType
  verify_status: UserVerifyStatus
}
