'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { createClient } from '@/utils/supabase/server'
import UserService from '@/app/api/utils/services/UserService'
import { MIN_CHARACTERS_NUMBER } from '@/app/api/utils/constants'

export async function signup(formData: FormData) {
    const cookieStore = await cookies()
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const repeatPassword = formData.get('repeatPassword') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    // Validate passwords match
    if (password !== repeatPassword) {
        return redirect('/register?error=passwords_dont_match')
    }

    // Validate password length
    if (password.length < MIN_CHARACTERS_NUMBER) {
        return redirect(`/register?error=password_too_short&min=${MIN_CHARACTERS_NUMBER}`)
    }

    const { error, data: userData } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return redirect('/register?error=signup_failed')
    }

    if (userData?.user?.id) {
        const userService = await UserService.init()
        const pendingId = await (userService as UserService).postSignUp(
            userData.user.id,
            `${firstName} ${lastName}`,
        )
        redirect(pendingId ? `/register/${pendingId}` : '/error')
    }
}
