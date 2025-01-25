import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProviderDashboard from '@/components/ProviderDashboard'
import PaymentService from '@/app/api/utils/services/PaymentService'
import ProviderService from '@/app/api/utils/services/ProviderService'
import UserService from '@/app/api/utils/services/UserService'
import { STATUS_PAYMENT_COMPLETED } from '@/app/api/utils/constants'

export default async function ProviderDashboardPage({ params }) {
    const { id, lng } = await params

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
        return redirect(`/${lng}/login`)
    }
    const providerService = new ProviderService(supabase)
    const providers = await providerService.getProvidersByUserId(user.id)

    if (!providers?.length) {
        return redirect(`/${lng}`)
    }

    const provider = await providerService.getDetailedProviderByUserId(user.id, id, lng)
    if (!provider) {
        return redirect(`/${lng}/dashboard`)
    }

    const businessClaim = provider?.business_claims?.[0]
    let stats = null
    let userStats = null
    let paymentInfo = null
    const paymentService = new PaymentService(supabase)
    const subscriptionLink = await paymentService.getPaymentLink(provider.id, lng)

    // Get provider stats
    if (businessClaim?.payment_status === STATUS_PAYMENT_COMPLETED) {
        stats = await providerService.getProviderStats(provider.id)

        // Get saved users
        const userIds = await providerService.getUserIdsByProvider(provider.id)
        const usersService = await UserService.init()
        userStats = await usersService.getUserStats(userIds)
        paymentInfo = await paymentService.getPaymentInfo(provider.id)
    }

    return (
        <ProviderDashboard
            provider={provider}
            providers={providers}
            userStats={userStats}
            stats={stats}
            subscriptionLink={subscriptionLink}
            paymentInfo={paymentInfo}
        />
    )
}
