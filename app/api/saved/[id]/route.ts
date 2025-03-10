import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'

interface Props {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: Props) {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !id) {
        return Response.json(null, { status: 403 })
    }
    const providerService = new ProviderService(supabase)
    await providerService.removeSavedProvider(user.id, id)
    const data = await providerService.getSavedProviders(
        user.id,
        searchParams.get('language'),
        (searchParams.get('maincategory') || '').split(',').filter(Boolean),
        searchParams.get('keyword'),
        searchParams.get('sort') ? String(searchParams.get('sort')) : null,
        searchParams.get('limit') ? Number(searchParams.get('limit')) : null
    )

    return Response.json({ data })
}

export async function PUT(request: NextRequest, { params }: Props) {
    const { id } = await params
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !id) {
        return Response.json(null, { status: 403 })
    }
    const providerService = new ProviderService(supabase)
    const data = await providerService.toggleSaveProvider(user.id, id)

    return Response.json({ data })
}
