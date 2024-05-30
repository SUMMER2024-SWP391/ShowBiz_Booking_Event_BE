import databaseService from '~/database/database.services'
import { EventOperatorRegisterReqBody } from './event_operator.requests'
import EventOperator from './event_operator.schema'
import { ObjectId } from 'mongodb'
import userService from '../user/user.services'
import { UserRole, UserVerifyStatus } from '~/constants/enums'
import { hashPassword } from '~/utils/crypto'
import RefreshToken from '../refreshToken/refreshToken.schema'

class EventOperatorService {
  async checkEmailExist(email: string) {
    return Boolean(await databaseService.event_operators.findOne({ email }))
  }

  async register(body: EventOperatorRegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await userService.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify_status: UserVerifyStatus.UNVERIFIED,
      role: UserRole.EventOperator
    })
    await databaseService.event_operators.insertOne(
      new EventOperator({ ...body, password: hashPassword(body.password) })
    )

    const [access_token, refresh_token] = await userService.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify_status: UserVerifyStatus.UNVERIFIED,
      role: UserRole.EventOperator
    })

    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    console.log('🚀 ~ email_verify_token:', email_verify_token)
    return { access_token, refresh_token }
  }

  async login({ user_id, verify_status, role }: { user_id: string; verify_status: UserVerifyStatus; role: UserRole }) {
    const [access_token, refresh_token] = await userService.signAccessAndRefreshToken({ user_id, verify_status, role })
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return { access_token, refresh_token }
  }
}
const eventOperatorService = new EventOperatorService()
export default eventOperatorService
