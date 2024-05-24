export interface EventOperatorRegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
}

export interface EventOperatorLoginReqBody {
  email: string
  password: string
}
