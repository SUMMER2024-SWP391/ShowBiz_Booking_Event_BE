import User from '~/modules/user/user.schema'
import databaseService from '../../database/database.services'
import { RegisterReqBody } from '~/modules/user/user.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import RefreshToken from '../refreshToken/refreshToken.schema'
import { env } from '~/config/environment'
import { USER_MESSAGES } from './user.messages'

class UserService {
  private signAccessToken({ user_id, verify_status }: { user_id: string; verify_status: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, type: TokenType.ACCESS_TOKEN, verify_status },
      privateKey: env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }

  private signRefreshToken({ user_id, verify_status }: { user_id: string; verify_status: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, type: TokenType.REFRESH_TOKEN, verify_status },
      privateKey: env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify_status }: { user_id: string; verify_status: UserVerifyStatus }) {
    return Promise.all([
      this.signAccessToken({ user_id, verify_status }),
      this.signRefreshToken({ user_id, verify_status })
    ])
  }

  private signEmailVerifyToken({ user_id, verify_status }: { user_id: string; verify_status: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, type: TokenType.EMAIL_VERIFY_TOKEN, verify_status },
      privateKey: env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }

  async checkEmailExist(email: string) {
    return Boolean(await databaseService.users.findOne({ email }))
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify_status: UserVerifyStatus.UNVERIFIED
    })
    const { email, user_name, phone_number, password, date_of_birth } = payload
    await databaseService.users.insertOne(
      new User({
        _id: user_id,
        user_name,
        email,
        email_verify_token,
        phone_number,
        password: hashPassword(password),
        date_of_birth: new Date(date_of_birth)
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify_status: UserVerifyStatus.UNVERIFIED
    })
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    console.log('🚀 ~ UserService ~ register ~ email_verify_token:', email_verify_token)
    return { access_token, refresh_token }
  }

  async login({ user_id, verify_status }: { user_id: string; verify_status: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify_status })
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    return { message: USER_MESSAGES.LOGOUT_SUCCESS }
  }
}

const userService = new UserService()
export default userService
