import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import UserService, { isAdmin } from '@/app/api/utils/services/UserService'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !isAdmin(user)) {
        return Response.json(null, { status: 403 })
    }
    const userService = await UserService.init()
    const data = await (userService as UserService).getUsers(
        searchParams.get('limit') ? Number(searchParams.get('limit')) : null,
        searchParams.get('sort') ? String(searchParams.get('sort')) : null
    )

    return Response.json({ data })
}
