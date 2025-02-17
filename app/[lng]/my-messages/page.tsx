import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProviderService from '@/app/api/utils/services/ProviderService'
import MessageService from '@/app/api/utils/services/MessageService'
import UserMessagesView from '@/components/Messages/UserMessagesView'

interface Props {
  params: Promise<{ lng: string }>
}

interface Message {
  created_at: string | number
}

export default async function MessagesPage({ params }: Props) {
  const { lng } = await params
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) {
    redirect(`/${lng}/login`)
  }
  const messageService = new MessageService(supabase)
  const messages = await messageService.getUserMessages(user.id)
  const providerService = new ProviderService(supabase)
  const savedProviders = await providerService.getSavedProviders(user.id, lng)
  const providers = savedProviders.map(({ user_id: userId, ...provider }) => ({
    ...provider,
    isOwnProvider: userId === user.id,
    // @ts-expect-error: provider_id is not defined
    messages: messages.filter((message) => message?.message?.provider_id === provider.id)
  })).filter(({ messages }) => messages.length)
  providers.sort(
    (a, b) => {
      const latestDateA = Math.max(
        ...a.messages.map((message: Message) => new Date(message.created_at).getTime())
      )
      const latestDateB = Math.max(
        ...b.messages.map((message: Message) => new Date(message.created_at).getTime())
      )

      return latestDateB - latestDateA
    }
  )

  return (
    <UserMessagesView providers={providers}/>
  )
}
