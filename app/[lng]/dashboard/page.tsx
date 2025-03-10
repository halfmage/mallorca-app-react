import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProviderService from '@/app/api/utils/services/ProviderService'

interface Props {
  params: Promise<{ lng: string }>
}

export default async function DashboardPage({ params }: Props) {
    const { lng } = await params

    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
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
