'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { createClient } from '@/utils/supabase/server'
import UserService from '@/app/api/utils/services/UserService'

export async function signup(formData: FormData) {
    const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error, data: userData } = await supabase.auth.signUp(data)

    if (error) {
        redirect('/error')
    }

    if (userData?.user?.id) {
        const userService = await UserService.init()
        const pendingId = await (userService as UserService).postSignUp(
            userData.user.id,
            `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`,
        )
        redirect(pendingId ? `/register/${pendingId}` : '/error')
    }
}
