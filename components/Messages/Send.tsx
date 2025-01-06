"use client"

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from '@/app/i18n/client'


const Send = () => {
    const [ savingStatus, setSavingStatus ] = useState('idle')
    const { register, handleSubmit } = useForm()
    const { t } = useTranslation()

    const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
        handleSubmit(
            async ({ email, phone, message }) => {
                try {
                    setSavingStatus('loading')

                    const response = await fetch(
                        `/api/message`,
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                email,
                                phone,
                                message
                            })
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
                    <div className="bg-gray-200 px-5 py-5 mb-6">
                        {t('messages.form.blockedMessage')}
                    </div>
                    <div className="bg-gray-200 px-5 py-5 mb-6 text-center">
                        {t('messages.form.addImage')}
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
                        <p dangerouslySetInnerHTML={{ __html: t('messages.form.infoText', { count: 200 })}} />
                    </div>
                    <input className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                           disabled={savingStatus === 'loading'} type="submit"/>
                </form>
            </div>
        </div>
    );
};

export default Send
