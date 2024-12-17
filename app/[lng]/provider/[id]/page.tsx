import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import Provider from "@/components/Provider"
import {ProviderService} from "@/app/api/utils/provider";

export default async function ProviderPage({ params }) {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();
    const providerService = new ProviderService(supabase)
    const provider = await providerService.get(id)

    const isSaved = await providerService.isProviderSaved(id, user?.id)

    return (
        <Provider provider={provider} userId={user?.id} isSaved={isSaved} />
    );
}
