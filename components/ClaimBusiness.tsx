"use client"

import React, {useCallback, useState} from 'react'
import {useTranslation} from '@/app/i18n/client'
import Select from "react-select";
import {useRouter} from "next/navigation";

// @ts-expect-error: skip type for now
const ClaimBusiness = ({provider, userOptions}) => {
  const [savingStatus, setSavingStatus] = useState('idle')
  const [value, setValue] = useState(null)
  const {t, i18n: {language}} = useTranslation()
  const { push } = useRouter()

  const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    async () => {
      try {
        setSavingStatus('loading')

        const response = await fetch(
          `/api/provider/${provider.id}/claim`,
          {
            method: 'POST',
            // @ts-expect-error: skip type for now
            body: JSON.stringify({user: value?.value})
          }
        )
        const { data } = await response.json()
        if (data) {
          push(`/${language}/admin`)
        }
      } catch (error) {
        // @ts-expect-error: skip type for now
        console.error(t('claimBusiness.error.saveProvider'), error.message);
      } finally {
        setSavingStatus('idle')
      }
    },
    [provider.id, value, push, language, t]
  )

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border-2 border-gray-300 p-4">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">{t('claimBusiness.form.title')}</h1>
          <h2 className="text-3xl font-bold mb-4">{provider.name}</h2>
          <Select
            options={userOptions}
            onChange={setValue}
            placeholder={t('claimBusiness.form.user.placeholder')}
            classNames={{
              container: () => 'w-full transition-all duration-300',
              control: (state) => `!min-h-10 ${state.isFocused ? 'shadow-md' : ''} !border-gray-200 dark:!border-gray-800`,
              menu: () => 'shadow-lg !rounded-lg !border !border-gray-200 dark:!border-gray-800 !mt-1 !z-50',
              menuList: () => '!p-1',
              input: () => '!text-base md:!text-sm',
              placeholder: () => '!text-gray-500 dark:!text-gray-400',
              option: (state) => `!text-base md:!text-sm !p-2 !rounded-md ${
                state.isFocused
                  ? '!bg-gray-50 dark:!bg-gray-800'
                  : '!bg-transparent'
              } hover:!bg-gray-50 dark:hover:!bg-gray-800 !text-gray-700 dark:!text-gray-200`,
              noOptionsMessage: () => '!p-2 !text-gray-500 dark:!text-gray-400',
            }}
            styles={{
              menu: (base) => ({
                ...base,
                width: '100%'
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: '60vh',
                '@media (min-width: 768px)': {
                  maxHeight: '40vh'
                }
              }),
              option: (base) => ({
                ...base,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 200ms ease'
              })
            }}
          />
          <button
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            disabled={savingStatus === 'loading' || value === null}
            onClick={onSubmit}
          >
            {savingStatus === 'loading' ? t('claimBusiness.form.button.saving') : t('claimBusiness.form.button.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimBusiness
