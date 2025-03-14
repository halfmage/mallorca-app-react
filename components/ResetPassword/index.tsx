'use client'

import React, {useCallback, useEffect, useState} from 'react'
import {useTranslation} from "@/app/i18n/client";
import {useForm} from "react-hook-form";
import { createClient } from '@/utils/supabase/client'
import { MIN_CHARACTERS_NUMBER } from '@/app/api/utils/constants'

// @ts-expect-error: skip type for now
const ResetPassword = ({onSubmit: onSubmitAction}) => {
  const {t} = useTranslation()
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const {register, handleSubmit, formState: {errors}} = useForm()

  const onSubmit = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
    handleSubmit(async ({password, repeatPassword}) => {
      setLoading(true)
      setError('');

      // Basic validation
      if (password !== repeatPassword) {
        setLoading(false)
        setError(t('resetPassword.error.passwordNotMatch'));
        return;
      }

      if (password.length < MIN_CHARACTERS_NUMBER) {
        setLoading(false)
        setError(t('resetPassword.error.count', {count: MIN_CHARACTERS_NUMBER}))
        return
      }

      try {
        const formData = new FormData()
        formData.append('password', password)
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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setReady(true)
      }
    })
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border-2 border-gray-300 p-4">
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">{t('resetPassword.title')}</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {ready ?
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">{t('resetPassword.password')}</label>
                <input
                  type="password"
                  className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  {...register('password', {required: true})}
                  placeholder={t('resetPassword.password')}
                />
                {errors?.password?.type &&
                  <span className="text-red-700 text-xs">
                  {t(`common.error.${errors?.password?.type}`)}
                </span>
                }
                <p className="text-sm text-gray-500 mt-1">
                  {t('resetPassword.passwordHint')}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">{t('resetPassword.password')}</label>
                <input
                  type="password"
                  className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                  {...register('repeatPassword', {required: true})}
                  placeholder={t('resetPassword.repeatPassword')}
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
                {t('resetPassword.submit')}
              </button>
            </form> : <p className="text-red-500 mb-4">{t('resetPassword.notReady')}</p>
          }
        </div>
      </div>
    </div>
  );
};

export default ResetPassword
