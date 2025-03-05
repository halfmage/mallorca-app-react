'use client'

import React from 'react'
import { useTranslation } from '@/app/i18n/client'
import Link from 'next/link'

interface Props {
  onSubmit: (formData: FormData) => Promise<void>
}

export default function PasswordFlowForm({ onSubmit }: Props) {
  const { t, i18n: { language} } = useTranslation()
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
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("login.password")}
        </label>
        <input
          type="password"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700
                                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400
                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                             transition-colors duration-200"
          name="password"
          required
          placeholder={t("login.password")}
        />
      </div>
      <div className="text-right">
        <Link
          href={`/${language}/forgot-password`}
          className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400
                                             dark:hover:text-gray-300 transition-colors duration-200"
        >
          {t("login.forgotPassword")}
        </Link>
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
