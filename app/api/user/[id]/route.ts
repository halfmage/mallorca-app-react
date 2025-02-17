import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import UserService, { isAdmin } from '@/app/api/utils/services/UserService'

interface Props {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: Props) {
    const { id } = await params
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id || !isAdmin(user)) {
        return Response.json(null, { status: 403 })
    }
    const userService = await UserService.init()
    const data = await (userService as UserService).deleteUser(id)

    return Response.json({ data })
}
