import { ObjectId } from 'mongodb'

type ImageEventType = {
  _id: ObjectId
  imageUrl: string
  event_id: ObjectId
}

export class ImageEvent {
  _id: ObjectId
  imageUrl: string
  event_id: ObjectId

  constructor(imageEvent: ImageEventType) {
    this._id = imageEvent._id
    this.imageUrl = imageEvent.imageUrl
    this.event_id = imageEvent.event_id
  }
}
