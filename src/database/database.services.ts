import { Collection, Db, MongoClient } from 'mongodb'
import User from '~/modules/user/user.schema'
import { env } from '~/config/environment'
import RefreshToken from '~/modules/refreshToken/refreshToken.schema'
import Event from '~/modules/event/event.schema'
import EventOperator from '~/modules/event_operator/event_operator.schema'

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
}

const databaseService = new DatabaseService()
export default databaseService
