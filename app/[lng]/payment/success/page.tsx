import React from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import PaymentService from '@/app/api/utils/services/PaymentService'

export default async function PaymentSuccessPage({ params, searchParams }) {
    const { lng } = await params
    const { session_id: sessionId } = await searchParams
    if (!sessionId) {
        redirect(`/${lng}/404`)
    }
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const paymentService = new PaymentService(supabase)
    const { paymentId, claimId, customer } = await paymentService.getPaymentSession(sessionId)
    if (!paymentId || !claimId || !customer) {
        redirect(`/${lng}/404`)
    }

    await paymentService.addPayment(claimId, paymentId as string, customer)

    return (
        <div>
            <h1>Payment Success</h1>
        </div>
    )
}


