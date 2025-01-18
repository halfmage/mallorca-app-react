import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import MessageService from '@/app/api/utils/services/MessageService'

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const title = formData.get('title') || ''
    const text = formData.get('text') || ''
    const image = formData.get('image')
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    const providerService = new ProviderService(supabase)
    const provider = await providerService.getProviderByUserId(user.id)

    if (!provider?.id) {
        return Response.json(null, { status: 400 })
    }

    let filePath = ''

    if (image) {
        const fileExt = image.name.split('.').pop()
        filePath = `${provider.id}-${Math.random()}.${fileExt}`

        // Upload the file to Supabase storage
        const { error: uploadError } = await supabase.storage
            .from('message-images')
            .upload(filePath, image)

        if (uploadError) {
            return Response.json(null, { status: 400 })
        }
    }

    const messageService = new MessageService(supabase)
    const data = await messageService.send(provider.id, user.id, title, text, filePath)

    return Response.json({ data })
}
