export const USER_MESSAGES = {
  MSSV_ALREADY_EXISTED: 'Student code already existed',
  CREATE_EVENT_OPERATOR_SUCCESS: 'Create event operator success',
  GET_TICKET_SUCCESS: 'Get ticket success',

  VALIDATION_ERROR: 'VALIDATION ERROR!',

  UNAUTHORIZED: 'UNAUTHORIZED! Not have enough permission!',

  LOGIN_SUCCESS: 'Login success!',
  LOGOUT_SUCCESS: 'Logout success!',
  REGISTER_SUCCESS: 'Register success!',

  YOU_CAN_ONLY_CANCEL_BEFORE_48H: 'You can only cancel before 48 hours!',

  // access token
  USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Used refresh token or not exist!',
  INVALID_REFRESH_TOKEN: 'Invalidd',

  // refresh token
  REFRESH_TOKEN_SUCCESS: 'Refresh token success!',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expired!',

  //search
  SEARCH_MUST_BE_A_STRING: 'Search must be a string!',
  SEARCH_LENGTH_MUST_BE_FROM_1_TO_100: 'Search length must be from 1 to 100!',
  SEARCH_NO_SPECIAL_CHARACTERS: 'Search must not contain special characters!',

  // password
  PASSWORD_IS_REQUIRED: 'Password is required!',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password length must be from 6 to 50!',
  PASSWORD_MUST_BE_STRONG: 'Password must be strong!',

  // confirm password
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required!',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password length must be from 6 to 50!',
  CONFIRM_PASSWORD_MUST_BE_STRONG: 'Confirm password must be strong!',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password!',

  //get list user
  GET_LIST_VISITOR_EVENT_SUCCESS: 'Get list visitor event success',
  GET_LIST_EVENT_OPERATOR_EVENT_SUCCESS: 'Get list event operator event success',
  GET_LIST_CHEKCING_STAFF_EVENT_SUCCESS: 'Get list checking staff event success',

  // name
  NAME_IS_REQUIRED: 'User name is required!',
  NAME_MUST_BE_A_STRING: 'User name must be a string!',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'User name length must be from 1 to 100!',

  // date of birth
  DATE_OF_BIRTH_BE_ISO8601: 'Date of birth must be ISO8601!',

  // email
  EMAIL_IS_REQUIRED: 'Email is required!',
  EMAIL_IS_INVALID: 'Email is invalid!',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect!',
  EMAIL_ALREADY_EXISTED: 'Email already existed!',
  EMAIL_NOT_MATCH_REGEX: 'Email must match format [6]@fpt.edu.vn',
  EMAIL_NOT_FOUND: 'Email not found!',

  // email verify token
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required!',
  EMAIL_VERIFIED: 'Email verified!',
  EMAIL_VERIFY_TOKEN_IS_INCORRECT: 'Email verify token is incorrect!',
  EMAIL_ALREADY_VERIFIED_BEFORE: 'Email already verified before!',
  RESEND_VERIFY_EMAIL_SUCCESS: 'Resend verify email success!',

  // Gmail
  GMAIL_NOT_VERIFIED: 'Gmail not verified yet!',

  //phone number
  PHONE_NUMBER_IS_INVALID: 'Phone number is invalid!',
  PHONE_NUMBER_IS_REQUIRED: 'Phone number is required!',
  PHONE_NUMBER_ALREADY_EXIST: 'Phone number already exist!',

  // image
  IMAGE_URL_MUST_BE_A_STRING: 'Image url must be a string!',
  IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_400: 'Image url length must be from 1 to 400!',

  // access token
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required!',

  // user
  USER_NOT_VERIFIED: 'User not verified yet!',
  USER_NOT_FOUND: 'User not found!',
  GET_USER_BY_ID_SUCCESS: 'Get user by id success!',
  USER_BANNED: 'User is banned!',
  YOU_ARE_BANNED: 'You are banned!',

  // admin
  CREATE_ACCOUNT_SUCCESS: 'Create account success!',
  UPDATE_ACCOUNT_SUCCESS: 'Update account success!',
  GET_ACCOUNT_SUCCESS: 'Get account success!',
  ACC_ALREADY_REMOVE: 'Account already removed!',
  UPDATE_ME_SUCCESS: 'Update me success!',

  NOT_AN_ADMIN: 'You are not an Admin!',
  ROLE_MUST_BE_EITHER_VISITOR_STAFF_OR_ADMIN: 'Role must be either Visitor, Staff or Admin!',
  VERIFY_STATUS_MUST_BE_EITHER_VERIFIED_OR_UNVERIFIED: 'Verify status must be either Verified or Unverified!',
  ROLE_IS_REQUIRED: 'Role is required!',
  ROLE_MUST_BE_A_NUMBER: 'Role must be a number!',

  //forgot password
  SEND_EMAIL_FORGOT_PASSWORD_SUCCESS: 'Send email forgot password success',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'Verify forgot password token success',
  FORGOT_PASSWORD_TOKEN_IS_INCORRECT: 'Forgot password token is incorrect',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  PASSWORD_ALREADY_EXISTED: 'Password already existed',
  OLD_PASSWORD_IS_INCORRECT: 'Old password is incorrect',
  PASSWORD_MATCHED_OLD_PASSWORD: 'Password matched old password',

  //ROLE
  ROLE_IS_NOT_VISITOR_OR_CHECKING_STAFF: 'Role is not Visitor or Checking Staff',
  ROLE_IS_NOT_CHECKING_STAFF: 'Role is not Checking Staff',

  //profile
  GET_PROFILE_SUCCESS: 'Get profile success',

  //event
  GET_LIST_REGISTER_EVENT_SUCCESS: 'Get list register event success'
} as const

export const EVENT_OPERATOR_MESSAGES = {
  REGISTER_SUCCESS: 'Register event operator account successfully',
  LOGIN_SUCCESS: 'Login successfully',
  CREATE_CHECKING_STAFF_SUCCESS: 'Create checking staff successfully',
  CHECKING_STAFF_ALREADY_ASSIGNED: 'Checking staff already assigned',
  EVENT_OPERATOR_IS_NOT_OWNER: 'Event operator is not owner',
  LIST_CHECKING_STAFF_SUCCESS: 'List checking staff successfully',
  DOES_NOT_HAVE_CHECKING_STAFF: 'Does not have checking staff',
  UNASSIGN_CHECKING_STAFF_SUCCESS: 'Unassign checking staff successfully',
  GET_LIST_REGISTER_EVENT_SUCCESS: 'Get list register event successfully',
  GET_LIST_REGISTERED_VISITOR_SUCCESS: 'Get list registered visitor success',
  INVITE_USER_SUCCESS: 'Invite user success'
} as const

export const EVENT_MESSAGES = {
  INVALID_EVENT_STATUS: 'Invalid event status!',
  INVALID_TYPE: 'Invalid type! Just Private or Public',
  CREATE_EVENT_SUCCESS: 'Create event successfully!',
  CREATE_EVENT_REQUEST_SUCCESS: 'Create event request successfully! Wait for admin confirm!',
  GET_EVENT_LIST_SUCCESS: 'Get event list successfully!',
  GET_EVENT_LIST_OPERATOR_SUCCESS: 'Get event list operator successfully!',
  YOU_HAVE_NOT_REGISTERED_THIS_EVENT: 'You have not registered this event!',
  EVENT_HAVE_PAYMENT: 'Event have payment!',
  YOU_REGISTERED_THIS_EVENT: 'You already registered this event!',
  GET_EVENT_LIST_EVENT_STAFF_SUCCESS: 'Get event list event staff successfully!',

  //statistical
  GET_STATISTICAL_DATA_SUCCESS: 'Get statistical data successfully!',

  //answer
  ANSWER_FEEDBACK_SUCCESS: 'Answer feedback success!',

  //EVENT
  EVENT_ID_IS_REQUIRED: 'Event id is required!',
  EVENT_ID_IS_INVALID: 'Event id is invalid!',
  EVENT_NOT_FOUND: 'Event not found!',
  CANCEL_EVENT_SUCCESS: 'Cancel event success!',

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
  INVALID_DATE: 'Date event must be in the format DD/MM/YYYY',
  DATE_EVENT_MUST_BE_IN_THE_FUTURE: 'Date event must be in the future!',
  DATE_EVENT_MUST_BE_ONE_WEEK_LATER: 'Please book the event one week in advance!',
  TIME_START_MUST_BE_A_STRING: 'Time start must be a string!',
  TIME_START_IS_REQUIRED: 'Time start is required!',
  TIME_START_MUST_MATCH_FORMAT: 'Time start must be in the format xx:xx AM|PM',
  TIME_START_MUST_BE_IN_THE_FUTURE: 'Time start must be in the future!',
  TIME_END_MUST_BE_A_STRING: 'Time end must be a string!',
  TIME_END_IS_REQUIRED: 'Time end is required!',
  TIME_END_MUST_MATCH_FORMAT: 'Time end must be in the format xx:xx AM|PM',
  TIME_END_MUST_BE_IN_THE_FUTURE: 'Time end must be in the future!',
  TIME_END_MUST_GREATER_THAN_TIME_START: 'Time end must be greater than time start!',
  TIME_CONFLICT: 'Conflict with other event!',
  INVALID_LOCATION: 'Invalid location! Just have Hall A | B | C | D | E',
  LIMIT_MUST_BE_BETWEEN_1_AND_100: 'Limit must be between 1 and 100!',
  REJECT_EVENT_SUCCESS: 'Reject event success',
  APPROVED_EVENT_SUCCESS: 'Approved event success',
  GET_EVENT_BY_ID_SUCCESS: 'Get event by id success',
  REGISTER_EVENT_SUCCESS: 'Register event success',

  GET_TICKET_BY_EVENT_ID_SUCCESS: 'Get ticket by event id success',

  EVENT_IS_FULL: 'Event is full',

  EVENT_IS_ALREADY_REJECTED: 'You can not cancel this event because it is already rejected by admin!',
  EVENT_IS_ALREADY_CANCELED: 'You can not cancel this event because it is already canceled by you!',

  EVENT_OPERATOR_IS_NOT_OWNER: 'This event is not yours!',
  SEARCH_EVENT_SUCCESS: 'Search event success'
} as const
