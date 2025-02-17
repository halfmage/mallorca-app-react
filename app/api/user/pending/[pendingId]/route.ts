import { NextRequest } from 'next/server'
import UserService from '@/app/api/utils/services/UserService'

interface Props {
  params: Promise<{ pendingId: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
    const { pendingId } = await params
    const { birthdate, gender, country } = await request.json()

    const userService = await UserService.init()
    const data = await (userService as UserService).updateUserByPendingId(pendingId, birthdate, gender, country)

    return Response.json({ data })
}
