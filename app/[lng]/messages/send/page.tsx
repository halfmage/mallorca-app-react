import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProviderService } from '@/app/api/utils/provider'
import Send from '@/components/Messages/Send'

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

    if (!provider?.id) {
        return redirect(`/${lng}/not-logged`)
    }

    return (
        <Send />
    )
}
