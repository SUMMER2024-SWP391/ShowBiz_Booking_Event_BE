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

export interface CreateCheckingStaffReqBody {
  email: string
  event_id: string
}

export interface CheckInBody {
  otp_check_in: string
}

export interface InviteUserReqBody {
  email: string
  user_name: string
}
