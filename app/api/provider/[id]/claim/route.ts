import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'

export async function POST(request: NextRequest, { params }) {
    const { id } = await params
    const { email, phone, message } = await request.json()
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !id) {
        return Response.json(null, { status: 403 })
    }
    const providerService = new ProviderService(supabase)
    const data = await providerService.claimProvider(id, user.id, email, phone, message)

    return Response.json({ data })
}