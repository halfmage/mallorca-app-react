import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import MessageService from '@/app/api/utils/services/MessageService'

export async function POST(request: NextRequest, { params }) {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    const messageService = new MessageService(supabase)
    const data = await messageService.markAsRead(id, user.id)

    return Response.json({ data })
}
