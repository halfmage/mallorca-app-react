'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {cookies} from 'next/headers'

import { createClient } from '@/utils/supabase/server'

export async function resetPassword(formData: FormData) {
    const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)

    const { error } = await supabase.auth.updateUser({
      password: formData.get('password') as string
    })

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
