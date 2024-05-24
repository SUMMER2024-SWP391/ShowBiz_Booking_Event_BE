import 'dotenv/config'

/* Tại sao lại phải có file này mà k dùng trực tiếp file .env? => Tránh import file .env nhiều lần,
thay vào đó import 1 lần ở file này thôi ! Nhớ nha Huyy */

export const env = {
  DB_NAME: process.env.DB_NAME,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,

  DB_HOST: process.env.DB_HOST,
  PORT: process.env.PORT,

  DB_COLLECTION_USERS: process.env.DB_COLLECTION_USERS,
  DB_COLLECTION_REFRESH_TOKENS: process.env.DB_COLLECTION_REFRESH_TOKENS,
  DB_COLLECTION_EVENTS: process.env.DB_COLLECTION_EVENTS,

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
  CLIENT_REDIRECT_CALLBACK: process.env.CLIENT_REDIRECT_CALLBACK
} as const
