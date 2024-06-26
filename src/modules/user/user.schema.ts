import { ObjectId } from 'mongodb'
import { UserRole, UserStatus } from '~/constants/enums'

interface UserType {
  _id?: ObjectId
  user_name?: string
  email: string
  date_of_birth?: Date
  password: string
  phone_number?: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  status?: UserStatus
  avatar?: string
  point?: number
  role?: UserRole
}

export default class User {
  _id?: ObjectId
  user_name?: string
  email: string
  date_of_birth?: Date
  password: string
  phone_number?: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  status?: UserStatus
  avatar?: string
  point?: number
  role?: UserRole

  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id || new ObjectId()
    this.user_name = user.user_name || ''
    this.email = user.email
    this.date_of_birth = user.date_of_birth || date
    this.password = user.password
    this.phone_number = user.phone_number || ''
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.status = user.status || UserStatus.UNVERIFIED
    this.avatar = user.avatar || ''
    this.point = user.point || 0
    this.role = user.role || UserRole.Visitor
  }
}
