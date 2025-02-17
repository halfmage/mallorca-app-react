"use client"

import React, { useCallback, useMemo, useState } from 'react'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'


// @ts-expect-error: skip type for now
const Send = ({ savedCount, limit, latestEmailDate, isBlocked, providerId }) => {
  const [ savingStatus, setSavingStatus ] = useState('idle')
  const { push } = useRouter()
  const { register, handleSubmit } = useForm()
  const { t, i18n: { language } } = useTranslation()
  const timeLeft = useMemo(
    () => {
      if (!isBlocked) {
        return null
      }

      const date = moment(latestEmailDate)
      const unblockDate = date.add(limit, 'hours')
      const diff = moment.duration(unblockDate.diff(moment()))

      return t('messages.form.blockedUntil', { hours: diff.hours(), minutes: diff.minutes() })
    },
    [ latestEmailDate, limit, isBlocked, t ]
  )

  const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    handleSubmit(
      async ({ title, text, image }) => {
        try {
          setSavingStatus('loading')
          const formData = new FormData()
          formData.append('title', title)
          formData.append('text', text)
          formData.append('providerId', providerId)
          if (image?.[0]) {
            formData.append('image', image[0])
          }

          const response = await fetch(
            `/api/message`,
            {
              method: 'POST',
              body: formData
            }
          )
          const { data } = await response.json()

          if (data) {
            push(`/${language}/messages/${providerId}`)
          }
        } catch (error) {
          // @ts-expect-error: skip type for now
          console.error(t('messages.form.error.send'), error.message);
        } finally {
          setSavingStatus('idle')
        }
      }
    ),
    [ handleSubmit, language, t, push, providerId ]
  )

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border-2 border-gray-300 p-4">
        <form onSubmit={onSubmit}>
          <h1 className="text-3xl font-bold mb-4">{t('messages.form.title')}</h1>
          {timeLeft &&
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow px-5 py-5 mb-6">
              <div>
                {t('messages.form.blockedMessage')}
              </div>
              <span>{timeLeft}</span>
            </div>
          }
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 my-2 text-center">
            <label
              className="p-2 my-2 text-center border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white cursor-pointer">
              <input
                type="file"
                accept="image/*"
                {...register('image', { required: false })}
                className="hidden"
              />
              {t('messages.form.addImageButton')}
            </label>
          </div>

          <div>
            <div>
              <input {...register('title', { required: true })}
                     className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                     type="text"
                     placeholder={t('messages.form.messageTitle.placeholder')}/>
            </div>
            <div>
                        <textarea {...register('text', { required: true })}
                                  className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                                  placeholder={t('messages.form.messageText.placeholder')}></textarea>
            </div>
            <p dangerouslySetInnerHTML={{
              __html: t('messages.form.infoText', {
                count: savedCount,
                limit
              })
            }}/>
          </div>
          <input
            className="w-full my-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            disabled={savingStatus === 'loading' || !savedCount}
            type="submit"
            value={t('messages.form.sendButton')}
          />
          <Link href={`/${language}/messages/${providerId}`}>
            <button
              className="w-full my-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              {t('common.back')}
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Send
