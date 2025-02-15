import moment from 'moment'
import {
  STATUS_PENDING,
  STATUS_VERIFIED,
  STATUS_REJECTED,
  STATUS_PAYMENT_PENDING,
  STATUS_PAYMENT_COMPLETED,
  SEASON_WINTER,
  SEASON_SUMMER
} from '@/app/api/utils/constants'

const TRANSLATABLE_STATUSES = [
  STATUS_PENDING,
  STATUS_VERIFIED,
  STATUS_REJECTED,
  STATUS_PAYMENT_PENDING,
  STATUS_PAYMENT_COMPLETED
]

export const stringifyParams = (params: object) => {
  const queryParams = new URLSearchParams(
    Object.entries(params).filter(([key, value]) => value != null) // eslint-disable-line @typescript-eslint/no-unused-vars
  )

  return `?${queryParams.toString()}`
}

export const isUUID = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)

export const translateStatus = (t: (key: string) => string, status: string) =>
  TRANSLATABLE_STATUSES.includes(status) ? t(`common.status.${status}`) : status

export const getSeason = () => {
  const now = moment()

  const startDate = moment({ year: now.year(), month: 3, day: 1 });   // April 1
  const endDate   = moment({ year: now.year(), month: 7, day: 31 });    // August 31

  return now.isBetween(startDate, endDate) ? SEASON_SUMMER : SEASON_WINTER
}
