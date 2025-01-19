'use client'

import React, { useState } from 'react'
import { useTranslation } from '@/app/i18n/client'


const SaveButton = ({ provider, isSaved: isSavedInitially }) => {
    const [isSaved, setIsSaved] = useState(isSavedInitially)
    const [savingStatus, setSavingStatus] = useState('idle')
    const { t } = useTranslation()
    console.log('111 provider= ', provider)

    const handleSaveToggle = async (e) => {
        try {
            e.preventDefault()
            setSavingStatus('loading')

            const response = await fetch(
                `/api/saved/${provider.id}`,
                { method: 'PUT' }
            )
            const { data: isSaved } = await response.json()

            setIsSaved(isSaved)
        } catch (error) {
            console.error(t('providerDetail.error.saveProvider'), error.message);
        } finally {
            setSavingStatus('idle')
        }
    }

    return (
        <button
            onClick={handleSaveToggle}
            disabled={savingStatus === 'loading'}
            className={`${
                isSaved
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-4 py-2 rounded transition-colors`}
        >
            {savingStatus === 'loading'
                ? t('common.loading')
                : isSaved
                    ? t('providerDetail.saveButton.remove')
                    : t('providerDetail.saveButton.save')}
        </button>
    )
}

export default SaveButton
