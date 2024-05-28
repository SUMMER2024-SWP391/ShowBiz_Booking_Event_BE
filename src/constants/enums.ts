export enum UserVerifyStatus {
  UNVERIFIED,
  VERIFIED,
  BANNED
}

export enum TokenType {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  FORGOT_PASSWORD_TOKEN,
  EMAIL_VERIFY_TOKEN
}

export enum EventTypeEnum {
  PRIVATE,
  PUBLIC
}

export enum LocationType {
  HALL_A,
  HALL_B,
  HALL_C,
  HALL_D,
  HALL_E
}

export enum EventCategory {
  FREE,
  PAID // có phí
}

export enum UserRole {
  Visitor, //0
  CheckingStaff, //1
  Admin //2
}

export enum EventStatus {
  PENDING, //0
  APPROVED, //1
  REJECTED //2
}
