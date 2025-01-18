import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import UserService, { isAdmin } from '@/app/api/utils/services/UserService'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !isAdmin(user)) {
        return Response.json(null, { status: 403 })
    }
    const userService = await UserService.init()
    const data = await userService.getUsers(
        searchParams.get('limit'),
        searchParams.get('sort')
    )

    return Response.json({ data })
}
