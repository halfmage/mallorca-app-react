import { login, signInWithMagicLink } from './actions'
import React from 'react'
import { CheckCircle } from 'lucide-react'
import { useTranslation } from '@/app/i18n'
import Link from 'next/link'
import SignInForm from '@/components/SignIn'

interface Props {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ pendingId?: string, error?: string, success?: boolean }>;
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { lng } = await params
  const { pendingId, error, success } = await searchParams
  const { t } = await useTranslation(lng); // eslint-disable-line react-hooks/rules-of-hooks
  const handleSubmit = login.bind(null, lng)
  const handlePasswordlessSubmit = signInWithMagicLink.bind(null, lng)
  return (
    <div
      className="h-[calc(100vh-6rem)] flex items-center rounded-3xl justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("https://images.pexels.com/photos/1731826/pexels-photo-1731826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")' }}>
      <div className="">
        <div
          className="bg-white/95 dark:bg-gray-950/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8">
            <h1 className="h3">
              {t("login.title")}
            </h1>
          </div>
          <div className="p-8">
            {pendingId &&
              <div>
                {t('login.signUpSuccessful')}
              </div>
            }
            {error && (
              <div
                className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {t(`login.error.${error}`)}
              </div>
            )}
            {success ? (
              <div className="mt-2 text-center flex items-center justify-center gap-2">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400"/>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {t("login.passwordless.success")}
                </p>
              </div>
            ) : (
              <>
                <SignInForm onSubmit={handleSubmit}
                            onPasswordlessSubmit={handlePasswordlessSubmit}/>
                <div className="mt-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    {t("login.message")}
                    <Link
                      href={`/${lng}/register`}
                      className="ml-2 text-primary-600 hover:text-primary-500 dark:text-primary-400
                                                 dark:hover:text-primary-300 font-semibold transition-colors duration-200"
                    >
                      {t("login.register")}
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
