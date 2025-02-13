'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { createClient } from '@/utils/supabase/server'
import UserService from '@/app/api/utils/services/UserService'

export async function signup(formData: FormData) {
    const cookieStore = await cookies()
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
        const pendingId = await userService.postSignUp(
            userData.user.id,
            `${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`,
        )
        redirect(pendingId ? `/register/${pendingId}` : '/error')
    }
}
