import { Request, Response } from 'express'
import mediaService from './media.services'
import { ObjectId } from 'mongodb'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import fs from 'fs'

export const uploadImageEventController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadMedia(req)
  const images = await mediaService.createEventImage(result[0])
  res.json({
    message: 'Upload image successfully',
    data: {
      images
    }
  })
}

export const deleteImageEventController = async (req: Request, res: Response) => {
  const id = req.params.id
  const result = await mediaService.deleteMedia(id)
  res.json({
    message: 'Delete image successfully'
  })
}

export const updateImageEventController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadMedia(req)
  const ahihi = await mediaService.getEventImage(new ObjectId(req.params.id))
  fs.unlinkSync(UPLOAD_IMAGE_DIR + '/' + ahihi?.imageUrl)
  const images = await mediaService.updateImage(new ObjectId(req.params.id), result[0])
  res.json({
    message: 'Update image successfully',
    data: {
      images
    }
  })
}
