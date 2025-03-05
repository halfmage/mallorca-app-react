'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { createClient } from '@/utils/supabase/server'

const SUPABASE_ERROR_NOT_CONFIRMED = 'email_not_confirmed'
const ERROR_NOT_CONFIRMED = 'notConfirmed'
const ERROR_GENERAL = 'general'

export async function login(lng: string, formData: FormData) {
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error, data: userData } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/${lng}/login?error=${error.code === SUPABASE_ERROR_NOT_CONFIRMED ? ERROR_NOT_CONFIRMED : ERROR_GENERAL}`)
  }

  revalidatePath(`/${lng}`, 'layout')
  redirect(`/${lng}${userData?.user?.user_metadata?.pending_id ? `/register/${userData?.user?.user_metadata?.pending_id}` : ''}`)
}

export async function signInWithMagicLink(lng: string, formData: FormData) {
  const cookieStore = await cookies()
  // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
  const supabase = await createClient(cookieStore)
  const { error } = await supabase.auth.signInWithOtp({
    email: formData.get('email') as string,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/${lng}`,
    },
  })

  return redirect(error ? `/${lng}/login?error=${ERROR_GENERAL}` : `/${lng}/login?success=true`)
}
