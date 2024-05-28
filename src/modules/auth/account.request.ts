import { UserRole } from '~/constants/enums'

export interface createAccountReqBody {
  user_name: string
  role: UserRole
  birthday: string
  phone_number: string
  email: string
}
