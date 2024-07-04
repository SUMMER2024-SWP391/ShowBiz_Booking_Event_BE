import cron from 'node-cron'
import eventService from '~/modules/event/event.services'
import registerService from '~/modules/register/register.services'

//chạy mỗi 0p mỗi giờ
const taskCheckPaymentPeople = cron.schedule('0 * * * *', async () => {
  //lấy ra event được approved có ngày bắt đầu lớn hơn ngày hiện tại và có phí
  const eventList = await eventService.getListEventApproved()
  //lấy ra danh sách register
  const listRegister = await registerService.getListRegiserPeople(eventList)
  //lấy ra danh sách payment
  //   const listPayment  =  await
})
