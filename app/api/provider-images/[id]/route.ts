import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { ProviderService } from '@/app/api/utils/provider'
import { isAdmin } from '@/app/api/utils/user'

export async function DELETE(request: NextRequest, { params }) {
    const { id } = await params
    const cookieStore = await cookies()
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
