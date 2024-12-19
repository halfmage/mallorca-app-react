import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { ProviderService } from '@/app/api/utils/provider'

export async function DELETE(request: NextRequest, { params }) {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !id) {
        return Response.json(null, { status: 403 })
    }
    const providerService = new ProviderService(supabase)
    await providerService.removeSavedProvider(user.id, id)
    const data = await providerService.getSavedProviders(
        user.id,
        (searchParams.get('maincategory') || '').split(',').filter(Boolean),
        searchParams.get('keyword'),
        searchParams.get('sort'),
        searchParams.get('limit')
    )

    return Response.json({ data })
}