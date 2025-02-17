import { login } from './actions'
import React from 'react'
import { useTranslation } from '@/app/i18n'
import Link from 'next/link'

interface Props {
  params: Promise<{ lng: string }>
}

export default async function LoginPage({ params }: Props) {
    const { lng } = await params
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks
    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="border-2 border-gray-300 p-4">
                {/*{error && <p className="text-red-500">{error}</p>}*/}
                <form>
                    <h1 className="text-3xl font-bold mb-4">{t('login.title')}</h1>
                    <div className="mb-4">
                        <label className="block text-gray-700">{t('login.email')}</label>
                        <input
                            type="email"
                            className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                            name="email"
                            required
                            placeholder={t('login.email')}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">{t('login.password')}</label>
                        <input
                            type="password"
                            className="w-full p-2 my-2 border rounded bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                            name="password"
                            required
                            placeholder={t('login.password')}
                        />
                    </div>
                    <div className="text-right my-4">
                      <Link href={`/${lng}/forgot-password`}>
                        {t('login.forgotPassword')}
                      </Link>
                    </div>
                    <button
                        formAction={login}
                        className="w-full my-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        {t('login.button')}
                    </button>
                </form>
                <div>
                  <p className="text-center">
                    {t('login.message')}
                    <Link href={`/${lng}/register`} className="ml-3 font-bold">
                      {t('login.register')}
                    </Link>
                  </p>
                </div>
            </div>
        </div>
    )
}
