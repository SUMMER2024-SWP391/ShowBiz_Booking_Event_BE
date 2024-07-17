import User from '../user/user.schema'
import { EventType } from './event.schema'

export interface EventResponse extends EventType {
  event_operator: User
}
