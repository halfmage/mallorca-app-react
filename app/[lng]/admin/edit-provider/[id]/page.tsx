import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import React from 'react'
import { redirect } from 'next/navigation'
import ProviderService from '@/app/api/utils/services/ProviderService'
import CategoryService from '@/app/api/utils/services/CategoryService'
import { isAdmin } from '@/app/api/utils/services/UserService'
import EditProvider from '@/components/EditProvider'

export default async function EditProviderPage({ params }) {
    const { id, lng } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()
    if (!isAdmin(user)) {
        return redirect(`/${lng}/403`)
    }
    const providerService = new ProviderService(supabase)
    const provider = await providerService.get(id)
    const categoryService = new CategoryService(supabase)
    const mainCategories = await categoryService.getMainCategories(lng)

    return (
        <EditProvider provider={provider} mainCategories={mainCategories} />
    )
}
