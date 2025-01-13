"use client"

import React, { useCallback, useMemo, useState } from 'react'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/app/i18n/client'


const Send = ({ savedCount, limit, latestEmailDate, isBlocked }) => {
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
                        push(`/${language}/messages`)
                    }
                } catch (error) {
                    console.error(t('messages.form.error.send'), error.message);
                } finally {
                    setSavingStatus('idle')
                }
            }
        ),
        [ handleSubmit, language, t, push]
    )

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="border-2 border-gray-300 p-4">
                <form onSubmit={onSubmit}>
                    <h1 className="text-3xl font-bold mb-4">{t('messages.form.title')}</h1>
                    {timeLeft &&
                      <div className="bg-gray-200 px-5 py-5 mb-6">
                            <div>
                                {t('messages.form.blockedMessage')}
                            </div>
                            <span>{timeLeft}</span>
                        </div>
                    }
                    <label className="w-full bg-gray-200 px-5 py-5 mb-6 text-center block cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            {...register('image', {required: false})}
                            className="hidden"
                        />
                        {t('messages.form.addImageButton')}
                    </label>

                    <div>
                        <div>
                            <input {...register('title', {required: true})} className="px-3 py-2 border rounded"
                                   type="text"
                                   placeholder={t('messages.form.messageTitle.placeholder')}/>
                        </div>
                        <div>
                        <textarea {...register('text', {required: true})} className="px-3 py-2 border rounded"
                                  placeholder={t('messages.form.messageText.placeholder')}></textarea>
                        </div>
                        <p dangerouslySetInnerHTML={{ __html: t('messages.form.infoText', { count: savedCount, limit })}} />
                    </div>
                    <input
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                        disabled={savingStatus === 'loading' || !savedCount}
                        type="submit"
                        value={t('messages.form.sendButton')}
                    />
                </form>
            </div>
        </div>
    );
};

export default Send
