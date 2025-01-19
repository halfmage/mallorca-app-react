import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'

export async function GET(request: NextRequest, { params }) {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    const providerService = new ProviderService(supabase)
    const data = await providerService.getProvidersByCategory(
        id,
        searchParams.get('language'),
        user?.id,
        (searchParams.get('subcategory') || '').split(',').filter(Boolean).map(Number),
        searchParams.get('sort'),
        searchParams.get('limit')
    )

    return Response.json({ data })
}
