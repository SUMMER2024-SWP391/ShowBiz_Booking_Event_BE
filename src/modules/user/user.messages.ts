export const USER_MESSAGES = {
  CREATE_EVENT_OPERATOR_SUCCESS: 'Create event operator success',

  VALIDATION_ERROR: 'VALIDATION ERROR!',

  UNAUTHORIZED: 'UNAUTHORIZED! Not have enough permission!',

  LOGIN_SUCCESS: 'Login success!',
  LOGOUT_SUCCESS: 'Logout success!',
  REGISTER_SUCCESS: 'Register success!',

  // access token
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist!',

  // password
  PASSWORD_IS_REQUIRED: 'Password is required!',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50!',
  PASSWORD_MUST_BE_STRONG: 'Password must be strong!',

  // confirm password
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required!',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50!',
  CONFIRM_PASSWORD_MUST_BE_STRONG: 'Confirm password must be strong!',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password!',

  // name
  NAME_IS_REQUIRED: 'Name is required!',
  NAME_MUST_BE_A_STRING: 'Name must be a string!',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100!',

  // date of birth
  DATE_OF_BIRTH_BE_ISO8601: 'Date of birth must be ISO8601!',

  // email
  EMAIL_IS_REQUIRED: 'Email is required!',
  EMAIL_IS_INVALID: 'Email is invalid!',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect!',
  EMAIL_ALREADY_EXISTED: 'Email already existed!',
  EMAIL_NOT_MATCH_REGEX: 'Email must match format [6]@fpt.edu.vn',

  // email verify token
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required!',
  EMAIL_VERIFIED: 'Email verified!',

  // Gmail
  GMAIL_NOT_VERIFIED: 'Gmail not verified yet!',

  //phone number
  PHONE_NUMBER_IS_INVALID: 'Phone number is invalid!',
  PHONE_NUMBER_IS_REQUIRED: 'Phone number is required!',
  PHONE_NUMBER_ALREADY_EXIST: 'Phone number already exist!',

  // access token
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required!',

  // user
  USER_NOT_VERIFIED: 'User not verified yet!',
  USER_NOT_FOUND: 'User not found!',
  GET_USER_BY_ID_SUCCESS: 'Get user by id success!',

  // admin
  CREATE_ACCOUNT_SUCCESS: 'Create account success!',
  UPDATE_ACCOUNT_SUCCESS: 'Update account success!',
  GET_ACCOUNT_SUCCESS: 'Get account success!',
  ACC_ALREADY_REMOVE: 'Account already removed!',

  NOT_AN_ADMIN: 'You are not an Admin!',
  ROLE_MUST_BE_EITHER_VISITOR_STAFF_OR_ADMIN: 'Role must be either Visitor, Staff or Admin!',
  VERIFY_STATUS_MUST_BE_EITHER_VERIFIED_OR_UNVERIFIED: 'Verify status must be either Verified or Unverified!',
  ROLE_IS_REQUIRED: 'Role is required!',
  ROLE_MUST_BE_A_NUMBER: 'Role must be a number!'
} as const

export const EVENT_OPERATOR_MESSAGES = {
  REGISTER_SUCCESS: 'Register event operator account successfully',
  LOGIN_SUCCESS: 'Login successfully'
} as const

export const EVENT_MESSAGES = {
  INVALID_TYPE: 'Invalid type!',
  CREATE_EVENT_SUCCESS: 'Create event successfully!',
  GET_EVENT_LIST_SUCCESS: 'Get event list successfully!',

  //PAGE
  INVALID_PAGE: 'Page out of range!',
  PAGE_MUST_BE_POSITIVE: 'Page must be positive number!',

  NAME_MUST_BE_A_STRING: 'Name must be a string!',
  NAME_IS_REQUIRED: 'Name is required!',
  CAPACITY_MUST_BE_A_NUMBER: 'Capacity must be a number!',
  CAPACITY_IS_REQUIRED: 'Capacity is required!',
  TICKET_PRICE_MUST_BE_A_NUMBER: 'Ticket price must be a number!',
  TICKET_PRICE_IS_REQUIRED: 'Ticket price is required!',
  DATE_EVENT_MUST_BE_A_STRING: 'Date event must be a string!',
  DATE_EVENT_IS_REQUIRED: 'Date event is required!',
  INVALID_DATE: 'Date event must be in the format DD-MM-YYYY',
  DATE_EVENT_MUST_BE_IN_THE_FUTURE: 'Date event must be in the future!',
  TIME_START_MUST_BE_A_STRING: 'Time start must be a string!',
  TIME_START_IS_REQUIRED: 'Time start is required!',
  TIME_START_MUST_MATCH_FORMAT: 'Time start must be in the format hh:mm:ss',
  TIME_START_MUST_BE_IN_THE_FUTURE: 'Time start must be in the future!',
  TIME_END_MUST_BE_A_STRING: 'Time end must be a string!',
  TIME_END_IS_REQUIRED: 'Time end is required!',
  TIME_END_MUST_MATCH_FORMAT: 'Time end must be in the format hh:mm:ss',
  TIME_END_MUST_BE_IN_THE_FUTURE: 'Time end must be in the future!',
  INVALID_LOCATION: 'Invalid location!',
  LIMIT_MUST_BE_BETWEEN_1_AND_100: 'Limit must be between 1 and 100!',
  REJECT_EVENT_SUCCESS: 'Reject event success',
  APPROVED_EVENT_SUCCESS: 'Approved event success'
} as const
