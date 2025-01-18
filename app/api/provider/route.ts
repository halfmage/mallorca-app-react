import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import { isAdmin } from '@/app/api/utils/services/UserService'

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const name = formData.get('name')
    const mainCategoryId = formData.get('mainCategoryId')
    const subCategoryId = formData.get('subCategoryId')
    const images = formData.getAll('images')
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdmin(user)) {
        return Response.json(null, { status: 403 })
    }
    const providerService = new ProviderService(supabase)
    const data = await providerService.add(name, mainCategoryId, subCategoryId, images)

    return Response.json({ data })
}
