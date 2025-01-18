import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    const providerService = new ProviderService(supabase)
    const data = await providerService.getSavedProviders(
        user.id,
        searchParams.get('language'),
        (searchParams.get('maincategory') || '').split(',').filter(Boolean),
        searchParams.get('keyword'),
        searchParams.get('sort'),
        searchParams.get('limit')
    )

    return Response.json({ data })
}
