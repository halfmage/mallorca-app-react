import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import { isAdmin } from '@/app/api/utils/services/UserService'

interface Props {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: Props) {
    const { id } = await params
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }
    const providerService = new ProviderService(supabase)
    const providerId = await providerService.getProviderIdByImage(id)
    if (!providerId) {
        return Response.json(null, { status: 403 })
    }
    const isProviderAdmin = await providerService.isProviderAdmin(user.id, providerId)
    if (!isAdmin(user) && !isProviderAdmin) {
        return Response.json(null, { status: 403 })
    }

    const data = await providerService.deleteImage(id)

    return Response.json({ data })
}
