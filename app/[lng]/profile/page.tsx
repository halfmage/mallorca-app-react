import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Profile from "@/components/Profile"

export default async function SavedPage() {
    // const { user } = useAuth();
    // const { t } = useTranslation();
    // const cookieStore = await cookies()
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <Profile user={user} />
    );
};
