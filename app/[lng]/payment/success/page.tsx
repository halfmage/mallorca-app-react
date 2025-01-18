import React from 'react'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'
import ProviderService from '@/app/api/utils/services/ProviderService'

export default async function PaymentSuccessPage({ params, searchParams }) {
    const { lng } = await params
    const { session_id: sessionId } = await searchParams
    if (!sessionId) {
        redirect(`/${lng}/404`)
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)
    const { subscription: paymentId, client_reference_id: claimId } = await stripe.checkout.sessions.retrieve(sessionId)
    if (!paymentId || !claimId) {
        redirect(`/${lng}/404`)
    }
    const providerService = await ProviderService.init()
    await providerService.addPayment(claimId, paymentId as string)

    return (
        <div>
            <h1>Payment Success</h1>
        </div>
    )
}


