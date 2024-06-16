import { get } from 'axios'
import { Request } from 'express'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFormFullName, handleUploadImage } from '~/utils/file'
import fs from 'fs'
import sharp from 'sharp'
import databaseService from '~/database/database.services'
import { ImageEvent } from './media.schema'
import { ObjectId } from 'mongodb'

class MediaService {
  async uploadMedia(req: Request) {
    const files = await handleUploadImage(req, UPLOAD_IMAGE_DIR)
    const images: Array<string> = []
    const result = await Promise.all(
      files.map(async (file) => {
        const newFileName = getNameFormFullName(file.newFilename) + '.jpg'
        const newFilePath = UPLOAD_IMAGE_DIR + '/' + newFileName
        await sharp(file.filepath).jpeg().toFile(newFilePath)
        fs.unlinkSync(file.filepath)
        images.push(`${newFileName}`)
        return images
      })
    )
    console.log(images)
    return images
  }

  async createEventImage(images: string) {
    const result = await databaseService.imageEvents.insertOne(
      new ImageEvent({
        _id: new ObjectId(),
        event_id: new ObjectId(),
        imageUrl: images
      })
    )
    return await this.getEventImage(result.insertedId)
  }

  async updateImage(id: ObjectId, images: string) {
    await databaseService.imageEvents.updateOne(
      { _id: id },
      {
        $set: {
          imageUrl: images
        }
      }
    )
    return await this.getEventImage(id)
  }

  async getEventImage(id: ObjectId) {
    return await databaseService.imageEvents.findOne({ _id: id })
  }

  async deleteMedia(id: string) {
    const image = await databaseService.imageEvents.findOne({ _id: new ObjectId(id) })
    await Promise.all([
      fs.unlinkSync(UPLOAD_IMAGE_DIR + '/' + image?.imageUrl),
      databaseService.imageEvents.deleteOne({ _id: image?._id })
    ])
  }
}

const mediaService = new MediaService()
export default mediaService
