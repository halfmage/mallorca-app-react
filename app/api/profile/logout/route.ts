import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function POST() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json({ data: false })
    }
    const { error } = await supabase.auth.signOut()

    return Response.json({ data: !error })
}
