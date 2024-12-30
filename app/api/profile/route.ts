import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    const { displayName, avatarUrl } = await request.json()
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    // Update auth user metadata
    const { error } = await supabase.auth.updateUser({
        data: {
            display_name: displayName,
            avatar_url: avatarUrl
        }
    })

    if (error) {
        return Response.json(null, { status: 400 })
    }

    return Response.json({ data: true })
}
