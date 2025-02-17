import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    const {
      displayName, avatarUrl, birthdate, gender, country, currentPassword, password
    } = await request.json()
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        return Response.json(null, { status: 403 })
    }

    if (password && currentPassword) {

    } else {
      // Update auth user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          avatar_url: avatarUrl,
          birthdate,
          gender,
          country
        }
      })

      if (error) {
        return Response.json(null, { status: 400 })
      }
    }

    return Response.json({ data: true })
}
