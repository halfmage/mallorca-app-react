import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import React from 'react'
import { redirect } from 'next/navigation'
import { ProviderService } from '@/app/api/utils/provider'
import { isAdmin } from '@/app/api/utils/user'
import EditProvider from '@/components/EditProvider'

export default async function EditProviderPage({ params }) {
    const { id, lng } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();
    if (isAdmin(user)) {
        return redirect(`/${lng}/403`)
    }
    const providerService = new ProviderService(supabase)
    const provider = await providerService.get(id)
    const { data: mainCategories } = await supabase.from('maincategories').select('*');

    return (
        <EditProvider provider={provider} mainCategories={mainCategories} />
    )
}
