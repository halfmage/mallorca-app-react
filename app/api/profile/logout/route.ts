import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function POST() {
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json({ data: false })
    }
    const { error } = await supabase.auth.signOut()

    return Response.json({ data: !error })
}
