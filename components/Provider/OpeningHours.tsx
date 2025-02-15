import React, { useMemo } from 'react'
import moment from 'moment'
import { useTranslation } from '@/app/i18n/client'
import { getSeason } from '@/app/api/utils/helpers'

const formatTime = (time: string) => moment(time, "HH:mm:ss").format("HH:mm")

const OpeningHours = ({ days }) => {
  const { t, i18n: { language } } = useTranslation()
  moment.locale(language)
  const items = useMemo(
    () => days.filter(
      ({ season }) => getSeason() === season
    ).sort((a, b) => a.day - b.day),
    [days]
  )

  return (
    <div className="sticky top-24 space-y-6">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
          {t('providerDetail.openingHours.title')}
        </h3>
        {items.map(
          day => <div key={day.day} className="flex flex-row justify-between">
            <div>{moment().isoWeekday(day.day).format("dddd")}</div>
            <div>{day.closed ? t('providerDetail.openingHours.closed') : `${formatTime(day.from)} - ${formatTime(day.to)}`}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OpeningHours
