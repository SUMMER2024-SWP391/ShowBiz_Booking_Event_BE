export const USER_MESSAGES = {
  VALIDATION_ERROR: 'VALIDATION ERROR!',

  LOGIN_SUCCESS: 'Login success!',
  REGISTER_SUCCESS: 'Register success!',

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

  // Gmail
  GMAIL_NOT_VERIFIED: 'Gmail not verified yet!',

  // access token
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required!',

  // user
  USER_NOT_VERIFIED: 'User not verified yet!'
} as const
