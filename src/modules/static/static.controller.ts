import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'

export const serveImageEventController = async (req: Request, res: Response) => {
  const { filename } = req.params
  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, filename), (error) => {
    if (error) {
      res.status((error as any).status).send('Not found image')
    }
  })
}
