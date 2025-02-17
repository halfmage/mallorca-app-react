"use client"

import React, {useCallback, useMemo, useState} from 'react'
import {useRouter} from 'next/navigation'
import {useTranslation} from '@/app/i18n/client'
import {useForm} from "react-hook-form";
import countries from "i18n-iso-countries";

interface Props {
  pendingId: string
}

const FORM_OPTIONS = {
  defaultValues: {
    birthdate: '',
    gender: '',
    country: 'ES'
  },
}

const AdditionalStep = ({pendingId}: Props) => {
  const {push} = useRouter()
  const {register, handleSubmit} = useForm(FORM_OPTIONS)

  const {t, i18n: {language}} = useTranslation()
  const [updating, setUpdating] = useState(false)
  const countryOptions = useMemo(
    () => {
      const options = countries.getNames(language, {select: 'official'})
      return Object.keys(options).map(
        (countryCode) => ({
          value: countryCode,
          label: options[countryCode],
        })
      )
    },
    [language]
  )

  const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    handleSubmit(async ({country, birthdate, gender}) => {
      try {
        setUpdating(true)

        // Update auth user metadata
        const response = await fetch(
          `/api/user/pending/${pendingId}`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              country,
              birthdate,
              gender
            })
          }
        )
        await response.json()
        push(`/${language}/profile`)
      } catch (error) {
        console.error('Error updating profile:', error)
      } finally {
        setUpdating(false)
      }
    }),
    [handleSubmit]
  )

  const skipStep = useCallback(
    async () => {
      try {
        setUpdating(true)

        // Update auth user metadata
        const response = await fetch(
          `/api/user/pending/${pendingId}/cancel`,
          {method: 'PATCH'}
        )
        await response.json()
        push(`/${language}/profile`)
      } catch (error) {
        console.error('Error updating profile:', error)
      } finally {
        setUpdating(false)
      }
    },
    [language, push, pendingId]
  )

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border-2 border-gray-300 p-4">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold mb-4">{t('signUp.additional.title')}</h1>
            <span className="text-gray-600 cursor-pointer" onClick={skipStep}>
                {t('signUp.additional.skip')}
            </span>
          </div>
          <form onSubmit={onSubmit} className="mb-8">
            <p className="text-sm text-gray-500 mt-1">
              {t('signUp.additional.info')}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t('profile.birthdate')}
              </label>
              <input
                type="date"
                {...register('birthdate')}
                className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t('profile.country')}
              </label>
              <select
                {...register('country')}
                className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
              >
                <option value="">{t('common.select.placeholder')}</option>
                {countryOptions.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {t('profile.gender')}
              </label>
              <select
                {...register('gender')}
                className="w-full p-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
              >
                <option value="">{t('common.select.placeholder')}</option>
                <option value="male">{t('common.gender.male')}</option>
                <option value="female">{t('common.gender.female')}</option>
                <option value="other">{t('common.gender.other')}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {updating ? t('common.updating') : t('signUp.additional.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdditionalStep
