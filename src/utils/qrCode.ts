import Register from '~/modules/register/register.schema'
import qrcode from 'qrcode'

export const convertDataToQrCode = async (infoRegister: Register) => {
  return await qrcode.toDataURL(JSON.stringify(infoRegister), { errorCorrectionLevel: 'H' })
}
