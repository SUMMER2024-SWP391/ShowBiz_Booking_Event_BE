import User from '../user/user.schema'
import { EventType } from './event.schema'

export interface EventReponse extends EventType {
  event_operator: User
}
