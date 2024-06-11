import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserStatus } from '~/constants/enums'

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

export interface ResetPasswordReqBody {
  forgot_password_token: string
  password: string
  confirm_password: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
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
  status: UserStatus
}

export interface EventOperatorRegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  phone_number: string
}

export interface UpdateMeReqBody {
  user_name?: string
  date_of_birth?: string
  avatar?: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}
