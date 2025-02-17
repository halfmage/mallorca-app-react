import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import FileUploadService from '@/app/api/utils/services/FileUploadService'

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const image = formData.get('image')
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    const fileUploadService = new FileUploadService()
    let imageUrl
    try {
        imageUrl = await fileUploadService.upload(image as File)
    } catch {
        return Response.json(null, { status: 400 })
    }

    // Update the user metadata
    const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: imageUrl }
    })

    if (updateError) {
        return Response.json(null, { status: 400 })
    }

    return Response.json({ data: imageUrl })
}

export async function DELETE() {
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !user?.user_metadata?.avatar_url) {
        return Response.json(null, { status: 403 })
    }

    const filePath = user.user_metadata.avatar_url.split('/').pop()

    // Remove the file from storage if it exists
    if (filePath && !filePath.startsWith('http')) {
        const { error: removeError } = await supabase.storage
            .from('avatars')
            .remove([filePath])

        if (removeError) {
            return Response.json(null, { status: 400 })
        }
    }

    // Update user metadata to remove avatar_url
    const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: '' }
    })

    if (updateError) {
        return Response.json(null, { status: 400 })
    }

    return Response.json({ data: true })
}
