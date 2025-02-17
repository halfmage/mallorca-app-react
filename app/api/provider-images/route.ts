import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import { isAdmin } from '@/app/api/utils/services/UserService'

export async function PATCH(request: NextRequest) {
    const { images } = await request.json()
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }
    const providerService = new ProviderService(supabase)
    const providerId = await providerService.getProviderIdByImage(images?.[0])
    if (!providerId) {
        return Response.json(null, { status: 403 })
    }
    const isProviderAdmin = await providerService.isProviderAdmin(user.id, providerId)
    if (!isAdmin(user) && !isProviderAdmin) {
        return Response.json(null, { status: 403 })
    }

    const data = await providerService.reorderImages(images)

    return Response.json({ data })
}
