import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProviderService from '@/app/api/utils/services/ProviderService'
import MessageService from '@/app/api/utils/services/MessageService'
import ProviderMessagesView from '@/components/Messages/ProviderMessagesView'
// import UserMessagesView from '@/components/Messages/UserMessagesView'

export default async function MessagesPage({ params }) {
    const { id, lng } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        redirect(`/${lng}/login`)
    }
    const providerService = new ProviderService(supabase)
    const provider = await providerService.getProviderByUserId(user.id, id, lng)
    if (!provider) {
        redirect(`/${lng}/messages`)
    }

    const providers = await providerService.getProvidersByUserId(user.id)
    const messageService = new MessageService(supabase)
    const messages = await messageService.getProviderMessages(provider.id)

    return (
        <ProviderMessagesView messages={messages} lng={lng} providers={providers} providerId={id} />
    )
}
