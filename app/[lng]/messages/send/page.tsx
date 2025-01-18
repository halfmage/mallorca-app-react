import React from 'react'
import moment from 'moment'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MessageService from '@/app/api/utils/services/MessageService'
import ProviderService from '@/app/api/utils/services/ProviderService'
import Send from '@/components/Messages/Send'

const DEFAULT_RATE_LIMIT = 12

export default async function MessageSendPage({ params }) {
    const { lng } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        redirect(`/${lng}/login`)
    }
    const providerService = new ProviderService(supabase)
    const provider = await providerService.getProviderByUserId(user.id)
    const messageService = new MessageService(supabase)
    const latestEmailDate = await messageService.getLatestEmailDate(provider.id)

    if (!provider?.id) {
        return redirect(`/${lng}/not-logged`)
    }

    const limit = process.env.MESSAGE_RATE_LIMIT || DEFAULT_RATE_LIMIT
    const isBlocked = latestEmailDate && moment().diff(moment(latestEmailDate)) <= limit * 60 * 60 * 1000

    return (
        <Send
            savedCount={provider?.saved_providers?.[0]?.count || 0}
            limit={limit}
            latestEmailDate={latestEmailDate}
            isBlocked={isBlocked}
        />
    )
}
