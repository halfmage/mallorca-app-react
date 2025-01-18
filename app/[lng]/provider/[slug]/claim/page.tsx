import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ClaimBusiness from '@/components/ClaimBusiness'
import ProviderService from '@/app/api/utils/services/ProviderService'

export default async function ClaimBusinessPage({ params }) {
    const { slug, lng } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        redirect('/not-logged')
    }

    const providerService = new ProviderService(supabase)
    const provider = await providerService.get(slug, lng)

    if (!provider?.id) {
        redirect('/404')
    }

    const isSaved = await providerService.isProviderSaved(provider.id, user?.id)

    return (
        <ClaimBusiness provider={provider} userId={user?.id} isSaved={isSaved} />
    );
}
