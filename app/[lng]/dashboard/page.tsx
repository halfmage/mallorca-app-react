import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProviderService from '@/app/api/utils/services/ProviderService'

export default async function DashboardPage({ params }) {
    const { lng } = await params

    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
        return redirect(`/${lng}/login`)
    }

    const providerService = new ProviderService(supabase)
    const providers = await providerService.getProvidersByUserId(user.id)

    if (!providers?.[0]?.id) {
        return redirect(`/${lng}`)
    } else {
        return redirect(`/${lng}/dashboard/${providers[0].id}`)
    }
}
