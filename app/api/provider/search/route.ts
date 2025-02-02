import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    const providerService = new ProviderService(supabase)
    const data = await providerService.search(
        searchParams.get('keyword'),
        searchParams.get('language')
    )

    return Response.json({ data })
}
