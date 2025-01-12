import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ProviderService } from '@/app/api/utils/provider'
import { MessageService } from '@/app/api/utils/message'
import ProviderMessagesView from '@/components/Messages/ProviderMessagesView'
import UserMessagesView from '@/components/Messages/UserMessagesView'

export default async function MessagesPage({ params }) {
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

    if (provider?.id) {
        const messages = await messageService.getProviderMessages(provider.id)

        return (
            <ProviderMessagesView messages={messages} lng={lng} />
        )
    }

    const messages = await messageService.getUserMessages(user.id)
    const savedProviders = await providerService.getSavedProviders(user.id)
    const providers = savedProviders.map((provider) => ({
        ...provider,
        messages: messages.filter((message) => message?.message?.provider_id === provider.id)
    })).filter(({ messages }) => messages.length)
    providers.sort(
        (a, b) => {
            const latestDateA = Math.max(...a.messages.map(message => new Date(message.created_at).getTime()));
            const latestDateB = Math.max(...b.messages.map(message => new Date(message.created_at).getTime()));

            return latestDateB - latestDateA
        }
    )

    return (
        <UserMessagesView providers={providers} />
    )
}
