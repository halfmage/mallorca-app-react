import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ClaimBusiness from '@/components/ClaimBusiness'
import { ProviderService } from '@/app/api/utils/provider'

export default async function ClaimBusinessPage({ params }) {
    const { id, lng } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
        redirect('/not-logged')
    }

    const providerService = new ProviderService(supabase)
    const provider = await providerService.get(id, lng)

    if (!provider?.id) {
        redirect('/404')
    }

    const isSaved = await providerService.isProviderSaved(id, user?.id)

    return (
        <ClaimBusiness provider={provider} userId={user?.id} isSaved={isSaved} />
    );
}
