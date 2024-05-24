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
  CheckingStaff, //0
  Visitor //1
}
