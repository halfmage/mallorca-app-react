import React from 'react'
import moment from 'moment'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import MessageService from '@/app/api/utils/services/MessageService'
import ProviderService from '@/app/api/utils/services/ProviderService'
import Send from '@/components/Messages/Send'

interface Props {
  params: Promise<{ lng: string, id: string }>
}

const DEFAULT_RATE_LIMIT = 12

export default async function MessageSendPage({ params }: Props) {
    const { id, lng } = await params
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        redirect(`/${lng}/login`)
    }
    const providerService = new ProviderService(supabase)
    const provider = await providerService.getProviderByUserId(user.id, id)
    if (!provider?.id) {
        redirect(`/${lng}/messages`)
    }
    const messageService = new MessageService(supabase)
    const latestEmailDate = await messageService.getLatestEmailDate(provider.id)

    const limit = Number(process.env.MESSAGE_RATE_LIMIT || DEFAULT_RATE_LIMIT)
    const isBlocked = latestEmailDate && moment().diff(moment(latestEmailDate)) <= limit * 60 * 60 * 1000

    return (
        <Send
            savedCount={provider?.saved_providers?.[0]?.count || 0}
            limit={limit}
            latestEmailDate={latestEmailDate}
            isBlocked={isBlocked as boolean}
            providerId={id}
        />
    )
}
