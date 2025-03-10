import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Provider from '@/components/Provider'
import ProviderService from '@/app/api/utils/services/ProviderService'

interface Props {
  params: Promise<{ lng: string, slug: string }>
}

export default async function ProviderPage({ params }: Props) {
  const { slug, lng } = await params
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  const providerService = new ProviderService(supabase)
  const provider = await providerService.get(slug, lng)

  if (!provider?.id) {
    redirect('/404')
  }

  const isSaved = await providerService.isProviderSaved(provider.id, user?.id)
  await providerService.addProviderView(provider.id, user?.id)

  // @ts-expect-error: provider type is not defined
  return (<Provider provider={provider} showSaveButton={!!user?.id} isSaved={isSaved}/>)
}
