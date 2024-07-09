import User from '~/modules/user/user.schema'
import databaseService from '../../database/database.services'
import { EventOperatorRegisterReqBody, RegisterReqBody, UpdateMeReqBody } from '~/modules/user/user.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { EventStatus, TokenType, UserRole, UserStatus } from '~/constants/enums'
import { ObjectId } from 'mongodb'
import RefreshToken from '../refreshToken/refreshToken.schema'
import { env } from '~/config/environment'
import { USER_MESSAGES } from './user.messages'
import axios from 'axios'
import { ErrorWithStatus } from '~/models/Errors'
import { StatusCodes } from 'http-status-codes'
import { createAccountReqBody, updateAccountReqBody } from '../auth/account.request'
import { REGEX_FPT_EMAIL } from '~/constants/regex'
import { sendEmail } from '../sendMail/sendMailService'
import { templateForgotPassword, templateVerifyAccount } from '~/constants/template-mail'

class UserService {
  private signAccessToken({ user_id, status, role }: { user_id: string; status: UserStatus; role: UserRole }) {
    return signToken({
      payload: { user_id, type: TokenType.ACCESS_TOKEN, status, role },
      privateKey: env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN }
    })
  }

  private signRefreshToken({ user_id, status, role }: { user_id: string; status: UserStatus; role: UserRole }) {
    return signToken({
      payload: { user_id, type: TokenType.REFRESH_TOKEN, status, role },
      privateKey: env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
    })
  }

  signAccessAndRefreshToken({ user_id, status, role }: { user_id: string; status: UserStatus; role: UserRole }) {
    return Promise.all([
      this.signAccessToken({ user_id, status, role }),
      this.signRefreshToken({ user_id, status, role })
    ])
  }

  signEmailVerifyToken({ user_id, status, role }: { user_id: string; status: UserStatus; role: UserRole }) {
    return signToken({
      payload: { user_id, type: TokenType.EMAIL_VERIFY_TOKEN, status, role },
      privateKey: env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: { expiresIn: env.EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    })
  }

  private signForgotPasswordToken({ user_id, status, role }: { user_id: string; status: UserStatus; role: UserRole }) {
    return signToken({
      payload: { user_id, type: TokenType.FORGOT_PASSWORD_TOKEN, status, role },
      privateKey: env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: { expiresIn: env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    })
  }

  async checkEmailExist(email: string) {
    return Boolean(await databaseService.users.findOne({ email }))
  }

  async checkPhoneNumberExist(phone_number: string) {
    return Boolean(await databaseService.users.findOne({ phone_number }))
  }

  async getRefreshToken(refresh_token: string) {
    return await databaseService.refresh_tokens.findOne({ token: refresh_token })
  }

  async logout(refresh_token: string) {
    await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    return { message: USER_MESSAGES.LOGOUT_SUCCESS }
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      status: UserStatus.UNVERIFIED,
      role: UserRole.Visitor
    })
    const { email, user_name, password, mssv } = payload
    await databaseService.users.insertOne(
      new User({
        _id: user_id,
        user_name,
        email,
        email_verify_token,
        password: hashPassword(password)
      })
    )

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      status: UserStatus.UNVERIFIED,
      role: UserRole.Visitor
    })
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )
    const user = (await databaseService.users.findOne({ _id: user_id })) as User
    const template = templateVerifyAccount(user, email_verify_token)
    await sendEmail(template)

    return { access_token, refresh_token }
  }

  async login({ user_id, status, role }: { user_id: string; status: UserStatus; role: UserRole }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, status, role })
    const expiresInOfAccessToken = env.ACCESS_TOKEN_EXPIRES_IN
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return { access_token, refresh_token, expiresInOfAccessToken }
  }

  async findUserById(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    if (!user) throw new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_FOUND, status: StatusCodes.NOT_FOUND })

    return user
  }

  async getRole(user_id: string) {
    const user = await this.findUserById(user_id)
    return user?.role
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })

    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
      hd: string
    }
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)
    // nếu email không match với regex thì throw lỗi
    if (!REGEX_FPT_EMAIL.test(userInfo.email))
      throw new ErrorWithStatus({ message: USER_MESSAGES.EMAIL_NOT_MATCH_REGEX, status: StatusCodes.BAD_REQUEST })

    //! Check user have already verified or not ?
    if (!userInfo.verified_email)
      throw new ErrorWithStatus({ message: USER_MESSAGES.GMAIL_NOT_VERIFIED, status: StatusCodes.BAD_REQUEST })

    //! Check user have already existed in db or not ?
    const user = await databaseService.users.findOne({ email: userInfo.email })

    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        status: user.status as UserStatus,
        role: user.role as UserRole
      })

      await databaseService.refresh_tokens.insertOne(
        new RefreshToken({
          user_id: user._id,
          token: refresh_token
        })
      )

      return {
        access_token,
        refresh_token,
        newUser: 0,
        status: user.status,
        user_id: user._id.toString(),
        user_role: user.role,
        user_name: user.user_name
      }
    } else {
      //! If user not existed, create new user
      // random string password
      const password = Math.random().toString(36).slice(2, 15)
      const data = await this.register({
        user_name: userInfo.name,
        email: userInfo.email,
        password,
        mssv: ''
      })

      const user = await databaseService.users.findOne({ email: userInfo.email })
      await databaseService.users.updateOne({ _id: user?._id }, [
        {
          $set: {
            email_verify_token: '',
            status: UserStatus.VERIFIED,
            updated_at: '$$NOW'
          }
        }
      ])

      return {
        ...data,
        newUser: 1,
        status: UserStatus.VERIFIED,
        user_id: user?._id.toString(),
        user_role: user?.role,
        user_name: user?.user_name
      }
    }
  }

  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token: '',
          status: UserStatus.VERIFIED,
          updated_at: '$$NOW'
        }
      }
    ])
  }

  //create account dành cho admin
  async createAccount(payload: createAccountReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        _id: new ObjectId(),
        ...payload,
        password: hashPassword('mat_khau_bi_mat!'),
        role: UserRole.CheckingStaff,
        status: UserStatus.VERIFIED
      })
    )

    return await this.findUserById(result.insertedId.toString())
  }

  //update account dành cho admin
  async updateAccountById(id: string, payload: updateAccountReqBody) {
    const user = await this.findUserById(id)

    if (user.password) payload.password = hashPassword(user.password)

    const newUser = await databaseService.users.findOneAndUpdate(
      { _id: user?._id },
      [{ $set: { ...payload, updated_at: '$$NOW' } }],
      { returnDocument: 'after' }
    )

    return newUser.value
  }

  // get account dành cho admin
  async getAccount() {
    const userList = await databaseService.users
      .find(
        {},
        {
          projection: {
            _id: 1,
            user_name: 1,
            email: 1,
            role: 1,
            status: 1
          }
        }
      )
      .toArray()

    return userList
  }

  // delete account dành cho admin
  async deleteAccountById(id: string) {
    const user = await this.findUserById(id)
    if (user.status === UserStatus.DELETE)
      throw new ErrorWithStatus({ message: USER_MESSAGES.ACC_ALREADY_REMOVE, status: StatusCodes.BAD_REQUEST })

    const result = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      [{ $set: { status: UserStatus.DELETE, updated_at: '$$NOW' } }],
      { returnDocument: 'after' }
    )

    return result.value
  }

  async approveEvent(id: string, status: EventStatus) {
    const event = await databaseService.events.findOne({ _id: new ObjectId(id) })
    if (!event) throw new ErrorWithStatus({ message: 'EVENT_NOT_FOUND', status: StatusCodes.NOT_FOUND })

    const result = await databaseService.events.findOneAndUpdate(
      { _id: new ObjectId(id) },
      [{ $set: { status, updated_at: '$$NOW' } }],
      { returnDocument: 'after' }
    )

    return result.value
  }

  async resendVerifyEmail(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      status: UserStatus.UNVERIFIED,
      role: UserRole.Visitor
    })

    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { email_verify_token, updated_at: '$$NOW' } }
    ])

    const user = (await databaseService.users.findOne({ _id: new ObjectId(user_id) })) as User

    const template = templateVerifyAccount(user, email_verify_token)
    await sendEmail(template)

    return { message: USER_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS }
  }

  async registerEventOperator(body: EventOperatorRegisterReqBody) {
    const { password, email, name, phone_number } = body
    const id = new ObjectId()

    return await databaseService.users.insertOne(
      new User({
        _id: id,
        user_name: name,
        email: email,
        phone_number: phone_number,
        password: hashPassword(password),
        role: UserRole.EventOperator
      })
    )
  }

  async getUserById(id: string) {
    return await databaseService.users.findOne({ _id: new ObjectId(id) })
  }

  async getUserByEmail(email: string) {
    return await databaseService.users.findOne({ email })
  }

  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      status: UserStatus.VERIFIED,
      role: UserRole.Visitor
    })

    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { forgot_password_token, updated_at: '$$NOW' } }
    ])
    const user = (await userService.getUserById(user_id)) as User

    const template = templateForgotPassword(user, forgot_password_token)
    await sendEmail(template)

    return { message: USER_MESSAGES.SEND_EMAIL_FORGOT_PASSWORD_SUCCESS }
  }

  async getMe(user_id: string): Promise<User> {
    return (await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0,
          role: 0,
          status: 0
        }
      }
    )) as User
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    if (_payload.password) {
      _payload.password = hashPassword(_payload.password)
    }

    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            ..._payload,
            password: _payload.password,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )

    return user.value
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: '',
          updated_at: '$$NOW'
        }
      }
    ])
    return { message: USER_MESSAGES.RESET_PASSWORD_SUCCESS }
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password: hashPassword(password),
          updated_at: '$$NOW'
        }
      }
    ])
    return { message: USER_MESSAGES.RESET_PASSWORD_SUCCESS }
  }

  async refreshToken({
    user_id,
    status,
    refresh_token
  }: {
    user_id: string
    status: UserStatus
    refresh_token: string
  }) {
    const role = await this.getRole(user_id)
    const [access_token, new_refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      status: UserStatus.VERIFIED,
      role: role as UserRole
    })
    await databaseService.refresh_tokens.deleteOne({ token: refresh_token })
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        token: new_refresh_token,
        user_id: new ObjectId(user_id)
      })
    )
    return {
      access_token,
      refresh_token: new_refresh_token
    }
  }
  async getListVisitor() {
    return await databaseService.users
      .find(
        { role: UserRole.Visitor },
        {
          projection: {
            _id: 1,
            user_name: 1,
            email: 1,
            phone_number: 1,
            date_of_birth: 1,
            status: 1
          }
        }
      )
      .toArray()
  }
  async getListEventOperator() {
    return await databaseService.users
      .find(
        { role: UserRole.EventOperator },
        {
          projection: {
            _id: 1,
            user_name: 1,
            email: 1,
            phone_number: 1,
            date_of_birth: 1,
            status: 1
          }
        }
      )
      .toArray()
  }
  async getListCheckingStaff() {
    return await databaseService.checking_staffs
      .aggregate([
        {
          $lookup: {
            from: env.DB_COLLECTION_USERS,
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            _id: 0,
            user_name: '$user.user_name',
            email: '$user.email',
            phone_number: '$user.phone_number',
            date_of_birth: '$user.date_of_birth',
            status: '$user.status'
          }
        }
      ])
      .toArray()
  }
}

const userService = new UserService()
export default userService
