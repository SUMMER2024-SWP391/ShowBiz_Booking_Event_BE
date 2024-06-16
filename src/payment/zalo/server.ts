import axios from 'axios'
import CryptoJS from 'crypto-js'
import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import moment from 'moment'
import qs from 'qs'
import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { omit } from 'lodash'

const payment = express()

// APP INFO, STK TEST: 4111 1111 1111 1111
const config = {
  app_id: env.APP_ID as string,
  key1: env.KEY1 as string,
  key2: env.KEY2 as string,
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create'
}

payment.use(bodyParser.json())

/**
 * * Description: Tạo đơn hàng, thanh toán
 * Method: POST
 * Sandbox POST https://sb-openapi.zalopay.vn/v2/create
 * Real POST https://openapi.zalopay.vn/v2/create
 */
payment.post('/payment', async (_req: Request, res: Response): Promise<Response> => {
  const embed_data = {
    // sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
    redirecturl: `${env.DB_HOST}:${env.PORT_FE}`
  }

  const items: any[] = []
  const transID: number = Math.floor(Math.random() * 1000000)

  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: 'user123',
    app_time: Date.now(), // milliseconds
    item: JSON.stringify(items),
    embed_data: JSON.stringify(embed_data),
    amount: 50000,
    // khi thanh toán xong, zalopay server sẽ POST đến url này để thông báo cho server của mình
    // Chú ý: cần dùng ngrok để public url thì Zalopay Server mới call đến được
    callback_url: 'https://b074-1-53-37-194.ngrok-free.app/callback',
    description: `Booking Event - Payment for the order #${transID}`,
    bank_code: '',
    mac: ''
  }

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data: string =
    config.app_id +
    '|' +
    order.app_trans_id +
    '|' +
    order.app_user +
    '|' +
    order.amount +
    '|' +
    order.app_time +
    '|' +
    order.embed_data +
    '|' +
    order.item
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString()

  try {
    const result = await axios.post(config.endpoint, null, { params: order })

    return res.status(StatusCodes.OK).json(result.data)
  } catch (error) {
    console.log('🚀 ~ error:', error)

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
  }
})

/**
 * * Description: Callback để Zalopay Server call đến khi thanh toán thành công.
 * Method: POST
 * Khi và chỉ khi ZaloPay đã thu tiền khách hàng thành công thì mới gọi API này để thông báo kết quả.
 */
payment.post('/callback', (req: Request, res: Response): void => {
  const result: any = {}
  console.log(req.body)
  try {
    const { dataStr, reqMac } = req.body
    // const dataStr: string = req.body.data
    // const reqMac: string = req.body.mac

    const mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString()
    console.log('🚀 ~ mac:', mac)

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1
      result.return_message = 'mac not equal'
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng ở đây
      const dataJson = JSON.parse(dataStr)

      result.return_code = 1
      result.return_message = 'success'
    }
  } catch (ex: any) {
    console.log('Err:::' + ex.message)
    result.return_code = 0 // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result)
})

/**
 ** Description:
  Khi user thanh toán thành công, ZaloPay sẽ gọi callback (notify) tới merchant để merchant cập nhật trạng thái
đơn hàng Thành Công trên hệ thống. Trong thực tế callback có thể bị miss do lỗi Network timeout, Merchant Service 
Unavailable/Internal Error... nên Merchant cần hiện thực việc chủ động gọi API truy vấn trạng thái đơn hàng.
 * Method: POST
 * Sandbox POST https://sb-openapi.zalopay.vn/v2/query
 * Real POST https://openapi.zalopay.vn/v2/query
 */
payment.post('/check-status-order/:app_trans_id', async (req: Request, res: Response) => {
  const { app_trans_id } = req.params

  const postData = {
    app_id: config.app_id,
    app_trans_id,
    mac: ''
  }

  const data = postData.app_id + '|' + postData.app_trans_id + '|' + config.key1 // appid|app_trans_id|key1
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString()

  const postConfig = {
    method: 'post',
    url: 'https://sb-openapi.zalopay.vn/v2/query',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(postData)
  }

  try {
    const result = await axios(postConfig)
    return res.status(StatusCodes.OK).json(omit(result.data, 'sub_return_code', 'sub_return_message'))
    /**
     ** Kết quả mẫu:
      {
        "return_code": 1, // 1 : Thành công, 2 : Thất bại, 3 : Đơn hàng chưa thanh toán hoặc giao dịch đang xử lý
        "return_message": "",
        "sub_return_code": 1,
        "sub_return_message": "",
        "is_processing": false,
        "amount": 50000,
        "zp_trans_id": 240331000000175,
        "server_time": 1711857138483,
        "discount_amount": 0
      }
    */
  } catch (error) {
    console.log('🚀 ~ error:', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
  }
})

export default payment
