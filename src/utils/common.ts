import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JsonWebTokenError } from 'jsonwebtoken'
import { USER_MESSAGES } from '~/modules/user/user.messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { capitalize } from './capitalize'
import { EventStatus } from '~/constants/enums'
import { REGEX_TIME } from '~/constants/regex'

export const verifyAccessToken = async (access_token: string, req?: Request) => {
  if (!access_token) {
    throw new ErrorWithStatus({
      message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
      status: StatusCodes.UNAUTHORIZED
    })
  }
  try {
    const decoded_authorization = await verifyToken({
      token: access_token,
      secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
    if (req) {
      ;(req as Request).decoded_authorization = decoded_authorization
      return true
    }
    return decoded_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      message: capitalize((error as JsonWebTokenError).message),
      status: StatusCodes.UNAUTHORIZED
    })
  }
}

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

function convertToDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number)
  // Month trong Date 0-11 nên trừ 1
  return new Date(year, month - 1, day)
}

export function convertToDateEvent(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export function convertTimeToMinutes(timeString: string): number {
  const [time, modifier] = timeString.split(' ')
  // eslint-disable-next-line prefer-const
  let [hours, minutes] = time.split(':').map(Number)

  if (modifier === 'PM' && hours !== 12) {
    hours += 12
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0
  }

  return hours * 60 + minutes
}

export function compareTimes(timeStart: number, timeEnd: number): boolean {
  return timeEnd <= timeStart ? true : false
}

export interface Event {
  time_start: string
  time_end: string
}

export function isTimeConflict(newEvent: Event, existingEvents: Event[]): boolean {
  const newStart = convertTimeToMinutes(newEvent.time_start)
  const newEnd = convertTimeToMinutes(newEvent.time_end)

  //! Check xem trong ngày đó và location đó có event nào khác không
  for (const event of existingEvents) {
    const existingStart = convertTimeToMinutes(event.time_start)
    const existingEnd = convertTimeToMinutes(event.time_end)

    if (newStart < existingEnd && newEnd > existingStart) {
      return true
    }
  }

  return false
}

export function isDateOneWeekLater(dateStr: string): boolean {
  const WEEK_TO_DAYS = 7
  const currentDate = getCurrentDateFormatted()

  // Parse the current date string in "dd-mm-yyyy" format
  const [currentDay, currentMonth, currentYear] = currentDate.split('-').map(Number)
  const currentDated = new Date(currentYear, currentMonth - 1, currentDay)

  // Parse the input date string in "dd-mm-yyyy" format
  const [day, month, year] = dateStr.split('-').map(Number)
  const inputDate = new Date(year, month - 1, day)

  // Calculate the date one week later from the current date
  const oneWeekLater = new Date(currentDated)
  oneWeekLater.setDate(oneWeekLater.getDate() + WEEK_TO_DAYS) // 1 week later

  return inputDate <= oneWeekLater
}

function getCurrentDateFormatted(): string {
  const currentDate = new Date()

  //! Thêm padStart(2, '0') để make sure string có at least 2 chars, nếu ít hơn thì thêm '0' vào đầu
  const day = String(currentDate.getDate()).padStart(2, '0')
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const year = currentDate.getFullYear()

  return `${day}-${month}-${year}`
}

export function checkActionOfEventOperatorValid(
  status: EventStatus,
  formRegister: boolean,
  formFeedback: boolean
): string[] {
  if (status === EventStatus.PENDING) {
    if (!formRegister && !formFeedback) {
      return ['create form register', 'create form feedback']
    }
    if (formRegister && formFeedback) {
      return ['update form register', 'update form feedback']
    }
    if (!formRegister && formFeedback) {
      return ['create form register', 'update form feedback']
    }
    if (formRegister && !formFeedback) {
      return ['update form register', 'create form feedback']
    }
  } else if (status === EventStatus.APPROVED) {
    if (!formFeedback) {
      return ['create form feedback']
    } else if (formFeedback) {
      return ['update form feedback']
    }
  }

  return ['do everything']
}

export function isToday(dateString: string) {
  const datePattern = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/(\d{4})$/

  // Kiểm tra định dạng ngày
  if (!datePattern.test(dateString)) {
    return false
  }

  // Lấy ngày hiện tại
  const today = new Date()
  const todayString =
    ('0' + today.getDate()).slice(-2) + '/' + ('0' + (today.getMonth() + 1)).slice(-2) + '/' + today.getFullYear()

  // So sánh ngày hiện tại với chuỗi ngày đầu vào
  return dateString === todayString
}

export function canCheckIn(eventTime: string): boolean {
  if (!REGEX_TIME.test(eventTime)) {
    throw new Error("Invalid time format. Please use 'HH:mm' format.")
  }

  const [inputHours, inputMinutes] = eventTime.split(':').map(Number)

  const now = new Date()
  const currentHours = now.getHours()
  const currentMinutes = now.getMinutes()

  // Calculate total minutes from midnight for input time
  const totalMinutesInput = inputHours * 60 + inputMinutes

  // Calculate total minutes from midnight for current time
  const totalMinutesCurrent = currentHours * 60 + currentMinutes

  // Calculate total minutes from midnight for current time minus 30 minutes
  const totalMinutes30BeforeCurrent = totalMinutesCurrent - 30

  // Calculate total minutes from midnight for current time plus 5 minutes
  const totalMinutes5AfterCurrent = totalMinutesCurrent + 5

  // Check if input time is within the valid range
  return totalMinutesInput <= totalMinutes30BeforeCurrent || totalMinutesInput >= totalMinutes5AfterCurrent
}

export function canCancelEvent(dateEvent: string, timeStart: string): boolean {
  const date = convertToDate(dateEvent)

  const [hours, minutes] = timeStart.split(':').map(Number)
  const eventDate = new Date(date)
  eventDate.setHours(hours, minutes, 0, 0)

  const now = new Date()
  //khoảng cách thời gian hiện tại so với thời gian bắt đầu sự kiện
  const diff = eventDate.getTime() - now.getTime()

  //đổi sang giờ
  const diffInHours = diff / (1000 * 60 * 60)

  return diffInHours >= 48
}

export function isErrorUnauthhoriztionn(
  result: unknown
): result is { message: 'UNAUTHORIZED! Not have enough permission!' } {
  return result != null && typeof result === 'object' && 'message' in result && typeof result.message === 'string'
}
