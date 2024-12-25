"use client"

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from '@/app/i18n/client'


const ClaimBusiness = ({ provider }) => {
    const [ savingStatus, setSavingStatus ] = useState('idle')
    const { register, handleSubmit } = useForm()
    const { t } = useTranslation()

    const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
        handleSubmit(
            async ({ email, phone, message }) => {
                try {
                    setSavingStatus('loading')

                    const response = await fetch(
                        `/api/provider/${provider.id}/claim`,
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
        [ handleSubmit, provider.id ]
    )

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div>
                <form onSubmit={onSubmit}>
                    <h1 className="text-3xl font-bold mb-4">{t('claimBusiness.form.title')}</h1>
                    <h2 className="text-3xl font-bold mb-4">{provider.name}</h2>
                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-6">
                            <span>
                                {provider?.maincategories?.name}
                            </span>
                            <span>
                                {provider?.subcategories?.name}
                            </span>
                        </h3>
                    </div>

                    <div>
                        <div>
                            <input {...register('email', {required: true})} className="px-3 py-2 border rounded"
                                   type="email"
                                   placeholder={t('claimBusiness.form.email.placeholder')}/>
                        </div>
                        <div>
                            <input {...register('phone', {required: true})} className="px-3 py-2 border rounded" type="text"
                                   placeholder={t('claimBusiness.form.phone.placeholder')}/>
                        </div>
                        <div>
                        <textarea {...register('message', {required: true})} className="px-3 py-2 border rounded"
                                  placeholder={t('claimBusiness.form.message.placeholder')}></textarea>
                        </div>
                    </div>
                    <input className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors" disabled={savingStatus === 'loading'} type="submit" />
                </form>
            </div>
        </div>
    );
};

export default ClaimBusiness
