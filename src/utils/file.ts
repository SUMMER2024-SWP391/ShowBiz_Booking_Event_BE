import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import formidable from 'formidable'
import { Files, File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //cho phép tạo folder nested vào nhau
        //uploads/image/bla bla bla
      }) //mkdirSync: giúp tạo thư mục
    }
  })
}

//hàm xử lý file từ client gửi lên
export const handleUploadImage = (req: Request, nameDir: string) => {
  const form = formidable({
    uploadDir: path.resolve(nameDir),
    maxFileSize: 500 * 1024,
    maxFiles: 1,
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      //đang hỏi là cái file m đưa lên cho t có phải image không và dạng của nó có phải là image không
      if (!valid) {
        form.emit('error' as any, new Error('File is not an image') as any) //do đây là chuẩn xử lý lỗi của formidable nên mình ko cấu hình status
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[])
    })
  })
}

export const getNameFormFullName = (fileName: string) => {
  //băm chuỗi tên file để lấy ra tên ext
  const nameArr = fileName.split('.')
  nameArr.pop()
  return nameArr.join('')
}

//làm hàm lấy số lượng file ảnh được truyền lên
export const getTotalImage = (req: Request) => {
  const form = formidable({
    maxFileSize: 500 * 1024,
    maxFiles: 5,
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      //đang hỏi là cái file m đưa lên cho t có phải image không và dạng của nó có phải là image không
      if (!valid) {
        form.emit('error' as any, new Error('File is not an image') as any) //do đây là chuẩn xử lý lỗi của formidable nên mình ko cấu hình status
      }
      return valid
    }
  })
  return new Promise<Files>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      return resolve(files)
    })
  })
}
