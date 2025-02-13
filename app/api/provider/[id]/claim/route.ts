import {NextRequest} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@/utils/supabase/server'
import ProviderService from '@/app/api/utils/services/ProviderService'
import UserService, {isAdmin} from '@/app/api/utils/services/UserService'
import {ROLE_PROVIDER, ROLE_USER} from "@/app/api/utils/constants";

export async function POST(request: NextRequest, {params}) {
  const {id} = await params
  const {user: userId} = await request.json()
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const {data: {user}} = await supabase.auth.getUser()
  if (!isAdmin(user)) {
    return Response.json(null, {status: 403})
  }
  const providerService = new ProviderService(supabase)
  const data = await providerService.claimProvider(id, userId)

  if (data) {
    const userService = await UserService.init()
    const role = await userService.getRole(userId)
    if (role === ROLE_USER) {
      await userService.setRole(userId, ROLE_PROVIDER)
    }
  }

  return Response.json({data})
}

export async function DELETE(request: NextRequest, {params}) {
  const {id} = await params
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
  const {data: {user}} = await supabase.auth.getUser()
  if (!isAdmin(user)) {
    return Response.json(null, {status: 403})
  }
  const providerService = new ProviderService(supabase)
  const data = await providerService.revokeProviderAccess(id)

  return Response.json({data})
}
