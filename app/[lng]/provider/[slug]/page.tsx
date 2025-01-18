import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Provider from '@/components/Provider'
import ProviderService from '@/app/api/utils/services/ProviderService'

export default async function ProviderPage({ params }) {
    const { slug, lng } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();
    const providerService = new ProviderService(supabase)
    const provider = await providerService.get(slug, lng)

    if (!provider?.id) {
        redirect('/404')
    }

    const isSaved = await providerService.isProviderSaved(provider.id, user?.id)
    await providerService.addProviderView(provider.id, user?.id)

    return (
        <Provider provider={provider} userId={user?.id} isSaved={isSaved} />
    )
}
