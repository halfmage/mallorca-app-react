'use client'

import React, { useCallback, useState } from 'react'
import { useTranslation } from '@/app/i18n/client'
import PasswordlessFlowForm from '@/components/SignIn/PasswordlessFlowForm'
import PasswordFlowForm from '@/components/SignIn/PasswordFlowForm'

interface Props {
  onSubmit: (formData: FormData) => Promise<void>
  onPasswordlessSubmit: (formData: FormData) => Promise<void>
}

export default function SignInForm({ onSubmit, onPasswordlessSubmit }: Props) {
  const { t } = useTranslation()
  const [ isPasswordless, setIsPasswordless ] = useState(true)
  const switchMode = useCallback(() => {
    setIsPasswordless(isPasswordless => !isPasswordless)
  }, [])

  return (
    <div>
      {isPasswordless ?
        <PasswordlessFlowForm onSubmit={onPasswordlessSubmit} /> :
        <PasswordFlowForm onSubmit={onSubmit} />
      }
      <div className="mt-2 text-center text-gray-600 dark:text-gray-400">
        <label>
          <input type="checkbox" onChange={switchMode} />
          <span className="ml-2">
            {t('login.passwordFlow')}
          </span>
        </label>
      </div>
    </div>
  )
}
