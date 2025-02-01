'use client'

import React, {useCallback, useState} from 'react'
import { useTranslation } from '@/app/i18n/client'
import { Heart, HeartCrack, LoaderCircle } from 'lucide-react'


const SaveButton = ({ provider, isSaved: isSavedInitially, onClick }) => {
    const [isSaved, setIsSaved] = useState(isSavedInitially)
    const [savingStatus, setSavingStatus] = useState('idle')
    const { t } = useTranslation()

    const handleSaveToggle = useCallback(
        async (e) => {
            try {
                e.preventDefault()
                setSavingStatus('loading')

                const response = await fetch(
                    `/api/saved/${provider.id}`,
                    { method: 'PUT' }
                )
                const { data: isSaved } = await response.json()

                setIsSaved(isSaved)
                if (onClick) {
                    onClick(provider.id, isSaved)
                }
            } catch (error) {
                console.error(t('providerDetail.error.saveProvider'), error.message);
            } finally {
                setSavingStatus('idle')
            }
        },
        [ provider.id, t, onClick ]
    )

    return (
        <button
            onClick={handleSaveToggle}
            disabled={savingStatus === 'loading'}
        >
            {savingStatus === 'loading' ? (
                <LoaderCircle className="size-6 animate-spin" />
            ) : isSaved ? (
                <HeartCrack className="size-6" />
            ) : (
                <Heart className="size-6" />
            )}
        </button>
    )
}

export default SaveButton
