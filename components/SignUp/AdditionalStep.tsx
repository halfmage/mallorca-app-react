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
    <div className="h-[calc(100vh-6rem)] flex items-center rounded-3xl justify-center p-4 bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("https://images.pexels.com/photos/1731826/pexels-photo-1731826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'}}>
      <div className="">
        <div className="bg-white/95 dark:bg-gray-950/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8">
            <div className="flex justify-between items-center">
              <h1 className="h3">
                {t('signUp.additional.title')}
              </h1>
              <span 
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium cursor-pointer transition-colors duration-200" 
                onClick={skipStep}
              >
                {t('signUp.additional.skip')}
              </span>
            </div>
          </div>
          <div className="p-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {t('signUp.additional.info')}
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile.birthdate')}
                </label>
                <input
                  type="date"
                  {...register('birthdate')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             transition-colors duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile.country')}
                </label>
                <select
                  {...register('country')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             transition-colors duration-200"
                >
                  <option value="">{t('common.select.placeholder')}</option>
                  {countryOptions.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('profile.gender')}
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             transition-colors duration-200"
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
                className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 
                           focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                           text-white font-medium rounded-lg
                           transform transition-all duration-200 hover:scale-[1.02]
                           shadow-lg hover:shadow-primary-500/25 disabled:bg-gray-400 disabled:shadow-none disabled:hover:scale-100"
              >
                {updating ? t('common.updating') : t('signUp.additional.submit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdditionalStep
