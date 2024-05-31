export enum UserStatus {
  UNVERIFIED = 'Unverified',
  VERIFIED = 'Verified',
  BANNED = 'Banned',
  DELETE = 'Delete'
}

export enum TokenType {
  ACCESS_TOKEN = 'access token',
  REFRESH_TOKEN = 'refresh token',
  FORGOT_PASSWORD_TOKEN = 'forgot password token',
  EMAIL_VERIFY_TOKEN = 'email verify token'
}

export enum EventTypeEnum {
  PRIVATE = 'Private',
  PUBLIC = 'Public'
}

export enum LocationType {
  HALL_A = 'Hall A',
  HALL_B = 'Hall B',
  HALL_C = 'Hall C',
  HALL_D = 'Hall D',
  HALL_E = 'Hall E'
}

export enum EventCategory {
  FREE = 'Free',
  PAID = 'Paid' // có phí
}

export enum UserRole {
  Visitor = 'Visitor', //0
  CheckingStaff = 'Checking staff', //1
  EventOperator = 'Event operator', //2
  Admin = 'Admin' //3
}

export enum EventStatus {
  PENDING = 'Pending', //0
  APPROVED = 'Approved', //1
  REJECTED = 'Rejected' //2
}
