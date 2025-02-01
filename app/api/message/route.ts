import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import MessageService from '@/app/api/utils/services/MessageService'
import FileUploadService from '@/app/api/utils/services/FileUploadService'

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const title = formData.get('title') || ''
    const text = formData.get('text') || ''
    const providerId = formData.get('providerId') || ''
    const image = formData.get('image')
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    const providerService = new ProviderService(supabase)
    const provider = await providerService.getProviderByUserId(user.id, providerId)

    if (!provider?.id) {
        return Response.json(null, { status: 400 })
    }

    let imageUrl = ''

    if (image) {
        const fileUploadService = new FileUploadService()
        imageUrl = await fileUploadService.upload(image)
    }

    const messageService = new MessageService(supabase)
    const data = await messageService.send(provider.id, user.id, title, text, imageUrl)

    return Response.json({ data })
}
