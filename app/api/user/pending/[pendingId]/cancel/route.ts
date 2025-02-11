import { NextRequest } from 'next/server'
import UserService from '@/app/api/utils/services/UserService'

export async function PATCH(request: NextRequest, { params }) {
    const { pendingId } = await params

    const userService = await UserService.init()
    const data = await userService.updateUserByPendingId(pendingId)

    return Response.json({ data })
}
