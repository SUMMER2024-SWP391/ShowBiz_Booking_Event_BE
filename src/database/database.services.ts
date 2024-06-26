import { PaymentZalo } from './../payment/zalo/payment.schema'
import { Collection, Db, MongoClient } from 'mongodb'
import User from '~/modules/user/user.schema'
import { env } from '~/config/environment'
import RefreshToken from '~/modules/refreshToken/refreshToken.schema'
import Event from '~/modules/event/event.schema'
import EventOperator from '~/modules/event_operator/event_operator.schema'
import { FormEvent } from '~/modules/form/form.schema'
import Question from '~/modules/question/question.schema'
import Answer from '~/modules/answer/answer.schema'
import Register from '~/modules/register/register.schema'
import CheckingStaff from '~/modules/checking_staff/checking_staff.schema'
import { ImageEvent } from '~/modules/media/media.schema'

const uri = `mongodb+srv://${env.DB_USERNAME}:${env.DB_PASSWORD}@showbizevent.vrxs1vz.mongodb.net/?retryWrites=true&w=majority&appName=ShowBizEvent`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('🚀 Pinged your deployment. You successfully connected to MôngCổ-DB           🚀')
    } catch (error) {
      console.log('🚀 ~ DatabaseService ~ connect ~ error:', error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(env.DB_COLLECTION_USERS as string)
  }

  get refresh_tokens(): Collection<RefreshToken> {
    return this.db.collection(env.DB_COLLECTION_REFRESH_TOKENS as string)
  }

  get events(): Collection<Event> {
    return this.db.collection(env.DB_COLLECTION_EVENTS as string)
  }

  get event_operators(): Collection<EventOperator> {
    return this.db.collection(env.DB_COLLECTION_EVENT_OPERATORS as string)
  }

  get forms(): Collection<FormEvent> {
    return this.db.collection(env.DB_COLLECTION_FORMS as string)
  }

  get questions(): Collection<Question> {
    return this.db.collection(env.DB_COLLECTION_QUESTIONS as string)
  }

  get answers(): Collection<Answer> {
    return this.db.collection(env.DB_COLLECTION_ANSWERS as string)
  }

  get registers(): Collection<Register> {
    return this.db.collection(env.DB_COLLECTION_REGISTERS as string)
  }

  get checking_staffs(): Collection<CheckingStaff> {
    return this.db.collection(env.DB_COLLECTION_CHECKING_STAFFS as string)
  }

  get imageEvents(): Collection<ImageEvent> {
    return this.db.collection(env.DB_COLLECTION_IMAGE_EVENTS as string)
  }

  get payments(): Collection<PaymentZalo> {
    return this.db.collection(env.DB_COLLECTION_PAYMENT as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
