import { NextRequest } from 'next/server'
import UserService from '@/app/api/utils/services/UserService'

export async function PATCH(request: NextRequest, { params }) {
    const { pendingId } = await params
    const { birthdate, gender, country } = await request.json()

    const userService = await UserService.init()
    const data = await userService.updateUserByPendingId(pendingId, birthdate, gender, country)

    return Response.json({ data })
}
