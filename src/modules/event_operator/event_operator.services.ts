import databaseService from '~/database/database.services'
import { EventOperatorRegisterReqBody } from './event_operator.requests'
import EventOperator from './event_operator.schema'
import { ObjectId } from 'mongodb'
import userService from '../user/user.services'
import { UserRole, UserStatus } from '~/constants/enums'
import { hashPassword } from '~/utils/crypto'
import RefreshToken from '../refreshToken/refreshToken.schema'
import { env } from '~/config/environment'

class EventOperatorService {
  async checkEmailExist(email: string) {
    return Boolean(await databaseService.event_operators.findOne({ email }))
  }

  async register(body: EventOperatorRegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await userService.signEmailVerifyToken({
      user_id: user_id.toString(),
      status: UserStatus.UNVERIFIED,
      role: UserRole.EventOperator
    })
    await databaseService.event_operators.insertOne(
      new EventOperator({ ...body, password: hashPassword(body.password) })
    )

    const [access_token, refresh_token] = await userService.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      status: UserStatus.UNVERIFIED,
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

  async login({ user_id, status, role }: { user_id: string; status: UserStatus; role: UserRole }) {
    const [access_token, refresh_token] = await userService.signAccessAndRefreshToken({ user_id, status, role })
    await databaseService.refresh_tokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: refresh_token
      })
    )

    return { access_token, refresh_token }
  }

  async assignCheckingStaff(event_id: ObjectId, user_id: ObjectId) {
    await databaseService.checking_staffs.insertOne({ event_id, user_id })
    const result = await databaseService.checking_staffs
      .aggregate([
        {
          $match: { event_id }
        },
        {
          $lookup: {
            from: env.DB_COLLECTION_USERS,
            localField: 'user_id',
            foreignField: '_id',
            as: 'checking_staff'
          }
        },
        {
          $project: {
            user_id: 0,
            checking_staff: {
              password: 0,
              created_at: 0,
              role: 0,
              status: 0,
              email_verify_token: 0,
              forgot_password_token: 0,
              date_of_birth: 0,
              point: 0,
              updated_at: 0,
              avatar: 0,
              phone_number: 0
            }
          }
        }
      ])
      .toArray()

    return result.at(-1)
  }

  async checkEventOwner(event_id: ObjectId, event_operator_id: ObjectId) {
    return Boolean(await databaseService.events.findOne({ _id: event_id, event_operator_id: event_operator_id }))
  }

  async listCheckingStaff(event_id: ObjectId) {
    return await databaseService.checking_staffs
      .aggregate([
        {
          $match: { event_id: event_id }
        },
        {
          $lookup: {
            from: env.DB_COLLECTION_USERS,
            localField: 'user_id',
            foreignField: '_id',
            as: 'checking_staff'
          }
        },
        {
          $unwind: '$checking_staff'
        },
        {
          $project: {
            _id: 0,
            'checking_staff._id': 1,
            'checking_staff.user_name': 1,
            'checking_staff.email': 1
          }
        },
        {
          $replaceRoot: { newRoot: '$checking_staff' }
        }
      ])
      .toArray()
  }

  async unassignCheckingStaff(event_id: ObjectId, checking_staff_id: ObjectId) {
    await databaseService.checking_staffs.deleteOne({ event_id, user_id: checking_staff_id })
    return await databaseService.checking_staffs
      .aggregate([
        {
          $match: { event_id: event_id }
        },
        {
          $lookup: {
            from: env.DB_COLLECTION_USERS,
            localField: 'user_id',
            foreignField: '_id',
            as: 'checking_staff'
          }
        },
        {
          $unwind: '$checking_staff'
        },
        {
          $project: {
            _id: 0,
            'checking_staff._id': 1,
            'checking_staff.user_name': 1,
            'checking_staff.email': 1
          }
        },
        {
          $replaceRoot: { newRoot: '$checking_staff' }
        }
      ])
      .toArray()
  }
}
const eventOperatorService = new EventOperatorService()
export default eventOperatorService
