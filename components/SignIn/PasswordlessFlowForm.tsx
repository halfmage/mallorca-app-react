'use client'

import React from 'react'
import { useTranslation } from '@/app/i18n/client'

interface Props {
  onSubmit: (formData: FormData) => Promise<void>
}

export default function PasswordlessFlowForm({ onSubmit }: Props) {
  const { t } = useTranslation()
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("login.email")}
        </label>
        <input
          type="email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700
                                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                             transition-colors duration-200"
          name="email"
          required
          placeholder={t("login.email")}
        />
      </div>
      <button
        formAction={onSubmit}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600
                                         focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                                         text-white font-medium rounded-lg
                                         transform transition-all duration-200 hover:scale-[1.02]
                                         shadow-lg hover:shadow-primary-500/25"
      >
        {t("login.button")}
      </button>
    </form>
  )
}
