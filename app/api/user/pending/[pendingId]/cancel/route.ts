import { NextRequest } from 'next/server'
import UserService from '@/app/api/utils/services/UserService'

interface Props {
  params: Promise<{ pendingId: string }>
}

export async function PATCH(request: NextRequest, { params }: Props) {
    const { pendingId } = await params

    const userService = await UserService.init()
    const data = await (userService as UserService).updateUserByPendingId(pendingId)

    return Response.json({ data })
}
