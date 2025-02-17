import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import PaymentService from '@/app/api/utils/services/PaymentService'
import { useTranslation } from '@/app/i18n'
import Link from 'next/link'

interface Props {
  params: Promise<{ lng: string }>
  searchParams: Promise<{ session_id: string }>
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const { lng } = await params
  const { t } = await useTranslation(lng) // eslint-disable-line react-hooks/rules-of-hooks
  const { session_id: sessionId } = await searchParams
  if (!sessionId) {
    redirect(`/${lng}/404`)
  }
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = createClient(cookieStore)
  const paymentService = new PaymentService(supabase)
  const {
    paymentId,
    claimId,
    customer,
    provider
  } = await paymentService.getPaymentSession(sessionId)
  if (!paymentId || !claimId || !customer) {
    redirect(`/${lng}/404`)
  }

  await paymentService.addPayment(claimId, paymentId as string, customer as string)

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="border-2 border-gray-300 p-4">
        <h1 className="text-3xl font-bold mb-4">{t('paymentSuccess.title')}</h1>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 my-2 text-center">
          <h2 className="text-xl font-bold mb-4 text-left">{t('paymentSuccess.subtitle')}</h2>
        </div>

        <p>
          {t('paymentSuccess.message')}
        </p>

        <ul>
          <li>{t('paymentSuccess.line1')}</li>
          <li>{t('paymentSuccess.line2')}</li>
          <li>{t('paymentSuccess.line3')}</li>
        </ul>

        {provider &&
          // @ts-expect-error: provider type is not defined
          <Link href={`/${lng}/provider/${provider.slug || provider.id}`}>
            <button
              className="w-full my-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              {t('paymentSuccess.button')}
            </button>
          </Link>
        }
      </div>
    </div>
  )
}
