import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Profile from '@/components/Profile'

interface Props {
  params: Promise<{ lng: string }>
}

export default async function ProfilePage({ params }: Props) {
    const { lng } = await params
    const cookieStore = await cookies()
    
    // @ts-expect-error: Argument of type 'ReadonlyRequestCookies' is not assignable to parameter of type 'Promise<ReadonlyRequestCookies>'
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
        redirect(`/${lng}/login`)
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-6 pb-16">
            <Profile userData={user?.user_metadata} />
        </main>
    );
};
