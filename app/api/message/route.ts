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
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    const providerService = new ProviderService(supabase)
    const provider = await providerService.getProviderByUserId(user.id, providerId as string)

    if (!provider?.id) {
        return Response.json(null, { status: 400 })
    }

    let imageUrl = ''

    if (image) {
        const fileUploadService = new FileUploadService()
        imageUrl = await fileUploadService.upload(image as File)
    }

    const messageService = new MessageService(supabase)
    const data = await messageService.send(provider.id, user.id, title as string, text as string, imageUrl)

    return Response.json({ data })
}
