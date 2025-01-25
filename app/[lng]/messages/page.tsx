// import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProviderService from '@/app/api/utils/services/ProviderService'
// import MessageService from '@/app/api/utils/services/MessageService'
// import UserMessagesView from '@/components/Messages/UserMessagesView'

export default async function MessagesPage({ params }) {
    const { lng } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        redirect(`/${lng}/login`)
    }
    const providerService = new ProviderService(supabase)
    const providers = await providerService.getProvidersByUserId(user.id, lng)

    if (!providers?.length) {
        return redirect(`/${lng}`)
    } else {
        return redirect(`/${lng}/messages/${providers[0].id}`)
    }

    // const messageService = new MessageService(supabase)
    // const messages = await messageService.getUserMessages(user.id)
    // const savedProviders = await providerService.getSavedProviders(user.id, lng)
    // const providers = savedProviders.map((provider) => ({
    //     ...provider,
    //     messages: messages.filter((message) => message?.message?.provider_id === provider.id)
    // })).filter(({ messages }) => messages.length)
    // providers.sort(
    //     (a, b) => {
    //         const latestDateA = Math.max(...a.messages.map(message => new Date(message.created_at).getTime()));
    //         const latestDateB = Math.max(...b.messages.map(message => new Date(message.created_at).getTime()));
    //
    //         return latestDateB - latestDateA
    //     }
    // )
    //
    // return (
    //     <UserMessagesView providers={providers} />
    // )
}
