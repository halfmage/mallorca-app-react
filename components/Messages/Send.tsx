"use client"

import React, { useCallback, useMemo, useState } from 'react'
import moment from 'moment'
import { useForm } from 'react-hook-form'
import { useTranslation } from '@/app/i18n/client'


const Send = ({ savedCount, limit, latestEmailDate }) => {
    const [ savingStatus, setSavingStatus ] = useState('idle')
    const { register, handleSubmit } = useForm()
    const { t } = useTranslation()
    const timeLeft = useMemo(
        () => {
            if (!latestEmailDate) {
                return null
            }

            const now = moment()
            const date = moment(latestEmailDate)

            if (now.diff(date) > limit * 1000 * 60 * 60) {
                return null
            }

            const unblockDate = date.add(limit, 'hours')
            const diff = moment.duration(unblockDate.diff(now))

            return `${diff.hours()}h ${diff.minutes()}min`
        },
        [ latestEmailDate, limit ]
    )

    const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
        handleSubmit(
            async ({ title, text }) => {
                try {
                    setSavingStatus('loading')
                    const formData = new FormData()
                    formData.append('title', title)
                    formData.append('text', text)

                    const response = await fetch(
                        `/api/message`,
                        {
                            method: 'POST',
                            body: formData
                        }
                    )
                    await response.json()
                } catch (error) {
                    console.error(t('claimBusiness.error.saveProvider'), error.message);
                } finally {
                    setSavingStatus('idle')
                }
            }
        ),
        [ handleSubmit ]
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
                    <div className="bg-gray-200 px-5 py-5 mb-6 text-center">
                        {t('messages.form.addImageButton')}
                    </div>

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
