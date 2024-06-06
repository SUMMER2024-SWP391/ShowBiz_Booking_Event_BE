import Register from '~/modules/register/register.schema'
import qrcode from 'qrcode'
import { IMAGE_PATH } from '~/constants/path'
export const convertDataToQrCode = async (infoRegister: Register) => {
  const nameFile = `${infoRegister._id}.png`
  await qrcode.toFile(`${IMAGE_PATH}/${nameFile}`, JSON.stringify(infoRegister), (err) => {
    if (err) throw err
  })
}
