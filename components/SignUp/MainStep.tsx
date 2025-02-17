"use client"

import React, {useCallback, useState} from 'react'
import {useTranslation} from '@/app/i18n/client'
import {useForm} from 'react-hook-form'
import Link from "next/link";
import { MIN_CHARACTERS_NUMBER } from '@/app/api/utils/constants'

// @ts-expect-error: skip type for now
const SignUp = ({onSubmit: onSubmitAction}) => {
  const {t, i18n: {language}} = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const {register, handleSubmit, formState: {errors}} = useForm()

  const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    handleSubmit(async ({email, password, repeatPassword, firstName, lastName}) => {
      setLoading(true)
      setError('');

      // Basic validation
      if (password !== repeatPassword) {
        setLoading(false)
        setError(t('signUp.main.error.passwordNotMatch'));
        return;
      }

      if (password.length < MIN_CHARACTERS_NUMBER) {
        setLoading(false)
        setError(t('signUp.main.error.count', {count: MIN_CHARACTERS_NUMBER}))
        return
      }

      try {
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        formData.append('firstName', firstName)
        formData.append('lastName', lastName)
        const {data, error} = await onSubmitAction(formData)

        if (error) {
          setError(error.message);
          return;
        }

        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists');
          return
        }

      } catch (err) {
        console.error('Unexpected error during signup:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false)
      }
    }),
    [handleSubmit, onSubmitAction]
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('signUp.main.title')}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('signUp.main.firstName')}</label>
          <input
            type="text"
            className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            {...register('firstName', {required: true})}
            placeholder={t('signUp.main.firstName')}
          />
          {errors?.firstName?.type &&
            <span className="text-red-700 text-xs">
                  {t(`common.error.${errors?.firstName?.type}`)}
                </span>
          }
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('signUp.main.lastName')}</label>
          <input
            type="text"
            className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            {...register('lastName', {required: true})}
            placeholder={t('signUp.main.lastName')}
          />
          {errors?.lastName?.type &&
            <span className="text-red-700 text-xs">
              {t(`common.error.${errors?.lastName?.type}`)}
            </span>
          }
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('signUp.main.email')}</label>
          <input
            type="email"
            className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            {...register('email', {required: true})}
            placeholder={t('signUp.main.email')}
          />
          {errors?.email?.type &&
            <span className="text-red-700 text-xs">
              {t(`common.error.${errors?.email?.type}`)}
            </span>
          }
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('signUp.main.password')}</label>
          <input
            type="password"
            className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            {...register('password', {required: true})}
            placeholder={t('signUp.main.password')}
          />
          {errors?.password?.type &&
            <span className="text-red-700 text-xs">
              {t(`common.error.${errors?.password?.type}`)}
            </span>
          }
          <p className="text-sm text-gray-500 mt-1">
            {t('signUp.main.passwordHint')}
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('signUp.main.password')}</label>
          <input
            type="password"
            className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            {...register('repeatPassword', {required: true})}
            placeholder={t('signUp.main.repeatPassword')}
          />
          {errors?.repeatPassword?.type &&
            <span className="text-red-700 text-xs">
              {t(`common.error.${errors?.repeatPassword?.type}`)}
            </span>
          }
        </div>
        <button
          type="submit"
          className="w-full my-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          disabled={loading}
        >
          {t('signUp.main.submit')}
        </button>
        <div>
          <p className="text-center">
            {t('signUp.main.message')}
            <Link href={`/${language}/login`} className="ml-3 font-bold">
              {t('signUp.main.login')}
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default SignUp
