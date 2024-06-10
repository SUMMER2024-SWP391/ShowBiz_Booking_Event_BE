import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import { JsonWebTokenError } from 'jsonwebtoken'
import { USER_MESSAGES } from '~/modules/user/user.messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { capitalize } from './capitalize'

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
  const [day, month, year] = dateString.split('-').map(Number)
  // Month trong Date 0-11 nên trừ 1
  return new Date(year, month - 1, day)
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
  const currentDate = getCurrentDateFormatted()

  // Parse the current date string in "dd-mm-yyyy" format
  const [currentDay, currentMonth, currentYear] = currentDate.split('-').map(Number)
  const currentDated = new Date(currentYear, currentMonth - 1, currentDay)

  // Parse the input date string in "dd-mm-yyyy" format
  const [day, month, year] = dateStr.split('-').map(Number)
  const inputDate = new Date(year, month - 1, day)

  // Calculate the date one week later from the current date
  const oneWeekLater = new Date(currentDated)
  oneWeekLater.setDate(oneWeekLater.getDate() + 6) // 1 week later

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
