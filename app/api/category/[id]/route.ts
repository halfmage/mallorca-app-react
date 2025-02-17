import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'

interface Props {
  params: Promise<{ id: string|number }>
}

export async function GET(request: NextRequest, { params }: Props) {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    const providerService = new ProviderService(supabase)
    const data = await providerService.getProvidersByCategory(
        id,
        searchParams.get('language'),
        user?.id,
        (searchParams.get('subcategory') || '').split(',').filter(Boolean).map(String),
        searchParams.get('sort'),
        searchParams.get('limit') ? Number(searchParams.get('limit')) : null
    )

    return Response.json({ data })
}
