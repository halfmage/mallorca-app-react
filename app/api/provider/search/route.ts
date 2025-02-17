import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)

    const providerService = new ProviderService(supabase)
    const data = await providerService.search(
        searchParams.get('keyword') as string,
        searchParams.get('language') as string
    )

    return Response.json({ data })
}
