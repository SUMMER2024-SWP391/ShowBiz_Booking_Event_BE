import { UserRole } from '~/constants/enums'

export interface createAccountReqBody {
  user_name: string
  role: UserRole
  birthday: string
  phone_number: string
  email: string
}

export interface updateAccountReqBody {
  user_name?: string
  role?: UserRole
  date_of_birth?: string
  phone_number?: string
  email?: string
  avatar?: string
  point?: string
  verify_status?: string
}
