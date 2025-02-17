'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {cookies} from 'next/headers'

import { createClient } from '@/utils/supabase/server'

export async function forgotPassword(formData: FormData) {
    const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)

    // type-casting here for convenience
    // in practice, you should validate your inputs

    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.get('email') as string,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/reset-password`,
      }
    )

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}
