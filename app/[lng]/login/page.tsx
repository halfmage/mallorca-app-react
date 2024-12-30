import { login } from './actions'
import React from 'react'
import { useTranslation } from '@/app/i18n'

export default async function LoginPage({ params }) {
    const { lng } = await params
    const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks
    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">{t('login.title')}</h2>
            {/*{error && <p className="text-red-500">{error}</p>}*/}
            <form>
                <div className="mb-4">
                    <label className="block text-gray-700">{t('login.email')}</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded"
                        name="email"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">{t('login.password')}</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded"
                        name="password"
                        required
                    />
                </div>
                <button
                    formAction={login}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    {t('login.button')}
                </button>
            </form>
        </div>
    )
}