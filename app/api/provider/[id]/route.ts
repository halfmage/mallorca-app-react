import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import { isAdmin } from '@/app/api/utils/services/UserService'

export async function PATCH(request: NextRequest, { params }) {
    const { id } = await params
    const formData = await request.formData()
    const name = formData.get('name')
    const mainCategoryId = formData.get('mainCategoryId')
    const subCategoryId = formData.get('subCategoryId')
    const images = formData.getAll('images')
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }
    const providerService = new ProviderService(supabase)
    const isProviderAdmin = await providerService.isProviderAdmin(user.id, id)
    if (!isAdmin(user) && !isProviderAdmin) {
        return Response.json(null, { status: 403 })
    }
    const data = await providerService.update(id, name, mainCategoryId, subCategoryId, images)

    return Response.json({ data })
}
