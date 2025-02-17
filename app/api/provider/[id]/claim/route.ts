import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import UserService, { isAdmin } from '@/app/api/utils/services/UserService'
import { ROLE_PROVIDER, ROLE_USER } from "@/app/api/utils/constants";

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  const { id } = await params
  const { user: userId } = await request.json()
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) {
    return Response.json(null, { status: 403 })
  }
  const providerService = new ProviderService(supabase)
  const data = await providerService.claimProvider(id, userId)

  if (data) {
    const userService = await UserService.init()
    const role = await (userService as UserService).getRole(userId)
    if (role === ROLE_USER) {
      await (userService as UserService).setRole(userId, ROLE_PROVIDER)
    }
  }

  return Response.json({ data })
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) {
    return Response.json(null, { status: 403 })
  }
  const providerService = new ProviderService(supabase)
  const data = await providerService.revokeProviderAccess(id)

  return Response.json({ data })
}
