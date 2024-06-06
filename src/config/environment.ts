import 'dotenv/config'

export const env = {
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,

  DB_HOST: process.env.DB_HOST,
  PORT: process.env.PORT,
  PORT_FE: process.env.PORT_FE,

  //COLLECTION
  DB_COLLECTION_USERS: process.env.DB_COLLECTION_USERS,
  DB_COLLECTION_REFRESH_TOKENS: process.env.DB_COLLECTION_REFRESH_TOKENS,
  DB_COLLECTION_EVENTS: process.env.DB_COLLECTION_EVENTS,
  DB_COLLECTION_EVENT_OPERATORS: process.env.DB_COLLECTION_EVENT_OPERATORS,
  DB_COLLECTION_FORMS: process.env.DB_COLLECTION_FORMS,
  DB_COLLECTION_QUESTIONS: process.env.DB_COLLECTION_QUESTIONS,
  DB_COLLECTION_REGISTERS: process.env.DB_COLLECTION_REGISTERS,
  DB_COLLECTION_ANSWERS: process.env.DB_COLLECTION_ANSWERS,

  PASSWORD_SECRET_KEY: process.env.PASSWORD_SECRET_KEY,

  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN,
  JWT_SECRET_EMAIL_VERIFY_TOKEN: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,

  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,

  // GOOGLE
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  CLIENT_REDIRECT_CALLBACK: process.env.CLIENT_REDIRECT_CALLBACK,

  //Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

  //FIREBASE
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,

  //CLIENT
  CLIENT_REDIRECT_VERIFY_SUCCESS: process.env.CLIENT_REDIRECT_VERIFY_SUCCESS
} as const
