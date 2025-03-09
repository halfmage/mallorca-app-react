'use client'

import React, { useCallback, useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import { Heart } from 'lucide-react'

// @ts-expect-error: skip type for now
const SaveButton = ({ provider, isSaved: isSavedInitially, onClick }) => {
  const [ isSaved, setIsSaved ] = useState(isSavedInitially)
  const [ savingStatus, setSavingStatus ] = useState('idle')
  const { t } = useTranslation()

  const handleSaveToggle = useCallback(
    // @ts-expect-error: skip type for now
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
        // @ts-expect-error: skip type for now
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
      className={isSaved ? 'button-outline' : 'button-save'}
    >
      {savingStatus === 'loading' ? (
        'Loading...'
      ) : isSaved ? (
        'Unsave'
      ) : (
        <>
          <Heart className="w-4 h-4"/>
          Save
        </>
      )}
    </button>
  )
}

export default SaveButton
