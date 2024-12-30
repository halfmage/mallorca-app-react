import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const image = formData.get('image')
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    const fileExt = image.name.split('.').pop()
    const filePath = `${user.id}-${Math.random()}.${fileExt}`

    // Upload the file to Supabase storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, image)

    if (uploadError) {
        return Response.json(null, { status: 400 })
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    // Update the user metadata
    const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrlData.publicUrl }
    })

    if (updateError) {
        return Response.json(null, { status: 400 })
    }

    return Response.json({ data: publicUrlData.publicUrl })
}

export async function DELETE() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !user?.user_metadata?.avatar_url) {
        return Response.json(null, { status: 403 })
    }

    const filePath = user.user_metadata.avatar_url.split('/').pop()

    // Remove the file from storage if it exists
    if (filePath) {
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
