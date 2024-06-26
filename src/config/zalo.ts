import { env } from '~/config/environment'

export const config = {
  app_id: env.APP_ID as string,
  key1: env.KEY1 as string,
  key2: env.KEY2 as string,
  endpoint: 'https://sb-openapi.zalopay.vn/v2/create'
}
